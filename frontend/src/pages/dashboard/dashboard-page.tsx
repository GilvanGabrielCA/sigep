import { type ReactNode } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../../hooks/use-auth'
import { useDashboard } from '../../hooks/use-dashboard'
import styles from './dashboard-page.module.css'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDate(): string {
  const str = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatChartDay(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const date = new Date(parts[0]!, parts[1]! - 1, parts[2]!)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .slice(0, 3)
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

function IconOrders() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconMoney() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  accentColor: string
  iconBg: string
  icon: ReactNode
  delay: string
}

function KpiCard({ label, value, sub, accentColor, iconBg, icon, delay }: KpiCardProps) {
  return (
    <div className={styles.kpiCard} style={{ animationDelay: delay }}>
      <div className={styles.kpiAccent} style={{ background: accentColor }} />
      <div className={styles.kpiRow}>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>{label}</span>
          <span className={styles.kpiValue}>{value}</span>
          <span className={styles.kpiSub}>{sub}</span>
        </div>
        <div
          className={styles.kpiIcon}
          style={{ background: iconBg, color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeleton} style={{ height: '0.625rem', width: '38%', marginBottom: '0.875rem' }} />
      <div className={styles.skeleton} style={{ height: '2rem', width: '55%', marginBottom: '0.5rem' }} />
      <div className={styles.skeleton} style={{ height: '0.625rem', width: '28%' }} />
    </div>
  )
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'Recebido':             { label: 'Recebido',           color: '#F59E0B' },
  'Em Preparacao':        { label: 'Em Preparação',      color: '#EA580C' },
  'Pronto para Entrega':  { label: 'Pronto p/ Entrega',  color: '#16A34A' },
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth()
  const { data, loading, error } = useDashboard()

  const greeting  = getGreeting()
  const dateStr   = formatDate()
  const firstName = user?.nome?.split(' ')[0] ?? 'Usuário'

  const chartData = (data?.pedidosUltimos7Dias ?? []).map((d) => ({
    dia:     formatChartDay(d.dia),
    pedidos: d.total,
  }))

  const totalAtivos = data?.pedidosAtivos ?? 0

  return (
    <div className={styles.page}>

      {/* ─── GREETING ─── */}
      <div className={styles.greeting}>
        <span className={styles.greetingEyebrow}>{greeting}</span>
        <h1 className={styles.greetingTitle}>
          {greeting},{' '}
          <span className={styles.greetingName}>{firstName}</span>
        </h1>
        <p className={styles.greetingDate}>{dateStr}</p>
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {/* ─── KPI CARDS ─── */}
      <div className={styles.kpiGrid}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Pedidos hoje"
              value={data?.pedidosHoje ?? 0}
              sub="realizados"
              accentColor="#F59E0B"
              iconBg="#FEF3C7"
              icon={<IconOrders />}
              delay="0.05s"
            />
            <KpiCard
              label="Faturamento hoje"
              value={formatBRL(data?.faturamentoHoje ?? 0)}
              sub="pedidos entregues"
              accentColor="#16A34A"
              iconBg="#DCFCE7"
              icon={<IconMoney />}
              delay="0.1s"
            />
            <KpiCard
              label="Ticket médio"
              value={formatBRL(data?.ticketMedio ?? 0)}
              sub="por pedido"
              accentColor="#2563EB"
              iconBg="#DBEAFE"
              icon={<IconTag />}
              delay="0.15s"
            />
            <KpiCard
              label="Pedidos ativos"
              value={data?.pedidosAtivos ?? 0}
              sub="em andamento"
              accentColor="#EA580C"
              iconBg="#FED7AA"
              icon={<IconClock />}
              delay="0.2s"
            />
          </>
        )}
      </div>

      {/* ─── STATUS PIPELINE ─── */}
      {!loading && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pipeline de Pedidos</h2>
            <div className={styles.sectionRule} />
          </div>

          <div className={styles.pipeline}>
            {Object.entries(STATUS_CONFIG).map(([statusKey, config], i) => {
              const count = data?.pedidosPorStatus.find((p) => p.status === statusKey)?.total ?? 0
              const pct   = totalAtivos > 0 ? Math.round((count / totalAtivos) * 100) : 0
              return (
                <div key={statusKey} className={styles.statusCard} style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
                  <div className={styles.statusHead}>
                    <span className={styles.statusDot} style={{ background: config.color, boxShadow: `0 0 5px ${config.color}` }} />
                    <span className={styles.statusLabel}>{config.label}</span>
                  </div>
                  <span className={styles.statusCount} style={{ color: config.color }}>{count}</span>
                  <div className={styles.statusBar}>
                    <div className={styles.statusBarFill} style={{ width: `${pct}%`, background: config.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ─── CHART: ÚLTIMOS 7 DIAS ─── */}
      {!loading && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Últimos 7 dias</h2>
            <div className={styles.sectionRule} />
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
              <span className={styles.chartCardTitle}>Volume de pedidos</span>
              <span className={styles.chartLegend}>
                <span className={styles.chartLegendPip} />
                Pedidos por dia
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className={styles.emptyChart}>Nenhum pedido nos últimos 7 dias.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  barSize={30}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0EDE8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#A8A29E', fontFamily: 'DM Sans, Inter, sans-serif' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#A8A29E', fontFamily: 'DM Sans, Inter, sans-serif' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(245,158,11,0.07)' }}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #ECEAE5',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                      fontFamily: 'DM Sans, Inter, sans-serif',
                      fontSize: '0.8125rem',
                      padding: '0.625rem 0.875rem',
                    }}
                    labelStyle={{ color: '#78716C', marginBottom: '2px', fontSize: '0.72rem' }}
                    itemStyle={{ color: '#1C1917', fontWeight: 600 }}
                    formatter={(val) => [`${val} pedidos`, '']}
                  />
                  <Bar
                    dataKey="pedidos"
                    fill="#F59E0B"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}
