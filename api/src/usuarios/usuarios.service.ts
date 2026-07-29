import { Injectable, ConflictException } from '@nestjs/common';
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
            orderBy: {nome: 'asc'},
            select: { id: true, nome: true, email: true },
        });
    }
}
