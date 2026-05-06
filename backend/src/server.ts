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

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST'],
  },
})

setIo(io)
setupPedidoEvents(io)

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`SIGEP backend rodando na porta ${PORT}`)
})
