import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'migrations', '004_auditoria_expand.sql'), 'utf8')

await pool.query(sql)
console.log('✓ Migration 004 (auditoria expand) aplicada com sucesso!')
await pool.end()
