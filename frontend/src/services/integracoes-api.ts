import { api } from './api'

export interface Integracao {
  id: string
  tipo: string
  ativo: boolean
  configuracao: Record<string, unknown>
}

export async function fetchIntegracoes(): Promise<Integracao[]> {
  const { data } = await api.get<Integracao[]>('/api/integracoes')
  return data
}

export async function toggleIntegracao(id: string, ativo: boolean): Promise<Integracao> {
  const { data } = await api.patch<Integracao>(`/api/integracoes/${id}`, { ativo })
  return data
}

export async function enviarMensagem(
  telefone: string,
  mensagem: string,
): Promise<{ resposta: string }> {
  const { data } = await api.post<{ resposta: string }>('/api/chatbot/mensagem', {
    telefone,
    mensagem,
  })
  return data
}
