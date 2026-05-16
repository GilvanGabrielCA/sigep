import { useState, useEffect } from 'react'
import type { PedidoKanban } from '../../types/pedido'
import styles from './pedido-card.module.css'

interface PedidoCardProps {
  pedido: PedidoKanban
  onMover: (pedidoId: string, novoStatus: string) => void
  onVerDetalhes: (pedidoId: string) => void
  nextStatus?: string
  prevStatus?: string
  accentColor: string
  index: number
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  return `há ${Math.floor(hrs / 24)}d`
}

function formatBRL(value: string | null): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(parseFloat(value))
}

function IconWhatsapp() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.1 1.517 5.833L.057 23.516a.5.5 0 0 0 .609.61l5.73-1.498A11.926 11.926 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 0 1-4.988-1.365l-.356-.213-3.703.97.988-3.614-.233-.372A9.78 9.78 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
    </svg>
  )
}

function IconMonitor() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  )
}

function IconBack() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function PedidoCard({
  pedido,
  onMover,
  onVerDetalhes,
  nextStatus,
  prevStatus,
  accentColor,
  index,
}: PedidoCardProps) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const shortId = pedido.id.slice(-8).toUpperCase()
  const clienteName = pedido.cliente_nome ?? 'Cliente desconhecido'
  const total = formatBRL(pedido.total)
  const tempo = timeAgo(pedido.criado_em)
  const isWhatsapp = pedido.canal === 'whatsapp'
  const elapsedMinutes = Math.floor((Date.now() - new Date(pedido.criado_em).getTime()) / 60_000)
  const isUrgent = elapsedMinutes >= 20

  const nextBg = `${accentColor}18`
  const delay = `${index * 0.05}s`

  return (
    <div
      className={`${styles.card}${isUrgent ? ` ${styles.urgentCard}` : ''}`}
      style={{ animationDelay: delay }}
    >
      <div className={styles.accent} style={{ background: accentColor }} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.orderId}>#{shortId}</span>
          <button
            className={styles.cancelBtn}
            onClick={() => onMover(pedido.id, 'Cancelado')}
            title="Cancelar pedido"
            aria-label="Cancelar pedido"
          >
            <IconX />
          </button>
        </div>

        <span
          className={styles.clientName}
          onClick={() => onVerDetalhes(pedido.id)}
          style={{ cursor: 'pointer' }}
        >
          {clienteName}
        </span>

        <div className={styles.metaRow}>
          <span className={styles.canal}>
            {isWhatsapp ? <IconWhatsapp /> : <IconMonitor />}
            {pedido.canal}
          </span>
          <span className={styles.metaSep} />
          {isUrgent ? (
            <span className={styles.timerBadge}>⚠ {tempo}</span>
          ) : (
            <span className={styles.time}>{tempo}</span>
          )}
        </div>

        {pedido.observacoes && (
          <span className={styles.obs}>{pedido.observacoes}</span>
        )}

        <div className={styles.footer}>
          <span className={styles.total}>{total}</span>
          <div className={styles.actions}>
            {prevStatus && (
              <button
                className={styles.prevBtn}
                onClick={() => onMover(pedido.id, prevStatus)}
                title={`Voltar para ${prevStatus}`}
                aria-label={`Voltar para ${prevStatus}`}
              >
                <IconBack />
              </button>
            )}
            {nextStatus && (
              <button
                className={styles.nextBtn}
                onClick={() => onMover(pedido.id, nextStatus)}
                title={`Avançar para ${nextStatus}`}
                aria-label={`Avançar para ${nextStatus}`}
                style={{ background: accentColor, color: '#fff' }}
              >
                <IconArrow />
                {nextStatus === 'Entregue' ? 'Entregar' : 'Avançar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
