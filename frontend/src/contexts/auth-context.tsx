import { createContext, useContext, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '../types/auth'

const STORAGE_KEY = 'sigep_token'

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
