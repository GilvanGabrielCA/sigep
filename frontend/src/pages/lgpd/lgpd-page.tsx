import { useState } from 'react'
import { useLgpd } from '../../hooks/use-lgpd'
import type { SolicitacaoLgpd, AuditoriaItem, ConsentimentoItem } from '../../services/lgpd-api'
import styles from './lgpd-page.module.css'

// ─── ICONS ────────────────────────────────────────────────────────────────────

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  )
}

function IconLog() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function IconErase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function fmt(d: string) {
  return formatDate.format(new Date(d))
}

function maskPhone(s: string): string {
  if (s.length <= 4) return s
  return s.slice(0, 2) + '****' + s.slice(-4)
}

// ─── BADGES ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pendente: styles.badgeAmber,
  em_analise: styles.badgeBlue,
  concluido: styles.badgeGreen,
  negado: styles.badgeRed,
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  concluido: 'Concluído',
  negado: 'Negado',
}

const TIPO_LABELS: Record<string, string> = {
  ACESSO: 'Acesso',
  CORRECAO: 'Correção',
  EXCLUSAO: 'Exclusão',
  PORTABILIDADE: 'Portabilidade',
  REVOGACAO: 'Revogação',
}

const OP_COLORS: Record<string, string> = {
  READ: styles.badgeBlue,
  UPDATE: styles.badgeAmber,
  DELETE: styles.badgeRed,
  ANONYMIZE: styles.badgePurple,
  EXPORT: styles.badgeSlate,
  CONSENT: styles.badgeGreen,
}

// ─── MODAL NOVA SOLICITAÇÃO ───────────────────────────────────────────────────

interface NovaSolicitacaoModalProps {
  onClose: () => void
  onSubmit: (p: { telefone?: string; email?: string; tipo: string; descricao?: string }) => Promise<void>
  submitting: boolean
}

function NovaSolicitacaoModal({ onClose, onSubmit, submitting }: NovaSolicitacaoModalProps) {
  const [tipo, setTipo] = useState('ACESSO')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [descricao, setDescricao] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      tipo,
      telefone: telefone.trim() || undefined,
      email: email.trim() || undefined,
      descricao: descricao.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Nova Solicitação LGPD</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>Tipo de Solicitação</label>
            <select className={styles.select} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="ACESSO">Acesso aos dados</option>
              <option value="CORRECAO">Correção de dados</option>
              <option value="EXCLUSAO">Exclusão de dados</option>
              <option value="PORTABILIDADE">Portabilidade</option>
              <option value="REVOGACAO">Revogação de consentimento</option>
            </select>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Telefone (opcional)</label>
              <input className={styles.input} type="tel" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>E-mail (opcional)</label>
              <input className={styles.input} type="email" placeholder="titular@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Descrição (opcional)</label>
            <textarea className={styles.textarea} rows={3} placeholder="Descreva a solicitação..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MODAL RESPONDER ─────────────────────────────────────────────────────────

interface ResponderModalProps {
  solicitacao: SolicitacaoLgpd
  onClose: () => void
  onSave: (id: string, status: string, resposta: string) => Promise<void>
  submitting: boolean
}

function ResponderModal({ solicitacao, onClose, onSave, submitting }: ResponderModalProps) {
  const [status, setStatus] = useState('em_analise')
  const [resposta, setResposta] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave(solicitacao.id, status, resposta)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Responder Solicitação</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Tipo:</span> {TIPO_LABELS[solicitacao.tipo] ?? solicitacao.tipo}
            {solicitacao.telefone && <><br /><span className={styles.infoLabel}>Telefone:</span> {solicitacao.telefone}</>}
            {solicitacao.email && <><br /><span className={styles.infoLabel}>E-mail:</span> {solicitacao.email}</>}
            {solicitacao.descricao && <><br /><span className={styles.infoLabel}>Descrição:</span> {solicitacao.descricao}</>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Novo Status</label>
            <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="em_analise">Em Análise</option>
              <option value="concluido">Concluído</option>
              <option value="negado">Negado</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Resposta</label>
            <textarea className={styles.textarea} rows={4} placeholder="Descreva a resposta ao titular..." value={resposta} onChange={(e) => setResposta(e.target.value)} required />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting || !resposta.trim()}>
              {submitting ? 'Salvando…' : 'Salvar Resposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── TAB: SOLICITAÇÕES ────────────────────────────────────────────────────────

interface TabSolicitacoesProps {
  solicitacoes: SolicitacaoLgpd[]
  loading: boolean
  submitting: boolean
  criarSolicitacao: (p: { telefone?: string; email?: string; tipo: string; descricao?: string }) => Promise<void>
  responderSolicitacao: (id: string, status: string, resposta: string) => Promise<void>
}

function TabSolicitacoes({ solicitacoes, loading, submitting, criarSolicitacao, responderSolicitacao }: TabSolicitacoesProps) {
  const [showNova, setShowNova] = useState(false)
  const [respondendo, setRespondendo] = useState<SolicitacaoLgpd | null>(null)

  return (
    <div className={styles.tabContent}>
      <div className={styles.tableToolbar}>
        <span className={styles.tableCount}>{solicitacoes.length} solicitação{solicitacoes.length !== 1 ? 'ões' : ''}</span>
        <button type="button" className={styles.btnPrimary} onClick={() => setShowNova(true)}>
          <IconPlus /> Nova Solicitação
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Contato</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}><div className={styles.skeleton} /></td>
                  ))}
                </tr>
              ))
            ) : solicitacoes.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>Nenhuma solicitação registrada.</td>
              </tr>
            ) : (
              solicitacoes.map((s) => (
                <tr key={s.id}>
                  <td><span className={styles.tipoTag}>{TIPO_LABELS[s.tipo] ?? s.tipo}</span></td>
                  <td className={styles.contactCell}>
                    {s.telefone && <span>{s.telefone}</span>}
                    {s.email && <span className={styles.emailSpan}>{s.email}</span>}
                    {!s.telefone && !s.email && <span className={styles.muted}>—</span>}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_COLORS[s.status] ?? ''}`}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{fmt(s.criado_em)}</td>
                  <td>
                    {(s.status === 'pendente' || s.status === 'em_analise') && (
                      <button type="button" className={styles.btnAction} onClick={() => setRespondendo(s)}>
                        Responder
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNova && (
        <NovaSolicitacaoModal
          onClose={() => setShowNova(false)}
          onSubmit={criarSolicitacao}
          submitting={submitting}
        />
      )}

      {respondendo && (
        <ResponderModal
          solicitacao={respondendo}
          onClose={() => setRespondendo(null)}
          onSave={responderSolicitacao}
          submitting={submitting}
        />
      )}
    </div>
  )
}

// ─── TAB: AUDITORIA ───────────────────────────────────────────────────────────

function TabAuditoria({ auditoria, loading }: { auditoria: AuditoriaItem[]; loading: boolean }) {
  const limited = auditoria.slice(0, 200)

  return (
    <div className={styles.tabContent}>
      <div className={styles.tableToolbar}>
        <span className={styles.tableCount}>{limited.length} registro{limited.length !== 1 ? 's' : ''} (últimos 200)</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Entidade</th>
              <th>Operação</th>
              <th>Descrição</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}><div className={styles.skeleton} /></td>
                  ))}
                </tr>
              ))
            ) : limited.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>Nenhum registro de auditoria.</td>
              </tr>
            ) : (
              limited.map((a) => (
                <tr key={a.id}>
                  <td className={styles.muted}>{a.usuario_nome ?? 'Sistema'}</td>
                  <td>
                    <span className={styles.entidadeTag}>{a.entidade}</span>
                    {a.entidade_id && <span className={styles.entidadeId}>{a.entidade_id.slice(0, 8)}…</span>}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${OP_COLORS[a.operacao] ?? ''}`}>
                      {a.operacao}
                    </span>
                  </td>
                  <td className={styles.descCell}>{a.descricao ?? '—'}</td>
                  <td className={styles.dateCell}>{fmt(a.criado_em)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── TAB: CONSENTIMENTOS ──────────────────────────────────────────────────────

function TabConsentimentos({ consentimentos, loading }: { consentimentos: ConsentimentoItem[]; loading: boolean }) {
  const ativos = consentimentos.filter((c) => c.aceito).length

  return (
    <div className={styles.tabContent}>
      <div className={styles.tableToolbar}>
        <span className={styles.tableCount}>
          <span className={styles.countHighlight}>{ativos}</span> consentimento{ativos !== 1 ? 's' : ''} ativo{ativos !== 1 ? 's' : ''}
          {consentimentos.length > ativos && (
            <span className={styles.countMuted}> · {consentimentos.length - ativos} revogado{consentimentos.length - ativos !== 1 ? 's' : ''}</span>
          )}
        </span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Telefone</th>
              <th>Status</th>
              <th>Canal</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j}><div className={styles.skeleton} /></td>
                  ))}
                </tr>
              ))
            ) : consentimentos.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>Nenhum registro de consentimento.</td>
              </tr>
            ) : (
              consentimentos.map((c) => (
                <tr key={c.id}>
                  <td className={styles.phoneCell}>{maskPhone(c.telefone)}</td>
                  <td>
                    <span className={`${styles.badge} ${c.aceito ? styles.badgeGreen : styles.badgeRed}`}>
                      {c.aceito ? 'Aceito' : 'Revogado'}
                    </span>
                  </td>
                  <td className={styles.muted}>{c.canal}</td>
                  <td className={styles.dateCell}>{fmt(c.criado_em)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── TAB: ANONIMIZAÇÃO ────────────────────────────────────────────────────────

function TabAnonimizacao({ anonimizar, anonimizando }: { anonimizar: (meses: number) => Promise<{ anonimizados: number; meses: number } | undefined>; anonimizando: boolean }) {
  const [meses, setMeses] = useState(24)
  const [resultado, setResultado] = useState<{ anonimizados: number; meses: number } | null>(null)

  async function handleExecutar() {
    const ok = window.confirm(
      `Esta operação irá anonimizar todos os clientes sem atividade há mais de ${meses} meses.\n\nOs dados pessoais (nome, telefone, endereço) serão substituídos por valores anônimos e não poderão ser recuperados.\n\nDeseja continuar?`
    )
    if (!ok) return
    const result = await anonimizar(meses)
    if (result) setResultado(result)
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.anonCard}>
        <div className={styles.anonHeader}>
          <div className={styles.anonIconWrap}>
            <IconErase />
          </div>
          <div>
            <h3 className={styles.anonTitle}>Política de Retenção de Dados</h3>
            <p className={styles.anonSub}>Conforme o art. 18 da LGPD, dados pessoais devem ser eliminados ou anonimizados quando deixam de ser necessários.</p>
          </div>
        </div>

        <div className={styles.anonInfo}>
          <div className={styles.anonInfoItem}>
            <span className={styles.anonInfoLabel}>Prazo padrão</span>
            <span className={styles.anonInfoValue}>24 meses</span>
          </div>
          <div className={styles.anonInfoItem}>
            <span className={styles.anonInfoLabel}>Critério</span>
            <span className={styles.anonInfoValue}>Último pedido do cliente</span>
          </div>
          <div className={styles.anonInfoItem}>
            <span className={styles.anonInfoLabel}>Operação</span>
            <span className={styles.anonInfoValue}>Anonimização irreversível</span>
          </div>
        </div>

        <div className={styles.anonForm}>
          <div className={styles.anonInputWrap}>
            <label className={styles.label}>Anonimizar clientes sem atividade há mais de</label>
            <div className={styles.anonInputRow}>
              <input
                type="number"
                className={styles.anonInput}
                min={1}
                max={120}
                value={meses}
                onChange={(e) => setMeses(Number(e.target.value))}
              />
              <span className={styles.anonUnit}>meses</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnDanger}
            onClick={handleExecutar}
            disabled={anonimizando}
          >
            <IconErase />
            {anonimizando ? 'Executando…' : 'Executar Anonimização'}
          </button>
        </div>

        {resultado && (
          <div className={styles.anonResult}>
            <span className={styles.anonResultIcon}>✓</span>
            <div>
              <strong>{resultado.anonimizados} cliente{resultado.anonimizados !== 1 ? 's' : ''}</strong> anonimizado{resultado.anonimizados !== 1 ? 's' : ''}
              {' '}com mais de <strong>{resultado.meses} meses</strong> de inatividade.
            </div>
          </div>
        )}
      </div>

      <div className={styles.anonWarning}>
        <strong>Atenção:</strong> esta operação é irreversível. Os dados pessoais substituídos não poderão ser recuperados. Um registro de auditoria será criado automaticamente (operação ANONYMIZE).
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type TabId = 'solicitacoes' | 'auditoria' | 'consentimentos' | 'anonimizacao'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'solicitacoes',  label: 'Solicitações',   icon: <IconClipboard /> },
  { id: 'auditoria',     label: 'Auditoria',       icon: <IconLog /> },
  { id: 'consentimentos', label: 'Consentimentos', icon: <IconCheck /> },
  { id: 'anonimizacao',  label: 'Anonimização',    icon: <IconErase /> },
]

export function LgpdPage() {
  const [activeTab, setActiveTab] = useState<TabId>('solicitacoes')
  const {
    solicitacoes,
    auditoria,
    consentimentos,
    loading,
    error,
    submitting,
    anonimizando,
    responderSolicitacao,
    criarSolicitacao,
    anonimizar,
    reload,
  } = useLgpd()

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <IconShield />
          </div>
          <div>
            <h1 className={styles.title}>Conformidade LGPD</h1>
            <p className={styles.subtitle}>Gestão de dados pessoais, auditoria e direitos dos titulares</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.lgpdBadge}>
            <span className={styles.lgpdDot} />
            Lei 13.709/2018
          </span>
          <button type="button" className={styles.reloadBtn} onClick={reload} title="Atualizar">
            <IconRefresh />
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>{error}</div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className={styles.panel}>
        {activeTab === 'solicitacoes' && (
          <TabSolicitacoes
            solicitacoes={solicitacoes}
            loading={loading}
            submitting={submitting}
            criarSolicitacao={criarSolicitacao}
            responderSolicitacao={responderSolicitacao}
          />
        )}
        {activeTab === 'auditoria' && (
          <TabAuditoria auditoria={auditoria} loading={loading} />
        )}
        {activeTab === 'consentimentos' && (
          <TabConsentimentos consentimentos={consentimentos} loading={loading} />
        )}
        {activeTab === 'anonimizacao' && (
          <TabAnonimizacao anonimizar={anonimizar} anonimizando={anonimizando} />
        )}
      </div>
    </div>
  )
}
