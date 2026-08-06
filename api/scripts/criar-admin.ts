import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Cria (ou promove a admin) um usuário. Não recebe a senha por argumento
 * de linha de comando de propósito — argumentos ficam no histórico do shell
 * e em `ps`. Use variáveis de ambiente, passadas só na chamada:
 *
 *   ADMIN_EMAIL="devanir@estoque.com" ADMIN_SENHA="sua-senha-aqui" npm run seed:admin
 *
 * Para apontar para outro banco (produção, por exemplo), sobrescreva a
 * DATABASE_URL na mesma linha.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;
  const nome = process.env.ADMIN_NOME ?? 'Admin';

  if (!email || !senha) {
    console.error('Defina ADMIN_EMAIL e ADMIN_SENHA antes de rodar este script.');
    process.exit(1);
  }
  if (senha.length < 6) {
    console.error('ADMIN_SENHA precisa ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não definida.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
  });

  try {
    const senha_hash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuarios.upsert({
      where: { email },
      update: { senha_hash, papel: 'admin', ativo: true },
      create: { nome, email, senha_hash, papel: 'admin' },
      select: { id: true, nome: true, email: true, papel: true },
    });

    console.log('Admin pronto:', usuario);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
