import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, MessageSquare, Clock, Save, CheckCircle2, Mail, Zap } from 'lucide-react'

const ConfigPage = () => {
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    evolution_url: '',
    evolution_key: '',
    evolution_instance: '',
    ai_base_url: 'https://integrate.api.nvidia.com/v1',
    ai_api_key: '',
    ai_model: 'deepseek-ai/deepseek-v4-flash',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    webhook_url: '',
    intervalo_min: '24',
    max_tentativas: '3',
    produto_padrao: 'solara_connect',
    horario_inicio: '08:00',
    horario_fim: '20:00',
  })

  const handleSave = () => {
    localStorage.setItem('sqr_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: '#111',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    color: '#fff', fontSize: 14, fontFamily: 'Montserrat',
  }

  const selectStyle: React.CSSProperties = { ...inputStyle }

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 20 }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {children}
      </div>
    </motion.div>
  )

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={28} /> Configurações
        </h1>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar</>}
        </button>
      </div>

      <Section icon={<MessageSquare size={20} color="#22C55E" />} title="WhatsApp — Evolution API">
        <div className="form-group"><label>URL da API</label><input style={inputStyle} value={config.evolution_url} onChange={e => setConfig({ ...config, evolution_url: e.target.value })} placeholder="https://evo.seudominio.com" /></div>
        <div className="form-group"><label>API Key</label><input style={inputStyle} value={config.evolution_key} onChange={e => setConfig({ ...config, evolution_key: e.target.value })} placeholder="Sua chave da Evolution" /></div>
        <div className="form-group"><label>Nome da Instância</label><input style={inputStyle} value={config.evolution_instance} onChange={e => setConfig({ ...config, evolution_instance: e.target.value })} placeholder="Ativo_Hub" /></div>
        <div className="form-group"><label>Webhook URL (copie e cole na Evolution)</label><input style={inputStyle} value={config.webhook_url} onChange={e => setConfig({ ...config, webhook_url: e.target.value })} placeholder="https://api.seudominio.com/webhook/whatsapp" /></div>
      </Section>

      <Section icon={<Mail size={20} color="#3B82F6" />} title="Email — SMTP">
        <div className="form-group"><label>Host SMTP</label><input style={inputStyle} value={config.smtp_host} onChange={e => setConfig({ ...config, smtp_host: e.target.value })} placeholder="smtp.hostinger.com" /></div>
        <div className="form-group"><label>Porta</label><input style={inputStyle} value={config.smtp_port} onChange={e => setConfig({ ...config, smtp_port: e.target.value })} /></div>
        <div className="form-group"><label>Usuário</label><input style={inputStyle} value={config.smtp_user} onChange={e => setConfig({ ...config, smtp_user: e.target.value })} placeholder="vendas@seudominio.com" /></div>
        <div className="form-group"><label>Senha</label><input style={inputStyle} type="password" value={config.smtp_pass} onChange={e => setConfig({ ...config, smtp_pass: e.target.value })} /></div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Remetente (From)</label><input style={inputStyle} value={config.smtp_from} onChange={e => setConfig({ ...config, smtp_from: e.target.value })} placeholder="Equipe SQR Vendas <vendas@seudominio.com>" /></div>
      </Section>

      <Section icon={<Zap size={20} color="#C9A84C" />} title="Inteligência Artificial — DeepSeek">
        <div className="form-group"><label>Base URL</label><input style={inputStyle} value={config.ai_base_url} onChange={e => setConfig({ ...config, ai_base_url: e.target.value })} /></div>
        <div className="form-group"><label>API Key</label><input style={inputStyle} value={config.ai_api_key} onChange={e => setConfig({ ...config, ai_api_key: e.target.value })} placeholder="nvapi-..." /></div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Modelo</label><input style={inputStyle} value={config.ai_model} onChange={e => setConfig({ ...config, ai_model: e.target.value })} /></div>
      </Section>

      <Section icon={<Clock size={20} color="#F59E0B" />} title="Scheduler — Automação">
        <div className="form-group"><label>Intervalo Mínimo entre Mensagens (horas)</label><input style={inputStyle} type="number" value={config.intervalo_min} onChange={e => setConfig({ ...config, intervalo_min: e.target.value })} /></div>
        <div className="form-group"><label>Máx. Tentativas sem Resposta</label><input style={inputStyle} type="number" value={config.max_tentativas} onChange={e => setConfig({ ...config, max_tentativas: e.target.value })} /></div>
        <div className="form-group"><label>Horário Início Disparos</label><input style={inputStyle} type="time" value={config.horario_inicio} onChange={e => setConfig({ ...config, horario_inicio: e.target.value })} /></div>
        <div className="form-group"><label>Horário Fim Disparos</label><input style={inputStyle} type="time" value={config.horario_fim} onChange={e => setConfig({ ...config, horario_fim: e.target.value })} /></div>
        <div className="form-group">
          <label>Produto Padrão</label>
          <select style={selectStyle} value={config.produto_padrao} onChange={e => setConfig({ ...config, produto_padrao: e.target.value })}>
            <option value="solara_connect">Solara Connect</option>
            <option value="autoracer">Auto Racer</option>
            <option value="yachts_atlas">Yachts Atlas</option>
          </select>
        </div>
      </Section>
    </div>
  )
}

export default ConfigPage
