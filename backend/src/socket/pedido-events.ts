import type { Server } from 'socket.io'

export function setupPedidoEvents(io: Server): void {
  io.on('connection', (socket) => {
    socket.on('entrar:restaurante', (restauranteId: string) => {
      socket.join(restauranteId)
    })
  })
}
