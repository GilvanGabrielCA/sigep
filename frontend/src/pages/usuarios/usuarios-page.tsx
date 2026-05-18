import { useState, useCallback } from 'react'
import { useUsuarios } from '../../hooks/use-usuarios'
import { useAuth } from '../../hooks/use-auth'
import { UsuarioModal } from '../../components/usuarios/usuario-modal'
import type { Usuario, NovoUsuario, EditarUsuario } from '../../services/usuarios-api'
import styles from './usuarios-page.module.css'

const AVATAR_COLORS = [
  '#D97706', '#2563EB', '#16A34A', '#7C3AED',
  '#EA580C', '#0891B2', '#DC2626', '#65A30D',
]

function avatarColor(nome: string): string {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function UsuariosPage() {
  const { user } = useAuth()
  const isGerente = user?.perfil === 'gerente'
  const { usuarios, loading, error, saving, criar, editar, toggleAtivo, resetSenha } = useUsuarios()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)

  const openNew = useCallback(() => {
    setEditingUsuario(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((u: Usuario) => {
    setEditingUsuario(u)
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(
    async (data: NovoUsuario | EditarUsuario) => {
      if (editingUsuario) {
        await editar(editingUsuario.id, data as EditarUsuario)
      } else {
        await criar(data as NovoUsuario)
      }
    },
    [editingUsuario, editar, criar],
  )

  const handleResetSenha = useCallback(
    async (id: string, novaSenha: string) => {
      await resetSenha(id, novaSenha)
    },
    [resetSenha],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Usuários</h1>
          <p className={styles.subtitle}>Gerencie a equipe do restaurante</p>
        </div>
        {isGerente && (
          <button className={styles.btnPrimary} onClick={openNew}>
            <PlusIcon /> Novo Usuário
          </button>
        )}
      </div>

      {!isGerente && (
        <div className={styles.notice}>
          <WarnIcon />
          Somente gerentes podem gerenciar usuários.
        </div>
      )}

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Status</th>
              {isGerente && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={styles.skRow}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={`${styles.skAvatar} ${styles.skeleton}`} />
                      <div>
                        <div className={`${styles.skCell} ${styles.skeleton}`} style={{ width: 120, marginBottom: 6 }} />
                        <div className={`${styles.skCell} ${styles.skeleton}`} style={{ width: 160 }} />
                      </div>
                    </div>
                  </td>
                  <td><div className={`${styles.skCell} ${styles.skeleton}`} style={{ width: 70 }} /></td>
                  <td><div className={`${styles.skCell} ${styles.skeleton}`} style={{ width: 55 }} /></td>
                  {isGerente && <td />}
                </tr>
              ))
            ) : usuarios.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={isGerente ? 4 : 3}>Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div
                        className={styles.avatar}
                        style={{ background: avatarColor(u.nome) }}
                      >
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.userName}>{u.nome}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${u.perfil === 'gerente' ? styles.badgeGerente : styles.badgeAtendente}`}>
                      {u.perfil === 'gerente' ? 'Gerente' : 'Atendente'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${u.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {isGerente && (
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEdit(u)}
                          title="Editar usuário"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${u.ativo ? styles.danger : styles.success}`}
                          onClick={() => void toggleAtivo(u.id, !u.ativo)}
                          disabled={user?.userId === u.id}
                          title={
                            user?.userId === u.id
                              ? 'Não é possível desativar seu próprio usuário'
                              : u.ativo
                              ? 'Desativar usuário'
                              : 'Ativar usuário'
                          }
                        >
                          {u.ativo ? <LockIcon /> : <UnlockIcon />}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UsuarioModal
        open={modalOpen}
        usuario={editingUsuario}
        saving={saving}
        requesterPerfil={user?.perfil}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onResetSenha={handleResetSenha}
      />
    </div>
  )
}
