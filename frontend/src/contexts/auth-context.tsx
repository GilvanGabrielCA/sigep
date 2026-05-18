import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '../types/auth'

const STORAGE_KEY = 'sigep_token'
const API_URL = import.meta.env.VITE_API_URL as string

interface AuthContextValue {
  user: JwtPayload | null
  token: string | null
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function safeDecodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState<JwtPayload | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? safeDecodeToken(stored) : null
  })

  // Sincroniza perfil com o banco sempre que o token muda (evita JWT obsoleto)
  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { perfil?: string; nome?: string } | null) => {
        if (data?.perfil) {
          setUser((prev) =>
            prev
              ? { ...prev, perfil: data.perfil as JwtPayload['perfil'], nome: data.nome ?? prev.nome }
              : prev,
          )
        }
      })
      .catch(() => {})
  }, [token])

  function signIn(newToken: string) {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
    setUser(safeDecodeToken(newToken))
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider')
  return ctx
}
