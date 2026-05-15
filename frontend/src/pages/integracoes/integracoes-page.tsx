import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useIntegracoes, useChatSimulator } from '../../hooks/use-integracoes'
import { useAuth } from '../../hooks/use-auth'
import type { Integracao } from '../../services/integracoes-api'
import styles from './integracoes-page.module.css'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*([^*]+)\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  )
}

function WhatsAppIcon({ size = 24, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function IntegracaoCard({
  integracao,
  isGerente,
  toggling,
  onToggle,
}: {
  integracao: Integracao
  isGerente: boolean
  toggling: string | null
  onToggle: (id: string, ativo: boolean) => void
}) {
  const isToggling = toggling === integracao.id
  const thumbLeft = integracao.ativo ? '23px' : '3px'
  const trackBg = integracao.ativo ? '#25D366' : '#D1C9C0'

  return (
    <div className={styles.integCard}>
      <div className={styles.integCardTop}>
        <div className={styles.integIconWrap}>
          <WhatsAppIcon size={22} color="#25D366" />
        </div>
        <div className={styles.integInfo}>
          <p className={styles.integName}>WhatsApp Business</p>
          <p className={styles.integDesc}>Chatbot para pedidos via mensagem</p>
        </div>
        <span className={`${styles.statusBadge} ${integracao.ativo ? styles.active : styles.inactive}`}>
          {integracao.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className={styles.integCardBottom}>
        <span className={styles.integToggleLabel}>
          {integracao.ativo ? 'Desativar integração' : 'Ativar integração'}
        </span>
        <div className={`${styles.toggleWrap} ${!isGerente ? styles.disabled : ''}`}>
          <button
            className={styles.toggleTrack}
            style={{ background: trackBg }}
            disabled={!isGerente || isToggling}
            onClick={() => onToggle(integracao.id, !integracao.ativo)}
            aria-label={integracao.ativo ? 'Desativar' : 'Ativar'}
            title={!isGerente ? 'Apenas gerentes podem alterar integrações' : undefined}
          >
            {isToggling ? (
              <div className={styles.toggleSpinner} />
            ) : (
              <div className={styles.toggleThumb} style={{ left: thumbLeft }} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function IntegracoesPage() {
  const { user } = useAuth()
  const isGerente = user?.perfil === 'gerente'
  const { integracoes, loading, toggling, toggle } = useIntegracoes()
  const [telefone, setTelefone] = useState('+55 11 99999-9999')
  const { mensagens, enviando, enviar, limpar } = useChatSimulator(telefone)
  const [texto, setTexto] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, enviando])

  const handleEnviar = useCallback(async () => {
    const msg = texto.trim()
    if (!msg || enviando) return
    setTexto('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await enviar(msg)
  }, [texto, enviando, enviar, telefone])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleEnviar()
      }
    },
    [handleEnviar],
  )

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTexto(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Integrações</h1>
        <p className={styles.subtitle}>Gerencie canais de atendimento e teste o chatbot</p>
      </div>

      <div className={styles.layout}>
        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className={styles.leftCol}>
          <p className={styles.sectionLabel}>Canais disponíveis</p>

          {loading ? (
            <>
              <div className={`${styles.skeletonCard} ${styles.skeleton}`} />
              <div className={`${styles.skeletonCard} ${styles.skeleton}`} style={{ height: 80 }} />
            </>
          ) : integracoes.length === 0 ? (
            <div className={styles.integCard}>
              <IntegracaoCard
                integracao={{ id: 'mock', tipo: 'whatsapp', ativo: false, configuracao: {} }}
                isGerente={isGerente}
                toggling={toggling}
                onToggle={toggle}
              />
            </div>
          ) : (
            integracoes.map((integ) => (
              <IntegracaoCard
                key={integ.id}
                integracao={integ}
                isGerente={isGerente}
                toggling={toggling}
                onToggle={toggle}
              />
            ))
          )}

        </div>

        {/* ── Right column — Chat simulator ───────────────────────────── */}
        <div className={styles.chatCard}>
          {/* WhatsApp-style header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderAvatar}>
              <WhatsAppIcon size={20} color="#fff" />
            </div>
            <div className={styles.chatHeaderInfo}>
              <p className={styles.chatHeaderTitle}>Simulador WhatsApp</p>
              <p className={styles.chatHeaderStatus}>online</p>
            </div>
            <div className={styles.chatHeaderActions}>
              <button className={styles.clearBtn} onClick={limpar}>
                Limpar
              </button>
            </div>
          </div>

          {/* Phone input */}
          <div className={styles.phoneBar}>
            <span className={styles.phoneLabel}>Telefone:</span>
            <input
              className={styles.phoneInput}
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+55 11 99999-9999"
            />
          </div>

          {/* Messages */}
          <div className={styles.messagesArea}>
            {mensagens.length === 0 && !enviando && (
              <div className={styles.emptyState}>
                <WhatsAppIcon size={36} color="#aaa" />
                <p className={styles.emptyStateText}>
                  Digite uma mensagem para iniciar o chatbot.<br />
                  Experimente: <strong>oi</strong>, <strong>cardápio</strong>, ou um número do menu.
                </p>
              </div>
            )}

            {mensagens.map((msg, i) => (
              <div key={i} className={`${styles.msgRow} ${msg.de === 'cliente' ? styles.client : styles.bot}`}>
                <div className={styles.bubble}>
                  <span className={styles.bubbleText}>{renderBold(msg.texto)}</span>
                  <span className={styles.bubbleTime}>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {enviando && (
              <div className={styles.typingRow}>
                <div className={styles.typingBubble}>
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className={styles.chatInputArea}>
            <textarea
              ref={textareaRef}
              className={styles.msgInput}
              value={texto}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={() => void handleEnviar()}
              disabled={!texto.trim() || enviando}
              aria-label="Enviar mensagem"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
