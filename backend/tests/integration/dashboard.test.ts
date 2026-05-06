import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

vi.mock('../../src/db/dashboard-queries.js')
vi.mock('../../src/db/connection.js', () => ({ pool: {} }))

import dashboardRoutes from '../../src/routes/dashboard-routes.js'
import { errorMiddleware } from '../../src/middlewares/error-middleware.js'
import * as dashboardQueries from '../../src/db/dashboard-queries.js'

const JWT_SECRET = process.env['JWT_SECRET']!

const app = express()
app.use(express.json())
app.use('/api/dashboard', dashboardRoutes)
app.use(errorMiddleware)

function tokenValido(perfil: 'gerente' | 'atendente' = 'gerente'): string {
  return jwt.sign(
    { userId: 'user-1', restauranteId: 'rest-1', nome: 'Usuário', perfil },
    JWT_SECRET,
    { expiresIn: '1h' },
  )
}

const DASHBOARD_FAKE = {
  pedidosHoje: 12,
  faturamentoHoje: 458.5,
  ticketMedio: 38.21,
  pedidosPorStatus: {
    Recebido: 3,
    'Em Preparacao': 2,
    'Pronto para Entrega': 1,
    Entregue: 6,
    Cancelado: 0,
  },
}

beforeEach(() => vi.clearAllMocks())

describe('GET /api/dashboard', () => {
  it('retorna 401 sem token de autenticação', async () => {
    const res = await request(app).get('/api/dashboard')
    expect(res.status).toBe(401)
  })

  it('retorna 200 com dados do dashboard para usuário autenticado', async () => {
    vi.mocked(dashboardQueries.getDashboardKpis).mockResolvedValue(DASHBOARD_FAKE)
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenValido()}`)
    expect(res.status).toBe(200)
  })

  it('resposta contém os campos obrigatórios de KPIs', async () => {
    vi.mocked(dashboardQueries.getDashboardKpis).mockResolvedValue(DASHBOARD_FAKE)
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenValido()}`)
    expect(res.body).toHaveProperty('pedidosHoje')
    expect(res.body).toHaveProperty('faturamentoHoje')
    expect(res.body).toHaveProperty('ticketMedio')
    expect(res.body).toHaveProperty('pedidosPorStatus')
  })

  it('atendente também tem acesso ao dashboard', async () => {
    vi.mocked(dashboardQueries.getDashboardKpis).mockResolvedValue(DASHBOARD_FAKE)
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenValido('atendente')}`)
    expect(res.status).toBe(200)
  })
})
