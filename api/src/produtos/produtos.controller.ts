
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController{

  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }


  @Get('em-falta')
  findEmFalta(){
    return this.produtosService.findEmFalta();
  }

  @Get('valor-total')
  valorTotalEstoque(){
    return this.produtosService.valorTotalEstoque();
  }

  @Get(':id/historico')
  historico(@Param('id', ParseIntPipe) id: number){
    return this.produtosService.historico(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProdutoDto: UpdateProdutoDto) {
    return this.produtosService.update(id, updateProdutoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.remove(id);
  }
}
