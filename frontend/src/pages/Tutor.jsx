import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Send, Bot, User, ChevronDown } from 'lucide-react'
import { C, card } from '../theme'

export default function Tutor() {
  const [agents, setAgents] = useState([])
  const [active, setActive] = useState(null)
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAgents, setShowAgents] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    api.get('/tutor/agents').then(r => { setAgents(r.data); if (r.data.length > 0) setActive(r.data[0]) })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history])

  const send = async () => {
    if (!input.trim() || !active) return
    const msg = input.trim(); setInput('')
    const newH = [...history, { role: 'user', content: msg }]
    setHistory(newH); setLoading(true)
    try {
      const r = await api.post('/tutor/chat', { agent_id: active.id, message: msg, history: newH.slice(0, -1) })
      setHistory([...newH, { role: 'assistant', content: r.data.response }])
    } finally { setLoading(false) }
  }

  const suggestions = ['Explique os critérios IMO para manobras', 'Gere 3 questões de múltipla escolha', 'Crie um mnemônico para memorizar']

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar de agentes */}
      <div style={{ width: 220, background: '#0e0e0e', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600 }}>Agentes Especialistas</p>
          <p style={{ color: C.textDim, fontSize: 11, marginTop: 2 }}>7 agentes oficiais PSCPP</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {agents.map(a => (
            <button key={a.id} onClick={() => { setActive(a); setHistory([]) }}
              style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: active?.id === a.id ? C.accentDim : 'transparent', color: active?.id === a.id ? C.accent : C.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <span style={{ color: C.textDim, fontSize: 10, fontWeight: 700, minWidth: 16 }}>#{a.id}</span>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg }}>
        {/* Header */}
        <div style={{ background: '#0e0e0e', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={16} color={C.accent} />
          </div>
          <div>
            <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>{active?.name || 'Selecione um agente'}</p>
            <p style={{ color: C.textDim, fontSize: 12 }}>{active?.subject}</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <Bot size={36} color={C.textDim} style={{ margin: '0 auto 12px' }} />
              <p style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>Pergunte sobre {active?.subject || 'qualquer tema do concurso'}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 30, height: 30, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Bot size={13} color={C.accent} />
                </div>
              )}
              <div style={{ maxWidth: '72%', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', background: msg.role === 'user' ? C.accent : '#1a1a1a', border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none' }}>
                <p style={{ color: msg.role === 'user' ? '#000' : C.textSecondary, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 30, height: 30, background: '#222', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <User size={13} color={C.textMuted} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} color={C.accent} />
              </div>
              <div style={{ background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: '14px 14px 14px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,150,300].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: C.textDim, animation: 'bounce 1s infinite', animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: '#0e0e0e', borderTop: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={`Perguntar ao ${active?.name || 'agente'}...`}
            style={{ flex: 1, padding: '11px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 14, outline: 'none' }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '11px 16px', background: input.trim() ? C.accent : '#1a1a1a', color: input.trim() ? '#000' : C.textDim, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
