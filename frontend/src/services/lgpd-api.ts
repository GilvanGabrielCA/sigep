import { api } from './api'

export interface SolicitacaoLgpd {
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

export interface AuditoriaItem {
  id: string
  usuario_nome: string | null
  entidade: string
  entidade_id: string | null
  operacao: string
  descricao: string | null
  criado_em: string
}

export interface ConsentimentoItem {
  id: string
  telefone: string
  aceito: boolean
  canal: string
  criado_em: string
}

export async function getSolicitacoes(): Promise<SolicitacaoLgpd[]> {
  const { data } = await api.get<SolicitacaoLgpd[]>('/lgpd/solicitacoes')
  return data
}

export async function postSolicitacao(payload: {
  telefone?: string
  email?: string
  tipo: string
  descricao?: string
}): Promise<SolicitacaoLgpd> {
  const { data } = await api.post<SolicitacaoLgpd>('/lgpd/solicitacao', payload)
  return data
}

export async function patchSolicitacao(
  id: string,
  status: string,
  resposta: string,
): Promise<SolicitacaoLgpd> {
  const { data } = await api.patch<SolicitacaoLgpd>(`/lgpd/solicitacoes/${id}`, {
    status,
    resposta,
  })
  return data
}

export async function getAuditoria(): Promise<AuditoriaItem[]> {
  const { data } = await api.get<AuditoriaItem[]>('/lgpd/auditoria')
  return data
}

export async function getConsentimentos(): Promise<ConsentimentoItem[]> {
  const { data } = await api.get<ConsentimentoItem[]>('/lgpd/consentimentos')
  return data
}

export async function postAnonimizar(meses: number): Promise<{ anonimizados: number; meses: number }> {
  const { data } = await api.post<{ anonimizados: number; meses: number }>('/lgpd/anonimizar', {
    meses,
  })
  return data
}

export async function getMeusDados(telefone: string): Promise<Record<string, unknown>> {
  const { data } = await api.get<Record<string, unknown>>('/lgpd/meus-dados', {
    params: { telefone },
  })
  return data
}
