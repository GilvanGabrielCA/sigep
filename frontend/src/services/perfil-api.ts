import { api } from './api'

export interface PerfilData {
  id: string
  restaurante_id: string
  nome: string
  email: string
  perfil: 'gerente' | 'atendente' | 'superadmin'
  ativo: boolean
  foto_url: string | null
  criado_em: string
}

export async function fetchPerfil(): Promise<PerfilData> {
  const { data } = await api.get<PerfilData>('/api/me')
  return data
}

export async function updatePerfil(payload: { nome?: string; email?: string }): Promise<PerfilData> {
  const { data } = await api.put<PerfilData>('/api/me', payload)
  return data
}

export async function updateSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await api.put('/api/me/senha', { senhaAtual, novaSenha })
}

export async function uploadFoto(file: File): Promise<PerfilData> {
  const formData = new FormData()
  formData.append('foto', file)
  const { data } = await api.post<PerfilData>('/api/me/foto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
