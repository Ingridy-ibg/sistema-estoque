-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" SERIAL NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "motivo" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER,
    "nome" VARCHAR(150) NOT NULL,
    "unidade_medida" VARCHAR(20) NOT NULL,
    "quantidade_atual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "quantidade_minima" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "preco_custo" DECIMAL(10,2) NOT NULL,
    "preco_venda" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" VARCHAR(20) NOT NULL DEFAULT 'operador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
