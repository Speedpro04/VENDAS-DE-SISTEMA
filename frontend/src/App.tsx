import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import LeadsPage from './pages/LeadsPage'
import ConfigPage from './pages/ConfigPage'
import AssistentePage from './pages/AssistentePage'
import {
  LayoutDashboard, Users, Settings, LogOut, Zap,
  Building2, Car, Anchor, MessageCircle
} from 'lucide-react'

const Sidebar = () => {
  const { signOut } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>SQR</h1>
        <span>Vendas Inteligentes</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Users size={20} /> Leads
        </NavLink>
        <NavLink to="/config" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} /> Configurações
        </NavLink>
        <NavLink to="/assistente" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <MessageCircle size={20} /> Tira-Dúvidas IA
        </NavLink>

        <div style={{ margin: '20px 4px 10px', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16 }}>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, padding: '0 12px', marginBottom: 10, fontWeight: 600 }}>
            Produtos
          </div>
          <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.7 }}>
            <Building2 size={20} color="#22C55E" />
            <span style={{ fontSize: 19, fontWeight: 600 }}>Solara Connect</span>
          </div>
          <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.7 }}>
            <Car size={20} color="#EF4444" />
            <span style={{ fontSize: 19, fontWeight: 600 }}>Auto Racer</span>
          </div>
          <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.7 }}>
            <Anchor size={20} color="#C9A84C" />
            <span style={{ fontSize: 19, fontWeight: 600 }}>Yachts Atlas</span>
          </div>
        </div>
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button
          onClick={signOut}
          className="sidebar-item"
          style={{ width: '100%', border: 'none', background: 'rgba(0,0,0,0.2)', color: '#aaa', fontFamily: 'Montserrat', fontSize: 19, fontWeight: 600 }}
        >
          <LogOut size={20} /> Sair
        </button>
      </div>
    </aside>
  )
}

const Topbar = () => {
  const { user } = useAuth()

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Zap size={24} color="#006266" />
        <span style={{ fontSize: 19, fontWeight: 600, color: '#888' }}>SQR Vendas — Sistema Automático</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="pulse-dot" />
        <span style={{ fontSize: 19, color: '#22C55E', fontWeight: 600 }}>ONLINE</span>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 19, fontWeight: 600, color: '#888' }}>{user?.email}</span>
      </div>
    </header>
  )
}

const AppLayout = () => (
  <>
    <Sidebar />
    <div className="main-content">
      <Topbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/assistente" element={<AssistentePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  </>
)

const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F0F14' }}>
        <div style={{ textAlign: 'center' }}>
          <Zap size={48} color="#009C3B" style={{ marginBottom: 16 }} />
          <div style={{ color: '#888', fontSize: 14 }}>Carregando SQR Vendas...</div>
        </div>
      </div>
    )
  }

  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
