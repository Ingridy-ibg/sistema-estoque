import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacoeDto } from './dto/create-movimentacoe.dto';

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

  findAll() {
    return this.prisma.movimentacoes.findMany({
      orderBy: { criado_em: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.movimentacoes.findUnique({ where: { id } });
  }
}