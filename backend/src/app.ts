import express from 'express'
import cors from 'cors'
import { errorMiddleware } from './middlewares/error-middleware.js'
import authRoutes from './routes/auth-routes.js'
import dashboardRoutes from './routes/dashboard-routes.js'
import pedidoRoutes from './routes/pedido-routes.js'
import cardapioRoutes from './routes/cardapio-routes.js'
import relatorioRoutes from './routes/relatorio-routes.js'
import restauranteRoutes from './routes/restaurante-routes.js'
import chatbotRoutes from './routes/chatbot-routes.js'
import usuarioRoutes from './routes/usuario-routes.js'
import perfilRoutes from './routes/perfil-routes.js'
import lgpdRoutes from './routes/lgpd-routes.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/pedidos', pedidoRoutes)
  app.use('/api/cardapio', cardapioRoutes)
  app.use('/api/relatorios', relatorioRoutes)
  app.use('/api/restaurante', restauranteRoutes)
  app.use('/api', chatbotRoutes)
  app.use('/api/usuarios', usuarioRoutes)
  app.use('/api/me', perfilRoutes)
  app.use('/api/lgpd', lgpdRoutes)

  app.use(errorMiddleware)

  return app
}
