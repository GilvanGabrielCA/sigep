import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'migrations/005_update_file_mignon_img.sql'), 'utf-8')

const { rowCount } = await pool.query(sql)
console.log(`✅ Imagem do Filé Mignon atualizada — ${rowCount} produto(s) afetado(s)`)
await pool.end()
