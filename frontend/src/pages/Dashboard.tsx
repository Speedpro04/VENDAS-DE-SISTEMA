import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { Users, TrendingUp, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, DollarSign, Activity } from 'lucide-react'

interface Lead {
  id: string
  nome: string
  telefone: string
  email: string
  produto: string
  segmento: string
  cidade: string
  estagio: string
  canal: string
  ativo: boolean
  created_at: string
}

const estagios = [
  { key: 'novo', label: 'Novos', color: '#888' },
  { key: 'situacao', label: 'Situação', color: '#3B82F6' },
  { key: 'problema', label: 'Problema', color: '#F59E0B' },
  { key: 'implicacao', label: 'Implicação', color: '#EF4444' },
  { key: 'necessidade', label: 'Necessidade', color: '#A855F7' },
  { key: 'proposta', label: 'Proposta', color: '#22C55E' },
  { key: 'fechado', label: 'Fechado ✓', color: '#009C3B' },
  { key: 'perdido', label: 'Perdido ✗', color: '#666' },
]

const productBadge = (p: string) => {
  if (p === 'solara_connect') return <span className="badge badge-solara">Solara</span>
  if (p === 'autoracer') return <span className="badge badge-autoracer">AutoRacer</span>
  if (p === 'yachts_atlas') return <span className="badge badge-yachts">Yachts</span>
  return <span className="badge">{p}</span>
}

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    const { data } = await supabase.from('leads').select('*').eq('ativo', true).order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const getLeadsByStage = (stage: string) => leads.filter((l) => l.estagio === stage)

  const stats = [
    { icon: <Users size={22} />, label: 'Total Leads', value: leads.length, color: '#009C3B' },
    { icon: <MessageSquare size={22} />, label: 'Em Conversa', value: leads.filter((l) => ['situacao', 'problema', 'implicacao', 'necessidade'].includes(l.estagio)).length, color: '#3B82F6' },
    { icon: <Send size={22} />, label: 'Em Proposta', value: leads.filter((l) => l.estagio === 'proposta').length, color: '#A855F7' },
    { icon: <CheckCircle2 size={22} />, label: 'Fechados', value: leads.filter((l) => l.estagio === 'fechado').length, color: '#22C55E' },
    { icon: <XCircle size={22} />, label: 'Perdidos', value: leads.filter((l) => l.estagio === 'perdido').length, color: '#EF4444' },
    { icon: <TrendingUp size={22} />, label: 'Taxa Conversão', value: leads.length > 0 ? Math.round((leads.filter((l) => l.estagio === 'fechado').length / leads.length) * 100) + '%' : '0%', color: '#FFDF00' },
  ]

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Zap size={28} color="#009C3B" />
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Dashboard de Vendas</h1>
        <div className="pulse-dot" style={{ marginLeft: 8 }} />
        <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>SISTEMA ATIVO</span>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* KANBAN BOARD */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={18} /> Funil SPIN Selling
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Carregando leads...</div>
      ) : (
        <div className="kanban-board">
          {estagios.map((est) => (
            <motion.div
              key={est.key}
              className="kanban-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
            >
              <div className="kanban-col-header">
                <h3 style={{ color: est.color }}>{est.label}</h3>
                <span className="count" style={{ color: est.color }}>{getLeadsByStage(est.key).length}</span>
              </div>
              <div style={{ padding: '4px 0', maxHeight: 400, overflowY: 'auto' }}>
                {getLeadsByStage(est.key).map((lead) => (
                  <motion.div
                    key={lead.id}
                    className="kanban-card"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="card-name">{lead.nome}</div>
                    <div className="card-phone">{lead.telefone}</div>
                    <div className="card-product">{productBadge(lead.produto)}</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#666' }}>
                      {lead.canal === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}
                    </div>
                  </motion.div>
                ))}
                {getLeadsByStage(est.key).length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#444', fontSize: 13 }}>Vazio</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
