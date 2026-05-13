import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import LeadsPage from './pages/LeadsPage'
import ConfigPage from './pages/ConfigPage'
import AssistentePage from './pages/AssistentePage'
import {
  LayoutDashboard, Users, Settings, LogOut, Zap,
  Building2, Car, Anchor, MessageCircle, Plus, X, Phone, User
} from 'lucide-react'
import { supabase } from './services/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = ({ onQuickAdd }: { onQuickAdd: () => void }) => {
  const { signOut, activeSystem, setActiveSystem } = useAuth()

  const products = [
    { name: 'Solara Connect', icon: Building2, color: '#22C55E', value: 'solara_connect' },
    { name: 'Auto Racer', icon: Car, color: '#EF4444', value: 'autoracer' },
    { name: 'Yachts Atlas', icon: Anchor, color: '#C9A84C', value: 'yachts_atlas' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>SQR</h1>
        <span>Vendas Inteligentes</span>
      </div>

      <nav className="sidebar-nav">
        <button 
          onClick={onQuickAdd}
          className="btn-primary" 
          style={{ 
            margin: '0 12px 20px', 
            padding: '12px', 
            fontSize: 14, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8,
            background: 'linear-gradient(135deg, #009C3B, #006266)'
          }}
        >
          <Plus size={18} /> Adição Rápida
        </button>

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
          {products.map((p) => (
            <div 
              key={p.name}
              className={`sidebar-item ${activeSystem === p.name ? 'active' : ''}`} 
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              onClick={() => setActiveSystem(p.name)}
            >
              <p.icon size={20} color={activeSystem === p.name ? p.color : 'rgba(255,255,255,0.4)'} />
              <span style={{ fontSize: 19, fontWeight: 600 }}>{p.name}</span>
            </div>
          ))}
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
  const { user, activeSystem } = useAuth()

  const getSystemColor = () => {
    if (activeSystem === 'Auto Racer') return '#EF4444'
    if (activeSystem === 'Yachts Atlas') return '#C9A84C'
    return '#22C55E'
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <Zap size={24} color="#006266" />
        <span style={{ fontSize: 16, fontWeight: 600, color: '#888' }}>SQR Vendas</span>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <span style={{ 
          fontSize: 20, 
          fontWeight: 800, 
          color: getSystemColor(), 
          letterSpacing: '1px', 
          textTransform: 'uppercase',
          transition: 'all 0.3s'
        }}>
          {activeSystem}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
        <div className="pulse-dot" style={{ background: getSystemColor() }} />
        <span style={{ fontSize: 16, color: getSystemColor(), fontWeight: 600 }}>ONLINE</span>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: '#888' }}>{user?.email}</span>
      </div>
    </header>
  )
}

const AppLayout = () => {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '' })
  const [saving, setSaving] = useState(false)
  const { activeSystem } = useAuth()

  const handleSaveLead = async () => {
    if (!form.nome || !form.telefone) return alert('Preencha nome e telefone')
    setSaving(true)
    
    // Mapeia o nome amigável para o valor do banco
    const systemValue = activeSystem === 'Auto Racer' ? 'autoracer' : 
                        activeSystem === 'Yachts Atlas' ? 'yachts_atlas' : 'solara_connect'

    const { error } = await supabase.from('leads').insert([{
      nome: form.nome,
      telefone: form.telefone.replace(/\D/g, ''),
      produto: systemValue,
      estagio: 'novo',
      ativo: true
    }])

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      // TRIGGER AUTOMÁTICO: Assim que salva, já manda o comando para a IA começar
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        fetch(`${apiUrl}/scheduler/trigger-now`, { method: 'POST' }).catch(e => console.error('Erro trigger:', e))
      } catch (e) {}

      setForm({ nome: '', telefone: '' })
      setShowQuickAdd(false)
      alert(`Lead ${form.nome} adicionado! A Solara já está iniciando a conversa agora...`)
    }
    setSaving(false)
  }

  return (
    <>
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} />
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

      <AnimatePresence>
        {showQuickAdd && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickAdd(false)}
          >
            <motion.div 
              className="modal-box"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 400 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Adição Rápida</h2>
                <button onClick={() => setShowQuickAdd(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px 14px', borderRadius: 10, marginBottom: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>SISTEMA ATIVO:</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{activeSystem}</div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Nome do Lead</label>
                <input 
                  value={form.nome} 
                  onChange={e => setForm({ ...form, nome: e.target.value })} 
                  placeholder="Nome completo ou empresa"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> WhatsApp</label>
                <input 
                  value={form.telefone} 
                  onChange={e => setForm({ ...form, telefone: e.target.value })} 
                  placeholder="55 12 9..."
                />
              </div>

              <button 
                className="btn-primary" 
                onClick={handleSaveLead}
                disabled={saving}
                style={{ marginTop: 10, height: 55 }}
              >
                {saving ? 'Salvando...' : 'Adicionar e Prospectar'}
              </button>

              <p style={{ fontSize: 11, color: '#555', textAlign: 'center', marginTop: 16 }}>
                O lead será salvo como "Novo" e entrará na fila de prospecção automática do {activeSystem}.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

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
