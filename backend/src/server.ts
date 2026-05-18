import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createApp } from './app.js'
import { setIo } from './socket/socket-instance.js'
import { setupPedidoEvents } from './socket/pedido-events.js'

dotenv.config()

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurado no .env')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurado no .env')

const app = createApp()
const httpServer = createServer(app)

const allowedSocketOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  /https:\/\/sigep[a-zA-Z0-9_-]*\.vercel\.app$/,
  /https:\/\/frontend[a-zA-Z0-9_-]*\.vercel\.app$/,
]

export const io = new Server(httpServer, {
  cors: {
    origin: allowedSocketOrigins,
    methods: ['GET', 'POST'],
  },
})

setIo(io)
setupPedidoEvents(io)

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`SIGEP backend rodando na porta ${PORT}`)
})
