import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuarioId = request['usuario']?.sub;

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { papel: true, ativo: true },
    });

    if (!usuario || !usuario.ativo || usuario.papel !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem gerenciar usuários');
    }

    return true;
  }
}