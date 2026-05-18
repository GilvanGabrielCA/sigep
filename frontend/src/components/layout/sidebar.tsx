import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { useRestauranteContext } from '../../contexts/restaurante-context'
import { SigepMark } from '../sigep-logo'
import styles from './sidebar.module.css'

function IconDashboard() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconKanban() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="5" height="18" rx="1.5" />
      <rect x="9.5" y="3" width="5" height="13" rx="1.5" />
      <rect x="17" y="3" width="5" height="8" rx="1.5" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="13" y2="12" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconPlug() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3" />
      <path d="M3.05 11a9 9 0 1 1 .5 4.5" />
      <polyline points="3 16 3.05 11 8 11" />
    </svg>
  )
}

function IconTerminal() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

interface NavItemConfig {
  label: string
  to: string
  icon: ReactNode
}

const NAV_GENERAL: NavItemConfig[] = [
  { label: 'Dashboard',  to: '/dashboard',  icon: <IconDashboard /> },
  { label: 'Pedidos',    to: '/pedidos',    icon: <IconKanban /> },
  { label: 'Histórico',  to: '/historico',  icon: <IconHistory /> },
  { label: 'Cardápio',   to: '/cardapio',   icon: <IconBook /> },
  { label: 'Perfil',     to: '/perfil',     icon: <IconUser /> },
]

const NAV_GERENTE: NavItemConfig[] = [
  { label: 'Relatórios',    to: '/relatorios',    icon: <IconChart /> },
  { label: 'Usuários',      to: '/usuarios',      icon: <IconUsers /> },
  { label: 'Configurações', to: '/configuracoes', icon: <IconSettings /> },
  { label: 'Integrações',   to: '/integracoes',   icon: <IconPlug /> },
  { label: 'LGPD',          to: '/lgpd',          icon: <IconShield /> },
]

const NAV_SUPERADMIN: NavItemConfig[] = [
  { label: 'Super Admin', to: '/superadmin', icon: <IconTerminal /> },
]

function navClassName({ isActive }: { isActive: boolean }): string {
  return `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
}

export function Sidebar() {
  const { user, signOut } = useAuth()
  const { restaurante } = useRestauranteContext()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.nome
    ? user.nome.split(' ').filter(Boolean).map((n) => n[0]!.toUpperCase()).slice(0, 2).join('')
    : (user?.perfil.charAt(0).toUpperCase() ?? 'U')

  const displayName = user?.nome ?? 'Usuário'

  return (
    <aside className={styles.sidebar}>

      <div className={styles.logoArea}>
        <div className={styles.logoInner}>
          {restaurante?.logo_url ? (
            <div className={styles.logoImgWrap}>
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className={styles.logoImg}
              />
            </div>
          ) : (
            <div className={styles.logoMark}>
              <SigepMark size={18} variant="white" />
            </div>
          )}
          <div className={styles.logoWordmark}>
            <span className={styles.logoText}>
              {restaurante?.nome ?? 'SIGEP'}
            </span>
            <span className={styles.logoSub}>Gestão de Pedidos</span>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_GENERAL.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClassName}>
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}

        {(user?.perfil === 'gerente' || user?.perfil === 'superadmin') && (
          <>
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerLabel}>Gerente</span>
              <div className={styles.dividerLine} />
            </div>
            {NAV_GERENTE.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClassName}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        {user?.perfil === 'superadmin' && (
          <>
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerLabel} style={{ color: '#D97706' }}>Super Admin</span>
              <div className={styles.dividerLine} />
            </div>
            {NAV_SUPERADMIN.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClassName}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userRole}>{user?.perfil}</div>
          </div>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.logoutIcon}><IconLogout /></span>
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
