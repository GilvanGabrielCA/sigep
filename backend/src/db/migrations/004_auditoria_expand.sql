-- Migration 004: expandir operações de auditoria e adicionar ip_address

ALTER TABLE tb_auditoria DROP CONSTRAINT IF EXISTS tb_auditoria_operacao_check;

ALTER TABLE tb_auditoria ADD CONSTRAINT tb_auditoria_operacao_check
  CHECK (operacao IN (
    'CREATE', 'READ', 'UPDATE', 'DELETE',
    'LOGIN', 'LOGIN_FAIL', 'TOGGLE', 'STATUS_CHANGE',
    'PASSWORD_RESET', 'CONFIG_CHANGE',
    'ANONYMIZE', 'EXPORT', 'CONSENT'
  ));

ALTER TABLE tb_auditoria ADD COLUMN IF NOT EXISTS ip_address TEXT;

CREATE INDEX IF NOT EXISTS idx_auditoria_operacao ON tb_auditoria (operacao);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON tb_auditoria (entidade);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON tb_auditoria (criado_em DESC);
