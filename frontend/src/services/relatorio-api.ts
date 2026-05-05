import { api } from './api'
import type { RelatorioData } from '../types/relatorio'

export async function fetchRelatorios(inicio?: string, fim?: string): Promise<RelatorioData> {
  const params = new URLSearchParams()
  if (inicio) params.set('inicio', inicio)
  if (fim) params.set('fim', fim)
  const query = params.toString()
  const { data } = await api.get<RelatorioData>(`/api/relatorios${query ? `?${query}` : ''}`)
  return data
}
