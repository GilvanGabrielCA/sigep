import { api } from './api'

export interface Usuario {
  id: string
  restaurante_id: string
  nome: string
  email: string
  perfil: 'gerente' | 'atendente'
  ativo: boolean
  criado_em: string
}

export interface NovoUsuario {
  nome: string
  email: string
  senha: string
  perfil: 'gerente' | 'atendente'
}

export interface EditarUsuario {
  nome?: string
  email?: string
  perfil?: 'gerente' | 'atendente'
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/api/usuarios')
  return data
}

export async function createUsuario(payload: NovoUsuario): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/api/usuarios', payload)
  return data
}

export async function updateUsuario(id: string, payload: EditarUsuario): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/api/usuarios/${id}`, payload)
  return data
}

export async function toggleUsuarioAtivo(id: string, ativo: boolean): Promise<void> {
  await api.patch(`/api/usuarios/${id}/ativo`, { ativo })
}

export async function resetSenhaUsuario(id: string, novaSenha: string): Promise<void> {
  await api.patch(`/api/usuarios/${id}/senha`, { novaSenha })
}
