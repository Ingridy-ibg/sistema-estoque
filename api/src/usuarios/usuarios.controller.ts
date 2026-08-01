import { Controller, Get, Post, Body, UseGuards, Delete, Param, ParseIntPipe, Req, Patch, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from "../auth/admin.guard";
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

  @Patch('minha-senha')
  alterarPropriaSenha(@Body() dto: AlterarSenhaDto, @Req() request: Request) {
    const usuarioId = (request['usuario'] as { sub: number }).sub;
    return this.usuariosService.alterarPropriaSenha(usuarioId, dto.senha_nova);
  }
    @UseGuards(AdminGuard)
    @Post()
    create(@Body() createUsuarioDto: CreateUsuarioDto){
        return this.usuariosService.create(createUsuarioDto);
    }

    @UseGuards(AdminGuard)
    @Get()
    findAll(
        @Query('pagina', new ParseIntPipe({ optional: true })) pagina?: number,
        @Query('por_pagina', new ParseIntPipe({ optional: true })) porPagina?: number,
    ) {
        return this.usuariosService.findAll(pagina, porPagina);
    }

    @UseGuards(AdminGuard)
    @Get('selecao')
    listarParaSelecao() {
        return this.usuariosService.listarParaSelecao();
    }

    @UseGuards(AdminGuard)
    @Get('inativos')
    findInativos() {
    return this.usuariosService.findInativos();
    }

    @UseGuards(AdminGuard)
    @Patch(':id/reativar')
    reativar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.reativar(id);
    }

  @UseGuards(AdminGuard)
  @Patch(':id/senha')
  redefinirSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RedefinirSenhaDto,
    @Req() request: Request,
  ) {
    const usuarioLogadoId = (request['usuario'] as { sub: number }).sub;
    return this.usuariosService.redefinirSenha(id, dto.senha_nova, usuarioLogadoId);
  }

    @UseGuards(AdminGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        const usuarioLogadoId = (request['usuario'] as { sub: number }).sub;
        return this.usuariosService.remove(id, usuarioLogadoId);
    }
}
