import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../src/hooks/use-auth', () => ({
  useAuth: () => ({ signIn: vi.fn(), user: null, token: null, signOut: vi.fn() }),
}))

vi.mock('../../src/services/auth-api', () => ({
  loginApi: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const real = await importOriginal<typeof import('react-router-dom')>()
  return { ...real, useNavigate: () => vi.fn() }
})

import { LoginPage } from '../../src/pages/login/login-page'
import { loginApi } from '../../src/services/auth-api'

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('renderiza o campo de e-mail', () => {
    renderLogin()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('renderiza o campo de senha', () => {
    renderLogin()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('renderiza o botão de entrar', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('renderiza o link "Esqueceu sua senha?"', () => {
    renderLogin()
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando campos estão vazios', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('exibe spinner e texto "Entrando..." durante carregamento', async () => {
    vi.mocked(loginApi).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('fake_token'), 500)),
    )
    renderLogin()
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText(/entrando/i)).toBeInTheDocument()
    })
  })

  it('exibe erro da API quando login falha', async () => {
    vi.mocked(loginApi).mockRejectedValue({
      response: { data: { error: 'Credenciais inválidas' } },
    })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
    })
  })
})
