import { api } from './api'

export async function loginApi(email: string, senha: string): Promise<string> {
  const { data } = await api.post<{ token: string }>('/api/auth/login', { email, senha })
  return data.token
}
