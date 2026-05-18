import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { loginApi } from '../../services/auth-api'
import { SigepMark } from '../../components/sigep-logo'
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

function BurgerIllustration() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="loginGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#D97706" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="125" rx="112" ry="88" fill="url(#loginGlow)" />

      <circle cx="120" cy="138" r="84" stroke="#D97706" strokeOpacity="0.1" strokeWidth="0.75" />
      <circle cx="120" cy="138" r="68" stroke="#D97706" strokeOpacity="0.06" strokeWidth="0.5" />

      <path d="M100,42 Q107,30 100,18" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M120,36 Q129,22 120,8"  stroke="#D97706" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M140,42 Q147,30 140,18" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="20" y1="64" x2="20" y2="162" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="64" x2="11" y2="90" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.5" y1="64" x2="15.5" y2="93" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24.5" y1="64" x2="24.5" y2="93" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="64" x2="29" y2="90"  stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11,90 Q20,101 29,90" fill="none" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" />

      <line x1="220" y1="64" x2="220" y2="162" stroke="#D97706" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <path d="M220,64 C234,72 238,92 220,104" fill="rgba(217,119,6,0.06)" stroke="#D97706" strokeOpacity="0.3" strokeWidth="1.5" />

      <path d="M52,93 Q120,66 188,93" fill="rgba(217,119,6,0.18)" stroke="#D97706" strokeOpacity="0.55" strokeWidth="1.5" />
      <rect x="52" y="90" width="136" height="14" rx="3" fill="rgba(217,119,6,0.32)" />

      <ellipse cx="89"  cy="79" rx="5.5" ry="3" fill="#FBBF24" fillOpacity="0.42" transform="rotate(-18,89,79)" />
      <ellipse cx="120" cy="73" rx="5.5" ry="3" fill="#FBBF24" fillOpacity="0.42" />
      <ellipse cx="151" cy="79" rx="5.5" ry="3" fill="#FBBF24" fillOpacity="0.42" transform="rotate(18,151,79)" />

      <path d="M50,105 Q70,99 90,105 Q110,99 130,105 Q150,99 170,105 Q188,105 188,105 Q170,116 150,112 Q130,116 110,112 Q90,116 70,112 Q50,116 50,116 Z" fill="#4ADE80" fillOpacity="0.2" />

      <rect x="52" y="114" width="136" height="12" rx="2" fill="#FCD34D" fillOpacity="0.4" />
      <polygon points="52,114 52,126 43,130 43,120" fill="#FCD34D" fillOpacity="0.3" />

      <ellipse cx="120" cy="136" rx="70" ry="13" fill="#78350F" fillOpacity="0.48" />
      <ellipse cx="120" cy="134" rx="66" ry="10" fill="#92400E" fillOpacity="0.42" />

      <rect x="52" y="147" width="136" height="10" rx="2" fill="#F87171" fillOpacity="0.26" />

      <path d="M52,158 Q120,150 188,158 L185,175 Q120,186 55,175 Z" fill="rgba(217,119,6,0.3)" />
    </svg>
  )
}

function TableBgIllustration() {
  return (
    <svg
      viewBox="0 0 560 840"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' } as React.CSSProperties}
    >
      <circle cx="280" cy="420" r="265" fill="rgba(217,119,6,0.028)" />
      <circle cx="280" cy="420" r="248" stroke="#D97706" strokeOpacity="0.055" strokeWidth="1" fill="none" />

      <circle cx="280" cy="178" r="66" stroke="#D97706" strokeOpacity="0.1" strokeWidth="1.5" fill="none" />
      <circle cx="280" cy="178" r="50" stroke="#D97706" strokeOpacity="0.055" strokeWidth="0.75" fill="none" />
      <circle cx="280" cy="178" r="34" fill="rgba(217,119,6,0.045)" />
      <circle cx="272" cy="170" r="11" fill="rgba(217,119,6,0.1)" />
      <circle cx="290" cy="184" r="9"  fill="rgba(217,119,6,0.08)" />
      <circle cx="266" cy="186" r="7"  fill="rgba(22,163,74,0.08)" />
      <line x1="188" y1="146" x2="188" y2="210" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="180" y1="146" x2="180" y2="167" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="184" y1="146" x2="184" y2="170" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="192" y1="146" x2="192" y2="170" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="196" y1="146" x2="196" y2="167" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M180,167 Q188,177 196,167" fill="none" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" />
      <line x1="372" y1="146" x2="372" y2="210" stroke="#D97706" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
      <path d="M372,146 C384,153 386,168 372,178" fill="rgba(217,119,6,0.04)" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" />
      <ellipse cx="462" cy="148" rx="20" ry="9" fill="rgba(217,119,6,0.055)" stroke="#D97706" strokeOpacity="0.11" strokeWidth="1" />
      <line x1="462" y1="157" x2="462" y2="216" stroke="#D97706" strokeOpacity="0.11" strokeWidth="1.5" strokeLinecap="round" />

      <ellipse cx="98" cy="308" rx="26" ry="11" fill="rgba(217,119,6,0.045)" stroke="#D97706" strokeOpacity="0.1" strokeWidth="1" />
      <path d="M72,308 Q66,352 62,372 M124,308 Q130,352 134,372" stroke="#D97706" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="372" x2="134" y2="372" stroke="#D97706" strokeOpacity="0.11" strokeWidth="1" strokeLinecap="round" />
      <line x1="98" y1="302" x2="98" y2="372" stroke="#D97706" strokeOpacity="0.07" strokeWidth="1" />

      <circle cx="280" cy="420" r="22" fill="rgba(217,119,6,0.05)" />
      <circle cx="280" cy="420" r="11" fill="rgba(217,119,6,0.09)" />
      <ellipse cx="280" cy="396" rx="5.5" ry="10" fill="rgba(217,119,6,0.08)" />
      <ellipse cx="304" cy="420" rx="10" ry="5.5" fill="rgba(217,119,6,0.08)" />
      <ellipse cx="280" cy="444" rx="5.5" ry="10" fill="rgba(217,119,6,0.08)" />
      <ellipse cx="256" cy="420" rx="10" ry="5.5" fill="rgba(217,119,6,0.08)" />

      <circle cx="280" cy="662" r="66" stroke="#D97706" strokeOpacity="0.1" strokeWidth="1.5" fill="none" />
      <circle cx="280" cy="662" r="50" stroke="#D97706" strokeOpacity="0.055" strokeWidth="0.75" fill="none" />
      <circle cx="280" cy="662" r="34" fill="rgba(217,119,6,0.045)" />
      <circle cx="272" cy="654" r="11" fill="rgba(217,119,6,0.1)" />
      <circle cx="290" cy="668" r="9"  fill="rgba(217,119,6,0.08)" />
      <circle cx="266" cy="670" r="7"  fill="rgba(22,163,74,0.08)" />
      <line x1="188" y1="630" x2="188" y2="694" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="180" y1="630" x2="180" y2="651" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="184" y1="630" x2="184" y2="654" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="192" y1="630" x2="192" y2="654" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="196" y1="630" x2="196" y2="651" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M180,651 Q188,661 196,651" fill="none" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" />
      <line x1="372" y1="630" x2="372" y2="694" stroke="#D97706" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
      <path d="M372,630 C384,637 386,652 372,662" fill="rgba(217,119,6,0.04)" stroke="#D97706" strokeOpacity="0.18" strokeWidth="1.5" />

      <circle cx="464" cy="548" r="40" stroke="#D97706" strokeOpacity="0.08" strokeWidth="1" fill="none" />
      <circle cx="464" cy="548" r="28" fill="rgba(217,119,6,0.03)" />
      <circle cx="459" cy="542" r="8" fill="rgba(217,119,6,0.07)" />
      <circle cx="472" cy="554" r="6" fill="rgba(217,119,6,0.055)" />

      <circle cx="122" cy="468" r="3"   fill="#D97706" fillOpacity="0.07" />
      <circle cx="452" cy="376" r="2.5" fill="#D97706" fillOpacity="0.06" />
      <circle cx="78"  cy="608" r="3.5" fill="#D97706" fillOpacity="0.06" />
      <circle cx="508" cy="198" r="2"   fill="#D97706" fillOpacity="0.07" />
      <circle cx="148" cy="712" r="3"   fill="#D97706" fillOpacity="0.06" />
      <circle cx="428" cy="758" r="2.5" fill="#D97706" fillOpacity="0.06" />
      <circle cx="96"  cy="202" r="2"   fill="#D97706" fillOpacity="0.05" />
      <circle cx="494" cy="698" r="3"   fill="#D97706" fillOpacity="0.06" />
      <circle cx="356" cy="790" r="2"   fill="#D97706" fillOpacity="0.05" />
      <circle cx="58"  cy="388" r="4"   fill="#D97706" fillOpacity="0.05" />
      <circle cx="520" cy="490" r="2.5" fill="#D97706" fillOpacity="0.06" />
      <circle cx="340" cy="60"  r="3"   fill="#D97706" fillOpacity="0.05" />
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
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          <div className={styles.brandLogo}>
            <div className={styles.brandMark}>
              <SigepMark size={22} variant="white" />
            </div>
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

          <div className={styles.brandIllustration}>
            <BurgerIllustration />
          </div>

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

      <div className={styles.formPanel}>
        <TableBgIllustration />
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setSenha(e.target.value)}
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

            <div className={styles.forgotRow}>
              <Link to="/esqueci-senha" className={styles.forgotLink}>
                Esqueceu sua senha?
              </Link>
            </div>

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
