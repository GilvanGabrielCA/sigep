import { createHash, randomBytes } from 'crypto'
import type { QueryResult } from 'pg'
import { pool } from './connection.js'

export interface ResetTokenRow {
  id: string
  usuario_id: string
  token_hash: string
  expira_em: string
  usado: boolean
  criado_em: string
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Gera token plaintext de 256 bits — nunca armazenado, apenas enviado por e-mail */
export function generateRawToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Cria um novo token para o usuário.
 * Deleta todos os tokens antigos do mesmo usuário antes de inserir.
 * Retorna o token plaintext (enviado ao usuário via e-mail).
 */
export async function createResetToken(usuarioId: string): Promise<string> {
  const raw = generateRawToken()
  const hash = hashToken(raw)
  const expiraEm = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await pool.query('DELETE FROM tb_reset_token WHERE usuario_id = $1', [usuarioId])

  await pool.query(
    `INSERT INTO tb_reset_token (usuario_id, token_hash, expira_em)
     VALUES ($1, $2, $3)`,
    [usuarioId, hash, expiraEm],
  )

  return raw
}

/**
 * Busca um token válido (não usado e não expirado) pelo plaintext.
 * Retorna null se inválido, expirado ou já utilizado.
 */
export async function findValidResetToken(raw: string): Promise<ResetTokenRow | null> {
  const hash = hashToken(raw)
  const result: QueryResult<ResetTokenRow> = await pool.query(
    `SELECT * FROM tb_reset_token
     WHERE token_hash = $1
       AND usado = false
       AND expira_em > NOW()`,
    [hash],
  )
  return result.rows[0] ?? null
}

/** Marca o token como usado (invalidação pós-redefinição) */
export async function markTokenAsUsed(raw: string): Promise<void> {
  const hash = hashToken(raw)
  await pool.query(
    'UPDATE tb_reset_token SET usado = true WHERE token_hash = $1',
    [hash],
  )
}
