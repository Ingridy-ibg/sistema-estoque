import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService){}

  create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categorias.create({ data: createCategoriaDto });
  }

  findAll() {
    return this.prisma.categorias.findMany({ 
      orderBy: {nome: 'asc'},
        include: { _count: { select: { produtos: true } } },
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
    include: { _count: { select: {produtos: true}}},
  });

  if (!categoria){
    throw new NotFoundException(`Categria ${id} não existe`);
  }

    if (categoria._count.produtos > 0){

  throw new BadRequestException(`Não é possível excluir essa categoria. ${categoria._count.produtos} produto(s) ainda estão ligadas à ela.`);    
  }
  return this.prisma.categorias.delete({ where: { id }});
  }
}
