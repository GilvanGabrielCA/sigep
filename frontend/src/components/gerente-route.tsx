import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

export function GerenteRoute() {
  const { user } = useAuth()

  if (user?.perfil !== 'gerente') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '0.5rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            color: '#D97706',
            lineHeight: 1,
          }}
        >
          403
        </span>
        <p style={{ color: '#78716C', fontSize: '0.9375rem' }}>
          Acesso restrito a gerentes.
        </p>
      </div>
    )
  }

  return <Outlet />
}
