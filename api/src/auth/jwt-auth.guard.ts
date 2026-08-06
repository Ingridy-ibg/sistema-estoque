import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor (private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean>{
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
        throw new UnauthorizedException('Token não fornecido');
    }

    try {
        const payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET,
        });
        request['usuario'] = payload;

    } catch (erro) {
        // sessão expirada é o caso normal (o token vale 8h) e merece mensagem própria;
        // qualquer outra falha é token corrompido ou assinado com outro segredo
        if (erro instanceof Error && erro.name === 'TokenExpiredError') {
            throw new UnauthorizedException('Sua sessão expirou. Entre novamente.');
        }
        throw new UnauthorizedException('Token inválido');
    }
    return true;
}

private extractTokenFromHeader(request: Request): string | undefined {

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
}
}