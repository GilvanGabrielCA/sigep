import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import jwt from 'jwt-decode'
import { AuthProvider } from '../../src/contexts/auth-context'
import { useAuth } from '../../src/hooks/use-auth'

// Token JWT válido para testes (exp em 2099)
const PAYLOAD = {
  userId: 'uuid-user-1',
  restauranteId: 'uuid-rest-1',
  nome: 'Gerente Teste',
  perfil: 'gerente',
}

function buildFakeToken(): string {
  // Cria um JWT fake com estrutura válida para jwt-decode (header.payload.signature)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payload = btoa(JSON.stringify({ ...PAYLOAD, iat: 1000000, exp: 9999999999 }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${header}.${payload}.fake_signature`
}

const FAKE_TOKEN = buildFakeToken()

function TestComponent() {
  const { user, signIn, signOut, token } = useAuth()
  return (
    <div>
      <span data-testid="user-nome">{user?.nome ?? 'sem-usuario'}</span>
      <span data-testid="user-perfil">{user?.perfil ?? 'sem-perfil'}</span>
      <span data-testid="token">{token ?? 'sem-token'}</span>
      <button onClick={() => signIn(FAKE_TOKEN)}>Login</button>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('estado inicial é null quando localStorage está vazio', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('user-nome').textContent).toBe('sem-usuario')
    expect(screen.getByTestId('token').textContent).toBe('sem-token')
  })

  it('signIn atualiza o estado do usuário', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('Login')) })
    expect(screen.getByTestId('user-nome').textContent).toBe(PAYLOAD.nome)
    expect(screen.getByTestId('user-perfil').textContent).toBe(PAYLOAD.perfil)
  })

  it('signIn persiste o token no localStorage', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('Login')) })
    expect(localStorage.getItem('sigep_token')).toBe(FAKE_TOKEN)
  })

  it('signOut limpa o usuário e remove token do localStorage', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('Login')) })
    act(() => { fireEvent.click(screen.getByText('Logout')) })
    expect(screen.getByTestId('user-nome').textContent).toBe('sem-usuario')
    expect(localStorage.getItem('sigep_token')).toBeNull()
  })

  it('lê o token do localStorage na inicialização', () => {
    localStorage.setItem('sigep_token', FAKE_TOKEN)
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('user-nome').textContent).toBe(PAYLOAD.nome)
  })
})
