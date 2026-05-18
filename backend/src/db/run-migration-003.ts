import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'migrations', '003_superadmin.sql'), 'utf8')

await pool.query(sql)
console.log('✓ Migration 003 (superadmin) aplicada com sucesso!')
await pool.end()
