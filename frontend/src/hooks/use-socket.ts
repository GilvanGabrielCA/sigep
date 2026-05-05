import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './use-auth'

let socketInstance: Socket | null = null

export function useSocket(): Socket | null {
  const { user } = useAuth()
  const ref = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user?.restauranteId) return

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL as string, { autoConnect: true })
    }

    ref.current = socketInstance
    socketInstance.emit('entrar:restaurante', user.restauranteId)
  }, [user?.restauranteId])

  return ref.current
}
