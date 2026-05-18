import { useState, useEffect, useCallback } from 'react'
import { useSuperAdmin } from '../../hooks/use-superadmin'
import styles from './superadmin-page.module.css'

type Aba = 'logs' | 'usuarios'

const OP_OPTS = [
  { value: '', label: 'Todas as operações' },
  { value: 'READ', label: 'READ' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'ANONYMIZE', label: 'ANONYMIZE' },
  { value: 'CONSENT', label: 'CONSENT' },
  { value: 'EXPORT', label: 'EXPORT' },
]

function opClass(op: string): string {
  switch (op) {
    case 'READ': return styles.opRead
    case 'UPDATE': return styles.opUpdate
    case 'DELETE': return styles.opDelete
    case 'ANONYMIZE': return styles.opAnonymize
    case 'CONSENT': return styles.opConsent
    case 'EXPORT': return styles.opExport
    default: return ''
  }
}

function perfilClass(perfil: string): string {
  switch (perfil) {
    case 'superadmin': return styles.perfilSuperadmin
    case 'gerente': return styles.perfilGerente
    case 'atendente': return styles.perfilAtendente
    default: return ''
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(iso))
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j}><div className={styles.skCell} style={{ width: '60%' }} /></td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SuperAdminPage() {
  const { stats, logsData, usuariosData, loading, error, loadStats, loadLogs, loadUsuarios } = useSuperAdmin()
  const [aba, setAba] = useState<Aba>('logs')
  const [operacao, setOperacao] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [usuarioPage, setUsuarioPage] = useState(1)

  useEffect(() => {
    void loadStats()
    void loadLogs({ page: 1 })
  }, [loadStats, loadLogs])

  const handleLoadLogs = useCallback(() => {
    setLogPage(1)
    void loadLogs({ operacao: operacao || undefined, page: 1 })
  }, [operacao, loadLogs])

  const handleLogPage = useCallback((p: number) => {
    setLogPage(p)
    void loadLogs({ operacao: operacao || undefined, page: p })
  }, [operacao, loadLogs])

  const handleAbaUsuarios = useCallback(() => {
    setAba('usuarios')
    setUsuarioPage(1)
    void loadUsuarios({ page: 1 })
  }, [loadUsuarios])

  const handleUsuarioPage = useCallback((p: number) => {
    setUsuarioPage(p)
    void loadUsuarios({ page: p })
  }, [loadUsuarios])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Super Admin
            <span className={styles.badge}>Acesso Total</span>
          </h1>
          <p className={styles.subtitle}>Visão global do sistema SIGEP</p>
        </div>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Restaurantes</div>
            <div className={`${styles.statValue} ${styles.statValueAmber}`}>
              {stats.total_restaurantes}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Usuários ativos</div>
            <div className={styles.statValue}>{stats.total_usuarios}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total pedidos</div>
            <div className={styles.statValue}>{stats.total_pedidos}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pedidos hoje</div>
            <div className={`${styles.statValue} ${styles.statValueAmber}`}>
              {stats.total_pedidos_hoje}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Faturamento entregue</div>
            <div className={styles.statValue} style={{ fontSize: '1.125rem' }}>
              {parseFloat(stats.faturamento_total || '0').toLocaleString('pt-BR', {
                style: 'currency', currency: 'BRL',
              })}
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${aba === 'logs' ? styles.tabActive : ''}`}
          onClick={() => setAba('logs')}
        >
          📋 Logs de Auditoria
        </button>
        <button
          className={`${styles.tab} ${aba === 'usuarios' ? styles.tabActive : ''}`}
          onClick={handleAbaUsuarios}
        >
          👥 Todos os Usuários
        </button>
      </div>

      {error && (
        <p style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
      )}

      {aba === 'logs' && (
        <>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Operação</span>
              <select
                className={styles.filterSelect}
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
              >
                {OP_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button className={styles.btnLoad} onClick={handleLoadLogs}>
              Filtrar
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Restaurante</th>
                  <th>Usuário</th>
                  <th>Entidade</th>
                  <th>Operação</th>
                  <th>Descrição</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={6} />
                ) : !logsData || logsData.rows.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>Nenhum log encontrado.</td></tr>
                ) : (
                  logsData.rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.restaurante_nome ?? '—'}</td>
                      <td>{row.usuario_nome ?? <span style={{ color: '#A8A29E' }}>sistema</span>}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#F5F4F0', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                          {row.entidade}
                          {row.entidade_id && <span style={{ color: '#78716C' }}>&nbsp;·&nbsp;{row.entidade_id.slice(-8)}</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.opBadge} ${opClass(row.operacao)}`}>
                          {row.operacao}
                        </span>
                      </td>
                      <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.descricao ?? '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(row.criado_em)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && logsData && logsData.pages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Página {logPage} de {logsData.pages} · {logsData.total} registros
                </span>
                <div className={styles.paginationBtns}>
                  <button className={styles.pageBtn} disabled={logPage <= 1} onClick={() => handleLogPage(logPage - 1)}>←</button>
                  {Array.from({ length: Math.min(5, logsData.pages) }, (_, i) => {
                    const p = Math.max(1, Math.min(logPage - 2, logsData.pages - 4)) + i
                    if (p < 1 || p > logsData.pages) return null
                    return (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === logPage ? styles.pageBtnActive : ''}`}
                        onClick={() => handleLogPage(p)}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button className={styles.pageBtn} disabled={logPage >= logsData.pages} onClick={() => handleLogPage(logPage + 1)}>→</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {aba === 'usuarios' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Restaurante</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={6} />
              ) : !usuariosData || usuariosData.rows.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>Nenhum usuário encontrado.</td></tr>
              ) : (
                usuariosData.rows.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nome}</td>
                    <td style={{ color: '#57534E' }}>{u.email}</td>
                    <td>
                      <span className={`${styles.perfilBadge} ${perfilClass(u.perfil)}`}>
                        {u.perfil}
                      </span>
                    </td>
                    <td>{u.restaurante_nome}</td>
                    <td>
                      <span className={u.ativo ? styles.statusAtivo : styles.statusInativo}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#78716C' }}>
                      {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && usuariosData && Math.ceil(usuariosData.total / 50) > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Página {usuarioPage} de {Math.ceil(usuariosData.total / 50)} · {usuariosData.total} usuários
              </span>
              <div className={styles.paginationBtns}>
                <button className={styles.pageBtn} disabled={usuarioPage <= 1} onClick={() => handleUsuarioPage(usuarioPage - 1)}>←</button>
                <button className={styles.pageBtn} disabled={usuarioPage >= Math.ceil(usuariosData.total / 50)} onClick={() => handleUsuarioPage(usuarioPage + 1)}>→</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
