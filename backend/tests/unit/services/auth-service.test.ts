import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'

vi.mock('../../../src/db/usuario-queries.js')
vi.mock('../../../src/db/reset-token-queries.js')
vi.mock('../../../src/services/email-service.js')

import { login, forgotPassword, validateResetToken, resetPassword } from '../../../src/services/auth-service.js'
import * as usuarioQueries from '../../../src/db/usuario-queries.js'
import * as tokenQueries from '../../../src/db/reset-token-queries.js'
import * as emailService from '../../../src/services/email-service.js'

const SENHA_CORRETA = 'senha_secreta_123'
let SENHA_HASH: string

const USUARIO_ATIVO = {
  id: 'uuid-usuario-1',
  restaurante_id: 'uuid-rest-1',
  nome: 'Gerente Teste',
  email: 'gerente@teste.com',
  senha_hash: '',
  perfil: 'gerente' as const,
  ativo: true,
  criado_em: new Date(),
}

beforeAll(async () => {
  SENHA_HASH = await bcrypt.hash(SENHA_CORRETA, 10)
  USUARIO_ATIVO.senha_hash = SENHA_HASH
})

beforeEach(() => vi.clearAllMocks())

describe('login()', () => {
  it('retorna JWT quando credenciais são válidas', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    const token = await login(USUARIO_ATIVO.email, SENHA_CORRETA)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // formato JWT válido
  })

  it('lança erro 401 quando usuário não existe', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(null)
    await expect(login('inexistente@teste.com', SENHA_CORRETA)).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('lança erro 401 quando senha está errada', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    await expect(login(USUARIO_ATIVO.email, 'senha_errada')).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})

describe('forgotPassword()', () => {
  it('não lança erro quando e-mail não existe (evita enumeração)', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(null)
    await expect(forgotPassword('naoexiste@teste.com')).resolves.toBeUndefined()
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('não envia e-mail quando usuário está inativo', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue({
      ...USUARIO_ATIVO,
      ativo: false,
    })
    await expect(forgotPassword(USUARIO_ATIVO.email)).resolves.toBeUndefined()
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('cria token e envia e-mail quando usuário está ativo', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    vi.mocked(tokenQueries.createResetToken).mockResolvedValue('raw_token_fake')
    await forgotPassword(USUARIO_ATIVO.email)
    expect(tokenQueries.createResetToken).toHaveBeenCalledWith(USUARIO_ATIVO.id)
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      USUARIO_ATIVO.email,
      USUARIO_ATIVO.nome,
      'raw_token_fake',
    )
  })
})

describe('validateResetToken()', () => {
  it('retorna true quando o token é válido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue({
      id: 'id-1',
      usuario_id: 'uuid-usuario-1',
      token_hash: 'hash123',
      expira_em: new Date(Date.now() + 60000).toISOString(),
      usado: false,
      criado_em: new Date().toISOString(),
    })
    expect(await validateResetToken('raw_token')).toBe(true)
  })

  it('retorna false quando o token é inválido ou expirado', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue(null)
    expect(await validateResetToken('token_invalido')).toBe(false)
  })
})

describe('resetPassword()', () => {
  it('lança erro 400 quando token é inválido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue(null)
    await expect(resetPassword('token_invalido', 'nova_senha_123')).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('atualiza senha e invalida token quando token é válido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue({
      id: 'id-1',
      usuario_id: USUARIO_ATIVO.id,
      token_hash: 'hash123',
      expira_em: new Date(Date.now() + 60000).toISOString(),
      usado: false,
      criado_em: new Date().toISOString(),
    })
    vi.mocked(usuarioQueries.findUsuarioById).mockResolvedValue(USUARIO_ATIVO)
    vi.mocked(usuarioQueries.updateUsuarioSenha).mockResolvedValue()
    vi.mocked(tokenQueries.markTokenAsUsed).mockResolvedValue()

    await resetPassword('raw_token_valido', 'nova_senha_segura')

    expect(usuarioQueries.updateUsuarioSenha).toHaveBeenCalledWith(
      USUARIO_ATIVO.id,
      expect.any(String), // hash gerado pelo bcrypt
    )
    expect(tokenQueries.markTokenAsUsed).toHaveBeenCalledWith('raw_token_valido')
  })
})
