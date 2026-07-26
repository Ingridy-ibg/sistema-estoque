import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req} from '@nestjs/common';
import type { Request } from 'express';
import { MovimentacoesService } from './movimentacoes.service';
import { CreateMovimentacoeDto } from './dto/create-movimentacoe.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  create(@Body() createMovimentacoeDto: CreateMovimentacoeDto, @Req() request: Request) {
    const usuarioId = (request['usuario'] as { sub: number }).sub;
    return this.movimentacoesService.create(createMovimentacoeDto, usuarioId);
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
