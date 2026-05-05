import type { PedidoKanban } from '../../types/pedido'
import { PedidoCard } from './pedido-card'
import styles from './kanban-column.module.css'

interface KanbanColumnProps {
  title: string
  status: string
  pedidos: PedidoKanban[]
  color: string
  onMover: (pedidoId: string, novoStatus: string) => void
  nextStatus?: string
  prevStatus?: string
}

function IconEmpty() {
  return (
    <svg
      className={styles.emptyIcon}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h7m-7 7h7m-3.5-3.5v7" />
    </svg>
  )
}

export function KanbanColumn({
  title,
  pedidos,
  color,
  onMover,
  nextStatus,
  prevStatus,
}: KanbanColumnProps) {
  const badgeBg = `${color}18`

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div
          className={styles.badge}
          style={{ background: badgeBg }}
        >
          <span className={styles.badgeDot} style={{ background: color }} />
          <span className={styles.badgeLabel} style={{ color }}>{title}</span>
        </div>
        <span className={styles.count}>{pedidos.length}</span>
      </div>

      <div className={styles.body}>
        {pedidos.length === 0 ? (
          <div className={styles.empty}>
            <IconEmpty />
            <span className={styles.emptyText}>Nenhum pedido aqui</span>
          </div>
        ) : (
          pedidos.map((pedido, i) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onMover={onMover}
              accentColor={color}
              nextStatus={nextStatus}
              prevStatus={prevStatus}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  )
}
