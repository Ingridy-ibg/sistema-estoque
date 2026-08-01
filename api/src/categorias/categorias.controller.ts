import { Controller,
   Get, 
   Post,
   Body,
   Patch, 
   Param, 
   Delete, 
   ParseIntPipe,
   Query,
   } from '@nestjs/common';

import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  findAll(
    @Query('pagina', new ParseIntPipe({ optional: true })) pagina?: number,
    @Query('por_pagina', new ParseIntPipe({ optional: true })) porPagina?: number,
  ) {
    return this.categoriasService.findAll(pagina, porPagina);
  }

  @Get('selecao')
  listarParaSelecao() {
    return this.categoriasService.listarParaSelecao();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
