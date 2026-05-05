// Script de seed para criar dados iniciais de demonstração
// Executar uma única vez: npx tsx src/db/seed.ts
import bcrypt from 'bcrypt'
import { pool } from './connection.js'

const senhaHash = await bcrypt.hash('admin123', 10)

const { rows: [restaurante] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_restaurante (nome, endereco, telefone)
   VALUES ('Restaurante Demo', 'Rua das Flores, 123 — Centro', '(11) 99999-9999')
   RETURNING id`,
)

await pool.query(
  `INSERT INTO tb_usuario (restaurante_id, nome, email, senha_hash, perfil)
   VALUES ($1, 'Administrador', 'admin@sigep.com', $2, 'gerente')`,
  [restaurante!.id, senhaHash],
)

await pool.query(
  `INSERT INTO tb_usuario (restaurante_id, nome, email, senha_hash, perfil)
   VALUES ($1, 'Atendente Demo', 'atendente@sigep.com', $2, 'atendente')`,
  [restaurante!.id, senhaHash],
)

const { rows: [categoria] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_categoria (restaurante_id, nome, ordem)
   VALUES ($1, 'Pratos Principais', 1)
   RETURNING id`,
  [restaurante!.id],
)

await pool.query(
  `INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco)
   VALUES
   ($1, $2, 'Frango Grelhado', 'Frango grelhado com legumes e arroz', 32.90),
   ($1, $2, 'Filé ao Molho', 'Filé mignon ao molho madeira com batata frita', 58.90),
   ($1, $2, 'Massa Carbonara', 'Espaguete carbonara com bacon e parmesão', 39.90)`,
  [restaurante!.id, categoria!.id],
)

await pool.query(
  `INSERT INTO tb_integracao (restaurante_id, tipo, ativo)
   VALUES ($1, 'whatsapp', true)`,
  [restaurante!.id],
)

console.log('✅ Seed concluído!')
console.log('   Gerente:    admin@sigep.com    / admin123')
console.log('   Atendente:  atendente@sigep.com / admin123')

await pool.end()
