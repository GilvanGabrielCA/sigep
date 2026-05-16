import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePedidoDetalhe } from '../../hooks/use-pedido-detalhe'
import type { ItemPedido, HistoricoStatus } from '../../types/pedido'
import styles from './pedido-modal.module.css'

interface PedidoModalProps {
  pedidoId: string | null
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  'Recebido':            '#F59E0B',
  'Em Preparacao':       '#EA580C',
  'Pronto para Entrega': '#16A34A',
  'Entregue':            '#2563EB',
  'Cancelado':           '#DC2626',
}

const STATUS_LABELS: Record<string, string> = {
  'Recebido':            'Recebido',
  'Em Preparacao':       'Em Preparação',
  'Pronto para Entrega': 'Pronto p/ Entrega',
  'Entregue':            'Entregue',
  'Cancelado':           'Cancelado',
}

function formatBRL(value: string | number | null): string {
  if (value === null || value === undefined) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function IconPdf() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function IconWhatsapp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.1 1.517 5.833L.057 23.516a.5.5 0 0 0 .609.61l5.73-1.498A11.926 11.926 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 0 1-4.988-1.365l-.356-.213-3.703.97.988-3.614-.233-.372A9.78 9.78 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
    </svg>
  )
}

function IconMonitor() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  )
}

function SkeletonBody() {
  return (
    <div className={styles.skeletonBody}>
      <div className={styles.skeleton} style={{ height: '0.75rem', width: '60%' }} />
      <div className={styles.skeleton} style={{ height: '0.75rem', width: '40%' }} />
      <div className={styles.skeleton} style={{ height: '0.75rem', width: '75%' }} />
      <div style={{ marginTop: '0.5rem' }}>
        <div className={styles.skeleton} style={{ height: '0.75rem', width: '50%', marginBottom: '0.5rem' }} />
        <div className={styles.skeleton} style={{ height: '0.75rem', width: '45%', marginBottom: '0.5rem' }} />
        <div className={styles.skeleton} style={{ height: '0.75rem', width: '55%' }} />
      </div>
    </div>
  )
}

function ItemsList({ itens }: { itens: ItemPedido[] }) {
  return (
    <div className={styles.itemsList}>
      {itens.map((item) => {
        const subtotal = item.quantidade * parseFloat(item.preco_unitario)
        return (
          <div key={item.id}>
            <div className={styles.itemRow}>
              <div className={styles.itemLeft}>
                <span className={styles.itemQty}>{item.quantidade}×</span>
                <span className={styles.itemName}>{item.produto_nome}</span>
              </div>
              <span className={styles.itemSubtotal}>{formatBRL(subtotal)}</span>
            </div>
            {item.observacao && (
              <div className={styles.itemObs}>{item.observacao}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Timeline({ historico }: { historico: HistoricoStatus[] }) {
  return (
    <div className={styles.timeline}>
      {historico.map((entry, i) => {
        const color = STATUS_COLORS[entry.status_novo] ?? '#A8A29E'
        return (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineTrack}>
              <div
                className={styles.timelineDot}
                style={{ color, backgroundColor: `${color}25` }}
              />
              <div className={styles.timelineLine} />
            </div>
            <div className={styles.timelineContent}>
              <span className={styles.timelineStatus}>
                {STATUS_LABELS[entry.status_novo] ?? entry.status_novo}
              </span>
              <div className={styles.timelineMeta}>
                <span className={styles.timelineDate}>{formatDate(entry.criado_em)}</span>
                {entry.usuario_nome && (
                  <>
                    <span className={styles.timelineSep} />
                    <span className={styles.timelineUser}>{entry.usuario_nome}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ModalContent({ pedidoId, onClose }: PedidoModalProps & { pedidoId: string }) {
  const { data, loading, error } = usePedidoDetalhe(pedidoId)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function gerarPDF() {
    if (!data) return
    const win = window.open('', '_blank', 'width=640,height=900')
    if (!win) return
    const linhasItens = data.itens.map((item) => {
      const sub = item.quantidade * parseFloat(item.preco_unitario)
      return `<tr>
        <td style="color:#F59E0B;font-weight:700;width:2.5rem">${item.quantidade}×</td>
        <td>${item.produto_nome}</td>
        <td style="text-align:right;font-weight:600;width:6rem">${formatBRL(sub)}</td>
      </tr>`
    }).join('')
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Pedido #${data.id.slice(-8).toUpperCase()}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;padding:2rem;color:#1C1917;line-height:1.5}
  h1{font-size:1.5rem;font-weight:700;margin-bottom:.25rem}
  .sub{color:#78716C;font-size:.875rem;margin-bottom:1.5rem}
  h2{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#A8A29E;margin-bottom:.5rem;padding-bottom:.375rem;border-bottom:1px solid #ECEAE5}
  .section{margin-bottom:1.25rem}
  .field{margin-bottom:.3rem;font-size:.9375rem}
  .label{color:#78716C;font-size:.8125rem}
  table{width:100%;border-collapse:collapse;margin-bottom:.75rem}
  td{padding:.4rem 0;border-bottom:1px solid #F0EDE8;font-size:.9375rem}
  .total-row{display:flex;justify-content:space-between;padding:.625rem 0 0;font-weight:700;font-size:1.1rem;border-top:2px solid #1C1917}
  @media print{body{padding:1rem}}
</style></head>
<body>
  <h1>Pedido #${data.id.slice(-8).toUpperCase()}</h1>
  <div class="sub">${formatDate(data.criado_em)}</div>
  <div class="section">
    <h2>Cliente</h2>
    <div class="field"><span class="label">Nome: </span>${data.cliente_nome ?? '—'}</div>
    <div class="field"><span class="label">Telefone: </span>${data.cliente_telefone ?? '—'}</div>
    <div class="field"><span class="label">Endereço: </span>${data.cliente_endereco ?? '—'}</div>
    <div class="field"><span class="label">Canal: </span>${data.canal}</div>
  </div>
  <div class="section">
    <h2>Itens do Pedido</h2>
    <table>${linhasItens}</table>
    <div class="total-row"><span>Total</span><span>${formatBRL(data.total)}</span></div>
  </div>
  <div class="section">
    <h2>Status</h2>
    <div class="field">${STATUS_LABELS[data.status] ?? data.status}</div>
    ${data.observacoes ? `<div class="field"><span class="label">Obs: </span>${data.observacoes}</div>` : ''}
  </div>
</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 300)
  }

  const statusColor = data ? (STATUS_COLORS[data.status] ?? '#A8A29E') : '#A8A29E'
  const statusLabel = data ? (STATUS_LABELS[data.status] ?? data.status) : ''

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.panel}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.orderId}>PEDIDO #{data ? data.id.slice(-8).toUpperCase() : '········'}</span>
            <span className={styles.orderTitle}>
              {data?.cliente_nome ?? 'Carregando...'}
            </span>
            {data && (
              <div
                className={styles.statusBadge}
                style={{ background: `${statusColor}22` }}
              >
                <span
                  className={styles.statusDot}
                  style={{ background: statusColor }}
                />
                <span className={styles.statusLabel} style={{ color: statusColor }}>
                  {statusLabel}
                </span>
              </div>
            )}
          </div>
          <div className={styles.headerRight}>
            {data && (
              <button
                type="button"
                className={styles.pdfBtn}
                onClick={gerarPDF}
                title="Gerar PDF do pedido"
              >
                <IconPdf />
                PDF
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
              <IconClose />
            </button>
          </div>
        </div>

        {loading && <SkeletonBody />}
        {error && <div className={styles.errorBox} role="alert">{error}</div>}

        {data && (
          <div className={styles.body}>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>Cliente</span>
              <div className={styles.clientGrid}>
                <div className={styles.clientField}>
                  <span className={styles.clientFieldLabel}>Nome</span>
                  <span className={styles.clientFieldValue}>
                    {data.cliente_nome ?? '—'}
                  </span>
                </div>
                <div className={styles.clientField}>
                  <span className={styles.clientFieldLabel}>Telefone</span>
                  <span className={styles.clientFieldValue}>
                    {data.cliente_telefone ?? '—'}
                  </span>
                </div>
                <div className={`${styles.clientField} ${styles.clientFieldFull}`}>
                  <span className={styles.clientFieldLabel}>Endereço de entrega</span>
                  <span className={styles.clientFieldValue}>
                    {data.cliente_endereco ?? '—'}
                  </span>
                </div>
                <div className={styles.clientField}>
                  <span className={styles.clientFieldLabel}>Canal</span>
                  <span className={`${styles.clientFieldValue} ${styles.canalRow}`}>
                    {data.canal === 'whatsapp' ? <IconWhatsapp /> : <IconMonitor />}
                    {data.canal}
                  </span>
                </div>
                {data.observacoes && (
                  <div className={`${styles.clientField} ${styles.clientFieldFull}`}>
                    <span className={styles.clientFieldLabel}>Observações</span>
                    <span className={styles.clientFieldValue}>{data.observacoes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>Itens do Pedido</span>
              {data.itens.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#A8A29E', margin: 0 }}>
                  Nenhum item registrado.
                </p>
              ) : (
                <>
                  <ItemsList itens={data.itens} />
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalValue}>{formatBRL(data.total)}</span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>Histórico de Status</span>
              {data.historico.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#A8A29E', margin: 0 }}>
                  Sem histórico registrado.
                </p>
              ) : (
                <Timeline historico={data.historico} />
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export function PedidoModal({ pedidoId, onClose }: PedidoModalProps) {
  if (!pedidoId) return null
  return createPortal(
    <ModalContent pedidoId={pedidoId} onClose={onClose} />,
    document.body,
  )
}
