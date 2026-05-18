import { api } from './api'

export interface PedidoHistorico {
  id: string
  status: string
  canal: string
  total: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  cliente_nome: string | null
  cliente_telefone: string | null
  itens_count: number
}

export interface HistoricoResponse {
  rows: PedidoHistorico[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface HistoricoFiltros {
  status?: string
  canal?: string
  dataInicio?: string
  dataFim?: string
  clienteNome?: string
  page?: number
  limit?: number
}

export async function fetchHistorico(filtros: HistoricoFiltros = {}): Promise<HistoricoResponse> {
  const params = new URLSearchParams()
  if (filtros.status) params.set('status', filtros.status)
  if (filtros.canal) params.set('canal', filtros.canal)
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio)
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim)
  if (filtros.clienteNome) params.set('clienteNome', filtros.clienteNome)
  if (filtros.page) params.set('page', String(filtros.page))
  if (filtros.limit) params.set('limit', String(filtros.limit))
  const { data } = await api.get<HistoricoResponse>(`/api/historico?${params}`)
  return data
}
