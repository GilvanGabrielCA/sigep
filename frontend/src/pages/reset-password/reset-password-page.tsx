import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { validateResetTokenApi, resetPasswordApi } from '../../services/auth-api'
import { SigepMark } from '../../components/sigep-logo'
import styles from './reset-password-page.module.css'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

type PageState = 'validating' | 'valid' | 'invalid' | 'success'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [pageState, setPageState] = useState<PageState>('validating')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setPageState('invalid')
      return
    }
    validateResetTokenApi(token)
      .then((valid) => setPageState(valid ? 'valid' : 'invalid'))
      .catch(() => setPageState('invalid'))
  }, [token])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPasswordApi(token, novaSenha)
      setPageState('success')
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err: unknown) {
      const apiMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(apiMsg ?? 'Não foi possível redefinir a senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <SigepMark size={22} variant="white" />
          </div>
          <span className={styles.logoText}>SIGEP</span>
        </div>

        {pageState === 'validating' && (
          <>
            <span className={styles.eyebrow}>Verificando link</span>
            <h1 className={styles.title}>Aguarde...</h1>
            <p className={styles.subtitle}>Validando seu link de redefinição de senha.</p>
          </>
        )}

        {pageState === 'invalid' && (
          <div className={styles.expiredWrap}>
            <div className={styles.expiredIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className={styles.expiredTitle}>Link inválido ou expirado</p>
            <p className={styles.expiredText}>
              Este link de redefinição de senha não é mais válido. Os links expiram após 1 hora e só podem ser usados uma vez.
            </p>
            <Link to="/esqueci-senha" className={styles.btn} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
              Solicitar novo link
            </Link>
          </div>
        )}

        {pageState === 'valid' && (
          <>
            <span className={styles.eyebrow}>Nova senha</span>
            <h1 className={styles.title}>Redefinir senha</h1>
            <p className={styles.subtitle}>
              Escolha uma nova senha segura para a sua conta.
            </p>
            <div className={styles.accent} />

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={`${styles.alertBox} ${styles.error}`}>
                  <svg className={`${styles.alertIcon} ${styles.error}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className={`${styles.alertText} ${styles.error}`}>{error}</span>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="novaSenha">
                  Nova senha
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="novaSenha"
                    type={showNova ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => { setNovaSenha(e.target.value); setError('') }}
                    autoFocus
                    disabled={loading}
                  />
                  <button type="button" className={styles.fieldToggle} onClick={() => setShowNova(v => !v)} tabIndex={-1} aria-label={showNova ? 'Ocultar' : 'Mostrar'}>
                    <EyeIcon open={showNova} />
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmar">
                  Confirmar nova senha
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="confirmar"
                    type={showConfirmar ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Repita a nova senha"
                    value={confirmar}
                    onChange={(e) => { setConfirmar(e.target.value); setError('') }}
                    disabled={loading}
                  />
                  <button type="button" className={styles.fieldToggle} onClick={() => setShowConfirmar(v => !v)} tabIndex={-1} aria-label={showConfirmar ? 'Ocultar' : 'Mostrar'}>
                    <EyeIcon open={showConfirmar} />
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </button>
            </form>

            <Link to="/login" className={styles.backLink}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Voltar ao login
            </Link>
          </>
        )}

        {pageState === 'success' && (
          <>
            <div className={`${styles.alertBox} ${styles.success}`}>
              <svg className={`${styles.alertIcon} ${styles.success}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className={`${styles.alertText} ${styles.success}`}>
                Senha redefinida com sucesso! Redirecionando para o login...
              </span>
            </div>
            <Link to="/login" className={styles.backLink}>
              Ir para o login agora
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
