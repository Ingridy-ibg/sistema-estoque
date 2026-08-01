import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { calcularPaginacao, PADRAO_POR_PAGINA } from '../common/paginacao';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService){}

  async create(createCategoriaDto: CreateCategoriaDto) {

       const ativo = await this.prisma.categorias.findFirst({
          where: { nome: { equals: createCategoriaDto.nome, mode: 'insensitive' } },
        });
    
        if (ativo){
          throw new ConflictException('Já existe uma categoria com esse nome');
        }

    return this.prisma.categorias.create({ data: createCategoriaDto });
  }

  async findAll(pagina = 1, porPagina = PADRAO_POR_PAGINA) {
    const total = await this.prisma.categorias.count();
    const { skip, take, ...paginacao } = calcularPaginacao(total, pagina, porPagina);

    const categorias = await this.prisma.categorias.findMany({
      orderBy: {nome: 'asc'},
      take,
      skip,

        include: {
           _count: {
            select: { produtos: {where: { ativo: true } } } ,
      },
    },

    });

    return { categorias, ...paginacao };
  }

  listarParaSelecao() {
    return this.prisma.categorias.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    });
  }

  findOne(id: number) {
    return this.prisma.categorias.findUnique({ where: { id }});

  }

  update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    return this.prisma.categorias.update({
      where: {id},
      data: updateCategoriaDto,
    });
  }

  async remove(id: number) {
    const categoria = await this.prisma.categorias.findUnique({ where: { id },
    include: { _count: { select: {produtos: {where: {ativo: true } } },
    },
  },
  });

  if (!categoria){
    throw new NotFoundException(`Categria ${id} não existe`);
  }

    if (categoria._count.produtos > 0){

  throw new BadRequestException(`Não é possível excluir essa categoria. ${categoria._count.produtos} produto(s) ainda estão ligadas à ela.`);    
  }

 return this.prisma.$transaction(async (tx) => {
    await tx.produtos.updateMany({
      where: { categoria_id: id },
      data: { categoria_id: null },
    });

  return tx.categorias.delete({ where: { id } });

  });
}
}
