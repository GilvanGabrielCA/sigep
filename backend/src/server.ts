import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
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
import { setupPedidoEvents } from './socket/pedido-events.js'

dotenv.config()

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurado no .env')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurado no .env')

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/cardapio', cardapioRoutes)
app.use('/api/relatorios', relatorioRoutes)
app.use('/api/restaurante', restauranteRoutes)
app.use('/api', chatbotRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/me', perfilRoutes)

setupPedidoEvents(io)

app.use(errorMiddleware)

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`SIGEP backend rodando na porta ${PORT}`)
})
