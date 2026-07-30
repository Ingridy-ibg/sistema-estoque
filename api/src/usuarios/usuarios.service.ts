import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';    

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUsuarioDto: CreateUsuarioDto){
        const { nome, email, senha } = createUsuarioDto;

        const existente = await this.prisma.usuarios.findUnique({where: {email} } );

        if (existente){
            throw new ConflictException('Já existe um usuário com esse email');
        }

        const senha_hash = await bcrypt.hash(senha,10);

        return this.prisma.usuarios.create({
            data: { nome, email, senha_hash },
            select: { id: true, nome: true, email: true },
        });
    }

    findAll(){
        return this.prisma.usuarios.findMany({
            where: { ativo: true },
            orderBy: {nome: 'asc'},
            select: { id: true, nome: true, email: true },
        });
    }

    async remove(id: number, usuarioLogadoId: number) {
    if (id === usuarioLogadoId) {
        throw new BadRequestException('Você não pode excluir sua própria conta');
    }

    const usuario = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!usuario || !usuario.ativo) {
        throw new NotFoundException(`Usuário ${id} não existe`);
    }

    return this.prisma.usuarios.update({
        where: { id },
        data: { ativo: false },
        select: { id: true, nome: true, email: true },
    });
    }
}
