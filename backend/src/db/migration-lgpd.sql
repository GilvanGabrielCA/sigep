-- Migração LGPD — executar uma vez no banco de produção
-- Adiciona campos de DPO ao restaurante, tabelas de consentimento, auditoria e solicitações

ALTER TABLE tb_restaurante
  ADD COLUMN IF NOT EXISTS dpo_nome  VARCHAR(200),
  ADD COLUMN IF NOT EXISTS dpo_email VARCHAR(200);

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

CREATE INDEX IF NOT EXISTS idx_auditoria_restaurante    ON tb_auditoria(restaurante_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacao_restaurante  ON tb_solicitacao_lgpd(restaurante_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_consentimento_lookup     ON tb_consentimento(restaurante_id, telefone);
