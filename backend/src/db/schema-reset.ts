import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Drop todas as tabelas na ordem correta (respeita FKs)
await pool.query(`
  DROP TABLE IF EXISTS tb_relatorio        CASCADE;
  DROP TABLE IF EXISTS tb_integracao       CASCADE;
  DROP TABLE IF EXISTS tb_status_historico CASCADE;
  DROP TABLE IF EXISTS tb_item_pedido      CASCADE;
  DROP TABLE IF EXISTS tb_pedido           CASCADE;
  DROP TABLE IF EXISTS tb_cliente          CASCADE;
  DROP TABLE IF EXISTS tb_produto          CASCADE;
  DROP TABLE IF EXISTS tb_categoria        CASCADE;
  DROP TABLE IF EXISTS tb_usuario          CASCADE;
  DROP TABLE IF EXISTS tb_restaurante      CASCADE;
`)
console.log('🗑️  Tabelas removidas')

const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
await pool.query(sql)
console.log('✅ Schema recriado com sucesso!')

await pool.end()
