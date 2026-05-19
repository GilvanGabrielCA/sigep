# 🍽️ SIGEP — Sistema de Gestão de Pedidos

<div align="center">

![SIGEP Banner](https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&fit=crop)

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)
[![Deploy](https://img.shields.io/badge/Deploy-Railway%20%2B%20Vercel-blueviolet?style=flat-square)](https://railway.app)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](LICENSE)

**Plataforma completa de gestão de pedidos para restaurantes, com kanban em tempo real, chatbot de atendimento, relatórios e conformidade LGPD.**

[▶ Demo ao vivo](https://sigep-nine.vercel.app) · [Reportar Bug](https://github.com/GilvanGabrielCA/sigep/issues) · [Solicitar Feature](https://github.com/GilvanGabrielCA/sigep/issues)

</div>

---

## 📌 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos e Instalação](#-pré-requisitos-e-instalação)
- [Como Usar](#-como-usar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Licença e Autores](#-licença-e-autores)

---

## 🎯 Sobre o Projeto

O **SIGEP** é um sistema web multicanal para gestão operacional de restaurantes. Ele centraliza o recebimento de pedidos (via WhatsApp simulado ou digitação direta), organiza o fluxo de produção em um kanban visual com atualizações ao vivo, e oferece ao gerente uma visão completa de desempenho via dashboard e relatórios.

**Problema resolvido:** Eliminar o caos de pedidos por papel ou WhatsApp manual, substituindo por um painel único acessível de qualquer dispositivo.

**Público-alvo:** Restaurantes de pequeno e médio porte que buscam profissionalizar a operação sem investir em sistemas corporativos caros.

---

## ✨ Funcionalidades

### 📊 Dashboard
- KPIs em tempo real: pedidos do dia, faturamento, ticket médio e pedidos por status
- Gráfico de vendas dos últimos 7 dias
- Atualização automática via Socket.io

### 🗂️ Kanban em Tempo Real
- Colunas: **Recebido → Em Preparação → Pronto → Entregue**
- Movimentação instantânea sem recarregar a página
- Notificação automática ao cliente via WhatsApp quando status muda

### 🤖 Chatbot WhatsApp
- Simulador de atendimento com máquina de estados completa
- Fluxo guiado por números: o cliente escolhe categorias, adiciona itens e confirma o pedido
- Suporte a entrega e retirada, escolha de pagamento
- Pedido cai automaticamente no Kanban ao ser confirmado
- Conformidade LGPD: coleta consentimento antes de qualquer interação

### 🍔 Gestão de Cardápio
- CRUD completo de categorias e produtos
- Upload de imagem do produto (arquivo ou URL externa)
- Toggle de disponibilidade em tempo real
- Agrupamento visual por categoria com cores

### 📈 Relatórios e Analytics
- Vendas por período com filtros de data
- Produtos mais pedidos
- Pedidos por canal (balcão, WhatsApp)
- Tempo médio de preparação
- Gráficos interativos com Recharts

### 👥 Gestão de Usuários
- Cadastro de gerentes e atendentes
- Ativação/desativação sem exclusão permanente
- Reset de senha pelo gerente
- Controle de acesso por perfil (RBAC)

### 🔐 Autenticação e Segurança
- Login com JWT (8h de expiração)
- Recuperação de senha por e-mail com link temporário
- Senhas armazenadas com hash bcrypt (custo 12)
- Auditoria completa de todas as ações do sistema

### 🛡️ Conformidade LGPD
- Registro e gestão de consentimentos
- Solicitações de acesso, correção, exclusão e portabilidade
- Anonimização automática de clientes inativos há mais de 24 meses
- Log de auditoria com IP, usuário, entidade e operação

### 👑 Painel Super Admin
- Visão global de todos os restaurantes do sistema
- Logs de auditoria com 13 tipos de operação e filtros avançados
- Filtro por entidade, tipo de operação e intervalo de datas
- Gestão de todos os usuários do sistema

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **TypeScript** | 5.4 | Tipagem estática |
| **Express** | 4.19 | Framework HTTP |
| **Socket.io** | 4.7 | Comunicação em tempo real |
| **PostgreSQL** | 16 | Banco de dados relacional |
| **pg** | 8.12 | Driver PostgreSQL |
| **bcrypt** | 5.1 | Hash de senhas |
| **jsonwebtoken** | 9.0 | Autenticação JWT |
| **Nodemailer** | 8.0 | Envio de e-mails |
| **Multer** | 2.1 | Upload de arquivos |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18.3 | Interface do usuário |
| **TypeScript** | 5.4 | Tipagem estática |
| **Vite** | 5.3 | Bundler e dev server |
| **React Router** | 6.23 | Navegação SPA |
| **Axios** | 1.7 | Cliente HTTP |
| **Socket.io-client** | 4.7 | Tempo real no frontend |
| **Recharts** | 2.12 | Gráficos e dashboards |
| **CSS Modules** | — | Estilização escopada |

### Infraestrutura
| Serviço | Uso |
|---|---|
| **Railway** | Hospedagem do backend e banco PostgreSQL |
| **Vercel** | Hospedagem do frontend |
| **GitHub** | Versionamento e CI/CD automático |

---

## 📦 Pré-requisitos e Instalação

### Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org) **v20 ou superior**
- [npm](https://www.npmjs.com) v10+
- [PostgreSQL](https://www.postgresql.org) v14+ (local) ou conta no [Railway](https://railway.app)
- [Git](https://git-scm.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/GilvanGabrielCA/sigep.git
cd sigep
```

### 2. Configurar o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend/`:

```bash
cp .env.example .env
# Edite o arquivo com suas credenciais (veja seção de variáveis de ambiente)
```

### 3. Criar o banco de dados

```bash
# Criar as tabelas (execute uma vez)
npx tsx src/db/schema-run.ts

# Popular com dados de demonstração (opcional)
npx tsx src/db/seed.ts
```

### 4. Iniciar o backend

```bash
npm run dev
# Servidor disponível em http://localhost:3001
```

### 5. Configurar o Frontend

Abra um novo terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/`:

```bash
VITE_API_URL=http://localhost:3001
```

### 6. Iniciar o frontend

```bash
npm run dev
# Aplicação disponível em http://localhost:5173
```

---

## 🚀 Como Usar

### Acesso inicial

Após executar o seed, acesse `http://localhost:5173` e faça login com as credenciais geradas pelo `seed.ts` (definidas no próprio arquivo).

### Fluxo básico de operação

1. **Login** → acesse o dashboard com KPIs do dia
2. **Cardápio** → cadastre categorias e produtos com imagens
3. **Integrações** → teste o chatbot simulando um cliente fazendo pedido pelo WhatsApp
4. **Kanban** → gerencie o status dos pedidos em tempo real
5. **Relatórios** → visualize o desempenho por período

### Testando o Chatbot

Na página **Integrações**, use o simulador de chat:

```
> oi
Bot: Bom dia! Bem-vindo ao Pátio 22...

> CONCORDO          (aceite os termos LGPD)
> Seu Nome          (informe o nome)
> 1                 (selecione uma categoria)
> 2                 (adicione um produto)
> 3                 (confirmar pedido)
> 1                 (entrega)
> Rua das Flores, 123, Centro
> 1                 (pagar com PIX)
```

O pedido aparece instantaneamente no **Kanban**.

### Verificação de tipos

```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run typecheck
```

---

## 🔧 Variáveis de Ambiente

### Backend (`backend/.env`)

```env
# Banco de dados (obrigatório)
DATABASE_URL=postgresql://user:password@host:5432/sigep

# Autenticação JWT (obrigatório)
JWT_SECRET=seu_segredo_jwt_super_seguro_aqui

# URL do frontend (CORS)
FRONTEND_URL=http://localhost:5173

# E-mail para recuperação de senha (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# Porta do servidor
PORT=3001

# Ambiente
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
# URL da API backend
VITE_API_URL=http://localhost:3001
```

> ⚠️ **Atenção:** Nunca versione arquivos `.env` com credenciais reais. O `.gitignore` já está configurado para ignorá-los.

---

## 📁 Estrutura do Projeto

```
sigep/
├── backend/
│   └── src/
│       ├── controllers/     # Handlers HTTP (Express)
│       ├── db/
│       │   ├── migrations/  # Scripts SQL de migração
│       │   ├── schema.sql   # DDL completo do banco
│       │   ├── seed.ts      # Dados iniciais de demonstração
│       │   └── *-queries.ts # Queries SQL tipadas
│       ├── middlewares/     # Auth, error handler
│       ├── routes/          # Definição de rotas
│       ├── services/        # Lógica de negócio
│       ├── socket/          # Configuração Socket.io
│       ├── types/           # Tipos TypeScript globais
│       └── server.ts        # Entry point
│
└── frontend/
    └── src/
        ├── components/      # Componentes reutilizáveis
        ├── contexts/        # Context API (auth)
        ├── hooks/           # Custom hooks
        ├── pages/           # Páginas da aplicação
        ├── services/        # Clientes de API (Axios)
        ├── types/           # Interfaces TypeScript
        └── App.tsx          # Roteamento principal
```

---

## 🔑 Perfis de Acesso

| Recurso | Super Admin | Gerente | Atendente |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Kanban (visualizar) | ✅ | ✅ | ✅ |
| Kanban (mover pedidos) | ✅ | ✅ | ✅ |
| Cardápio (visualizar) | ✅ | ✅ | ✅ |
| Cardápio (editar) | ✅ | ✅ | ❌ |
| Relatórios | ✅ | ✅ | ❌ |
| Usuários | ✅ | ✅ | ❌ |
| Configurações | ✅ | ✅ | ❌ |
| LGPD | ✅ | ✅ | ❌ |
| Painel Super Admin | ✅ | ❌ | ❌ |
| Logs de Auditoria Global | ✅ | ❌ | ❌ |

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Siga os passos:

1. Faça um **Fork** do projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-nova-feature
   ```
3. Faça suas alterações e **commit** com mensagem clara:
   ```bash
   git commit -m "feat: adicionar filtro por data no relatório"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feature/minha-nova-feature
   ```
5. Abra um **Pull Request** descrevendo o que foi alterado e por quê

### Reportando Bugs

Abra uma [issue](https://github.com/GilvanGabrielCA/sigep/issues) com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Print ou GIF da tela (se aplicável)

---

## 📄 Licença e Autores

Este projeto está licenciado sob a **Licença MIT** — veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Desenvolvido por **Gilvan Gabriel Correia de Alencar**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/gilvangabriel)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/GilvanGabrielCA)
[![E-mail](https://img.shields.io/badge/E--mail-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:gilvangabriealencar@gmail.com)

</div>
