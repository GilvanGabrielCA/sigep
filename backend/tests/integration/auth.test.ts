import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import bcrypt from 'bcrypt'

vi.mock('../../src/db/usuario-queries.js')
vi.mock('../../src/db/reset-token-queries.js')
vi.mock('../../src/services/email-service.js')
vi.mock('../../src/db/connection.js', () => ({ pool: {} }))

import authRoutes from '../../src/routes/auth-routes.js'
import { errorMiddleware } from '../../src/middlewares/error-middleware.js'
import * as usuarioQueries from '../../src/db/usuario-queries.js'
import * as tokenQueries from '../../src/db/reset-token-queries.js'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use(errorMiddleware)

let SENHA_HASH: string
const USUARIO_ATIVO = {
  id: 'uuid-1',
  restaurante_id: 'rest-1',
  nome: 'Admin',
  email: 'admin@sigep.com',
  senha_hash: '',
  perfil: 'gerente' as const,
  ativo: true,
  criado_em: new Date(),
}

beforeAll(async () => {
  SENHA_HASH = await bcrypt.hash('admin123', 10)
  USUARIO_ATIVO.senha_hash = SENHA_HASH
})

beforeEach(() => vi.clearAllMocks())

describe('POST /api/auth/login', () => {
  it('retorna 400 quando email está ausente', async () => {
    const res = await request(app).post('/api/auth/login').send({ senha: '123456' })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando senha está ausente', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })

  it('retorna 401 quando usuário não existe', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(null)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@sigep.com', senha: 'qualquer' })
    expect(res.status).toBe(401)
  })

  it('retorna 401 quando senha está errada', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USUARIO_ATIVO.email, senha: 'senha_errada' })
    expect(res.status).toBe(401)
  })

  it('retorna 200 e token JWT com credenciais válidas', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USUARIO_ATIVO.email, senha: 'admin123' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
  })
})

describe('POST /api/auth/forgot-password', () => {
  it('retorna 400 quando email está ausente', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({})
    expect(res.status).toBe(400)
  })

  it('retorna 200 mesmo quando e-mail não existe (sem enumeração)', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(null)
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'naoexiste@sigep.com' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
  })

  it('retorna 200 e aciona envio quando e-mail é válido', async () => {
    vi.mocked(usuarioQueries.findUsuarioByEmail).mockResolvedValue(USUARIO_ATIVO)
    vi.mocked(tokenQueries.createResetToken).mockResolvedValue('fake_token_123')
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: USUARIO_ATIVO.email })
    expect(res.status).toBe(200)
  })
})

describe('GET /api/auth/reset-password/:token', () => {
  it('retorna 400 quando token é inválido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue(null)
    const res = await request(app).get('/api/auth/reset-password/token_invalido')
    expect(res.status).toBe(400)
  })

  it('retorna 200 quando token é válido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue({
      id: 'id-1',
      usuario_id: 'uuid-1',
      token_hash: 'hash',
      expira_em: new Date(Date.now() + 60000).toISOString(),
      usado: false,
      criado_em: new Date().toISOString(),
    })
    const res = await request(app).get('/api/auth/reset-password/token_valido')
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
  })
})

describe('POST /api/auth/reset-password', () => {
  it('retorna 400 quando token está ausente', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ novaSenha: 'nova123' })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando senha tem menos de 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'tok', novaSenha: '123' })
    expect(res.status).toBe(400)
  })

  it('retorna 200 e redefine senha com token válido', async () => {
    vi.mocked(tokenQueries.findValidResetToken).mockResolvedValue({
      id: 'id-1',
      usuario_id: USUARIO_ATIVO.id,
      token_hash: 'hash',
      expira_em: new Date(Date.now() + 60000).toISOString(),
      usado: false,
      criado_em: new Date().toISOString(),
    })
    vi.mocked(usuarioQueries.findUsuarioById).mockResolvedValue(USUARIO_ATIVO)
    vi.mocked(usuarioQueries.updateUsuarioSenha).mockResolvedValue()
    vi.mocked(tokenQueries.markTokenAsUsed).mockResolvedValue()

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'token_valido', novaSenha: 'nova_senha_segura' })
    expect(res.status).toBe(200)
    expect(res.body.message).toContain('sucesso')
  })
})
