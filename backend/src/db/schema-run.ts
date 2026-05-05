import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')

await pool.query(sql)
console.log('✅ Schema aplicado com sucesso!')
await pool.end()
