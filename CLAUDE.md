# SIGEP – Sistema Integrado de Gestão de Pedidos

Sistema multicanal de automação e gestão de pedidos para restaurantes. Integra um painel web administrativo (Kanban, cardápio, relatórios) com um chatbot WhatsApp mockado para pedidos externos.

## Estrutura do Repositório (Monorepo)

```
sigep/
├── CLAUDE.md
├── backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── db/          # Queries pg diretas (sem ORM)
│   │   ├── socket/      # Lógica Socket.io
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/         # React + TypeScript
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/    # Chamadas à API
    │   └── main.tsx
    ├── package.json
    └── tsconfig.json
```

## Stack

- **Backend:** Node.js + Express + TypeScript
- **Banco de dados:** PostgreSQL — queries diretas com `pg` (sem ORM)
- **Frontend:** React + TypeScript + Vite
- **Auth:** JWT + bcrypt
- **Real-time:** Socket.io
- **Chatbot WhatsApp:** Mockado (sem integração real com Meta API)
- **Deploy:** Frontend → Vercel | Backend + Banco → Railway

## Comandos Essenciais

```bash
# Backend
cd backend
npm install
npm run dev       # tsx watch src/server.ts
npm run build     # tsc
npm run typecheck # tsc --noEmit

# Frontend
cd frontend
npm install
npm run dev       # vite
npm run build     # vite build
npm run typecheck # tsc --noEmit
```

## Banco de Dados

PostgreSQL com as seguintes tabelas (schema já definido):
`tb_restaurante`, `tb_usuario`, `tb_categoria`, `tb_produto`, `tb_cliente`, `tb_pedido`, `tb_item_pedido`, `tb_status_historico`, `tb_integracao`, `tb_relatorio`

- Usar `pg` com queries SQL diretas — NUNCA usar ORM
- UUIDs como chave primária (`gen_random_uuid()`)
- Variável de conexão via `DATABASE_URL` no `.env`

## Variáveis de Ambiente

```
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/sigep
JWT_SECRET=...
PORT=3001

# frontend/.env
VITE_API_URL=http://localhost:3001
```

## Regras de Código

- TypeScript estrito em todo o projeto — sem `any` implícito
- Usar ES modules (`import/export`), nunca `require`
- Nomear arquivos em `kebab-case`
- Controllers não contêm lógica de negócio — apenas chamam services
- Todas as queries SQL ficam em `backend/src/db/`
- Erros de autenticação retornam HTTP 401; erros de autorização retornam HTTP 403

## Fluxo de Status dos Pedidos

`Recebido` → `Em Preparacao` → `Pronto para Entrega` → `Entregue` | `Cancelado`

Toda mudança de status deve:
1. Atualizar `tb_pedido.status`
2. Inserir registro em `tb_status_historico`
3. Emitir evento Socket.io para atualizar o Kanban em tempo real

## Telas do Sistema (Escopo MVP)

Prioridade de desenvolvimento:
1. Login (autenticação JWT)
2. Dashboard (KPIs)
3. Kanban de Pedidos em Tempo Real
4. Detalhes do Pedido (Modal)
5. Gestão de Cardápio
6. Adicionar/Editar Produto (Modal)
7. Relatórios e Analytics
8. Configurações do Restaurante
9. Integrações (Chatbot mockado)
10. Gestão de Usuários
11. Perfil do Usuário

## Git Workflow — IMPORTANTE

Após concluir cada tela ou funcionalidade, SEMPRE executar:

```bash
git add .
git commit -m "feat: descrição do que foi feito"
git push origin main
```

Usar prefixos de commit: `feat:`, `fix:`, `refactor:`, `chore:`

## O que o Chatbot Mockado Deve Fazer

Simular o fluxo de um cliente pedindo via WhatsApp:
1. Receber mensagem de texto
2. Responder com cardápio disponível
3. Coletar itens e endereço
4. Criar pedido no banco (`tb_pedido` + `tb_item_pedido`)
5. Emitir evento Socket.io para aparecer no Kanban

Não há integração real com a Meta/WhatsApp API — tudo é simulado internamente.

## Níveis de Acesso

- **Gerente:** acesso total (cardápio, relatórios, usuários, configurações)
- **Atendente:** acesso ao Kanban e detalhes de pedidos; sem acesso a exclusão de histórico