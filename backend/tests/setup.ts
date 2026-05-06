// Variáveis de ambiente para todos os testes do backend
process.env['JWT_SECRET'] = 'sigep_test_secret_chave_para_testes_nao_usar_em_producao'
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/sigep_test'
process.env['NODE_ENV'] = 'test'
