import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordApi } from '../../services/auth-api'
import { SigepMark } from '../../components/sigep-logo'
import styles from './forgot-password-page.module.css'

function AlertIcon({ type }: { type: 'error' | 'success' }) {
  if (type === 'success') {
    return (
      <svg className={`${styles.alertIcon} ${styles.success}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
  return (
    <svg className={`${styles.alertIcon} ${styles.error}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Informe o seu e-mail.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await forgotPasswordApi(trimmed)
      setSent(true)
    } catch {
      setError('Não foi possível processar a solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/login" className={styles.back}>
          <span className={styles.backIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </span>
          Voltar ao login
        </Link>

        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <SigepMark size={22} variant="white" />
          </div>
          <span className={styles.logoText}>SIGEP</span>
        </div>

        <span className={styles.eyebrow}>Recuperar acesso</span>
        <h1 className={styles.title}>Esqueceu sua senha?</h1>
        <p className={styles.subtitle}>
          Informe o e-mail da sua conta e enviaremos as instruções para criar uma nova senha.
        </p>
        <div className={styles.accent} />

        {sent ? (
          <div className={`${styles.alertBox} ${styles.success}`}>
            <AlertIcon type="success" />
            <span className={`${styles.alertText} ${styles.success}`}>
              Se este e-mail estiver cadastrado, você receberá as instruções em breve. Verifique sua caixa de entrada.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className={`${styles.alertBox} ${styles.error}`}>
                <AlertIcon type="error" />
                <span className={`${styles.alertText} ${styles.error}`}>{error}</span>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
