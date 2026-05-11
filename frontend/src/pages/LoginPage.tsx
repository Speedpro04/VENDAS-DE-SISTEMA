import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ShieldCheck, Car, Anchor, Building2, ArrowRight, Sparkles } from 'lucide-react'

const salesMessages = [
  {
    tag: 'SOLARA CONNECT',
    icon: <Building2 size={18} />,
    text: '"Sua clínica atendendo 24h no WhatsApp, recuperando pacientes que sumiram e eliminando no-shows."',
    color: '#22C55E',
  },
  {
    tag: 'AUTO RACER SHOP',
    icon: <Car size={18} />,
    text: '"Seu estoque inteiro com vídeo curto, alcançando compradores do Vale do Paraíba que estão prontos para fechar."',
    color: '#EF4444',
  },
  {
    tag: 'YACHTS ATLAS',
    icon: <Anchor size={18} />,
    text: '"Cofre digital de ativos de alto valor. Dossiê completo, monitoramento e auditoria em tempo real."',
    color: '#C9A84C',
  },
]

const LoginPage = () => {
  const { quickAccess } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [activeMsg, setActiveMsg] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMsg((prev) => (prev + 1) % salesMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const navigate = useNavigate()

  const handleQuickAccess = () => {
    setLoading(true)
    quickAccess()
    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      {/* LEFT SIDE — LOGIN FORM */}
      <div className="login-form-side">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Zap size={32} color="#006266" />
            <h2 style={{ fontSize: 32 }}>SQR Vendas</h2>
          </div>
          <p style={{ fontSize: 19, fontWeight: 600, color: '#aaa', marginBottom: 12 }}>Sistema Inteligente de Qualificação e Relacionamento</p>
          <div style={{ padding: '16px 24px', background: 'rgba(0, 98, 102, 0.1)', borderLeft: '4px solid #006266', borderRadius: '0 8px 8px 0', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 19, fontWeight: 600, color: '#22C55E' }}>"O sucesso de hoje é o resultado das conexões que você cria. Bom trabalho!"</p>
          </div>

          <div style={{ marginTop: 40 }}>
            <button 
              className="btn-primary" 
              onClick={handleQuickAccess} 
              disabled={loading}
              style={{ 
                height: 75, 
                fontSize: 19,
                fontWeight: 600,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12,
                boxShadow: '0 10px 30px rgba(0, 156, 59, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles size={24} />
                  </motion.span>
                  Autenticando...
                </>
              ) : (
                <>
                  Acessar Painel SQR
                  <ArrowRight size={24} />
                </>
              )}
            </button>
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#EF4444',
                  fontSize: 19,
                  fontWeight: 600,
                  marginTop: 20,
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: 32, color: '#555', fontSize: 19, fontWeight: 600, letterSpacing: 1 }}>
              ACESSO EXCLUSIVO ADMINISTRADOR
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {salesMessages.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i === activeMsg ? '#009C3B' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE — SALES MESSAGES */}
      <div className="login-messages-side">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 2 }}
        >
          <ShieldCheck size={48} color="#FFDF00" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Venda no Piloto Automático
          </h2>
          <p style={{ fontSize: 19, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            A inteligência artificial trabalhando por você 24 horas por dia.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 320, margin: '0 auto' }}>
            Cadastre leads, ative campanhas e deixe a IA fechar negócios por você.
          </p>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMsg}
              className="msg-float"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              style={{ animation: 'none', margin: '0 auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: salesMessages[activeMsg].color }}>
                  {salesMessages[activeMsg].icon}
                </span>
                <span className="msg-tag">{salesMessages[activeMsg].tag}</span>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6 }}>{salesMessages[activeMsg].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ marginTop: 60, display: 'flex', gap: 24, position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFDF00' }}>3</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Produtos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFDF00' }}>AI</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>DeepSeek</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFDF00' }}>24/7</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Automático</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
