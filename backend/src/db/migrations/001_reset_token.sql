-- Migration: adicionar tabela de tokens de redefinição de senha
-- Execute uma vez no banco de produção:
--   psql $DATABASE_URL -f src/db/migrations/001_reset_token.sql

CREATE TABLE IF NOT EXISTS tb_reset_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES tb_usuario(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON tb_reset_token (token_hash);
CREATE INDEX IF NOT EXISTS idx_reset_token_usuario ON tb_reset_token (usuario_id);
