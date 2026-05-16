import { useNavigate } from 'react-router-dom'
import styles from './privacidade-page.module.css'

function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  )
}

interface Section {
  num: string
  title: string
  content?: string
  items?: string[]
}

const SECTIONS: Section[] = [
  {
    num: '01',
    title: 'Dados Coletados',
    items: [
      'Clientes (WhatsApp): nome, número de telefone, endereço de entrega e histórico de pedidos.',
      'Usuários do sistema: nome completo, endereço de e-mail e senha (armazenada como hash bcrypt — nunca em texto simples).',
    ],
  },
  {
    num: '02',
    title: 'Finalidade do Tratamento',
    content:
      'Os dados pessoais são tratados exclusivamente para: processamento e entrega de pedidos, geração de histórico e relatórios gerenciais, e autenticação e controle de acesso ao painel administrativo.',
  },
  {
    num: '03',
    title: 'Base Legal (LGPD art. 7º)',
    content:
      'O tratamento se baseia no consentimento do titular para clientes que realizam pedidos via WhatsApp, e na execução de contrato para usuários do sistema administrativo.',
  },
  {
    num: '04',
    title: 'Retenção de Dados',
    items: [
      'Clientes: dados retidos por até 24 meses após a última interação. Após esse período, dados pessoais são anonimizados automaticamente.',
      'Usuários do sistema: dados mantidos enquanto o vínculo com o restaurante estiver ativo.',
    ],
  },
  {
    num: '05',
    title: 'Seus Direitos (LGPD art. 18º)',
    content:
      'Você tem direito a: confirmação e acesso aos seus dados, correção de dados incompletos ou inexatos, anonimização ou eliminação de dados desnecessários, portabilidade para outro fornecedor, e revogação do consentimento a qualquer momento. Para exercer seus direitos, entre em contato com o encarregado de dados (DPO) do restaurante.',
  },
  {
    num: '06',
    title: 'Segurança',
    content:
      'Aplicamos medidas técnicas de proteção: senhas armazenadas como hash bcrypt (12 rounds), autenticação via tokens JWT com validade limitada, controle de acesso por perfil (gerente/atendente) e log completo de auditoria de operações sobre dados pessoais.',
  },
  {
    num: '07',
    title: 'Compartilhamento',
    content:
      'Os dados pessoais não são compartilhados com terceiros para fins comerciais, exceto quando exigido expressamente por lei ou autoridade competente.',
  },
  {
    num: '08',
    title: 'Contato com o DPO',
    content:
      'Para dúvidas sobre esta política, para exercer seus direitos como titular ou para reportar incidentes de segurança, entre em contato com o encarregado de dados (DPO) indicado pelo restaurante em suas configurações.',
  },
]

export function PrivacidadePage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          <IconArrowLeft />
          Voltar
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.shieldWrap}>
            <IconShield />
          </div>
          <h1 className={styles.heroTitle}>Política de Privacidade</h1>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            LGPD — Lei 13.709/2018
          </span>
          <p className={styles.heroSub}>
            Saiba como coletamos, usamos e protegemos seus dados pessoais.
          </p>
        </div>

        {SECTIONS.map((sec, i) => (
          <div
            key={sec.num}
            className={styles.section}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum}>{sec.num}</span>
              <h2 className={styles.sectionTitle}>{sec.title}</h2>
            </div>
            {sec.content && <p className={styles.sectionText}>{sec.content}</p>}
            {sec.items && (
              <ul className={styles.sectionList}>
                {sec.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <p className={styles.footer}>
          Última atualização: {new Date().getFullYear()} · SIGEP — Sistema Integrado de Gestão de Pedidos
        </p>
      </div>
    </div>
  )
}
