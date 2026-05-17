import { useState, useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './use-auth'

let socketInstance: Socket | null = null

export function useSocket(): { socket: Socket | null; connected: boolean } {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user?.restauranteId) return

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL as string, { autoConnect: true })
    }

    socketInstance.emit('entrar:restaurante', user.restauranteId)
    setSocket(socketInstance)
    setConnected(socketInstance.connected)

    function onConnect() { setConnected(true) }
    function onDisconnect() { setConnected(false) }

    socketInstance.on('connect', onConnect)
    socketInstance.on('disconnect', onDisconnect)
    socketInstance.on('connect_error', onDisconnect)

    return () => {
      socketInstance?.off('connect', onConnect)
      socketInstance?.off('disconnect', onDisconnect)
      socketInstance?.off('connect_error', onDisconnect)
    }
  }, [user?.restauranteId])

  return { socket, connected }
}
