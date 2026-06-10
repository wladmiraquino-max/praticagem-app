import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Send, Bot, User, Zap, ChevronRight } from 'lucide-react'
import { C, card } from '../theme'

const AGENT_COLORS = {
  'I':   '#ef4444',
  'II':  '#f97316',
  'III': '#eab308',
  'IV':  '#22c55e',
  'V':   '#3b82f6',
  'VI':  '#8b5cf6',
  'VII': '#ec4899',
}

export default function Tutor() {
  const [agents, setAgents]       = useState([])
  const [active, setActive]       = useState(null)
  const [history, setHistory]     = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [hubMode, setHubMode]     = useState(false)
  const [lastRoute, setLastRoute] = useState(null)
  const bottomRef = useRef()

  useEffect(() => {
    api.get('/tutor/agents').then(r => { setAgents(r.data); if (r.data.length > 0) setActive(r.data[0]) })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history])

  const send = async () => {
    if (!input.trim()) return
    if (!hubMode && !active) return
    const msg = input.trim(); setInput('')
    const newH = [...history, { role: 'user', content: msg }]
    setHistory(newH); setLoading(true)
    try {
      if (hubMode) {
        const r = await api.post('/tutor/hub', { message: msg, history: newH.slice(0, -1) })
        setLastRoute({ agent_id: r.data.agent_id, agent_name: r.data.agent_name, rationale: r.data.rationale })
        setHistory([...newH, { role: 'assistant', content: r.data.response, routed_to: r.data.agent_id, routed_name: r.data.agent_name }])
      } else {
        const r = await api.post('/tutor/chat', { agent_id: active.id, message: msg, history: newH.slice(0, -1) })
        setHistory([...newH, { role: 'assistant', content: r.data.response }])
      }
    } finally { setLoading(false) }
  }

  const switchMode = (hub) => {
    setHubMode(hub)
    setHistory([])
    setLastRoute(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#0e0e0e', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>

        {/* Mode toggle */}
        <div style={{ padding: '12px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 8, padding: 3, gap: 2 }}>
            <button onClick={() => switchMode(false)}
              style={{ flex: 1, padding: '6px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: !hubMode ? C.accent : 'transparent', color: !hubMode ? '#000' : C.textDim, transition: 'all 0.2s' }}>
              Direto
            </button>
            <button onClick={() => switchMode(true)}
              style={{ flex: 1, padding: '6px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: hubMode ? '#a855f7' : 'transparent', color: hubMode ? '#fff' : C.textDim, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Zap size={10} /> HUB
            </button>
          </div>
        </div>

        {/* Agents list */}
        <div style={{ padding: '8px 8px 6px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ color: C.textDim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 6px' }}>
            {hubMode ? 'Agentes (automático)' : 'Agentes Especialistas'}
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {agents.map(a => {
            const color = AGENT_COLORS[a.id] || C.accent
            const isActive = !hubMode && active?.id === a.id
            const isRoutedTo = hubMode && lastRoute?.agent_id === a.id
            return (
              <button key={a.id}
                onClick={() => { if (!hubMode) { setActive(a); setHistory([]) } }}
                style={{
                  width: '100%', textAlign: 'left', padding: '7px 10px',
                  borderRadius: 7, border: 'none', cursor: hubMode ? 'default' : 'pointer',
                  background: isActive ? `${color}22` : isRoutedTo ? '#a855f722' : 'transparent',
                  color: isActive ? color : isRoutedTo ? '#a855f7' : C.textMuted,
                  fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 1,
                  transition: 'all 0.2s',
                }}>
                <span style={{
                  color: isActive ? color : isRoutedTo ? '#a855f7' : C.textDim,
                  fontSize: 9, fontWeight: 800, minWidth: 18, background: isActive ? `${color}33` : isRoutedTo ? '#a855f733' : '#1a1a1a',
                  borderRadius: 4, padding: '2px 4px', textAlign: 'center',
                }}>{a.id}</span>
                <span style={{ lineHeight: 1.3 }}>{a.name}</span>
                {isRoutedTo && <ChevronRight size={10} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>

        {hubMode && (
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}` }}>
            <p style={{ color: C.textDim, fontSize: 10, lineHeight: 1.5 }}>
              HUB MODE: o roteador analisa sua pergunta e direciona ao agente oficial correto.
            </p>
          </div>
        )}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg }}>

        {/* Header */}
        <div style={{ background: '#0e0e0e', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: hubMode ? '#a855f722' : C.accentDim, border: `1px solid ${hubMode ? '#a855f7' : C.accentBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hubMode ? <Zap size={16} color="#a855f7" /> : <Bot size={16} color={C.accent} />}
          </div>
          <div>
            {hubMode ? (
              <>
                <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>
                  HUB ADMINISTRADOR PSCPP
                  {lastRoute && (
                    <span style={{ marginLeft: 10, fontSize: 11, color: AGENT_COLORS[lastRoute.agent_id] || '#a855f7', background: `${AGENT_COLORS[lastRoute.agent_id] || '#a855f7'}22`, borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                      → Agente {lastRoute.agent_id}
                    </span>
                  )}
                </p>
                <p style={{ color: C.textDim, fontSize: 12 }}>
                  {lastRoute ? `${lastRoute.agent_name} — ${lastRoute.rationale}` : 'Roteamento automático por disciplina'}
                </p>
              </>
            ) : (
              <>
                <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>{active?.name || 'Selecione um agente'}</p>
                <p style={{ color: C.textDim, fontSize: 12 }}>{active?.subject}</p>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              {hubMode ? (
                <>
                  <Zap size={36} color="#a855f7" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: C.textDim, fontSize: 13, marginBottom: 8 }}>Pergunte qualquer coisa do edital</p>
                  <p style={{ color: C.textDim, fontSize: 12, marginBottom: 16 }}>O HUB identifica o agente e responde pela disciplina correta</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['O que é squat e qual o risco para praticagem?', 'Explique o GMDSS e seus componentes', 'Como funciona o efeito de banco?'].map(s => (
                      <button key={s} onClick={() => setInput(s)} style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Bot size={36} color={C.textDim} style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>Pergunte sobre {active?.subject || 'qualquer tema do concurso'}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Explique os critérios IMO para manobras', 'Gere 3 questões de múltipla escolha', 'Crie um mnemônico para memorizar'].map(s => (
                      <button key={s} onClick={() => setInput(s)} style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && msg.routed_to && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 40, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: AGENT_COLORS[msg.routed_to] || '#a855f7', background: `${AGENT_COLORS[msg.routed_to] || '#a855f7'}22`, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                    Agente {msg.routed_to} — {msg.routed_name}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 30, height: 30, background: msg.routed_to ? `${AGENT_COLORS[msg.routed_to] || '#a855f7'}22` : C.accentDim, border: `1px solid ${msg.routed_to ? AGENT_COLORS[msg.routed_to] || '#a855f7' : C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {msg.routed_to ? <Zap size={12} color={AGENT_COLORS[msg.routed_to] || '#a855f7'} /> : <Bot size={13} color={C.accent} />}
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
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: hubMode ? '#a855f722' : C.accentDim, border: `1px solid ${hubMode ? '#a855f7' : C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hubMode ? <Zap size={12} color="#a855f7" /> : <Bot size={13} color={C.accent} />}
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
            placeholder={hubMode ? 'Pergunte qualquer coisa — o HUB direciona ao agente correto...' : `Perguntar ao ${active?.name || 'agente'}...`}
            style={{ flex: 1, padding: '11px 16px', background: '#111', border: `1px solid ${input.trim() ? (hubMode ? '#a855f7' : C.accentBorder) : C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} />
          <button onClick={send} disabled={loading || !input.trim() || (!hubMode && !active)}
            style={{ padding: '11px 16px', background: input.trim() ? (hubMode ? '#a855f7' : C.accent) : '#1a1a1a', color: input.trim() ? (hubMode ? '#fff' : '#000') : C.textDim, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
