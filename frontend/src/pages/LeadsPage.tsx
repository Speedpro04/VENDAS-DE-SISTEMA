import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabase'
import {
  Plus, Search, Upload, Send, MapPin, Trash2, Eye,
  Building2, Car, Anchor, X, Sparkles, RefreshCw
} from 'lucide-react'

interface Lead {
  id: string; nome: string; telefone: string; email: string; produto: string
  segmento: string; cidade: string; estagio: string; canal: string
  ativo: boolean; created_at: string; observacoes: string
}

const produtos = [
  { value: 'solara_connect', label: 'Solara Connect', icon: <Building2 size={16} />, color: '#22C55E' },
  { value: 'autoracer', label: 'Auto Racer', icon: <Car size={16} />, color: '#EF4444' },
  { value: 'yachts_atlas', label: 'Yachts Atlas', icon: <Anchor size={16} />, color: '#C9A84C' },
]

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProduto, setFilterProduto] = useState('')
  const [filterEstagio, setFilterEstagio] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGmapsModal, setShowGmapsModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingChat, setLoadingChat] = useState(false)

  // New lead form
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '', produto: 'solara_connect',
    segmento: '', cidade: '', canal: 'whatsapp', observacoes: '',
  })

  // Google Maps scraper form
  const [gmapsQuery, setGmapsQuery] = useState('')
  const [gmapsCity, setGmapsCity] = useState('')
  const [gmapsProduct, setGmapsProduct] = useState('solara_connect')
  const [gmapsScraping, setGmapsScraping] = useState(false)
  const [gmapsResults, setGmapsResults] = useState<any[]>([])

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const addLead = async () => {
    if (!form.nome || (!form.telefone && !form.email)) return
    const tel = form.telefone.replace(/\D/g, '')
    await supabase.from('leads').insert([{ ...form, telefone: tel, estagio: 'novo', ativo: true }])
    setShowAddModal(false)
    setForm({ nome: '', telefone: '', email: '', produto: 'solara_connect', segmento: '', cidade: '', canal: 'whatsapp', observacoes: '' })
    fetchLeads()
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Remover este lead?')) return
    await supabase.from('leads').delete().eq('id', id)
    fetchLeads()
  }

  const dispararLead = async (lead: Lead) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/scheduler/trigger-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        alert(`Disparo iniciado para ${lead.nome}`)
      } else {
        alert('Erro ao disparar. Verifique o backend.')
      }
    } catch (err) {
      alert('Erro de conexão.')
    }
  }

  const dispararTodos = async () => {
    const novos = leads.filter(l => l.estagio === 'novo')
    if (novos.length === 0) return alert('Nenhum lead novo para disparar')
    if (!confirm(`Disparar para ${novos.length} leads novos?`)) return
    alert(`Disparo em lote iniciado para ${novos.length} leads`)
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const _header = lines[0].toLowerCase()
    console.log('Importing CSV with header:', _header)
    const rows = lines.slice(1)
    let imported = 0
    for (const row of rows) {
      const cols = row.split(',').map(c => c.trim())
      if (cols.length >= 2) {
        await supabase.from('leads').insert([{
          nome: cols[0], telefone: cols[1]?.replace(/\D/g, ''),
          email: cols[2] || '', produto: cols[3] || 'solara_connect',
          segmento: cols[4] || '', cidade: cols[5] || '',
          canal: 'whatsapp', estagio: 'novo', ativo: true,
        }])
        imported++
      }
    }
    alert(`${imported} leads importados!`)
    setShowImportModal(false)
    fetchLeads()
  }

  const captarGoogleMaps = async () => {
    if (!gmapsQuery || !gmapsCity) return
    setGmapsScraping(true)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/outscraper/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${gmapsQuery} em ${gmapsCity}`,
          limit: 20,
          produto: gmapsProduct
        })
      })
      
      if (response.ok) {
        alert('Processo de captação iniciado em segundo plano! Os leads aparecerão na tabela em alguns instantes.')
        setShowGmapsModal(false)
      } else {
        alert('Erro ao iniciar captação. Verifique se o backend está rodando.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão com o servidor.')
    } finally {
      setGmapsScraping(false)
    }
  }

  const importGmapsResults = async () => {
    for (const r of gmapsResults) {
      await supabase.from('leads').insert([{
        nome: r.nome, telefone: r.telefone, email: '',
        produto: gmapsProduct, segmento: gmapsQuery, cidade: r.cidade,
        canal: 'whatsapp', estagio: 'novo', ativo: true,
      }])
    }
    alert(`${gmapsResults.length} leads importados do Google Maps!`)
    setGmapsResults([])
    setShowGmapsModal(false)
    fetchLeads()
  }

  const openChat = async (lead: Lead) => {
    setSelectedLead(lead)
    setShowChatModal(true)
    setLoadingChat(true)
    const { data } = await supabase.from('mensagens').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true })
    setMessages(data || [])
    setLoadingChat(false)
  }

  const filtered = leads.filter(l => {
    const matchSearch = l.nome.toLowerCase().includes(search.toLowerCase()) || l.telefone.includes(search)
    const matchProd = !filterProduto || l.produto === filterProduto
    const matchEst = !filterEstagio || l.estagio === filterEstagio
    return matchSearch && matchProd && matchEst
  })

  const getBadgeClass = (p: string) => {
    if (p === 'solara_connect') return 'badge badge-solara'
    if (p === 'autoracer') return 'badge badge-autoracer'
    if (p === 'yachts_atlas') return 'badge badge-yachts'
    return 'badge'
  }

  const getStageBadge = (e: string) => `badge badge-${e}`

  return (
    <div className="page-content">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Leads</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setShowGmapsModal(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #4285F4, #1a5cd0)' }}>
            <MapPin size={16} /> Captar Google Maps
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            <Upload size={16} /> Importar CSV
          </button>
          <button onClick={dispararTodos} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
            <Send size={16} /> Disparar Novos
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Novo Lead
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome ou telefone..."
            style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'Montserrat' }}
          />
        </div>
        <select value={filterProduto} onChange={e => setFilterProduto(e.target.value)}
          style={{ padding: '12px 16px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'Montserrat' }}>
          <option value="">Todos Produtos</option>
          {produtos.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={filterEstagio} onChange={e => setFilterEstagio(e.target.value)}
          style={{ padding: '12px 16px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'Montserrat' }}>
          <option value="">Todos Estágios</option>
          <option value="novo">Novo</option>
          <option value="situacao">Situação</option>
          <option value="problema">Problema</option>
          <option value="implicacao">Implicação</option>
          <option value="necessidade">Necessidade</option>
          <option value="proposta">Proposta</option>
          <option value="fechado">Fechado</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ background: '#1A1A1A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th><th>Contato</th><th>Produto</th><th>Estágio</th><th>Canal</th><th>Cidade</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td style={{ fontWeight: 700 }}>{lead.nome}</td>
                <td>
                  <div style={{ fontSize: 13 }}>{lead.telefone && <span>📱 {lead.telefone}</span>}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{lead.email && <span>📧 {lead.email}</span>}</div>
                </td>
                <td><span className={getBadgeClass(lead.produto)}>{lead.produto === 'solara_connect' ? 'Solara' : lead.produto === 'autoracer' ? 'AutoRacer' : 'Yachts'}</span></td>
                <td><span className={getStageBadge(lead.estagio)}>{lead.estagio}</span></td>
                <td style={{ fontSize: 13 }}>{lead.canal === 'whatsapp' ? '📱 WA' : '📧 Email'}</td>
                <td style={{ fontSize: 13, color: '#888' }}>{lead.cidade || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openChat(lead)} title="Ver Conversa" style={{ background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#3B82F6' }}><Eye size={14} /></button>
                    <button onClick={() => dispararLead(lead)} title="Disparar" style={{ background: 'rgba(0,156,59,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#22C55E' }}><Send size={14} /></button>
                    <button onClick={() => deleteLead(lead.id)} title="Remover" style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            {loading ? 'Carregando...' : 'Nenhum lead encontrado'}
          </div>
        )}
      </div>

      {/* MODAL — ADD LEAD */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Novo Lead</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div className="form-group"><label>Nome *</label><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do contato" /></div>
              <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="5512999999999" /></div>
              <div className="form-group"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" /></div>
              <div className="form-group">
                <label>Produto</label>
                <select value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 16, fontFamily: 'Montserrat' }}>
                  {produtos.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Canal</label>
                <select value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })} style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 16, fontFamily: 'Montserrat' }}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="form-group"><label>Segmento</label><input value={form.segmento} onChange={e => setForm({ ...form, segmento: e.target.value })} placeholder="Ex: clínica estética" /></div>
              <div className="form-group"><label>Cidade</label><input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Ex: São José dos Campos" /></div>
              <button className="btn-primary" onClick={addLead} style={{ marginTop: 8 }}>Cadastrar Lead</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — GOOGLE MAPS */}
      <AnimatePresence>
        {showGmapsModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGmapsModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={22} color="#4285F4" /> Captar do Google Maps</h2>
                <button onClick={() => setShowGmapsModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div className="form-group"><label>Buscar (ex: "clínica estética", "revendedora de veículos")</label><input value={gmapsQuery} onChange={e => setGmapsQuery(e.target.value)} placeholder="Tipo de negócio" /></div>
              <div className="form-group"><label>Cidade</label><input value={gmapsCity} onChange={e => setGmapsCity(e.target.value)} placeholder="Ex: São José dos Campos" /></div>
              <div className="form-group">
                <label>Produto para vincular</label>
                <select value={gmapsProduct} onChange={e => setGmapsProduct(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 16, fontFamily: 'Montserrat' }}>
                  {produtos.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={captarGoogleMaps} style={{ marginBottom: 16, background: 'linear-gradient(135deg, #4285F4, #1a5cd0)' }}>
                {gmapsScraping ? <><RefreshCw size={16} className="animate-spin" /> Buscando...</> : <><Globe size={16} /> Buscar Leads</>}
              </button>
              {gmapsResults.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#22C55E' }}>✓ {gmapsResults.length} resultados encontrados</h3>
                  {gmapsResults.map((r, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: '#222', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <strong>{r.nome}</strong> — {r.telefone} — {r.cidade}
                    </div>
                  ))}
                  <button className="btn-primary" onClick={importGmapsResults} style={{ marginTop: 12 }}>
                    <Sparkles size={16} /> Importar Todos para Leads
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — CSV */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowImportModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2><Upload size={22} /> Importar CSV</h2>
                <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Formato: nome, telefone, email, produto, segmento, cidade</p>
              <input type="file" accept=".csv" onChange={handleCSVImport} style={{ color: '#fff' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — CHAT HISTORY */}
      <AnimatePresence>
        {showChatModal && selectedLead && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChatModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>Histórico: {selectedLead.nome}</h2>
                  <span className={getBadgeClass(selectedLead.produto)}>{selectedLead.produto}</span>
                </div>
                <button onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ background: '#111', borderRadius: 12, padding: 16, height: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                {loadingChat ? (
                  <div style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>Carregando histórico...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>Nenhuma mensagem trocada ainda.</div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.direcao === 'saida' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: m.direcao === 'saida' ? '14px 14px 0 14px' : '14px 14px 14px 0',
                      background: m.direcao === 'saida' ? '#009C3B' : '#222',
                      color: '#fff',
                      fontSize: 14,
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                        {m.direcao === 'saida' ? 'SQR CONSULTOR' : 'LEAD'} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {m.conteudo}
                      {m.estagio_spin && (
                        <div style={{ fontSize: 9, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4, marginTop: 6, display: 'inline-block' }}>
                          Estágio: {m.estagio_spin}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => dispararLead(selectedLead)} style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}>
                  Disparar Próxima Etapa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LeadsPage
