import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { fetchRestaurante } from '../services/restaurante-api'
import type { Restaurante } from '../types/restaurante'

interface RestauranteContextValue {
  restaurante: Restaurante | null
  loading: boolean
  setRestaurante: (r: Restaurante) => void
}

const RestauranteContext = createContext<RestauranteContextValue | null>(null)

export function RestauranteProvider({ children }: { children: ReactNode }) {
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurante()
      .then(setRestaurante)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <RestauranteContext.Provider value={{ restaurante, loading, setRestaurante }}>
      {children}
    </RestauranteContext.Provider>
  )
}

export function useRestauranteContext(): RestauranteContextValue {
  const ctx = useContext(RestauranteContext)
  if (!ctx) throw new Error('useRestauranteContext deve ser usado dentro de RestauranteProvider')
  return ctx
}
