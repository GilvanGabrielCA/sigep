import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/db/usuario-queries.js', () => ({
  findUsuarioByEmail: vi.fn(),
  findUsuarioById: vi.fn(),
  updateUsuarioSenha: vi.fn(),
}))

vi.mock('../src/db/reset-token-queries.js', () => ({
  createResetToken: vi.fn(),
  findValidResetToken: vi.fn(),
  markTokenAsUsed: vi.fn(),
}))

vi.mock('../src/services/email-service.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('bcrypt', () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}))

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn() },
}))

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  findUsuarioByEmail,
  findUsuarioById,
  updateUsuarioSenha,
} from '../src/db/usuario-queries.js'
import {
  findValidResetToken,
  markTokenAsUsed,
} from '../src/db/reset-token-queries.js'
import { login, validateResetToken, resetPassword } from '../src/services/auth-service.js'

const mockUsuario = {
  id: 'u-1',
  restaurante_id: 'r-1',
  nome: 'Gilvan Gabriel',
  email: 'gilvan@test.com',
  senha_hash: '$2b$10$hash',
  perfil: 'gerente' as const,
  ativo: true,
  foto_url: null,
  criado_em: '2025-01-01T00:00:00.000Z',
}

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança erro 401 quando usuário não é encontrado', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(null)
    await expect(login('naoexiste@test.com', '123')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('lança erro 401 quando senha está incorreta', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(mockUsuario)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    await expect(login('gilvan@test.com', 'senha-errada')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('retorna JWT assinado quando credenciais são válidas', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(mockUsuario)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(jwt.sign).mockReturnValue('jwt-token-gerado' as any)

    const token = await login('gilvan@test.com', 'senha-correta')

    expect(token).toBe('jwt-token-gerado')
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', perfil: 'gerente' }),
      'sigep-test-secret',
      { expiresIn: '8h' },
    )
  })

  it('não vaza informação — mesma mensagem para e-mail inexistente e senha errada', async () => {
    vi.mocked(findUsuarioByEmail).mockResolvedValue(null)
    const err1 = await login('x@x.com', 'abc').catch((e) => e)

    vi.mocked(findUsuarioByEmail).mockResolvedValue(mockUsuario)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const err2 = await login('gilvan@test.com', 'errada').catch((e) => e)

    expect(err1.message).toBe(err2.message)
  })
})

describe('validateResetToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna true quando token é válido', async () => {
    vi.mocked(findValidResetToken).mockResolvedValue({ usuario_id: 'u-1' } as any)
    expect(await validateResetToken('token-valido')).toBe(true)
  })

  it('retorna false quando token não existe ou expirou', async () => {
    vi.mocked(findValidResetToken).mockResolvedValue(null)
    expect(await validateResetToken('token-expirado')).toBe(false)
  })
})

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança erro 400 para token inválido', async () => {
    vi.mocked(findValidResetToken).mockResolvedValue(null)
    await expect(resetPassword('token-invalido', 'nova123')).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('lança erro 400 quando usuário associado ao token está inativo', async () => {
    vi.mocked(findValidResetToken).mockResolvedValue({ usuario_id: 'u-1' } as any)
    vi.mocked(findUsuarioById).mockResolvedValue({ ...mockUsuario, ativo: false })
    await expect(resetPassword('token-valido', 'nova123')).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('atualiza a senha e invalida o token em caso de sucesso', async () => {
    vi.mocked(findValidResetToken).mockResolvedValue({ usuario_id: 'u-1' } as any)
    vi.mocked(findUsuarioById).mockResolvedValue(mockUsuario)
    vi.mocked(bcrypt.hash).mockResolvedValue('novo-hash-bcrypt' as never)
    vi.mocked(updateUsuarioSenha).mockResolvedValue(undefined as never)
    vi.mocked(markTokenAsUsed).mockResolvedValue(undefined as never)

    await resetPassword('token-valido', 'nova-senha-segura')

    expect(updateUsuarioSenha).toHaveBeenCalledWith('u-1', 'novo-hash-bcrypt')
    expect(markTokenAsUsed).toHaveBeenCalledWith('token-valido')
  })
})
