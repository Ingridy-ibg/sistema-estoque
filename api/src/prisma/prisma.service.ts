import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Uma única fonte de configuração: a mesma DATABASE_URL que o CLI do Prisma
    // usa em prisma.config.ts. Parâmetros como ?sslmode=require viajam na própria
    // string, que é o formato exigido por provedores gerenciados (Neon, Supabase).
    // A ausência da variável é barrada no boot, em main.ts.
    const adapter = new PrismaPg(process.env.DATABASE_URL as string);
    super({ adapter });
  }
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

