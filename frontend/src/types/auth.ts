export interface JwtPayload {
  userId: string
  restauranteId: string
  nome?: string
  perfil: 'gerente' | 'atendente' | 'superadmin'
}
