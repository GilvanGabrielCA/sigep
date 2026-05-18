import { api } from './api'

export interface AuditoriaGlobal {
  id: string
  restaurante_id: string | null
  restaurante_nome: string | null
  usuario_id: string | null
  usuario_nome: string | null
  entidade: string
  entidade_id: string | null
  operacao: string
  descricao: string | null
  ip_address: string | null
  criado_em: string
}

export interface SystemStats {
  total_restaurantes: number
  total_usuarios: number
  total_pedidos: number
  total_pedidos_hoje: number
  faturamento_total: string
}

export interface LogsResponse {
  rows: AuditoriaGlobal[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface UsuarioGlobal {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  criado_em: string
  restaurante_nome: string
}

export async function fetchSystemStats(): Promise<SystemStats> {
  const { data } = await api.get<SystemStats>('/api/superadmin/stats')
  return data
}

export async function fetchLogs(opts: {
  operacao?: string
  entidade?: string
  restauranteId?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
} = {}): Promise<LogsResponse> {
  const params = new URLSearchParams()
  if (opts.operacao) params.set('operacao', opts.operacao)
  if (opts.entidade) params.set('entidade', opts.entidade)
  if (opts.restauranteId) params.set('restauranteId', opts.restauranteId)
  if (opts.dataInicio) params.set('dataInicio', opts.dataInicio)
  if (opts.dataFim) params.set('dataFim', opts.dataFim)
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  const { data } = await api.get<LogsResponse>(`/api/superadmin/logs?${params}`)
  return data
}

export async function fetchUsuariosGlobal(opts: { page?: number; limit?: number } = {}): Promise<{ rows: UsuarioGlobal[]; total: number }> {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  const { data } = await api.get<{ rows: UsuarioGlobal[]; total: number }>(`/api/superadmin/usuarios?${params}`)
  return data
}
