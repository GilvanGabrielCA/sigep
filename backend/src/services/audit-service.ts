import { pool } from '../db/connection.js'

export type OperacaoAuditoria =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGIN_FAIL' | 'TOGGLE' | 'STATUS_CHANGE'
  | 'PASSWORD_RESET' | 'CONFIG_CHANGE'
  | 'ANONYMIZE' | 'EXPORT' | 'CONSENT'

export interface AuditParams {
  restauranteId?: string | null
  usuarioId?: string | null
  entidade: string
  entidadeId?: string | null
  operacao: OperacaoAuditoria
  descricao?: string
  ipAddress?: string | null
}

export function audit(params: AuditParams): void {
  pool.query(
    `INSERT INTO tb_auditoria
       (restaurante_id, usuario_id, entidade, entidade_id, operacao, descricao, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      params.restauranteId ?? null,
      params.usuarioId ?? null,
      params.entidade,
      params.entidadeId ?? null,
      params.operacao,
      params.descricao ?? null,
      params.ipAddress ?? null,
    ],
  ).catch(() => {})
}

export function getIp(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } }): string | null {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])?.trim() ?? null
  return req.socket.remoteAddress ?? null
}
