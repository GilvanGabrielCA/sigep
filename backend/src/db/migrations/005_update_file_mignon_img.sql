-- Atualiza imagem do Filé Mignon ao Molho Madeira para foto mais atraente
UPDATE tb_produto
SET imagem_url = 'https://images.unsplash.com/photo-1565299715199-866c917206bb?w=400&q=80'
WHERE nome ILIKE '%fil%mignon%'
   OR nome ILIKE '%filé mignon%';
