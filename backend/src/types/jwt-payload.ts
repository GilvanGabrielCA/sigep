export interface JwtPayload {
  userId: string
  restauranteId: string
  perfil: 'gerente' | 'atendente'
}
