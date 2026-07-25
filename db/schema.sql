CREATE TABLE categorias (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE produtos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    nome VARCHAR(150) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    quantidade_atual NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    quantidade_minima NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0),
    preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0)
);

CREATE TABLE usuarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL
);

CREATE TABLE movimentacoes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
    motivo TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT now()
);
