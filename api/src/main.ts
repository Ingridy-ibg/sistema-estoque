import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Falha antes de subir qualquer coisa quando falta configuração.
 * Sem isso a API inicia normalmente e só quebra no primeiro uso — o login
 * devolve 500 e as rotas protegidas devolvem "Token inválido ou expirado",
 * que esconde a causa real.
 */
function validarAmbiente() {
  const obrigatorias = [
    'JWT_SECRET',
    // usada tanto pelo CLI do Prisma (migrate/generate, via prisma.config.ts)
    // quanto em execução pelo PrismaService
    'DATABASE_URL',
  ];
  // string vazia conta como ausente: é o caso de variável cadastrada sem valor
  const faltando = obrigatorias.filter((nome) => !process.env[nome]);

  if (faltando.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${faltando.join(', ')}`,
    );
  }
}

async function bootstrap() {
  validarAmbiente();

  const app = await NestFactory.create(AppModule);
  // qualquer origem: a autenticação é por Bearer token no header, não por cookie,
  // então o navegador não anexa credenciais automaticamente entre sites
  app.enableCors({ origin: '*' });
  app.useGlobalPipes( new ValidationPipe ({ whitelist: true, forbidNonWhitelisted: true}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


