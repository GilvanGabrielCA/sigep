import bcrypt from 'bcrypt'
import { pool } from './connection.js'

// ── Limpar banco completo ─────────────────────────────────────────────────────
await pool.query(`
  TRUNCATE tb_relatorio, tb_reset_token, tb_status_historico,
           tb_item_pedido, tb_pedido, tb_integracao,
           tb_cliente, tb_produto, tb_categoria,
           tb_solicitacao_lgpd, tb_auditoria, tb_consentimento,
           tb_usuario, tb_restaurante
  RESTART IDENTITY CASCADE
`)

// ── Restaurante ───────────────────────────────────────────────────────────────
const { rows: [rest] } = await pool.query<{ id: string }>(`
  INSERT INTO tb_restaurante (nome, endereco, telefone, dpo_nome, dpo_email)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id`,
  [
    'Pátio 22',
    'Av. Afonso Pena, 1200 — Centro, Campo Grande/MS',
    '(67) 99874-2200',
    'Gilvan Gabriel',
    'gilvangabriealencar@gmail.com',
  ],
)
const rid = rest!.id

// ── Superadmin ────────────────────────────────────────────────────────────────
const hashAdmin = await bcrypt.hash('110125Gj!', 12)
await pool.query(
  `INSERT INTO tb_usuario (restaurante_id, nome, email, senha_hash, perfil)
   VALUES ($1, $2, $3, $4, 'gerente')`,
  [rid, 'Gilvan Gabriel', 'gilvangabriealencar@gmail.com', hashAdmin],
)

// ── Categorias ────────────────────────────────────────────────────────────────
async function cat(nome: string): Promise<string> {
  const { rows: [r] } = await pool.query<{ id: string }>(
    `INSERT INTO tb_categoria (restaurante_id, nome) VALUES ($1, $2) RETURNING id`,
    [rid, nome],
  )
  return r!.id
}

const catEntradas   = await cat('Entradas')
const catPratos     = await cat('Pratos Principais')
const catLanches    = await cat('Lanches')
const catSobremesas = await cat('Sobremesas')
const catBebidas    = await cat('Bebidas')

// ── Produtos ──────────────────────────────────────────────────────────────────
type Prod = { nome: string; desc: string; preco: number; foto: string; cat: string }

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=400&q=80`
}

const produtos: Prod[] = [
  // Entradas
  {
    nome: 'Bruschetta Caprese',
    desc: 'Fatias de pão italiano grelhado com tomate fresco, manjericão e azeite extravirgem.',
    preco: 28,
    foto: img('1572695157366-5e585ab2b69f'),
    cat: catEntradas,
  },
  {
    nome: 'Bolinho de Carne Seca',
    desc: 'Bolinhos crocantes recheados com carne seca desfiada e cream cheese. Acompanha molho aioli.',
    preco: 34,
    foto: img('1548943487-a2e4e43b4853'),
    cat: catEntradas,
  },
  {
    nome: 'Fritas Artesanais',
    desc: 'Batatas rústicas temperadas com alecrim, alho e flor de sal. Crocantes por fora, macias por dentro.',
    preco: 22,
    foto: img('1573080496219-bb080dd4f877'),
    cat: catEntradas,
  },
  {
    nome: 'Coxinha de Frango Gourmet',
    desc: 'Coxinhas artesanais com frango desfiado, catupiry e cúrcuma na massa. 4 unidades.',
    preco: 26,
    foto: img('1562967914-608f82629710'),
    cat: catEntradas,
  },

  // Pratos Principais
  {
    nome: 'Filé Mignon ao Molho Madeira',
    desc: 'Medalhão de filé mignon grelhado, coberto com molho madeira e cogumelos Paris. Acompanha arroz e batatas.',
    preco: 72,
    foto: img('1546833999-b9f581a1996d'),
    cat: catPratos,
  },
  {
    nome: 'Salmão Grelhado',
    desc: 'Filé de salmão norueguês grelhado com ervas finas, limão-siciliano e azeite. Acompanha purê de batata-doce.',
    preco: 78,
    foto: img('1467003909585-2f8a72700288'),
    cat: catPratos,
  },
  {
    nome: 'Frango ao Curry Cremoso',
    desc: 'Peito de frango cozido em molho de curry tailandês com leite de coco e legumes. Acompanha arroz basmati.',
    preco: 48,
    foto: img('1585937421612-70a008356fbe'),
    cat: catPratos,
  },
  {
    nome: 'Risoto de Funghi',
    desc: 'Risoto cremoso com mix de cogumelos funghi porcini, shitake e paris. Finalizado com parmesão e trufas.',
    preco: 56,
    foto: img('1476124369491-e7addf5db371'),
    cat: catPratos,
  },
  {
    nome: 'Macarrão Carbonara',
    desc: 'Espaguete al dente com molho cremoso de gema, pancetta crocante e parmesão ralado na hora.',
    preco: 42,
    foto: img('1555949258-eb67b1ef0ceb'),
    cat: catPratos,
  },

  // Lanches
  {
    nome: 'Smash Burger Clássico',
    desc: 'Blend de carne 180g smashado, queijo americano, alface, tomate, picles e molho da casa. Acompanha fritas.',
    preco: 42,
    foto: img('1568901346375-23c9450c58cd'),
    cat: catLanches,
  },
  {
    nome: 'Chicken Crispy',
    desc: 'Filé de frango empanado no buttermilk, alface americana, tomate e maionese de mel e mostarda no brioche.',
    preco: 38,
    foto: img('1598515214211-89d3c73ae83b'),
    cat: catLanches,
  },
  {
    nome: 'Veggie Wrap',
    desc: 'Tortilha integral recheada com homus, legumes grelhados, rúcula, tomate seco e molho tahine.',
    preco: 32,
    foto: img('1626700051175-6818013e1d64'),
    cat: catLanches,
  },

  // Sobremesas
  {
    nome: 'Petit Gateau',
    desc: 'Bolinho de chocolate com interior cremoso e quente. Acompanha uma bola de sorvete de creme.',
    preco: 28,
    foto: img('1578985545062-69928b1d9587'),
    cat: catSobremesas,
  },
  {
    nome: 'Pudim de Leite Condensado',
    desc: 'Pudim artesanal com calda de caramelo. Receita da vovó, servido gelado.',
    preco: 18,
    foto: img('1702728109878-c61a98d80491'),
    cat: catSobremesas,
  },
  {
    nome: 'Brownie ao Brigadeiro',
    desc: 'Brownie denso e úmido de chocolate belga, coberto com brigadeiro gourmet e granulado crocante.',
    preco: 24,
    foto: img('1564355808539-22fda35bed7e'),
    cat: catSobremesas,
  },
  {
    nome: 'Açaí na Tigela',
    desc: '400ml de açaí batido grosso, com granola crocante, banana, morango e mel. Puro e sem mistura.',
    preco: 22,
    foto: img('1590080876351-41a5c3d42c3a'),
    cat: catSobremesas,
  },

  // Bebidas
  {
    nome: 'Limonada Suíça',
    desc: 'Limão tahiti batido com leite condensado, leite de coco e gelo. Refrescante e cremosa.',
    preco: 16,
    foto: img('1621263764928-df1444c5e859'),
    cat: catBebidas,
  },
  {
    nome: 'Suco Natural',
    desc: 'Suco feito na hora. Opções: laranja, maracujá, abacaxi com hortelã ou melancia. 400ml.',
    preco: 14,
    foto: img('1621506289937-a8e4df240d0b'),
    cat: catBebidas,
  },
  {
    nome: 'Cerveja Artesanal 600ml',
    desc: 'Seleção rotativa de cervejas artesanais nacionais. Pergunte ao garçom as opções do dia.',
    preco: 26,
    foto: img('1608270586620-248524c67de9'),
    cat: catBebidas,
  },
  {
    nome: 'Refrigerante',
    desc: 'Lata 350ml gelada. Opções: Coca-Cola, Guaraná Antarctica, Sprite ou Fanta.',
    preco: 8,
    foto: img('1554866585-cd94860890b7'),
    cat: catBebidas,
  },
  {
    nome: 'Água Mineral',
    desc: 'Garrafa 500ml com ou sem gás.',
    preco: 6,
    foto: img('1548839140-29a749e1cf4d'),
    cat: catBebidas,
  },
]

for (const p of produtos) {
  await pool.query(
    `INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url, disponivel)
     VALUES ($1, $2, $3, $4, $5, $6, true)`,
    [rid, p.cat, p.nome, p.desc, p.preco, p.foto],
  )
}

await pool.end()

console.log(`
✅ Pátio 22 — Seed concluído!

  Restaurante : Pátio 22 — Campo Grande/MS

  ── ACESSO ───────────────────────────────────────────────────
  gilvangabriealencar@gmail.com  /  110125Gj!  (Gerente)

  ── CARDÁPIO (21 produtos em 5 categorias) ──────────────────
  Entradas (4)       : Bruschetta, Bolinho de Carne Seca, Fritas, Coxinha
  Pratos Principais (5): Filé Mignon, Salmão, Frango Curry, Risoto, Carbonara
  Lanches (3)        : Smash Burger, Chicken Crispy, Veggie Wrap
  Sobremesas (4)     : Petit Gateau, Pudim, Brownie, Açaí
  Bebidas (5)        : Limonada, Suco Natural, Cerveja, Refrigerante, Água
`)
