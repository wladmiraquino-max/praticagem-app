import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Upload, Cpu, Trash2, Sparkles, X, BookMarked, ChevronRight, CheckCircle } from 'lucide-react'
import { C, card } from '../theme'

const SUBJECTS = [
  'Arte Naval','Manobrabilidade do Navio','Legislação Marítima',
  'Navegação e Radar','Meteorologia e Oceanografia','Comunicações','Conhecimentos Gerais'
]

function BookDetail({ book, onClose, onGenerate }) {
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('extract') // 'extract' | 'generate'

  const extract = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await api.post(`/question-books/${book.id}/extract`)
      setResult(r.data); onGenerate()
    } catch (err) {
      setResult({ error: err?.response?.data?.detail || 'Erro ao extrair questões' })
    } finally { setLoading(false) }
  }

  const generate = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await api.post(`/question-books/${book.id}/generate?count=${count}`)
      setResult(r.data); onGenerate()
    } catch (err) {
      setResult({ error: err?.response?.data?.detail || 'Erro ao gerar questões' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ color: C.textPrimary, fontWeight: 700, fontSize: 15 }}>{book.title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {book.subject && <span style={{ background: C.accentDim, color: C.accent, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, width: 'fit-content' }}>{book.subject}</span>}

          <div style={{ background: '#0a0a0a', border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>Questões salvas deste caderno</p>
            <p style={{ color: C.accent, fontSize: 28, fontWeight: 700 }}>{book.questions_generated}</p>
          </div>

          {/* Seletor de modo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => setMode('extract')}
              style={{ padding: '12px', background: mode === 'extract' ? C.accentDim : '#1a1a1a', color: mode === 'extract' ? C.accent : C.textMuted, border: `1px solid ${mode === 'extract' ? C.accent : C.border}`, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
              Importar questoes exatas
              <p style={{ fontSize: 10, fontWeight: 400, marginTop: 3, color: mode === 'extract' ? C.accent : C.textDim }}>Extrai as questoes e gabaritos do BZ</p>
            </button>
            <button onClick={() => setMode('generate')}
              style={{ padding: '12px', background: mode === 'generate' ? C.accentDim : '#1a1a1a', color: mode === 'generate' ? C.accent : C.textMuted, border: `1px solid ${mode === 'generate' ? C.accent : C.border}`, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
              Gerar questoes similares
              <p style={{ fontSize: 10, fontWeight: 400, marginTop: 3, color: mode === 'generate' ? C.accent : C.textDim }}>Cria novas questoes no mesmo estilo</p>
            </button>
          </div>

          {mode === 'extract' ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ color: C.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Importar questoes exatas do BZ</p>
              <p style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                A IA vai ler o caderno e extrair <strong style={{ color: C.textSecondary }}>todas as questoes exatamente como estao escritas</strong>, incluindo o gabarito comentado original. Ao responder no app, voce vera a justificativa completa do BZ.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: C.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quantas questoes gerar?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[5, 10, 20, 30].map(n => (
                  <button key={n} onClick={() => setCount(n)}
                    style={{ padding: '8px 16px', background: count === n ? C.accent : '#1a1a1a', color: count === n ? '#000' : C.textMuted, border: `1px solid ${count === n ? C.accent : C.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && !result.error && (
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} color="#4ade80" />
              <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>{result.message}</p>
            </div>
          )}
          {result?.error && (
            <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 12px' }}>{result.error}</p>
          )}

          <button onClick={mode === 'extract' ? extract : generate} disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#1a1a1a' : C.accent, color: loading ? C.textMuted : '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <><Cpu size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processando...</>
              : mode === 'extract'
                ? <><Sparkles size={14} /> Importar questoes do caderno</>
                : <><Sparkles size={14} /> Gerar {count} questoes</>
            }
          </button>

          <p style={{ color: C.textDim, fontSize: 11, textAlign: 'center' }}>
            As questoes ficam disponiveis na aba <strong style={{ color: C.textMuted }}>Questoes</strong> do app.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function QuestionBooks() {
  const [books, setBooks] = useState([])
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [subject, setSubject] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef()

  const load = () => api.get('/question-books').then(r => setBooks(r.data))
  useEffect(() => { load() }, [])

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true); setError('')
    const form = new FormData()
    form.append('file', file)
    if (subject) form.append('subject', subject)
    try {
      await api.post('/question-books/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await load()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Erro ao enviar caderno')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const del = async (id) => {
    await api.delete(`/question-books/${id}`)
    setBooks(b => b.filter(x => x.id !== id))
  }

  const totalGenerated = books.reduce((s, b) => s + (b.questions_generated || 0), 0)

  return (
    <div style={{ padding: '28px 32px' }}>
      {selected && (
        <BookDetail
          book={selected}
          onClose={() => setSelected(null)}
          onGenerate={() => { load(); setSelected(b => books.find(x => x.id === b?.id) || b) }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Cadernos de Questões</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>Suba seus cadernos resolvidos — a IA gera novas questões no mesmo estilo</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{ padding: '8px 12px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSecondary, fontSize: 13, outline: 'none' }}>
            <option value="">Selecione a matéria</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: uploading ? '#1a1a1a' : C.accent, color: uploading ? C.textMuted : '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? <><Cpu size={13} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</> : <><Upload size={13} /> Enviar caderno</>}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" onChange={upload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Stats bar */}
      {books.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Cadernos', value: books.length },
            { label: 'Questões geradas', value: totalGenerated },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...card({ padding: '12px 18px' }), display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120 }}>
              <p style={{ color: C.textDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
              <p style={{ color: C.accent, fontSize: 22, fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {books.length === 0 ? (
        <div style={{ ...card({ padding: 60, textAlign: 'center', border: `1px dashed ${C.border}` }) }}>
          <BookMarked size={28} color={C.textDim} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: C.textMuted, fontWeight: 600, fontSize: 14 }}>Nenhum caderno ainda</p>
          <p style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>Envie um PDF ou TXT do seu caderno de questões resolvido com gabarito</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {books.map(b => (
            <div key={b.id} style={card({ padding: 18 })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ background: C.accentDim, color: C.accent, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                    {b.questions_generated > 0 ? `${b.questions_generated} questões geradas` : 'Aguardando geração'}
                  </span>
                </div>
                <button onClick={() => del(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim }}><Trash2 size={13} /></button>
              </div>
              <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14, marginBottom: b.subject ? 4 : 10 }}>{b.title}</p>
              {b.subject && <p style={{ color: C.accent, fontSize: 11, marginBottom: 10 }}>{b.subject}</p>}
              <p style={{ color: C.textDim, fontSize: 11, marginBottom: 12 }}>
                {new Date(b.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <button onClick={() => setSelected(b)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                <Sparkles size={12} /> Gerar questões <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: 28, background: '#0a0e0a', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ color: C.accent, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Como funciona</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { n: '1', title: 'Envie o caderno', desc: 'PDF ou TXT com questões resolvidas e gabarito comentado' },
            { n: '2', title: 'IA analisa o conteúdo', desc: 'Identifica temas, normas, pegadinhas e estilo das questões' },
            { n: '3', title: 'Gera questões novas', desc: 'Cria perguntas originais no mesmo nível e estilo do concurso' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 22, height: 22, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</div>
              <div>
                <p style={{ color: C.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{title}</p>
                <p style={{ color: C.textDim, fontSize: 11 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
