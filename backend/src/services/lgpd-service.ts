import {
  findConsentimento,
  upsertConsentimento,
  listConsentimentos,
  insertAuditoria,
  listAuditoria,
  insertSolicitacao,
  listSolicitacoes,
  updateSolicitacao,
  findClienteComPedidos,
  anonymizeInactiveClients,
  type ConsentimentoRow,
  type AuditoriaRow,
  type SolicitacaoLgpdRow,
} from '../db/lgpd-queries.js'

// ─── Consentimento ────────────────────────────────────────────────────────────

export async function verificarConsentimento(
  restauranteId: string,
  telefone: string,
): Promise<boolean> {
  const c = await findConsentimento(restauranteId, telefone)
  return c?.aceito === true
}

export async function registrarConsentimento(
  restauranteId: string,
  telefone: string,
  aceito: boolean,
): Promise<void> {
  await upsertConsentimento(restauranteId, telefone, aceito)
  await registrarAuditoria(
    restauranteId, null, 'cliente', null, 'CONSENT',
    `Consentimento ${aceito ? 'concedido' : 'revogado'} pelo titular telefone ${telefone.slice(0, 4)}***`,
  )
}

export async function getConsentimentos(restauranteId: string): Promise<ConsentimentoRow[]> {
  return listConsentimentos(restauranteId)
}

// ─── Auditoria ────────────────────────────────────────────────────────────────

export async function registrarAuditoria(
  restauranteId: string | null,
  usuarioId: string | null,
  entidade: string,
  entidadeId: string | null,
  operacao: string,
  descricao: string,
): Promise<void> {
  try {
    await insertAuditoria(restauranteId, usuarioId, entidade, entidadeId, operacao, descricao)
  } catch { /* não bloqueia a operação principal */ }
}

export async function getAuditoria(restauranteId: string): Promise<AuditoriaRow[]> {
  return listAuditoria(restauranteId)
}

// ─── Solicitações LGPD ────────────────────────────────────────────────────────

const TIPOS_VALIDOS = ['ACESSO', 'CORRECAO', 'EXCLUSAO', 'PORTABILIDADE', 'REVOGACAO']
const STATUS_VALIDOS = ['em_analise', 'concluido', 'negado']

export async function submeterSolicitacao(
  restauranteId: string,
  telefone: string | null,
  email: string | null,
  tipo: string,
  descricao: string,
): Promise<SolicitacaoLgpdRow> {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw Object.assign(new Error('Tipo de solicitação inválido'), { statusCode: 400 })
  }
  if (!telefone && !email) {
    throw Object.assign(new Error('Telefone ou e-mail são obrigatórios'), { statusCode: 400 })
  }
  const sol = await insertSolicitacao(restauranteId, telefone, email, tipo, descricao)
  await registrarAuditoria(
    restauranteId, null, 'solicitacao_lgpd', sol.id, 'UPDATE',
    `Nova solicitação LGPD do tipo ${tipo} registrada`,
  )
  return sol
}

export async function getSolicitacoes(restauranteId: string): Promise<SolicitacaoLgpdRow[]> {
  return listSolicitacoes(restauranteId)
}

export async function responderSolicitacao(
  id: string,
  restauranteId: string,
  status: string,
  resposta: string,
  usuarioId: string,
): Promise<SolicitacaoLgpdRow> {
  if (!STATUS_VALIDOS.includes(status)) {
    throw Object.assign(new Error('Status inválido'), { statusCode: 400 })
  }
  const updated = await updateSolicitacao(id, restauranteId, status, resposta)
  if (!updated) {
    throw Object.assign(new Error('Solicitação não encontrada'), { statusCode: 404 })
  }
  await registrarAuditoria(
    restauranteId, usuarioId, 'solicitacao_lgpd', id, 'UPDATE',
    `Solicitação LGPD respondida com status: ${status}`,
  )
  return updated
}

// ─── Acesso a dados (direito de acesso LGPD art. 18) ─────────────────────────

export async function acessarDadosCliente(
  restauranteId: string,
  telefone: string,
  usuarioId: string,
): Promise<Record<string, unknown>> {
  const data = await findClienteComPedidos(restauranteId, telefone)
  if (!data) {
    throw Object.assign(new Error('Nenhum dado encontrado para este número'), { statusCode: 404 })
  }
  await registrarAuditoria(
    restauranteId, usuarioId, 'cliente', String(data.id ?? ''), 'READ',
    `Acesso a dados pessoais do cliente telefone ${telefone.slice(0, 4)}*** via solicitação LGPD`,
  )
  return data
}

// ─── Anonimização ─────────────────────────────────────────────────────────────

export async function anonimizarClientesInativos(
  restauranteId: string,
  meses: number,
  usuarioId: string,
): Promise<number> {
  if (meses < 1 || meses > 120) {
    throw Object.assign(new Error('Período deve estar entre 1 e 120 meses'), { statusCode: 400 })
  }
  const count = await anonymizeInactiveClients(restauranteId, meses)
  if (count > 0) {
    await registrarAuditoria(
      restauranteId, usuarioId, 'cliente', null, 'ANONYMIZE',
      `${count} cliente(s) anonimizado(s) por inatividade superior a ${meses} meses`,
    )
  }
  return count
}
