import { useState, useEffect } from 'react'
import { useRestaurante } from '../../hooks/use-restaurante'
import { useAuth } from '../../hooks/use-auth'
import type { RestauranteFormData } from '../../types/restaurante'
import styles from './configuracoes-page.module.css'

function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function SkeletonForm() {
  return (
    <div className={styles.skeletonForm}>
      {[['50%', '2.5rem'], ['70%', '2.5rem'], ['60%', '4rem'], ['55%', '2.5rem']].map(([w, h], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div className={styles.skeleton} style={{ height: '0.625rem', width: '30%' }} />
          <div className={styles.skeleton} style={{ height: h, width: w }} />
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export function ConfiguracoesPage() {
  const { data, loading, saving, error, success, salvar } = useRestaurante()
  const { user } = useAuth()
  const isGerente = user?.perfil === 'gerente'

  const [form, setForm] = useState<RestauranteFormData>({
    nome: '', endereco: '', telefone: '', logoUrl: '',
  })

  useEffect(() => {
    if (data) {
      setForm({
        nome:     data.nome,
        endereco: data.endereco  ?? '',
        telefone: data.telefone  ?? '',
        logoUrl:  data.logo_url  ?? '',
      })
    }
  }, [data])

  function setField<K extends keyof RestauranteFormData>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    await salvar(form)
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.subtitle}>Dados do restaurante</p>
      </div>

      <div className={styles.wrap}>
        <div className={styles.card}>

          {/* CARD HEADER */}
          <div className={styles.cardHead}>
            <div className={styles.cardHeadIcon}>
              <IconStore />
            </div>
            <div className={styles.cardHeadText}>
              <span className={styles.cardHeadTitle}>Dados do Restaurante</span>
              <span className={styles.cardHeadSub}>Informações exibidas nos pedidos e relatórios</span>
            </div>
          </div>

          {/* FORM BODY */}
          {loading ? (
            <SkeletonForm />
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              {!isGerente && (
                <div className={styles.accessWarning}>
                  <IconAlert />
                  Somente gerentes podem editar as configurações.
                </div>
              )}

              {/* Nome */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Nome do Restaurante<span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  value={form.nome}
                  onChange={(e) => setField('nome', e.target.value)}
                  placeholder="Ex: Restaurante Boa Mesa"
                  disabled={!isGerente}
                  required
                />
              </div>

              {/* Endereço */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Endereço</label>
                <textarea
                  className={styles.textarea}
                  value={form.endereco}
                  onChange={(e) => setField('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  disabled={!isGerente}
                  rows={2}
                />
              </div>

              {/* Telefone */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Telefone</label>
                <input
                  className={styles.input}
                  value={form.telefone}
                  onChange={(e) => setField('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={!isGerente}
                  type="tel"
                />
              </div>

              {/* Logo URL */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>URL do Logo</label>
                <div className={styles.logoRow}>
                  <input
                    className={styles.input}
                    value={form.logoUrl}
                    onChange={(e) => setField('logoUrl', e.target.value)}
                    placeholder="https://..."
                    disabled={!isGerente}
                    type="url"
                  />
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className={styles.logoPreview}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <IconImage />
                    </div>
                  )}
                </div>
              </div>

            </form>
          )}

          {/* CARD FOOTER */}
          {!loading && (
            <div className={styles.cardFooter}>

              {success && (
                <div className={styles.successBanner}>
                  <IconCheck />
                  Configurações salvas com sucesso!
                </div>
              )}
              {error && (
                <div className={styles.errorBanner}>
                  <IconAlert />
                  {error}
                </div>
              )}

              <div className={styles.footerActions}>
                {data && (
                  <div className={styles.metaInfo}>
                    <span className={styles.metaLine}>ID: {data.id.slice(-12).toUpperCase()}</span>
                    <span className={styles.metaLine}>Criado em: {formatDate(data.criado_em)}</span>
                  </div>
                )}
                {isGerente && (
                  <button
                    className={styles.btnSave}
                    type="submit"
                    disabled={saving}
                    onClick={handleSubmit}
                  >
                    {saving ? <span className={styles.spinner} /> : null}
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
