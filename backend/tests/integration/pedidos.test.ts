import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

vi.mock('../../src/db/pedido-queries.js')
vi.mock('../../src/db/connection.js', () => ({ pool: {} }))
vi.mock('../../src/socket/socket-instance.js', () => ({
  getIo: () => ({ to: vi.fn().mockReturnValue({ emit: vi.fn() }) }),
}))
vi.mock('../../src/services/chatbot-service.js', () => ({
  enviarNotificacaoCliente: vi.fn(),
  consumirOutbox: vi.fn(),
  processarMensagem: vi.fn(),
}))

import pedidoRoutes from '../../src/routes/pedido-routes.js'
import { errorMiddleware } from '../../src/middlewares/error-middleware.js'
import * as pedidoQueries from '../../src/db/pedido-queries.js'

const JWT_SECRET = process.env['JWT_SECRET']!

const app = express()
app.use(express.json())
app.use('/api/pedidos', pedidoRoutes)
app.use(errorMiddleware)

function tokenGerente(): string {
  return jwt.sign(
    { userId: 'user-1', restauranteId: 'rest-1', nome: 'Gerente', perfil: 'gerente' },
    JWT_SECRET,
    { expiresIn: '1h' },
  )
}

const PEDIDOS_FAKE = [
  { id: 'p1', status: 'Recebido', canal: 'interno', total: '30.00', cliente_nome: 'Cliente 1' },
  { id: 'p2', status: 'Em Preparacao', canal: 'whatsapp', total: '55.00', cliente_nome: 'Cliente 2' },
]

beforeEach(() => vi.clearAllMocks())

describe('GET /api/pedidos', () => {
  it('retorna 401 sem token de autenticação', async () => {
    const res = await request(app).get('/api/pedidos')
    expect(res.status).toBe(401)
  })

  it('retorna 200 e lista de pedidos com token válido', async () => {
    vi.mocked(pedidoQueries.listPedidosKanban).mockResolvedValue(PEDIDOS_FAKE as never)
    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${tokenGerente()}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })
})

describe('GET /api/pedidos/:id', () => {
  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/api/pedidos/pedido-1')
    expect(res.status).toBe(401)
  })

  it('retorna 404 quando pedido não existe', async () => {
    vi.mocked(pedidoQueries.findPedidoById).mockResolvedValue(null)
    const res = await request(app)
      .get('/api/pedidos/id-inexistente')
      .set('Authorization', `Bearer ${tokenGerente()}`)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/pedidos/:id/status', () => {
  it('retorna 401 sem autenticação', async () => {
    const res = await request(app)
      .patch('/api/pedidos/p1/status')
      .send({ status: 'Entregue' })
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando campo status está ausente', async () => {
    const res = await request(app)
      .patch('/api/pedidos/p1/status')
      .set('Authorization', `Bearer ${tokenGerente()}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it('retorna 400 para status inválido', async () => {
    const res = await request(app)
      .patch('/api/pedidos/p1/status')
      .set('Authorization', `Bearer ${tokenGerente()}`)
      .send({ status: 'StatusInvalido' })
    expect(res.status).toBe(400)
  })
})
