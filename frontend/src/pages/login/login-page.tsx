import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { loginApi } from '../../services/auth-api'
import styles from './login-page.module.css'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className={styles.errorIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setError('Preencha email e senha para continuar.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await loginApi(email.trim(), senha)
      signIn(token)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const apiMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(apiMsg ?? 'Não foi possível entrar. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* ─── LEFT BRAND PANEL ─── */}
      <div className={styles.brand}>
        <div className={styles.brandGlow} />
        <div className={styles.brandGrid} />
        <div className={styles.brandRings} />
        <div className={styles.brandWatermark}>S</div>

        <div className={styles.brandTop}>
          <div className={styles.brandLogo}>
            <div className={styles.brandMark}>S</div>
            <span className={styles.brandName}>SIGEP</span>
          </div>
        </div>

        <div className={styles.brandMiddle}>
          <h1 className={styles.brandHeading}>
            Gestão de pedidos<br />
            para restaurantes de{' '}
            <span className={styles.brandAccent}>excelência</span>
          </h1>
          <p className={styles.brandTagline}>
            Sistema integrado multicanal. Controle pedidos,
            cardápio e equipe em tempo real.
          </p>
          <div className={styles.brandFeatures}>
            {[
              'Kanban de pedidos em tempo real',
              'Relatórios e analytics avançados',
              'Chatbot WhatsApp integrado',
            ].map((feature) => (
              <div key={feature} className={styles.brandFeatureItem}>
                <span className={styles.brandFeaturePip} />
                <span className={styles.brandFeatureLabel}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.brandBottom}>
          <div className={styles.brandRule} />
          <span className={styles.brandVersion}>SIGEP v1.0 — MVP</span>
        </div>
      </div>

      {/* ─── RIGHT FORM PANEL ─── */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <span className={styles.formEyebrow}>Sistema de gestão</span>
          <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
          <p className={styles.formSubtitle}>
            Entre com suas credenciais para acessar o painel.
          </p>
          <div className={styles.formAccent} />

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">
                  E-mail
                </label>
                <div className={styles.fieldRow}>
                  <input
                    id="email"
                    type="email"
                    className={styles.fieldInput}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="senha">
                  Senha
                </label>
                <div className={styles.fieldRow}>
                  <input
                    id="senha"
                    type={showSenha ? 'text' : 'password'}
                    className={styles.fieldInput}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setError('') }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.fieldToggle}
                    onClick={() => setShowSenha((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <EyeIcon open={showSenha} />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <AlertIcon />
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p className={styles.formFooterText}>
              SIGEP — Sistema Integrado de Gestão de Pedidos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
