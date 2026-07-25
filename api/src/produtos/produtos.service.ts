import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    await this.verificarCategoriaExiste(createProdutoDto.categoria_id);
    return this.prisma.produtos.create({ data: createProdutoDto });
  }

  findAll() {
    return this.prisma.produtos.findMany({
    include: { categorias: { select: { nome: true } } },
  });
  }

  findOne(id: number) {
    return this.prisma.produtos.findUnique({where: {id} });
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    await this.verificarCategoriaExiste( updateProdutoDto.categoria_id);
    return this.prisma.produtos.update({
      where: {id},
      data: updateProdutoDto,
    });
  }

  remove(id: number) {
    return this.prisma.produtos.delete({where: {id}});
  }

  private async verificarCategoriaExiste(categoriaId?: number) {
    if (categoriaId === undefined) return;

    const categoria = await this.prisma.categorias.findUnique({
      where: {id: categoriaId},
    });

    if (!categoria){
      throw new NotFoundException(`Categoria ${categoriaId} não existe.`);
    }
  }

  async findEmFalta(){
    return this.prisma.$queryRaw`
    SELECT id, nome, quantidade_atual, quantidade_minima
    FROM produtos
    WHERE quantidade_atual <= quantidade_minima
    ORDER BY nome;
    `;
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
    SELECT ROUND(SUM(quantidade_atual * preco_unitario), 2):: text AS valor_atual
    FROM produtos;
    `; 
    
    return {valor_total: resultado[0].valor_atual };
  }


}

