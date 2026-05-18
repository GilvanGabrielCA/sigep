-- Atualiza imagem do Filé Mignon ao Molho Madeira para foto mais atraente
UPDATE tb_produto
SET imagem_url = 'https://images.unsplash.com/photo-1544025162-c23ab63a6afc?w=400&q=80'
WHERE nome ILIKE '%fil%mignon%'
   OR nome ILIKE '%filé mignon%';
