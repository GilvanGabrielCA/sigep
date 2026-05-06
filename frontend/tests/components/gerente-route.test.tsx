import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GerenteRoute } from '../../src/components/gerente-route'

vi.mock('../../src/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../src/hooks/use-auth'

function renderComRotas() {
  return render(
    <MemoryRouter initialEntries={['/relatorios']}>
      <Routes>
        <Route element={<GerenteRoute />}>
          <Route path="/relatorios" element={<div>Área do Gerente</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('GerenteRoute', () => {
  it('exibe mensagem 403 para perfil atendente', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'u1', restauranteId: 'r1', nome: 'Atendente', perfil: 'atendente' },
      token: 'jwt',
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    renderComRotas()
    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText(/acesso restrito a gerentes/i)).toBeInTheDocument()
  })

  it('renderiza conteúdo para perfil gerente', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'u1', restauranteId: 'r1', nome: 'Gerente', perfil: 'gerente' },
      token: 'jwt',
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    renderComRotas()
    expect(screen.getByText('Área do Gerente')).toBeInTheDocument()
  })

  it('bloqueia acesso quando usuário não está autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, token: null, signIn: vi.fn(), signOut: vi.fn() })
    renderComRotas()
    expect(screen.queryByText('Área do Gerente')).not.toBeInTheDocument()
    expect(screen.getByText('403')).toBeInTheDocument()
  })
})
