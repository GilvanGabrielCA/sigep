import type { Request, Response, NextFunction } from 'express'
import {
  submeterSolicitacao,
  getSolicitacoes,
  responderSolicitacao,
  getAuditoria,
  acessarDadosCliente,
  anonimizarClientesInativos,
  getConsentimentos,
} from '../services/lgpd-service.js'

const POLITICA_PRIVACIDADE = `
## Política de Privacidade — SIGEP

**Última atualização:** ${new Date().getFullYear()}

### 1. Dados Coletados
Coletamos os seguintes dados pessoais para operação do sistema:
- **Clientes (WhatsApp):** nome, número de telefone, endereço de entrega e histórico de pedidos
- **Usuários do sistema:** nome completo, endereço de e-mail e credenciais de acesso (senha armazenada como hash)

### 2. Finalidade do Tratamento
Os dados são tratados exclusivamente para:
- Processamento e entrega de pedidos
- Geração de histórico e relatórios gerenciais
- Autenticação e controle de acesso ao painel administrativo

### 3. Base Legal (LGPD art. 7º)
O tratamento se baseia no **consentimento** do titular (clientes via WhatsApp) e na **execução de contrato** (usuários do sistema).

### 4. Retenção de Dados
- Dados de clientes são retidos por até **24 meses** após a última interação. Após esse período, os dados pessoais são anonimizados automaticamente.
- Dados de usuários do sistema são mantidos enquanto o vínculo com o restaurante estiver ativo.

### 5. Direitos do Titular (LGPD art. 18º)
Você tem direito a: confirmação, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e revogação do consentimento. Para exercer esses direitos, entre em contato com o encarregado de dados (DPO) do restaurante.

### 6. Segurança
Aplicamos medidas técnicas de proteção: senhas armazenadas como hash bcrypt, autenticação JWT, controle de acesso por perfil e log de auditoria de operações sobre dados pessoais.

### 7. Compartilhamento
Os dados não são compartilhados com terceiros, exceto quando exigido por lei.

### 8. Contato
Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato com o encarregado de dados (DPO) indicado pelo restaurante.
`

export async function getPrivacidade(_req: Request, res: Response) {
  res.json({ content: POLITICA_PRIVACIDADE })
}

export async function postSolicitacao(req: Request, res: Response, next: NextFunction) {
  try {
    const { telefone, email, tipo, descricao } = req.body as {
      telefone?: string; email?: string; tipo: string; descricao?: string
    }
    const restauranteId = req.user!.restauranteId
    const sol = await submeterSolicitacao(
      restauranteId,
      telefone ?? null,
      email ?? null,
      tipo,
      descricao ?? '',
    )
    res.status(201).json(sol)
  } catch (err) { next(err) }
}

export async function getSolicitacoesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSolicitacoes(req.user!.restauranteId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function patchSolicitacao(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, resposta } = req.body as { status: string; resposta: string }
    const updated = await responderSolicitacao(
      req.params.id!,
      req.user!.restauranteId,
      status,
      resposta ?? '',
      req.user!.userId,
    )
    res.json(updated)
  } catch (err) { next(err) }
}

export async function getAuditoriaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAuditoria(req.user!.restauranteId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function postAnonimizar(req: Request, res: Response, next: NextFunction) {
  try {
    const meses = Number((req.body as { meses?: unknown }).meses ?? 24)
    const count = await anonimizarClientesInativos(
      req.user!.restauranteId,
      meses,
      req.user!.userId,
    )
    res.json({ anonimizados: count, meses })
  } catch (err) { next(err) }
}

export async function getMeusDados(req: Request, res: Response, next: NextFunction) {
  try {
    const telefone = (req.query.telefone ?? '') as string
    if (!telefone) {
      res.status(400).json({ message: 'Parâmetro telefone obrigatório' })
      return
    }
    const data = await acessarDadosCliente(req.user!.restauranteId, telefone, req.user!.userId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function getConsentimentosHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getConsentimentos(req.user!.restauranteId)
    res.json(data)
  } catch (err) { next(err) }
}
