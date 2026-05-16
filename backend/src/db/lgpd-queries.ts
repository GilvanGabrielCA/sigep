import { pool } from './connection.js'

export interface ConsentimentoRow {
  id: string
  restaurante_id: string
  telefone: string
  aceito: boolean
  canal: string
  criado_em: string
}

export interface AuditoriaRow {
  id: string
  restaurante_id: string | null
  usuario_id: string | null
  usuario_nome: string | null
  entidade: string
  entidade_id: string | null
  operacao: string
  descricao: string | null
  criado_em: string
}

export interface SolicitacaoLgpdRow {
  id: string
  restaurante_id: string
  telefone: string | null
  email: string | null
  tipo: string
  status: string
  descricao: string | null
  resposta: string | null
  criado_em: string
  atualizado_em: string
}

export async function findConsentimento(
  restauranteId: string,
  telefone: string,
): Promise<ConsentimentoRow | null> {
  const { rows } = await pool.query<ConsentimentoRow>(
    `SELECT * FROM tb_consentimento WHERE restaurante_id = $1 AND telefone = $2 LIMIT 1`,
    [restauranteId, telefone],
  )
  return rows[0] ?? null
}

export async function upsertConsentimento(
  restauranteId: string,
  telefone: string,
  aceito: boolean,
): Promise<void> {
  await pool.query(
    `INSERT INTO tb_consentimento (restaurante_id, telefone, aceito)
     VALUES ($1, $2, $3)
     ON CONFLICT (restaurante_id, telefone) DO UPDATE SET aceito = $3, criado_em = NOW()`,
    [restauranteId, telefone, aceito],
  )
}

export async function listConsentimentos(restauranteId: string): Promise<ConsentimentoRow[]> {
  const { rows } = await pool.query<ConsentimentoRow>(
    `SELECT * FROM tb_consentimento WHERE restaurante_id = $1 ORDER BY criado_em DESC LIMIT 500`,
    [restauranteId],
  )
  return rows
}

export async function insertAuditoria(
  restauranteId: string | null,
  usuarioId: string | null,
  entidade: string,
  entidadeId: string | null,
  operacao: string,
  descricao: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO tb_auditoria
       (restaurante_id, usuario_id, entidade, entidade_id, operacao, descricao)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [restauranteId, usuarioId, entidade, entidadeId, operacao, descricao],
  )
}

export async function listAuditoria(
  restauranteId: string,
  limit = 200,
): Promise<AuditoriaRow[]> {
  const { rows } = await pool.query<AuditoriaRow>(
    `SELECT a.id, a.restaurante_id, a.usuario_id,
            u.nome AS usuario_nome,
            a.entidade, a.entidade_id, a.operacao, a.descricao,
            a.criado_em::text
     FROM tb_auditoria a
     LEFT JOIN tb_usuario u ON u.id = a.usuario_id
     WHERE a.restaurante_id = $1
     ORDER BY a.criado_em DESC
     LIMIT $2`,
    [restauranteId, limit],
  )
  return rows
}

export async function insertSolicitacao(
  restauranteId: string,
  telefone: string | null,
  email: string | null,
  tipo: string,
  descricao: string,
): Promise<SolicitacaoLgpdRow> {
  const { rows } = await pool.query<SolicitacaoLgpdRow>(
    `INSERT INTO tb_solicitacao_lgpd
       (restaurante_id, telefone, email, tipo, descricao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [restauranteId, telefone, email, tipo, descricao],
  )
  return rows[0]!
}

export async function listSolicitacoes(restauranteId: string): Promise<SolicitacaoLgpdRow[]> {
  const { rows } = await pool.query<SolicitacaoLgpdRow>(
    `SELECT * FROM tb_solicitacao_lgpd
     WHERE restaurante_id = $1
     ORDER BY criado_em DESC`,
    [restauranteId],
  )
  return rows
}

export async function updateSolicitacao(
  id: string,
  restauranteId: string,
  status: string,
  resposta: string,
): Promise<SolicitacaoLgpdRow | null> {
  const { rows } = await pool.query<SolicitacaoLgpdRow>(
    `UPDATE tb_solicitacao_lgpd
     SET status = $1, resposta = $2, atualizado_em = NOW()
     WHERE id = $3 AND restaurante_id = $4
     RETURNING *`,
    [status, resposta, id, restauranteId],
  )
  return rows[0] ?? null
}

export async function findClienteComPedidos(
  restauranteId: string,
  telefone: string,
): Promise<Record<string, unknown> | null> {
  const { rows } = await pool.query(
    `SELECT
       c.id, c.nome, c.telefone, c.endereco, c.canal, c.criado_em::text,
       COALESCE(
         json_agg(
           json_build_object(
             'id',         p.id,
             'status',     p.status,
             'total',      p.total,
             'canal',      p.canal,
             'criado_em',  p.criado_em::text
           ) ORDER BY p.criado_em DESC
         ) FILTER (WHERE p.id IS NOT NULL),
         '[]'::json
       ) AS pedidos
     FROM tb_cliente c
     LEFT JOIN tb_pedido p ON p.cliente_id = c.id
     WHERE c.restaurante_id = $1 AND c.telefone = $2
     GROUP BY c.id`,
    [restauranteId, telefone],
  )
  return (rows[0] as Record<string, unknown> | undefined) ?? null
}

export async function anonymizeInactiveClients(
  restauranteId: string,
  mesesSemAtividade: number,
): Promise<number> {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - mesesSemAtividade)

  const { rowCount } = await pool.query(
    `UPDATE tb_cliente SET
       nome     = 'Cliente Anonimizado',
       telefone = 'anon_' || LEFT(MD5(telefone::text), 8),
       endereco = NULL
     WHERE restaurante_id = $1
       AND nome NOT LIKE 'Cliente Anonimizado%'
       AND id IN (
         SELECT c.id
         FROM tb_cliente c
         LEFT JOIN tb_pedido p ON p.cliente_id = c.id
         WHERE c.restaurante_id = $1
         GROUP BY c.id
         HAVING COALESCE(MAX(p.criado_em), c.criado_em) < $2
       )`,
    [restauranteId, cutoff.toISOString()],
  )
  return rowCount ?? 0
}
