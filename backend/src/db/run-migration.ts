import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'migrations', '001_reset_token.sql'), 'utf8')

await pool.query(sql)
console.log('✓ Migration aplicada com sucesso!')
await pool.end()
