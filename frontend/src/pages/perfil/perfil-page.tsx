import { useState, useEffect } from 'react'
import { usePerfil } from '../../hooks/use-perfil'
import styles from './perfil-page.module.css'

const AVATAR_COLORS = [
  '#D97706', '#2563EB', '#16A34A', '#7C3AED',
  '#EA580C', '#0891B2', '#DC2626', '#65A30D',
]

function avatarColor(nome: string): string {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function PerfilPage() {
  const { data, loading, saving, error, successDados, successSenha, salvarDados, salvarSenha } = usePerfil()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaError, setSenhaError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setNome(data.nome)
      setEmail(data.email)
    }
  }, [data])

  useEffect(() => {
    if (successSenha) {
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setSenhaError(null)
    }
  }, [successSenha])

  const handleSalvarDados = () => {
    if (!nome.trim() || !email.trim()) return
    void salvarDados({ nome: nome.trim(), email: email.trim() })
  }

  const handleAlterarSenha = () => {
    setSenhaError(null)
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaError('Preencha todos os campos de senha')
      return
    }
    if (novaSenha.length < 6) {
      setSenhaError('Nova senha deve ter ao menos 6 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem')
      return
    }
    void salvarSenha(senhaAtual, novaSenha)
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div style={{ width: 160, height: 28, borderRadius: 6, background: '#ECEAE5', marginBottom: 8 }} />
          <div style={{ width: 220, height: 16, borderRadius: 6, background: '#F0EFEC' }} />
        </div>
        <div className={styles.grid}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skHero} />
              <div className={styles.skBody}>
                <div className={styles.skLine} style={{ height: 14, width: '60%' }} />
                <div className={styles.skLine} style={{ height: 38 }} />
                <div className={styles.skLine} style={{ height: 14, width: '45%' }} />
                <div className={styles.skLine} style={{ height: 38 }} />
                <div className={styles.skLine} style={{ height: 38, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const initials = data ? data.nome.charAt(0).toUpperCase() : '?'
  const color = data ? avatarColor(data.nome) : '#D97706'

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Meu Perfil</h1>
        <p className={styles.pageSubtitle}>Gerencie seus dados e segurança da conta</p>
      </div>

      <div className={styles.grid}>
        {/* ── Card 1: Dados pessoais ─────────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHero}>
            <div className={styles.avatar} style={{ background: color }}>
              {initials}
            </div>
            <p className={styles.heroName}>{data?.nome ?? '—'}</p>
            <p className={styles.heroEmail}>{data?.email ?? '—'}</p>
            <span className={`${styles.perfilBadge} ${data?.perfil === 'gerente' ? styles.gerente : styles.atendente}`}>
              {data?.perfil === 'gerente' ? 'Gerente' : 'Atendente'}
            </span>
          </div>

          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Informações Pessoais</h2>
            <p className={styles.cardSubtitle}>Atualize seu nome e e-mail de acesso</p>

            {successDados && (
              <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                <CheckIcon /> Dados salvos com sucesso!
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nome</label>
              <input
                className={styles.input}
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>E-mail</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <button
              className={styles.btnPrimary}
              onClick={handleSalvarDados}
              disabled={saving || !nome.trim() || !email.trim()}
            >
              {saving ? <span className={styles.spinner} /> : null}
              {saving ? 'Salvando…' : 'Salvar Dados'}
            </button>
          </div>
        </div>

        {/* ── Card 2: Segurança ───────────────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.securityHeader}>
            <h2 className={styles.securityTitle}>Segurança</h2>
            <p className={styles.securitySubtitle}>Altere sua senha de acesso ao sistema</p>
            <hr className={styles.securityDivider} />
          </div>

          <div className={styles.securityBody}>
            {(senhaError || error) && (
              <div className={`${styles.banner} ${styles.bannerError}`}>
                <AlertIcon /> {senhaError ?? error}
              </div>
            )}

            {successSenha && (
              <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                <CheckIcon /> Senha alterada com sucesso!
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Senha Atual</label>
              <input
                className={styles.input}
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <hr className={styles.divider} />

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nova Senha</label>
              <input
                className={styles.input}
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Confirmar Nova Senha</label>
              <input
                className={styles.input}
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>

            <button
              className={styles.btnPrimary}
              onClick={handleAlterarSenha}
              disabled={saving}
            >
              {saving ? <span className={styles.spinner} /> : null}
              {saving ? 'Alterando…' : 'Alterar Senha'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer info ─────────────────────────────────────────────── */}
      {data && (
        <div className={styles.footer}>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>ID da Conta</span>
            <span className={styles.footerValue}>{data.id.slice(0, 8).toUpperCase()}…</span>
          </div>
          <div className={styles.footerSep} />
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Membro desde</span>
            <span className={styles.footerValue}>{formatDate(data.criado_em)}</span>
          </div>
          <div className={styles.footerSep} />
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Nível de acesso</span>
            <span className={`${styles.footerBadge} ${data.perfil === 'gerente' ? styles.gerente : styles.atendente}`}>
              {data.perfil === 'gerente' ? 'Gerente' : 'Atendente'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
