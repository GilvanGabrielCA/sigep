import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Produto, Categoria, ProdutoFormData } from '../../types/cardapio'
import styles from './produto-modal.module.css'

interface ProdutoModalProps {
  open: boolean
  onClose: () => void
  produto?: Produto | null
  categorias: Categoria[]
  onSave: (form: ProdutoFormData) => Promise<void>
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function getInitialForm(produto?: Produto | null): ProdutoFormData {
  return {
    categoriaId:  produto?.categoria_id  ?? null,
    nome:         produto?.nome          ?? '',
    descricao:    produto?.descricao     ?? '',
    preco:        produto ? parseFloat(produto.preco) : 0,
    imagemUrl:    produto?.imagem_url    ?? '',
    disponivel:   produto?.disponivel    ?? true,
  }
}

function ModalInner({ onClose, produto, categorias, onSave }: Omit<ProdutoModalProps, 'open'>) {
  const [form, setForm] = useState<ProdutoFormData>(() => getInitialForm(produto))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdicao = !!produto?.id
  const title = isEdicao ? produto!.nome : 'Novo Produto'

  useEffect(() => {
    setForm(getInitialForm(produto))
    setError(null)
  }, [produto])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function setField<K extends keyof ProdutoFormData>(key: K, value: ProdutoFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { setError('Nome é obrigatório'); return }
    if (!form.preco || form.preco <= 0) { setError('Preço deve ser maior que zero'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar produto.'
      setError(msg)
      setSaving(false)
    }
  }

  const switchBg = form.disponivel ? '#16A34A' : '#D1C9C0'
  const thumbLeft = form.disponivel ? '20px' : '3px'

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <form className={styles.panel} onSubmit={handleSubmit} noValidate>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEyebrow}>{isEdicao ? 'Editar Produto' : 'Novo Produto'}</span>
            <span className={styles.headerTitle}>{title}</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <IconClose />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>

          {/* Nome */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Nome<span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              placeholder="Ex: X-Burger Especial"
              required
              autoFocus
            />
          </div>

          {/* Categoria + Preço */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Categoria</label>
              <select
                className={styles.select}
                value={form.categoriaId ?? ''}
                onChange={(e) => setField('categoriaId', e.target.value || null)}
              >
                <option value="">Sem categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Preço (R$)<span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0.01"
                value={form.preco || ''}
                onChange={(e) => setField('preco', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.textarea}
              value={form.descricao}
              onChange={(e) => setField('descricao', e.target.value)}
              placeholder="Ingredientes, detalhes do prato..."
              rows={3}
            />
          </div>

          {/* URL imagem */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>URL da Imagem</label>
            <input
              className={styles.input}
              type="url"
              value={form.imagemUrl}
              onChange={(e) => setField('imagemUrl', e.target.value)}
              placeholder="https://..."
            />
            {form.imagemUrl && (
              <div className={styles.imgPreviewWrap}>
                <img
                  src={form.imagemUrl}
                  alt="Prévia"
                  className={styles.imgPreview}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'block' }}
                />
              </div>
            )}
          </div>

          {/* Disponível switch */}
          <div
            className={styles.switchWrap}
            onClick={() => setField('disponivel', !form.disponivel)}
            role="switch"
            aria-checked={form.disponivel}
            tabIndex={0}
            onKeyDown={(e) => e.key === ' ' && setField('disponivel', !form.disponivel)}
          >
            <div className={styles.switchLabel}>
              <span className={styles.switchTitle}>Disponível para pedidos</span>
              <span className={styles.switchSub}>
                {form.disponivel ? 'Visível no cardápio' : 'Oculto do cardápio'}
              </span>
            </div>
            <div className={styles.switchTrack} style={{ background: switchBg }}>
              <div className={styles.switchThumb} style={{ left: thumbLeft }} />
            </div>
          </div>

          {error && <div className={styles.errorBox} role="alert">{error}</div>}

          {/* FOOTER */}
          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? <span className={styles.spinner} /> : null}
              {saving ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

export function ProdutoModal({ open, onClose, produto, categorias, onSave }: ProdutoModalProps) {
  if (!open) return null
  return createPortal(
    <ModalInner
      onClose={onClose}
      produto={produto}
      categorias={categorias}
      onSave={onSave}
    />,
    document.body,
  )
}
