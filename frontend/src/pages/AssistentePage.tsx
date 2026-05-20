import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Bot, Loader2, Send, Sparkles } from 'lucide-react'
import { getApiUrl } from '../services/api'

type Publico = 'interno' | 'cliente'
type Produto = 'all' | 'solara_connect' | 'autoracer' | 'yachts_atlas'

interface Message {
  role: 'user' | 'assistant'
  text: string
  sources?: { product: string; source: string }[]
}



const AssistentePage = () => {
  const [pergunta, setPergunta] = useState('')
  const [produto, setProduto] = useState<Produto>('solara_connect')
  const [publico, setPublico] = useState<Publico>('cliente')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Assistente Solara pronto. Pergunte sobre faltas, confirmacoes, reengajamento e abordagem comercial para contratantes.',
    },
  ])

  const placeholder = useMemo(() => {
    if (publico === 'cliente') return 'Ex: Como o Solara Connect reduz faltas na agenda?'
    return 'Ex: Monte um roteiro interno para recuperar pacientes inativos.'
  }, [publico])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = pergunta.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setPergunta('')
    setLoading(true)

    try {
      const res = await fetch(`${getApiUrl()}/assistente/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: text, produto, publico }),
      })

      if (!res.ok) {
        throw new Error('Falha ao consultar assistente')
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'Sem resposta no momento.',
          sources: data.sources || [],
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Nao consegui responder agora. Verifique se o backend esta no ar e tente novamente.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="assistant-header">
        <div>
          <h1><Sparkles size={24} /> Tira-Duvidas IA dos 3 SaaS</h1>
          <p>Use para atendimento interno e conversa com clientes contratantes.</p>
        </div>

        <div className="assistant-filters">
          <select value={produto} onChange={(e) => setProduto(e.target.value as Produto)}>
            <option value="all">Todos os produtos</option>
            <option value="solara_connect">Solara Connect</option>
            <option value="autoracer">AutoRacer</option>
            <option value="yachts_atlas">Yachts Atlas</option>
          </select>

          <select value={publico} onChange={(e) => setPublico(e.target.value as Publico)}>
            <option value="interno">Modo interno</option>
            <option value="cliente">Modo cliente contratante</option>
          </select>
        </div>
      </div>

      <div className="assistant-chat-box">
        <div className="assistant-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`msg ${m.role}`}>
              <div className="msg-meta">
                {m.role === 'assistant' ? <Bot size={14} /> : null}
                <span>{m.role === 'assistant' ? 'Assistente SQR' : 'Voce'}</span>
              </div>
              <div className="msg-text">{m.text}</div>
              {m.sources && m.sources.length > 0 ? (
                <div className="msg-sources">
                  Fontes: {m.sources.map((s) => `${s.product} (${s.source})`).join(' | ')}
                </div>
              ) : null}
            </div>
          ))}
          {loading ? (
            <div className="msg assistant">
              <div className="msg-meta"><Loader2 size={14} className="spin" /> <span>Assistente SQR</span></div>
              <div className="msg-text">Pensando na melhor resposta...</div>
            </div>
          ) : null}
        </div>

        <form onSubmit={submit} className="assistant-input">
          <input
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder={placeholder}
          />
          <button type="submit" disabled={loading || !pergunta.trim()}>
            <Send size={16} /> Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

export default AssistentePage
