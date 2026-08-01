import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { calcularPaginacao, PADRAO_POR_PAGINA } from '../common/paginacao';

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUsuarioDto: CreateUsuarioDto){
        const { nome, email, senha } = createUsuarioDto;

        const existente = await this.prisma.usuarios.findUnique({where: {email} } );

        if(existente){
        if (existente.ativo){
            throw new ConflictException('Já existe um usuário com esse email');
        }
        throw new ConflictException(
      'Existe um usuário excluído com esse e-mail. Você pode reativá-lo em "Usuários excluídos".',
    );
    }

        const senha_hash = await bcrypt.hash(senha,10);

        return this.prisma.usuarios.create({
            data: { nome, email, senha_hash },
            select: { id: true, nome: true, email: true },
        });
    }

    async findAll(pagina = 1, porPagina = PADRAO_POR_PAGINA){
        const where = { ativo: true };
        const total = await this.prisma.usuarios.count({ where });
        const { skip, take, ...paginacao } = calcularPaginacao(total, pagina, porPagina);

        const usuarios = await this.prisma.usuarios.findMany({
            where,
            orderBy: {nome: 'asc'},
            select: { id: true, nome: true, email: true },
            take,
            skip,
        });

        return { usuarios, ...paginacao };
    }

    listarParaSelecao(){
        return this.prisma.usuarios.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' },
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

    findInativos() {
  return this.prisma.usuarios.findMany({
    where: { ativo: false },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, email: true },
  });
}

async reativar(id: number) {
  const usuario = await this.prisma.usuarios.findUnique({ where: { id } });

  if (!usuario) {
    throw new NotFoundException(`Usuário ${id} não existe`);
  }

  if (usuario.ativo) {
    throw new BadRequestException('Este usuário já está ativo');
  }

  return this.prisma.usuarios.update({
    where: { id },
    data: { ativo: true },
    select: { id: true, nome: true, email: true },
  });
}

private async definirNovaSenha(id: number, senhaNova: string) {
  const senha_hash = await bcrypt.hash(senhaNova, 10);

  await this.prisma.usuarios.update({
    where: { id },
    data: { senha_hash },
  });

  return { mensagem: 'Senha alterada com sucesso' };
}

async redefinirSenha(id: number, senhaNova: string, usuarioLogadoId: number) {
 const usuario = await this.prisma.usuarios.findUnique({ where: { id } });

  if (!usuario || !usuario.ativo) {
    throw new NotFoundException(`Usuário ${id} não existe`);
  }

  return this.definirNovaSenha(id, senhaNova);
}

async alterarPropriaSenha(usuarioId: number, senhaNova: string) {
  return this.definirNovaSenha(usuarioId, senhaNova);
}

}
