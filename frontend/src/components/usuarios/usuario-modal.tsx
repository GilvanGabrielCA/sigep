import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Usuario, NovoUsuario, EditarUsuario } from '../../services/usuarios-api'
import styles from './usuario-modal.module.css'

interface UsuarioModalProps {
  open: boolean
  usuario: Usuario | null
  saving: boolean
  onClose: () => void
  onSave: (data: NovoUsuario | EditarUsuario) => Promise<void>
  onResetSenha: (id: string, novaSenha: string) => Promise<void>
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ModalInner({ usuario, saving, onClose, onSave, onResetSenha }: Omit<UsuarioModalProps, 'open'>) {
  const isEdit = usuario !== null

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState<'gerente' | 'atendente'>('atendente')
  const [novaSenha, setNovaSenha] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [resettingSenha, setResettingSenha] = useState(false)

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setPerfil(usuario.perfil)
    } else {
      setNome('')
      setEmail('')
      setSenha('')
      setPerfil('atendente')
    }
    setNovaSenha('')
    setFormError(null)
  }, [usuario])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = useCallback(async () => {
    setFormError(null)
    if (!nome.trim() || !email.trim()) {
      setFormError('Nome e e-mail são obrigatórios')
      return
    }
    if (!isEdit && !senha.trim()) {
      setFormError('Senha é obrigatória')
      return
    }
    if (!isEdit && senha.length < 6) {
      setFormError('Senha deve ter ao menos 6 caracteres')
      return
    }
    try {
      if (isEdit) {
        await onSave({ nome: nome.trim(), email: email.trim(), perfil } as EditarUsuario)
      } else {
        await onSave({ nome: nome.trim(), email: email.trim(), senha, perfil } as NovoUsuario)
      }
      onClose()
    } catch {
      setFormError('Ocorreu um erro. Verifique os dados e tente novamente.')
    }
  }, [nome, email, senha, perfil, isEdit, onSave, onClose])

  const handleResetSenha = useCallback(async () => {
    if (!novaSenha || novaSenha.length < 6) {
      setFormError('Nova senha deve ter ao menos 6 caracteres')
      return
    }
    setResettingSenha(true)
    setFormError(null)
    try {
      await onResetSenha(usuario!.id, novaSenha)
      setNovaSenha('')
    } catch {
      setFormError('Erro ao redefinir senha')
    } finally {
      setResettingSenha(false)
    }
  }, [novaSenha, usuario, onResetSenha])

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit ? `Editando ${usuario!.nome}` : 'Adicionar membro à equipe'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          {formError && <div className={styles.formError}>{formError}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Nome <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                E-mail <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Perfil</label>
              <select
                className={styles.select}
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as 'gerente' | 'atendente')}
              >
                <option value="atendente">Atendente</option>
                <option value="gerente">Gerente</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Senha <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          {isEdit && (
            <>
              <hr className={styles.divider} />
              <p className={styles.sectionTitle}>Redefinir Senha</p>
              <div className={styles.passwordRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nova Senha</label>
                  <input
                    className={styles.input}
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <button
                  className={styles.btnResetSenha}
                  onClick={() => void handleResetSenha()}
                  disabled={resettingSenha || !novaSenha}
                >
                  {resettingSenha ? 'Salvando…' : 'Redefinir'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnSave}
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? <span className={styles.spinner} /> : null}
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UsuarioModal(props: UsuarioModalProps) {
  if (!props.open) return null
  return createPortal(<ModalInner {...props} />, document.body)
}
