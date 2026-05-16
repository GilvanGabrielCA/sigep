import bcrypt from 'bcrypt'
import { pool } from './connection.js'

await pool.query(`
  TRUNCATE tb_relatorio, tb_reset_token, tb_status_historico,
           tb_item_pedido, tb_pedido, tb_integracao,
           tb_cliente, tb_produto, tb_categoria,
           tb_usuario, tb_restaurante
  RESTART IDENTITY CASCADE
`)

const { rows: [rest] } = await pool.query<{ id: string }>(`
  INSERT INTO tb_restaurante (nome, endereco, telefone)
  VALUES ($1, $2, $3)
  RETURNING id`,
  [
    "Bruto's Burger",
    'Rua Weimar Gonçalves Torres, 1500 - Centro, Dourados - MS, 79800-020',
    '(67) 3422-9876',
  ],
)
const rid = rest!.id

const hashGerente1  = await bcrypt.hash('Ger#2026!kM9',  12)
const hashGerente2  = await bcrypt.hash('Am&nd@$ilv88',  12)
const hashAtend1    = await bcrypt.hash('Raf@C0stA*12',  12)
const hashAtend2    = await bcrypt.hash('JuLi#B@rr0s9',  12)
const hashAtend3    = await bcrypt.hash('M@rc0s%Oli77',  12)
const hashAtend4    = await bcrypt.hash('L3tici@Nun!s',  12)
const hashAtend5    = await bcrypt.hash('Th1@g0$ant0s',  12)

await pool.query(`
  INSERT INTO tb_usuario (restaurante_id, nome, email, senha_hash, perfil) VALUES
  ($1, 'Carlos Mendes',   'carlos.mendes@brutosburger.com',   $2,  'gerente'),
  ($1, 'Amanda Silveira', 'amanda.silveira@brutosburger.com', $3,  'gerente'),
  ($1, 'Rafael Costa',    'rafael.costa@brutosburger.com',    $4,  'atendente'),
  ($1, 'Juliana Barros',  'juliana.barros@brutosburger.com',  $5,  'atendente'),
  ($1, 'Marcos Oliveira', 'marcos.oliveira@brutosburger.com', $6,  'atendente'),
  ($1, 'Letícia Nunes',   'leticia.nunes@brutosburger.com',   $7,  'atendente'),
  ($1, 'Thiago Santos',   'thiago.santos@brutosburger.com',   $8,  'atendente')`,
  [rid, hashGerente1, hashGerente2, hashAtend1, hashAtend2, hashAtend3, hashAtend4, hashAtend5],
)

const { rows: [catEntradas] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_categoria (restaurante_id, nome, ordem) VALUES ($1, 'Entradas', 1) RETURNING id`,
  [rid],
)
const { rows: [catPrincipais] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_categoria (restaurante_id, nome, ordem) VALUES ($1, 'Pratos Principais', 2) RETURNING id`,
  [rid],
)
const { rows: [catSobremesas] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_categoria (restaurante_id, nome, ordem) VALUES ($1, 'Sobremesas', 3) RETURNING id`,
  [rid],
)
const { rows: [catBebidas] } = await pool.query<{ id: string }>(
  `INSERT INTO tb_categoria (restaurante_id, nome, ordem) VALUES ($1, 'Bebidas', 4) RETURNING id`,
  [rid],
)

await pool.query(`
  INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url) VALUES
  (
    $1, $2,
    'Fritas Rústicas Bruto''s',
    'Porção de batatas rústicas cortadas à mão, temperadas com páprica defumada, sal grosso e alecrim. Acompanha maionese verde da casa.',
    28.00,
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Onion Rings Crocantes',
    'Anéis de cebola empanados em massa de cerveja artesanal, fritos até dourarem. Acompanha molho barbecue com toque de whisky.',
    24.00,
    'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Chicken Bites',
    'Pedaços suculentos de peito de frango empanados em farinha panko. Acompanha molho mostarda e mel.',
    32.00,
    'https://images.unsplash.com/photo-1562802378-063ec186a863?auto=format&fit=crop&w=800&q=80'
  )`,
  [rid, catEntradas!.id],
)

await pool.query(`
  INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url) VALUES
  (
    $1, $2,
    'Smash Clássico',
    'Pão brioche selado na manteiga, dois smash burgers de 80g (blend de costela), queijo cheddar derretido, picles de pepino e molho especial da casa.',
    34.00,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Bruto''s Bacon Supreme',
    'Pão australiano, burger de 160g ao ponto, queijo prato, cebola caramelizada, fatias grossas de bacon defumado artesanalmente e maionese de alho assado.',
    42.00,
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Vegetariano do Bosque',
    'Pão brioche, hambúrguer de grão de bico e cogumelos Paris (150g), queijo muçarela, rúcula fresca, tomate confit e maionese de manjericão.',
    38.00,
    'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Choripan Burger',
    'Pão francês redondo, blend de linguiça suína e carne bovina (160g), queijo provolone tostado, chimichurri fresco e maionese defumada.',
    39.00,
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80'
  )`,
  [rid, catPrincipais!.id],
)

await pool.query(`
  INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url) VALUES
  (
    $1, $2,
    'Brownie Vulcão',
    'Brownie de chocolate meio amargo servido quente, acompanhado de uma bola de sorvete de creme, farofa de nozes e calda generosa de chocolate.',
    26.00,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Milkshake de Churros',
    '400ml de sorvete de creme batido com doce de leite, finalizado com chantilly, canela em pó e mini churros crocantes.',
    22.00,
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Pudim de Leite Perfeito',
    'Fatias de pudim de leite condensado sem furinhos, com calda de caramelo tostado levemente salgada.',
    18.00,
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80'
  )`,
  [rid, catSobremesas!.id],
)

await pool.query(`
  INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url) VALUES
  (
    $1, $2,
    'Refrigerante Lata',
    'Lata de 350ml (Coca-Cola, Guaraná ou Sprite), servida bem gelada com rodela de limão e gelo (opcional).',
    7.00,
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Suco Natural de Laranja',
    'Copo de 400ml, suco espremido na hora, sem adição de água ou açúcar.',
    12.00,
    'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80'
  ),
  (
    $1, $2,
    'Chopp Pilsen Artesanal',
    'Caneca de 500ml de chopp pilsen de cervejaria local de Mato Grosso do Sul, colarinho cremoso de 2 dedos.',
    14.00,
    'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80'
  )`,
  [rid, catBebidas!.id],
)

await pool.query(
  `INSERT INTO tb_integracao (restaurante_id, tipo, ativo) VALUES ($1, 'whatsapp', true)`,
  [rid],
)

console.log("✅ Seed do Bruto's Burger concluído!")
console.log('')
console.log('  Restaurante : Bruto\'s Burger — Dourados/MS')
console.log('')
console.log('  ── GERENTES ─────────────────────────────────────────────────')
console.log('  carlos.mendes@brutosburger.com   / Ger#2026!kM9')
console.log('  amanda.silveira@brutosburger.com / Am&nd@$ilv88')
console.log('')
console.log('  ── ATENDENTES ───────────────────────────────────────────────')
console.log('  rafael.costa@brutosburger.com    / Raf@C0stA*12')
console.log('  juliana.barros@brutosburger.com  / JuLi#B@rr0s9')
console.log('  marcos.oliveira@brutosburger.com / M@rc0s%Oli77')
console.log('  leticia.nunes@brutosburger.com   / L3tici@Nun!s')
console.log('  thiago.santos@brutosburger.com   / Th1@g0$ant0s')
console.log('')
console.log('  ── CARDÁPIO (12 produtos em 4 categorias) ───────────────────')
console.log('  Entradas (3): Fritas Rústicas, Onion Rings, Chicken Bites')
console.log('  Pratos Principais (4): Smash Clássico, Bacon Supreme, Vegetariano, Choripan')
console.log('  Sobremesas (3): Brownie Vulcão, Milkshake de Churros, Pudim de Leite')
console.log('  Bebidas (3): Refrigerante, Suco de Laranja, Chopp Pilsen')

await pool.end()
