import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import styles from './top-bar.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/pedidos':      'Pedidos',
  '/cardapio':     'Cardápio',
  '/relatorios':   'Relatórios',
  '/configuracoes':'Configurações',
  '/integracoes':  'Integrações',
  '/usuarios':     'Usuários',
  '/perfil':       'Meu Perfil',
}

export function TopBar() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const pageTitle = PAGE_TITLES[pathname] ?? 'SIGEP'
  const perfilLabel = user?.perfil === 'gerente' ? 'Gerente' : 'Atendente'

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <span className={styles.breadcrumb}>SIGEP / {pageTitle}</span>
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>
      <div className={styles.right}>
        <span className={styles.badge}>{perfilLabel}</span>
      </div>
    </header>
  )
}
