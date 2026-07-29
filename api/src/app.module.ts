import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProdutosModule } from './produtos/produtos.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [PrismaModule, CategoriasModule, ProdutosModule, MovimentacoesModule, AuthModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
