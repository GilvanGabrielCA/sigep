import { api } from './api'

export async function loginApi(email: string, senha: string): Promise<string> {
  const { data } = await api.post<{ token: string }>('/api/auth/login', { email, senha })
  return data.token
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email })
}

export async function validateResetTokenApi(token: string): Promise<boolean> {
  try {
    await api.get(`/api/auth/reset-password/${token}`)
    return true
  } catch {
    return false
  }
}

export async function resetPasswordApi(token: string, novaSenha: string): Promise<void> {
  await api.post('/api/auth/reset-password', { token, novaSenha })
}
