import { Injectable, NotFoundException, BadRequestException, ConflictException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { calcularPaginacao, PADRAO_POR_PAGINA } from '../common/paginacao';
import { Prisma } from '../generated/prisma/client';

interface FiltrosProdutos {
  categoriaId?: string;
  busca?: string;
  emFalta?: boolean;
  pagina?: number;
  porPagina?: number;
}

@Injectable()
export class ProdutosService {

  constructor(private readonly prisma: PrismaService) {}



  async create(createProdutoDto: CreateProdutoDto) {
    await this.verificarCategoriaExiste(createProdutoDto.categoria_id);

    const ativo = await this.prisma.produtos.findFirst({
      where: {nome: createProdutoDto.nome, ativo: true},
    });

    if (ativo){
      throw new ConflictException('Já existe um produto com esse nome');
    }

    const inativo = await this.prisma.produtos.findFirst({
      where: { nome: createProdutoDto.nome, ativo: false}
    });

    if (inativo){
      throw new ConflictException(`Existe um produto excluído com esse nome. Você pode reativá-lo em "Produtos excluídos".`);
    }
    return this.prisma.produtos.create({ data: createProdutoDto });
  }



 async findAll({ categoriaId, busca, emFalta, pagina = 1, porPagina = PADRAO_POR_PAGINA }: FiltrosProdutos = {}) {

    const where: Prisma.produtosWhereInput = { ativo: true };

    if (categoriaId === 'sem' ) {
      where.categoria_id = null;
    }else if (categoriaId){
      const id = Number(categoriaId);
      if (Number.isNaN(id)){
        throw new BadRequestException('categoria_id invalido');
      }
      where.categoria_id = id;
    }

    const termo = busca?.trim();
    if (termo){
      where.nome = { contains: termo, mode: 'insensitive' };
    }

    if (emFalta){
      // comparação entre colunas: estoque atual abaixo do mínimo do próprio produto
      where.quantidade_atual = { lt: this.prisma.produtos.fields.quantidade_minima };
    }

    const total = await this.prisma.produtos.count({ where });
    const { skip, take, ...paginacao } = calcularPaginacao(total, pagina, porPagina);

    const produtos = await this.prisma.produtos.findMany({
      where,
      orderBy: { nome: 'asc'},
      include: { categorias: { select: { nome: true } } },
      take,
      skip,
    });

    return { produtos, ...paginacao };
  }

  listarParaSelecao() {
  return this.prisma.produtos.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, unidade_medida: true, quantidade_atual: true },
  });
}

  findOne(id: number) {
    return this.prisma.produtos.findUnique({where: {id} });
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    await this.verificarCategoriaExiste( updateProdutoDto.categoria_id);

    if (updateProdutoDto.nome) {
    const existente = await this.prisma.produtos.findFirst({
      where: {
        nome: updateProdutoDto.nome,
        ativo: true,
        id: { not: id },
      },
    });

    if (existente) {
      throw new ConflictException('Já existe um produto com esse nome');
    }
  }  
    return this.prisma.produtos.update({
      where: {id},
      data: updateProdutoDto,
    });
  }

  async remove(id: number) {
    const produto = await this.prisma.produtos.findUnique({ where: { id } });
    if(!produto){
      throw new NotFoundException(`Produto ${id} não existe`)
    }
    return this.prisma.produtos.update({
      where: { id },
      data: { ativo: false },
    }); 
  }

  private async verificarCategoriaExiste(categoriaId?: number | null) {
    if (categoriaId === undefined || categoriaId === null ) return;

    const categoria = await this.prisma.categorias.findUnique({
      where: {id: categoriaId},
    });

    if (!categoria){
      throw new NotFoundException(`Categoria ${categoriaId} não existe.`);
    }
  }

  async findEmFalta(pagina = 1, porPagina = PADRAO_POR_PAGINA){
    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>`
    SELECT COUNT(*)::int AS total
    FROM produtos
    WHERE ativo = true AND quantidade_atual < quantidade_minima;
    `;

    const { skip, take, ...paginacao } = calcularPaginacao(total, pagina, porPagina);

    const produtos = await this.prisma.$queryRaw`
    SELECT id, nome, quantidade_atual, quantidade_minima
    FROM produtos
    WHERE ativo = true AND quantidade_atual < quantidade_minima
    ORDER BY nome
    LIMIT ${take} OFFSET ${skip};
    `;

    return { produtos, ...paginacao };
  }

  async historico(produtoId: number){
    const produto = await this.prisma.produtos.findUnique({ where: {id: produtoId}});
    if (!produto){
      throw new NotFoundException(`Produto ${produtoId} não existe.`);
    }
    const movimentacoes = await this.prisma.movimentacoes.findMany({
      where: {produto_id: produtoId},
      orderBy: {criado_em: 'desc'},
      include: {usuarios: {select: {nome: true}}},
    });

    return {produto: produto.nome, movimentacoes };

  }

  async valorTotalEstoque() {
    const resultado = await this.prisma.$queryRaw<{ valor_atual: string | null }[]>`
    SELECT ROUND(SUM(quantidade_atual * preco_custo), 2)::text AS valor_atual
    FROM produtos WHERE ativo = true;
    `; 
    
    return {valor_total: resultado[0].valor_atual };
  }

  findInativos(){
    return this.prisma.produtos.findMany({
      where: { ativo: false },
      orderBy: { nome: 'asc'},
      include: { categorias: {select: { nome: true } } },
    });
  }


  async reativar(id: number) {
    
    const produto = await this.prisma.produtos.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto ${id} não existe`);
    }

    if (produto.ativo) {
      throw new BadRequestException('Este produto já está ativo');
    }

    const conflito = await this.prisma.produtos.findFirst({
      where: { nome: produto.nome, ativo: true },
    });

    if (conflito) {
      throw new ConflictException(
        `Já existe um produto ativo com o nome "${produto.nome}". Renomeie ou exclua o outro antes de reativar.`,
      );
    }

    return this.prisma.produtos.update({
      where: { id },
      data: { ativo: true },
    });
  }
}


