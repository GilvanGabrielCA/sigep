import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/db/usuario-queries.js', () => ({
  listUsuariosByRestaurante: vi.fn(),
  createUsuario: vi.fn(),
  updateUsuario: vi.fn(),
  toggleUsuarioAtivo: vi.fn(),
  findUsuarioByEmail: vi.fn(),
  findUsuarioById: vi.fn(),
  updateUsuarioSenha: vi.fn(),
}))

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}))

import bcrypt from 'bcrypt'
import {
  findUsuarioById,
  findUsuarioByEmail,
  toggleUsuarioAtivo,
  createUsuario,
  updateUsuarioSenha,
} from '../src/db/usuario-queries.js'
import {
  addUsuario,
  setUsuarioAtivo,
  resetSenha,
} from '../src/services/usuario-service.js'

const base = {
  restaurante_id: 'r-1',
  foto_url: null,
  criado_em: '2025-01-01T00:00:00.000Z',
}

const mockSuperAdmin = {
  ...base,
  id: 'sa-1',
  nome: 'Super Admin',
  email: 'super@sigep.com',
  senha_hash: 'hash',
  perfil: 'superadmin' as const,
  ativo: true,
}

const mockGerente = {
  ...base,
  id: 'g-1',
  nome: 'Gerente',
  email: 'gerente@sigep.com',
  senha_hash: 'hash',
  perfil: 'gerente' as const,
  ativo: true,
}

const mockAtendente = {
  ...base,
  id: 'at-1',
  nome: 'Atendente',
  email: 'atendente@sigep.com',
  senha_hash: 'hash',
  perfil: 'atendente' as const,
  ativo: true,
}

describe('addUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança 403 quando gerente tenta criar usuário superadmin', async () => {
    await expect(
      addUsuario(
        'r-1',
        { nome: 'X', email: 'x@x.com', senha: '123', perfil: 'superadmin' },
        'gerente',
      ),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('superadmin pode criar outro superadmin', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(null)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never)
    vi.mocked(createUsuario).mockResolvedValue({ ...mockSuperAdmin, id: 'sa-2' })

    const result = await addUsuario(
      'r-1',
      { nome: 'Novo SA', email: 'novo@sigep.com', senha: '123', perfil: 'superadmin' },
      'superadmin',
    )

    expect(result).not.toHaveProperty('senha_hash')
  })

  it('lança 409 quando e-mail já está em uso', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(mockGerente)
    await expect(
      addUsuario(
        'r-1',
        { nome: 'X', email: 'gerente@sigep.com', senha: '123', perfil: 'atendente' },
        'gerente',
      ),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('cria usuário com sucesso e retorna objeto sem senha_hash', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(null)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never)
    vi.mocked(createUsuario).mockResolvedValue({ ...mockAtendente, id: 'at-2' })

    const result = await addUsuario(
      'r-1',
      { nome: 'Novo', email: 'novo@sigep.com', senha: '123', perfil: 'atendente' },
      'gerente',
    )

    expect(result).not.toHaveProperty('senha_hash')
    expect(result.perfil).toBe('atendente')
  })
})

describe('setUsuarioAtivo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança 404 quando usuário não existe', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(null)
    await expect(
      setUsuarioAtivo('id-inexistente', 'r-1', false, 'gerente'),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lança 404 quando usuário pertence a outro restaurante', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue({ ...mockGerente, restaurante_id: 'r-OUTRO' })
    await expect(
      setUsuarioAtivo('g-1', 'r-1', false, 'gerente'),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lança 403 quando gerente tenta desativar superadmin', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(mockSuperAdmin)
    await expect(
      setUsuarioAtivo('sa-1', 'r-1', false, 'gerente'),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lança 403 quando atendente tenta desativar superadmin', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(mockSuperAdmin)
    await expect(
      setUsuarioAtivo('sa-1', 'r-1', false, 'atendente'),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('permite superadmin desativar outro superadmin', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(mockSuperAdmin)
    vi.mocked(toggleUsuarioAtivo).mockResolvedValue(undefined as never)

    await setUsuarioAtivo('sa-1', 'r-1', false, 'superadmin')

    expect(toggleUsuarioAtivo).toHaveBeenCalledWith('sa-1', false)
  })

  it('permite gerente desativar atendente', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(mockAtendente)
    vi.mocked(toggleUsuarioAtivo).mockResolvedValue(undefined as never)

    await setUsuarioAtivo('at-1', 'r-1', false, 'gerente')

    expect(toggleUsuarioAtivo).toHaveBeenCalledWith('at-1', false)
  })

  it('permite gerente reativar atendente inativo', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue({ ...mockAtendente, ativo: false })
    vi.mocked(toggleUsuarioAtivo).mockResolvedValue(undefined as never)

    await setUsuarioAtivo('at-1', 'r-1', true, 'gerente')

    expect(toggleUsuarioAtivo).toHaveBeenCalledWith('at-1', true)
  })
})

describe('resetSenha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança 404 quando usuário não existe', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(null)
    await expect(resetSenha('id-x', 'r-1', 'nova123')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('atualiza a senha com hash bcrypt', async () => {
    vi.mocked(findUsuarioById).mockResolvedValue(mockGerente)
    vi.mocked(bcrypt.hash).mockResolvedValue('hash-novo' as never)
    vi.mocked(updateUsuarioSenha).mockResolvedValue(undefined as never)

    await resetSenha('g-1', 'r-1', 'nova-senha')

    expect(bcrypt.hash).toHaveBeenCalledWith('nova-senha', expect.any(Number))
    expect(updateUsuarioSenha).toHaveBeenCalledWith('g-1', 'hash-novo')
  })
})
