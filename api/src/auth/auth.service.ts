import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(email: string, senha: string){
        const usuario = await this.prisma.usuarios.findUnique({ where: { email }});

        if (!usuario) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida){
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        if (!usuario || !usuario.ativo) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const payload = { sub: usuario.id, email: usuario.email, papel: usuario.papel };

        const access_token = await this.jwtService.signAsync(payload);

        return { access_token };
    }

}
