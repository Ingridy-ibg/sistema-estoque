import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacoeDto } from './dto/create-movimentacoe.dto';
import { calcularPaginacao, PADRAO_POR_PAGINA } from '../common/paginacao';

@Injectable()
export class MovimentacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMovimentacoeDto: CreateMovimentacoeDto, usuario_id: number) {
    const { produto_id, tipo, quantidade, motivo } = createMovimentacoeDto;

    return this.prisma.$transaction(async (tx) => {
      const produto = await tx.produtos.findUnique({ where: { id: produto_id } });
      if (!produto) {
        throw new NotFoundException(`Produto ${produto_id} não existe`);
      }

      if (tipo === 'saida' && Number(produto.quantidade_atual) < quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para "${produto.nome}": disponível ${produto.quantidade_atual}, solicitado ${quantidade}.`,
        );
      }

      await tx.produtos.update({
        where: { id: produto_id },
        data: {
          quantidade_atual:
            tipo === 'entrada' ? { increment: quantidade } : { decrement: quantidade },
        },
      });

      return tx.movimentacoes.create({
        data: { produto_id, usuario_id, tipo, quantidade, motivo },
      });
    });
  }

  async findAll(limite?: number, produtoId?: number, periodo?: string, pagina = 1) {
    const where: { produto_id?: number; criado_em?: { gte: Date } } = {};

    if (produtoId){
      where.produto_id = produtoId;
    }

    const desde = this.calcularDataInicio(periodo);
    if (desde){
      where.criado_em = { gte: desde };
    }

    const total = await this.prisma.movimentacoes.count({ where });
    const { skip, take, ...paginacao } = calcularPaginacao(total, pagina, limite ?? PADRAO_POR_PAGINA);

    const movimentacoes = await this.prisma.movimentacoes.findMany({
      where,
      orderBy: { criado_em: 'desc' },
      take,
      skip,
      include: {
         produtos: { select: { nome: true, unidade_medida: true } },
         usuarios: { select: { nome: true } },
      },
    });

    return { movimentacoes, ...paginacao };
  }

  findOne(id: number) {
    return this.prisma.movimentacoes.findUnique({ where: { id } });
  }

  private calcularDataInicio(periodo?: string): Date | undefined {
    if (!periodo || periodo === 'todos') return undefined;

    const inicio = new Date();

    if (periodo === 'hoje') {
      inicio.setHours(0, 0, 0, 0);
      return inicio;
    }
    
    if (periodo === 'semana') {
      inicio.setDate(inicio.getDate() - 7);
      return inicio;
    }

    if(periodo === 'mes'){
      inicio.setDate(inicio.getDate() - 30);
      return inicio;
    }

    return undefined;
  }
}