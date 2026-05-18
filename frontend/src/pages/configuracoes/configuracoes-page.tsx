import { useState, useEffect, useRef } from 'react'
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

function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
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
  const isGerente = user?.perfil === 'gerente' || user?.perfil === 'superadmin'

  const [form, setForm] = useState<RestauranteFormData>({
    nome: '', endereco: '', telefone: '', logoUrl: '', dpoNome: '', dpoEmail: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (data) {
      setForm({
        nome:     data.nome,
        endereco: data.endereco  ?? '',
        telefone: data.telefone  ?? '',
        logoUrl:  data.logo_url  ?? '',
        dpoNome:  data.dpo_nome  ?? '',
        dpoEmail: data.dpo_email ?? '',
      })
    }
  }, [data])

  function setField<K extends keyof RestauranteFormData>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleFileSelect(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelect(e.target.files?.[0] ?? null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!isGerente) return
    handleFileSelect(e.dataTransfer.files?.[0] ?? null)
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    setField('logoUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    await salvar(form, logoFile ?? undefined)
    if (logoFile) {
      setLogoFile(null)
      setLogoPreview(null)
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.subtitle}>Dados do restaurante</p>
      </div>

      <div className={styles.wrap}>
        <div className={styles.card}>

          <div className={styles.cardHead}>
            <div className={styles.cardHeadIcon}>
              <IconStore />
            </div>
            <div className={styles.cardHeadText}>
              <span className={styles.cardHeadTitle}>Dados do Restaurante</span>
              <span className={styles.cardHeadSub}>Informações exibidas nos pedidos e relatórios</span>
            </div>
          </div>

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

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Encarregado de Dados (DPO) — Nome</label>
                <input
                  className={styles.input}
                  value={form.dpoNome}
                  onChange={(e) => setField('dpoNome', e.target.value)}
                  placeholder="Ex: João da Silva"
                  disabled={!isGerente}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Encarregado de Dados (DPO) — E-mail</label>
                <input
                  className={styles.input}
                  value={form.dpoEmail}
                  onChange={(e) => setField('dpoEmail', e.target.value)}
                  placeholder="dpo@restaurante.com.br"
                  disabled={!isGerente}
                  type="email"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Logo do Restaurante</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                  disabled={!isGerente}
                />
                {(logoPreview ?? form.logoUrl) ? (
                  <div className={styles.logoCurrentWrap}>
                    <img
                      src={logoPreview ?? form.logoUrl}
                      alt="Logo do restaurante"
                      className={styles.logoCurrentImg}
                    />
                    <div className={styles.logoCurrentActions}>
                      {isGerente && (
                        <>
                          <button
                            type="button"
                            className={styles.logoBtnChange}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Trocar logo
                          </button>
                          <button
                            type="button"
                            className={styles.logoBtnRemove}
                            onClick={handleRemoveLogo}
                          >
                            <IconTrash />
                            Remover
                          </button>
                        </>
                      )}
                      {logoFile && (
                        <span className={styles.logoPendingBadge}>
                          Novo arquivo selecionado — salve para aplicar
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${styles.logoDropZone} ${dragOver ? styles.dragOver : ''} ${!isGerente ? styles.disabled : ''}`}
                    onClick={() => isGerente && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); if (isGerente) setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className={styles.logoDropIcon}>
                      <IconUpload />
                    </div>
                    <p className={styles.logoDropTitle}>
                      {isGerente ? 'Clique ou arraste a imagem aqui' : 'Nenhuma logo configurada'}
                    </p>
                    {isGerente && (
                      <p className={styles.logoDropHint}>JPEG, PNG, WebP, GIF ou SVG · máx. 2 MB</p>
                    )}
                  </div>
                )}
              </div>

            </form>
          )}

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
