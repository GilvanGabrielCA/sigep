-- Migration 003: perfil superadmin + coluna foto_url em tb_usuario

ALTER TABLE tb_usuario DROP CONSTRAINT IF EXISTS tb_usuario_perfil_check;
ALTER TABLE tb_usuario ADD CONSTRAINT tb_usuario_perfil_check
  CHECK (perfil IN ('gerente', 'atendente', 'superadmin'));

ALTER TABLE tb_usuario ADD COLUMN IF NOT EXISTS foto_url TEXT;

UPDATE tb_usuario
SET perfil = 'superadmin'
WHERE email = 'gilvangabriealencar@gmail.com';
