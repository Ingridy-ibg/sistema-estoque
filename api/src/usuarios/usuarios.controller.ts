import { Controller, Get, Post, Body, UseGuards, Delete, Param, ParseIntPipe, Req, Patch } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from "../auth/admin.guard";
import type { Request } from 'express';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Post()
    create(@Body() createUsuarioDto: CreateUsuarioDto){
        return this.usuariosService.create(createUsuarioDto);
    }

    @Get()
    findAll() {
        return this.usuariosService.findAll();
    }
    @Get('inativos')
    findInativos() {
    return this.usuariosService.findInativos();
    }

    @Patch(':id/reativar')
    reativar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.reativar(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        const usuarioLogadoId = (request['usuario'] as { sub: number }).sub;
        return this.usuariosService.remove(id, usuarioLogadoId);
    }
}
