import { useState } from 'react'
import { usePedidos } from '../../hooks/use-pedidos'
import { KanbanColumn } from '../../components/kanban/kanban-column'
import { PedidoModal } from '../../components/pedido/pedido-modal'
import styles from './kanban-page.module.css'

const COLUMNS = [
  {
    status:     'Recebido',
    title:      'Recebido',
    color:      '#F59E0B',
    nextStatus: 'Em Preparacao',
  },
  {
    status:     'Em Preparacao',
    title:      'Em Preparação',
    color:      '#EA580C',
    prevStatus: 'Recebido',
    nextStatus: 'Pronto para Entrega',
  },
  {
    status:     'Pronto para Entrega',
    title:      'Pronto p/ Entrega',
    color:      '#16A34A',
    prevStatus: 'Em Preparacao',
    nextStatus: 'Entregue',
  },
]

export function KanbanPage() {
  const { pedidos, loading, error, moverPedido } = usePedidos()
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)

  const total = pedidos.length

  return (
    <div className={styles.page}>

      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Gerenciamento em tempo real</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.totalBadge}>
            <strong>{total}</strong> pedido{total !== 1 ? 's' : ''} ativo{total !== 1 ? 's' : ''}
          </span>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveText}>Ao vivo</span>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {/* ─── BOARD ─── */}
      {loading ? (
        <div className={styles.board}>
          {COLUMNS.map((col) => (
            <div key={col.status} className={styles.skeletonColumn}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.board}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              color={col.color}
              pedidos={pedidos.filter((p) => p.status === col.status)}
              onMover={moverPedido}
              onVerDetalhes={setSelectedPedidoId}
              nextStatus={col.nextStatus}
              prevStatus={col.prevStatus}
            />
          ))}
        </div>
      )}

      <PedidoModal
        pedidoId={selectedPedidoId}
        onClose={() => setSelectedPedidoId(null)}
      />
    </div>
  )
}
