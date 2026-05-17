import { useState } from 'react'
import { useCardapio } from '../../hooks/use-cardapio'
import { useAuth } from '../../hooks/use-auth'
import { ProdutoModal } from '../../components/cardapio/produto-modal'
import type { Categoria, Produto, ProdutoFormData } from '../../types/cardapio'
import styles from './cardapio-page.module.css'

const CATEGORY_COLORS = ['#F59E0B', '#2563EB', '#16A34A', '#7C3AED', '#EA580C', '#0891B2']

function getCatColor(categoriaId: string | null, categorias: Categoria[]): string {
  if (!categoriaId) return '#A8A29E'
  const idx = categorias.findIndex((c) => c.id === categoriaId)
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length] ?? '#A8A29E'
}

function formatBRL(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value))
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6m4-6v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function DisponibilidadeToggle({ value, onChange, disabled }: ToggleProps) {
  const bg = value ? '#16A34A' : '#D1C9C0'
  const left = value ? '15px' : '2.5px'
  const labelColor = value ? '#16A34A' : '#A8A29E'

  return (
    <button
      className={styles.toggleWrap}
      onClick={() => !disabled && onChange(!value)}
      type="button"
      aria-label={value ? 'Marcar como indisponível' : 'Marcar como disponível'}
    >
      <span className={styles.toggleTrack} style={{ background: bg }}>
        <span className={styles.toggleThumb} style={{ left }} />
      </span>
      <span className={styles.toggleLabel} style={{ color: labelColor }}>
        {value ? 'Disponível' : 'Indisponível'}
      </span>
    </button>
  )
}

interface CatFormState {
  nome: string
  ordem: string
}

function SkeletonLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.skeletonPanel}>
        {[80, 65, 75, 60].map((w, i) => (
          <div key={i} className={styles.skeleton} style={{ height: '1.5rem', width: `${w}%` }} />
        ))}
      </div>
      <div className={styles.skeletonPanel}>
        {[100, 90, 100, 85, 100, 92].map((w, i) => (
          <div key={i} className={styles.skeleton} style={{ height: '4.5rem', width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

export function CardapioPage() {
  const {
    categorias, produtos, loading, error,
    adicionarProduto, editarProduto, removerProduto, alternarDisponivel,
    adicionarCategoria, editarCategoria, removerCategoria,
  } = useCardapio()

  const { user } = useAuth()
  const isGerente = user?.perfil === 'gerente'

  const [busca, setBusca] = useState('')
  const [modalState, setModalState] = useState<{ open: boolean; produto?: Produto | null }>({ open: false })
  const [editingCat, setEditingCat] = useState<Categoria | 'new' | null>(null)
  const [catForm, setCatForm] = useState<CatFormState>({ nome: '', ordem: '0' })
  const [catError, setCatError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  type GroupMap = Map<string, { label: string; produtos: Produto[] }>
  const grouped: GroupMap = new Map()

  filtrados.forEach((p) => {
    const key = p.categoria_nome ?? '__sem__'
    const label = p.categoria_nome ?? 'Sem categoria'
    if (!grouped.has(key)) grouped.set(key, { label, produtos: [] })
    grouped.get(key)!.produtos.push(p)
  })

  function startEditCat(cat: Categoria) {
    setEditingCat(cat)
    setCatForm({ nome: cat.nome, ordem: String(cat.ordem) })
    setCatError(null)
  }

  function startNewCat() {
    setEditingCat('new')
    setCatForm({ nome: '', ordem: String(categorias.length) })
    setCatError(null)
  }

  async function handleSaveCat() {
    if (!catForm.nome.trim()) { setCatError('Nome obrigatório'); return }
    try {
      if (editingCat === 'new') {
        await adicionarCategoria(catForm.nome, Number(catForm.ordem))
      } else if (editingCat) {
        await editarCategoria(editingCat.id, catForm.nome, Number(catForm.ordem), editingCat.ativo)
      }
      setEditingCat(null)
      setCatError(null)
    } catch {
      setCatError('Erro ao salvar categoria.')
    }
  }

  async function handleDeleteCat(id: string) {
    if (!confirm('Remover esta categoria?')) return
    try {
      setDeleteError(null)
      await removerCategoria(id)
    } catch {
      setDeleteError('Não foi possível remover a categoria. Verifique se ela não possui produtos.')
    }
  }

  async function handleSaveProduto(form: ProdutoFormData) {
    if (modalState.produto?.id) {
      await editarProduto(modalState.produto.id, form)
    } else {
      await adicionarProduto(form)
    }
    setModalState({ open: false })
  }

  async function handleDeleteProduto(id: string) {
    if (!confirm('Remover este produto?')) return
    try {
      setDeleteError(null)
      await removerProduto(id)
    } catch {
      setDeleteError('Não foi possível remover o produto.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Cardápio</h1>
        <p className={styles.pageSubtitle}>Gerencie categorias e produtos</p>
      </div>

      {(error || deleteError) && (
        <div className={styles.errorBox} role="alert">{deleteError ?? error}</div>
      )}

      {loading ? (
        <SkeletonLayout />
      ) : (
        <div className={styles.layout}>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Categorias</h2>
              <span className={styles.panelCount}>{categorias.length}</span>
            </div>

            <div className={styles.catList}>
              {categorias.map((cat, i) => {
                const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]!
                const isEditing = editingCat !== 'new' && editingCat?.id === cat.id
                return (
                  <div key={cat.id}>
                    <div className={styles.catItem}>
                      <span
                        className={styles.catDot}
                        style={{ background: cat.ativo ? color : '#D1C9C0' }}
                      />
                      <span className={styles.catNome}>{cat.nome}</span>
                      <span className={styles.catOrdem}>#{cat.ordem}</span>
                      {isGerente && (
                        <div className={styles.catActions}>
                          <button className={styles.btnIcon} onClick={() => startEditCat(cat)} title="Editar">
                            <IconEdit />
                          </button>
                          <button className={styles.btnDanger} onClick={() => handleDeleteCat(cat.id)} title="Excluir">
                            <IconTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className={styles.catForm}>
                        <div className={styles.catFormRow}>
                          <input
                            className={styles.catFormInput}
                            value={catForm.nome}
                            onChange={(e) => setCatForm((f) => ({ ...f, nome: e.target.value }))}
                            placeholder="Nome"
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCat()}
                          />
                          <input
                            className={`${styles.catFormInput} ${styles.catFormInputSmall}`}
                            type="number"
                            value={catForm.ordem}
                            onChange={(e) => setCatForm((f) => ({ ...f, ordem: e.target.value }))}
                            placeholder="Ordem"
                            min={0}
                          />
                        </div>
                        {catError && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{catError}</span>}
                        <div className={styles.catFormActions}>
                          <button className={styles.btnSave} onClick={handleSaveCat}>Salvar</button>
                          <button className={styles.btnCancel} onClick={() => setEditingCat(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {editingCat === 'new' && (
                <div className={styles.catForm}>
                  <div className={styles.catFormRow}>
                    <input
                      className={styles.catFormInput}
                      value={catForm.nome}
                      onChange={(e) => setCatForm((f) => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome da categoria"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCat()}
                    />
                    <input
                      className={`${styles.catFormInput} ${styles.catFormInputSmall}`}
                      type="number"
                      value={catForm.ordem}
                      onChange={(e) => setCatForm((f) => ({ ...f, ordem: e.target.value }))}
                      placeholder="Ordem"
                      min={0}
                    />
                  </div>
                  {catError && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{catError}</span>}
                  <div className={styles.catFormActions}>
                    <button className={styles.btnSave} onClick={handleSaveCat}>Salvar</button>
                    <button className={styles.btnCancel} onClick={() => setEditingCat(null)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {isGerente && editingCat === null && (
              <button className={styles.addCatBtn} onClick={startNewCat}>
                <IconPlus />
                Nova Categoria
              </button>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Produtos</h2>
              <span className={styles.panelCount}>{produtos.length}</span>
              <div className={styles.prodHeader}>
                <div className={styles.searchWrap}>
                  <span className={styles.searchIcon}><IconSearch /></span>
                  <input
                    className={styles.searchInput}
                    placeholder="Buscar produto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                {isGerente && (
                  <button
                    className={styles.btnPrimary}
                    onClick={() => setModalState({ open: true, produto: null })}
                  >
                    <IconPlus />
                    Novo Produto
                  </button>
                )}
              </div>
            </div>

            <div className={styles.prodBody}>
              {filtrados.length === 0 ? (
                <div className={styles.emptyProd}>
                  {busca ? `Nenhum produto encontrado para "${busca}"` : 'Nenhum produto cadastrado.'}
                </div>
              ) : (
                Array.from(grouped.entries()).map(([key, group]) => (
                  <div key={key} className={styles.groupSection}>
                    <p className={styles.groupLabel}>{group.label}</p>
                    <div className={styles.prodGrid}>
                      {group.produtos.map((prod, i) => {
                        const color = getCatColor(prod.categoria_id, categorias)
                        return (
                          <div
                            key={prod.id}
                            className={`${styles.prodCard}${prod.disponivel ? '' : ` ${styles.indisponivel}`}`}
                            style={{ animationDelay: `${i * 0.04}s` }}
                          >
                            <div className={styles.prodStripe} style={{ background: color }} />
                            <div className={styles.prodContent}>
                              <span className={styles.prodNome}>{prod.nome}</span>
                              {prod.descricao && (
                                <span className={styles.prodDesc}>{prod.descricao}</span>
                              )}
                              <span className={styles.prodPreco}>{formatBRL(prod.preco)}</span>
                              <div className={styles.prodFooter}>
                                <DisponibilidadeToggle
                                  value={prod.disponivel}
                                  onChange={(v) => isGerente && alternarDisponivel(prod.id, v)}
                                  disabled={!isGerente}
                                />
                                {isGerente && (
                                  <div className={styles.prodActions}>
                                    <button
                                      className={styles.btnIcon}
                                      onClick={() => setModalState({ open: true, produto: prod })}
                                      title="Editar"
                                    >
                                      <IconEdit />
                                    </button>
                                    <button
                                      className={styles.btnDanger}
                                      onClick={() => handleDeleteProduto(prod.id)}
                                      title="Excluir"
                                    >
                                      <IconTrash />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {prod.imagem_url ? (
                              <div className={styles.prodThumb}>
                                <img
                                  src={prod.imagem_url}
                                  alt={prod.nome}
                                  className={styles.prodThumbImg}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className={styles.prodThumbFallback} style={{ background: color }}>
                                {prod.nome[0]}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ProdutoModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        produto={modalState.produto}
        categorias={categorias}
        onSave={handleSaveProduto}
      />
    </div>
  )
}
