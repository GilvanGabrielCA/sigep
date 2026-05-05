import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/protected-route'
import { GerenteRoute } from './components/gerente-route'
import { AppLayout } from './components/layout/app-layout'
import { LoginPage } from './pages/login/login-page'
import { DashboardPage } from './pages/dashboard/dashboard-page'
import { KanbanPage } from './pages/kanban/kanban-page'
import { CardapioPage } from './pages/cardapio/cardapio-page'
import { RelatoriosPage } from './pages/relatorios/relatorios-page'
import { ConfiguracoesPage } from './pages/configuracoes/configuracoes-page'
import { IntegracoesPage } from './pages/integracoes/integracoes-page'
import { UsuariosPage } from './pages/usuarios/usuarios-page'
import { PerfilPage } from './pages/perfil/perfil-page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pedidos" element={<KanbanPage />} />
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="/perfil" element={<PerfilPage />} />

          <Route element={<GerenteRoute />}>
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="/integracoes" element={<IntegracoesPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
