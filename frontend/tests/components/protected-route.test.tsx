import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../src/components/protected-route'

vi.mock('../../src/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../src/hooks/use-auth'

function renderComRotas(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redireciona para /login quando usuário não está autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, token: null, signIn: vi.fn(), signOut: vi.fn() })
    renderComRotas('/dashboard')
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  it('renderiza conteúdo protegido quando usuário está autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'u1', restauranteId: 'r1', nome: 'Admin', perfil: 'gerente' },
      token: 'jwt_fake',
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    renderComRotas('/dashboard')
    expect(screen.getByText('Dashboard Protegido')).toBeInTheDocument()
  })

  it('não exibe conteúdo protegido quando não autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, token: null, signIn: vi.fn(), signOut: vi.fn() })
    renderComRotas('/dashboard')
    expect(screen.queryByText('Dashboard Protegido')).not.toBeInTheDocument()
  })
})
