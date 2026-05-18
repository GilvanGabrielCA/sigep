import { useState, useEffect, useCallback } from 'react'
import { useHistorico } from '../../hooks/use-historico'
import { useAuth } from '../../hooks/use-auth'
import type { HistoricoFiltros } from '../../services/historico-api'
import styles from './historico-page.module.css'

const STATUS_OPTS = [
  { value: '', label: 'Todos os status' },
  { value: 'Recebido', label: 'Recebido' },
  { value: 'Em Preparacao', label: 'Em Preparação' },
  { value: 'Pronto para Entrega', label: 'Pronto para Entrega' },
  { value: 'Entregue', label: 'Entregue' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const CANAL_OPTS = [
  { value: '', label: 'Todos os canais' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'interno', label: 'Interno' },
]

function statusClass(status: string): string {
  switch (status) {
    case 'Recebido': return styles.statusRecebido
    case 'Em Preparacao': return styles.statusPreparacao
    case 'Pronto para Entrega': return styles.statusPronto
    case 'Entregue': return styles.statusEntregue
    case 'Cancelado': return styles.statusCancelado
    default: return ''
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function formatCurrency(val: string | null): string {
  if (!val) return '—'
  return parseFloat(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className={styles.skRow}>
          <td><div className={styles.skCell} style={{ width: 80 }} /></td>
          <td><div className={styles.skCell} style={{ width: '70%' }} /></td>
          <td><div className={styles.skCell} style={{ width: 70 }} /></td>
          <td><div className={styles.skCell} style={{ width: 90 }} /></td>
          <td><div className={styles.skCell} style={{ width: 60 }} /></td>
          <td><div className={styles.skCell} style={{ width: 120 }} /></td>
        </tr>
      ))}
    </>
  )
}

export function HistoricoPage() {
  const { data, loading, error, load } = useHistorico()
  const { user } = useAuth()
  const isGerente = user?.perfil === 'gerente' || user?.perfil === 'superadmin'

  const [filtros, setFiltros] = useState<HistoricoFiltros>({ page: 1, limit: 50 })
  const [status, setStatus] = useState('')
  const [canal, setCanal] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    void load({ page: 1, limit: 50 })
  }, [load])

  const handleSearch = useCallback(() => {
    const f: HistoricoFiltros = {
      page: 1,
      limit: 50,
      status: status || undefined,
      canal: canal || undefined,
      clienteNome: clienteNome || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    }
    setFiltros(f)
    void load(f)
  }, [status, canal, clienteNome, dataInicio, dataFim, load])

  const handleClear = useCallback(() => {
    setStatus('')
    setCanal('')
    setClienteNome('')
    setDataInicio('')
    setDataFim('')
    const f: HistoricoFiltros = { page: 1, limit: 50 }
    setFiltros(f)
    void load(f)
  }, [load])

  const handlePage = useCallback((p: number) => {
    const f = { ...filtros, page: p }
    setFiltros(f)
    void load(f)
  }, [filtros, load])

  const rows = data?.rows ?? []
  const totalPedidos = data?.total ?? 0
  const totalPages = data?.pages ?? 1
  const currentPage = data?.page ?? 1

  const totalFaturamento = rows
    .filter((r) => r.status === 'Entregue' && r.total)
    .reduce((s, r) => s + parseFloat(r.total!), 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Histórico de Pedidos</h1>
        <p className={styles.subtitle}>Todos os pedidos registrados no sistema</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status</span>
          <select
            className={styles.filterInput}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Canal</span>
          <select
            className={styles.filterInput}
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            {CANAL_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Cliente</span>
          <input
            className={styles.filterInputWide}
            type="text"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Nome do cliente…"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>De</span>
          <input
            className={styles.filterInput}
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Até</span>
          <input
            className={styles.filterInput}
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <button className={styles.btnSearch} onClick={handleSearch}>Buscar</button>
        <button className={styles.btnClear} onClick={handleClear}>Limpar</button>
      </div>

      {!loading && data && (
        <div className={styles.statsBar}>
          <div className={styles.statChip}>
            Total: <span className={styles.statChipValue}>{totalPedidos} pedidos</span>
          </div>
          {isGerente && (
            <div className={styles.statChip}>
              Entregues: <span className={styles.statChipValue}>
                {totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Canal</th>
              <th>Status</th>
              {isGerente && <th>Total</th>}
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={isGerente ? 6 : 5}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📋</div>
                    <p className={styles.emptyText}>Nenhum pedido encontrado</p>
                    <p className={styles.emptyHint}>Tente ajustar os filtros de busca</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles.pedidoId}>#{row.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td>
                    <div className={styles.clienteNome}>{row.cliente_nome ?? '—'}</div>
                    {row.cliente_telefone && (
                      <div className={styles.clienteTel}>{row.cliente_telefone}</div>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.canal} ${row.canal === 'whatsapp' ? styles.canalWhatsapp : styles.canalInterno}`}>
                      {row.canal === 'whatsapp' ? '📱' : '🖥️'} {row.canal}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  {isGerente && (
                    <td>
                      <span className={styles.total}>{formatCurrency(row.total)}</span>
                    </td>
                  )}
                  <td>{formatDate(row.criado_em)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Página {currentPage} de {totalPages} · {totalPedidos} registros
            </span>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn} disabled={currentPage <= 1} onClick={() => handlePage(currentPage - 1)}>
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => handlePage(currentPage + 1)}>
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
