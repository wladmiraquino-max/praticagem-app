import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { BookText, Send, Bot, User, CheckSquare, Square, Search, ChevronRight, X } from 'lucide-react'
import { C, card } from '../theme'

function PubCard({ pub, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(pub.id)}
      style={{
        ...card({ padding: '10px 14px' }),
        cursor: 'pointer',
        borderColor: selected ? C.accent : C.border,
        background: selected ? C.accentDim : '#111',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        marginBottom: 6,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 2, color: selected ? C.accent : C.textDim }}>
        {selected ? <CheckSquare size={13} /> : <Square size={13} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: selected ? C.accent : C.textPrimary, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{pub.title}</p>
      </div>
    </div>
  )
}

export default function Publications() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [publications, setPublications] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    api.get('/publications/categories').then(r => setCategories(r.data))
    api.get('/publications').then(r => setPublications(r.data))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const filtered = publications.filter(p => {
    const matchCat = activeCategory === 'Todas' || p.category === activeCategory
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const togglePub = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAll = () => setSelectedIds(filtered.map(p => p.id))
  const clearAll = () => setSelectedIds([])

  const send = async () => {
    if (!input.trim() || selectedIds.length === 0) return
    const msg = input.trim()
    setInput('')
    const newH = [...history, { role: 'user', content: msg }]
    setHistory(newH)
    setLoading(true)
    try {
      const r = await api.post('/publications/ask', {
        question: msg,
        pub_ids: selectedIds,
        history: newH.slice(0, -1),
      })
      setHistory([...newH, { role: 'assistant', content: r.data.response }])
    } catch (err) {
      setHistory([...newH, { role: 'assistant', content: err?.response?.data?.detail || 'Erro ao consultar IA.' }])
    } finally {
      setLoading(false)
    }
  }

  const catBtn = (label) => ({
    padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
    background: activeCategory === label ? C.accent : '#1a1a1a',
    color: activeCategory === label ? '#000' : C.textMuted,
    marginRight: 6, marginBottom: 6, flexShrink: 0,
  })

  const shortCat = (cat) => cat?.replace(/^\d+[-–\s]+/, '').replace(/-\d{8}T\d{6}Z.*$/, '').trim() || cat

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* LEFT PANEL – Publications list */}
      <div style={{ width: 300, background: '#0e0e0e', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '16px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BookText size={14} color={C.accent} />
            <p style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700 }}>Publicações</p>
          </div>
          <p style={{ color: C.textDim, fontSize: 11 }}>{publications.length} publicações · {selectedIds.length} selecionadas</p>
        </div>

        {/* Category filter */}
        <div style={{ padding: '10px 12px 4px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap' }}>
          <button style={catBtn('Todas')} onClick={() => setActiveCategory('Todas')}>Todas</button>
          {categories.map(c => (
            <button key={c} style={catBtn(c)} onClick={() => setActiveCategory(c)}>{shortCat(c)}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={12} color={C.textDim} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar publicação..."
            style={{ flex: 1, background: 'none', border: 'none', color: C.textPrimary, fontSize: 12, outline: 'none' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex' }}><X size={11} /></button>}
        </div>

        {/* Select all / clear */}
        <div style={{ padding: '6px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
          <button onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 11, fontWeight: 600, padding: 0 }}>Selecionar todos</button>
          {selectedIds.length > 0 && <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 11, padding: 0 }}>Limpar</button>}
        </div>

        {/* Publications list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: C.textDim, fontSize: 12, textAlign: 'center', marginTop: 20 }}>Nenhuma publicação encontrada</p>
          ) : (
            filtered.map(p => (
              <PubCard key={p.id} pub={p} selected={selectedIds.includes(p.id)} onToggle={togglePub} />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL – Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg }}>

        {/* Header */}
        <div style={{ background: '#0e0e0e', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookText size={16} color={C.accent} />
          </div>
          <div>
            <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>Consulta às Publicações</p>
            <p style={{ color: C.textDim, fontSize: 12 }}>
              {selectedIds.length === 0
                ? 'Selecione publicações ao lado para consultar'
                : `${selectedIds.length} publicação(ões) selecionada(s) como contexto`}
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 12px', color: C.textDim, fontSize: 11, cursor: 'pointer' }}>
              Nova conversa
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <BookText size={36} color={C.textDim} style={{ margin: '0 auto 12px' }} />
              <p style={{ color: C.textMuted, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Consulta baseada em publicações do edital</p>
              <p style={{ color: C.textDim, fontSize: 13, marginBottom: 20 }}>Selecione as publicações ao lado e faça sua pergunta</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  'Quais são os principais conceitos deste material?',
                  'Resuma os pontos mais cobrados em provas',
                  'Gere 3 questões com base nesta publicação',
                  'Explique a diferença entre os itens principais',
                ].map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>
                    {s}
                  </button>
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
              <div style={{ maxWidth: '75%', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', background: msg.role === 'user' ? C.accent : '#1a1a1a', border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none' }}>
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
                {[0, 150, 300].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: C.textDim, animation: 'bounce 1s infinite', animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: '#0e0e0e', borderTop: `1px solid ${C.border}`, padding: '14px 20px' }}>
          {selectedIds.length === 0 && (
            <p style={{ color: '#f59e0b', fontSize: 11, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronRight size={11} /> Selecione ao menos uma publicação ao lado antes de consultar
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={selectedIds.length === 0 ? 'Selecione publicações para consultar...' : 'Consultar sobre as publicações selecionadas...'}
              disabled={selectedIds.length === 0}
              style={{ flex: 1, padding: '11px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 14, outline: 'none', opacity: selectedIds.length === 0 ? 0.5 : 1 }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim() || selectedIds.length === 0}
              style={{ padding: '11px 16px', background: input.trim() && selectedIds.length > 0 ? C.accent : '#1a1a1a', color: input.trim() && selectedIds.length > 0 ? '#000' : C.textDim, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
