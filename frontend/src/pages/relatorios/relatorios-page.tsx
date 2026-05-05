import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useRelatorios } from '../../hooks/use-relatorios'
import styles from './relatorios-page.module.css'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function defaultDates() {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - 29)
  return { inicio: toDateStr(inicio), fim: toDateStr(fim) }
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value)
}

function formatChartDay(dia: string): string {
  const d = new Date(`${dia}T12:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
}

function formatMinutes(min: number | null): string {
  if (min === null) return '—'
  if (min < 60) return `${Math.round(min)} min`
  return `${(min / 60).toFixed(1)} h`
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

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

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonPage() {
  return (
    <>
      <div className={styles.kpiGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeleton} style={{ height: '0.625rem', width: '50%' }} />
            <div className={styles.skeleton} style={{ height: '1.75rem', width: '65%' }} />
            <div className={styles.skeleton} style={{ height: '0.625rem', width: '40%' }} />
          </div>
        ))}
      </div>
      <div className={styles.skeletonChart}>
        <div className={styles.skeleton} style={{ height: '220px', width: '100%' }} />
      </div>
    </>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function RelatoriosPage() {
  const defaults = defaultDates()
  const [inicio, setInicio] = useState(defaults.inicio)
  const [fim, setFim] = useState(defaults.fim)
  const [applied, setApplied] = useState({ inicio: defaults.inicio, fim: defaults.fim })

  const { data, loading, error } = useRelatorios(applied.inicio, applied.fim)

  function handleUpdate() {
    setApplied({ inicio, fim })
  }

  // ── Computed metrics ────────────────────────────────────────────────────────

  const totalFaturamento = data?.vendas.reduce((s, d) => s + d.faturamento, 0) ?? 0
  const totalPedidos     = data?.vendas.reduce((s, d) => s + d.pedidos, 0) ?? 0
  const ticketMedio      = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0
  const tempoPreparo     = data?.tempoPreparo.minutos_medio ?? null

  const chartData = (data?.vendas ?? []).map((d) => ({
    dia:         formatChartDay(d.dia),
    pedidos:     d.pedidos,
    faturamento: d.faturamento,
  }))

  const maxProduto = data?.produtosMaisPedidos[0]?.total_pedido ?? 1
  const totalCanal = (data?.pedidosPorCanal ?? []).reduce((s, c) => s + c.total, 0)

  const fmtPeriod = () => {
    const a = new Date(`${applied.inicio}T12:00:00`)
    const b = new Date(`${applied.fim}T12:00:00`)
    const fmt = (d: Date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
    return `${fmt(a)} — ${fmt(b)}`
  }

  return (
    <div className={styles.page}>

      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.subtitle}>{fmtPeriod()}</p>
        </div>
        <div className={styles.periodForm}>
          <span className={styles.periodLabel}>De</span>
          <input
            type="date"
            className={styles.dateInput}
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            max={fim}
          />
          <span className={styles.periodLabel}>até</span>
          <input
            type="date"
            className={styles.dateInput}
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            min={inicio}
          />
          <button className={styles.btnUpdate} onClick={handleUpdate}>
            Atualizar
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {loading ? (
        <SkeletonPage />
      ) : (
        <>
          {/* ─── KPI CARDS ─── */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#16A34A' }} />
              <span className={styles.kpiLabel}>Faturamento</span>
              <span className={styles.kpiValue}>{formatBRL(totalFaturamento)}</span>
              <span className={styles.kpiSub}>no período</span>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#F59E0B' }} />
              <span className={styles.kpiLabel}>Total de Pedidos</span>
              <span className={styles.kpiValue}>{totalPedidos}</span>
              <span className={styles.kpiSub}>não cancelados</span>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#2563EB' }} />
              <span className={styles.kpiLabel}>Ticket Médio</span>
              <span className={styles.kpiValue}>{formatBRL(ticketMedio)}</span>
              <span className={styles.kpiSub}>por pedido</span>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#EA580C' }} />
              <span className={styles.kpiLabel}>Tempo de Preparo</span>
              <span className={styles.kpiValue}>{formatMinutes(tempoPreparo)}</span>
              <span className={styles.kpiSub}>
                {data?.tempoPreparo.total_entregues ?? 0} entregues
              </span>
            </div>
          </div>

          {/* ─── GRÁFICO ─── */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Vendas por Dia</h2>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendPip} style={{ background: '#F59E0B' }} />
                  Pedidos
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendPip} style={{ background: '#16A34A' }} />
                  Faturamento
                </span>
              </div>
            </div>
            <div className={styles.sectionBody}>
              {chartData.length === 0 ? (
                <div className={styles.empty}>Nenhum pedido no período.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={chartData}
                    barSize={14}
                    margin={{ top: 4, right: 16, bottom: 0, left: -16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                    <XAxis
                      dataKey="dia"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#A8A29E', fontFamily: 'DM Sans, Inter, sans-serif' }}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false} tickLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#A8A29E', fontFamily: 'DM Sans, Inter, sans-serif' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#A8A29E', fontFamily: 'DM Sans, Inter, sans-serif' }}
                      tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(245,158,11,0.06)' }}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #ECEAE5',
                        borderRadius: '8px',
                        fontFamily: 'DM Sans, Inter, sans-serif',
                        fontSize: '0.8125rem',
                      }}
                      formatter={(value: number, name: string) =>
                        name === 'pedidos'
                          ? [`${value} pedidos`, 'Pedidos']
                          : [formatBRL(value), 'Faturamento']
                      }
                    />
                    <Bar yAxisId="left"  dataKey="pedidos"     fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="faturamento" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ─── BOTTOM GRID ─── */}
          <div className={styles.bottomGrid}>

            {/* TOP PRODUTOS */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Top Produtos</h2>
                <span className={styles.sectionMeta}>{data?.produtosMaisPedidos.length ?? 0} itens</span>
              </div>
              <div className={styles.sectionBody}>
                {(data?.produtosMaisPedidos ?? []).length === 0 ? (
                  <div className={styles.empty}>Sem dados de produtos.</div>
                ) : (
                  <div className={styles.prodList}>
                    {(data?.produtosMaisPedidos ?? []).map((prod, i) => {
                      const pct = maxProduto > 0 ? (prod.total_pedido / maxProduto) * 100 : 0
                      return (
                        <div key={prod.nome} className={styles.prodRow}>
                          <span className={styles.prodRank}>{i + 1}</span>
                          <div className={styles.prodBarWrap}>
                            <span className={styles.prodName}>{prod.nome}</span>
                            <div className={styles.prodBarTrack}>
                              <div
                                className={styles.prodBarFill}
                                style={{
                                  '--bar-width': `${pct}%`,
                                  '--delay': `${i * 0.06}s`,
                                } as React.CSSProperties}
                              />
                            </div>
                          </div>
                          <div className={styles.prodStats}>
                            <span className={styles.prodCount}>{prod.total_pedido}×</span>
                            <span className={styles.prodFat}>{formatBRL(prod.faturamento)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CANAIS */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Pedidos por Canal</h2>
                <span className={styles.sectionMeta}>{totalCanal} total</span>
              </div>
              <div className={styles.sectionBody}>
                {(data?.pedidosPorCanal ?? []).length === 0 ? (
                  <div className={styles.empty}>Sem dados de canais.</div>
                ) : (
                  <div className={styles.canalList}>
                    {(data?.pedidosPorCanal ?? []).map((canal, i) => {
                      const pct = totalCanal > 0 ? (canal.total / totalCanal) * 100 : 0
                      const isWhatsapp = canal.canal === 'whatsapp'
                      const color = isWhatsapp ? '#25D366' : '#2563EB'
                      const iconBg = isWhatsapp ? '#DCFCE7' : '#DBEAFE'
                      return (
                        <div key={canal.canal} className={styles.canalItem}>
                          <div className={styles.canalTop}>
                            <span className={styles.canalName}>
                              <span className={styles.canalIconWrap} style={{ background: iconBg, color }}>
                                {isWhatsapp ? <IconWhatsapp /> : <IconMonitor />}
                              </span>
                              {canal.canal}
                            </span>
                            <div className={styles.canalRight}>
                              <span className={styles.canalPct}>{Math.round(pct)}%</span>
                              <span className={styles.canalTotal}>{canal.total}</span>
                            </div>
                          </div>
                          <div className={styles.canalTrack}>
                            <div
                              className={styles.canalFill}
                              style={{
                                background: color,
                                '--bar-width': `${pct}%`,
                                '--delay': `${i * 0.1}s`,
                              } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
