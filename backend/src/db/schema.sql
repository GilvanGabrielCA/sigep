CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tb_restaurante (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      VARCHAR(200) NOT NULL,
  endereco  TEXT,
  telefone  VARCHAR(20),
  logo_url  TEXT,
  dpo_nome  VARCHAR(200),
  dpo_email VARCHAR(200),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('gerente', 'atendente')),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tb_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES tb_categoria(id) ON DELETE SET NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  imagem_url TEXT,
  disponivel BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  telefone VARCHAR(30),
  endereco TEXT,
  canal VARCHAR(20) DEFAULT 'whatsapp',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES tb_cliente(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Recebido'
    CHECK (status IN ('Recebido', 'Em Preparacao', 'Pronto para Entrega', 'Entregue', 'Cancelado')),
  canal VARCHAR(20) DEFAULT 'interno',
  total NUMERIC(10,2),
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_item_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES tb_pedido(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES tb_produto(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  observacao TEXT
);

CREATE TABLE IF NOT EXISTS tb_status_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES tb_pedido(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES tb_usuario(id) ON DELETE SET NULL,
  status_anterior VARCHAR(30),
  status_novo VARCHAR(30) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_integracao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
  ativo BOOLEAN DEFAULT FALSE,
  configuracao JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tb_relatorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  dados JSONB,
  gerado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_reset_token (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES tb_usuario(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expira_em  TIMESTAMPTZ NOT NULL,
  usado      BOOLEAN NOT NULL DEFAULT false,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LGPD ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tb_consentimento (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  telefone       VARCHAR(30) NOT NULL,
  aceito         BOOLEAN NOT NULL DEFAULT TRUE,
  canal          VARCHAR(20) DEFAULT 'whatsapp',
  criado_em      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (restaurante_id, telefone)
);

CREATE TABLE IF NOT EXISTS tb_auditoria (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID REFERENCES tb_restaurante(id) ON DELETE SET NULL,
  usuario_id     UUID REFERENCES tb_usuario(id) ON DELETE SET NULL,
  entidade       VARCHAR(50) NOT NULL,
  entidade_id    TEXT,
  operacao       VARCHAR(20) NOT NULL
                   CHECK (operacao IN ('READ','UPDATE','DELETE','ANONYMIZE','EXPORT','CONSENT')),
  descricao      TEXT,
  criado_em      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tb_solicitacao_lgpd (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID NOT NULL REFERENCES tb_restaurante(id) ON DELETE CASCADE,
  telefone       VARCHAR(30),
  email          VARCHAR(200),
  tipo           VARCHAR(30) NOT NULL
                   CHECK (tipo IN ('ACESSO','CORRECAO','EXCLUSAO','PORTABILIDADE','REVOGACAO')),
  status         VARCHAR(20) NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente','em_analise','concluido','negado')),
  descricao      TEXT,
  resposta       TEXT,
  criado_em      TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_restaurante   ON tb_auditoria(restaurante_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacao_restaurante ON tb_solicitacao_lgpd(restaurante_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_consentimento_lookup    ON tb_consentimento(restaurante_id, telefone);
