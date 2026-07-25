import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MovimentacoesService } from './movimentacoes.service';
import { CreateMovimentacoeDto } from './dto/create-movimentacoe.dto';
import { UpdateMovimentacoeDto } from './dto/update-movimentacoe.dto';
import { UseGuards } from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  create(@Body() createMovimentacoeDto: CreateMovimentacoeDto) {
    return this.movimentacoesService.create(createMovimentacoeDto);
  }

  @Get()
  findAll() {
    return this.movimentacoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimentacoesService.findOne(id);
  }

  }
