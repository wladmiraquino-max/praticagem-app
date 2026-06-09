import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, BookMarked, ArrowRight, Pencil, Save, X } from 'lucide-react'
import { C, card } from '../theme'

const diffColor = { Fácil: { color: C.success, bg: C.successDim }, Médio: { color: C.accent, bg: C.accentDim }, Difícil: { color: C.error, bg: C.errorDim } }

function QuestionCard({ question: initialQuestion, onAnswer, result }) {
  const [question, setQuestion] = useState(initialQuestion)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editCorrect, setEditCorrect] = useState(initialQuestion.correct || 'A')
  const [editExpl, setEditExpl] = useState(initialQuestion.explanation || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveCorrection = async () => {
    if (editExpl.trim().length < 20) return
    setSaving(true)
    try {
      await api.patch(`/questions/${question.id}/correct`, { correct: editCorrect, explanation: editExpl })
      setQuestion({ ...question, correct: editCorrect, explanation: editExpl })
      setSaved(true)
      setTimeout(() => { setEditing(false); setSaved(false) }, 1000)
    } catch (e) {
      alert('Erro: ' + (e?.response?.data?.detail || e.message))
    } finally {
      setSaving(false)
    }
  }

  const optStyle = (opt) => {
    const base = { width: '100%', textAlign: 'left', padding: '13px 16px', borderRadius: 10, border: '1px solid', cursor: result ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', background: 'transparent', marginBottom: 8 }
    if (!result) return { ...base, borderColor: selected === opt ? C.accent : C.border, background: selected === opt ? C.accentDim : 'transparent' }
    if (opt === result.correct) return { ...base, borderColor: C.success, background: C.successDim }
    if (opt === selected && !result.is_correct) return { ...base, borderColor: C.error, background: C.errorDim }
    return { ...base, borderColor: '#1a1a1a', opacity: 0.45 }
  }

  const optLabel = (opt) => {
    if (!result) return { background: selected === opt ? C.accent : '#222', color: selected === opt ? '#000' : C.textDim, border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }
    if (opt === result.correct) return { background: C.success, color: '#000', border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }
    if (opt === selected && !result.is_correct) return { background: C.error, color: '#fff', border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }
    return { background: '#1a1a1a', color: '#333', border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }
  }

  const dc = diffColor[question.difficulty] || diffColor['Médio']

  return (
    <div style={card({ padding: 24 })}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: dc.color, background: dc.bg }}>{question.difficulty}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.textDim, fontSize: 12 }}>{question.subject}</span>
          <button onClick={() => { setEditing(!editing); setEditCorrect(question.correct); setEditExpl(question.explanation || '') }}
            style={{ background: editing ? C.accentDim : 'none', border: `1px solid ${editing ? C.accent : C.border}`, borderRadius: 6, padding: '3px 9px', cursor: 'pointer', color: editing ? C.accent : C.textDim, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: editing ? 700 : 400 }}>
            <Pencil size={11} /> {editing ? 'Editando' : 'Corrigir'}
          </button>
        </div>
      </div>

      {/* Enunciado */}
      <p style={{ color: C.textPrimary, fontSize: 15, lineHeight: 1.65, marginBottom: 20, fontWeight: 400 }}>{question.text}</p>

      {/* Alternativas */}
      <div style={{ marginBottom: 16 }}>
        {Object.entries(question.options).map(([opt, text]) => (
          <button key={opt} onClick={() => !result && setSelected(opt)} style={optStyle(opt)}>
            <span style={optLabel(opt)}>{opt}</span>
            <span style={{ color: result ? (opt === result.correct ? C.success : opt === selected && !result.is_correct ? C.error : C.textDim) : (selected === opt ? C.textPrimary : C.textSecondary), fontSize: 13 }}>{text}</span>
          </button>
        ))}
      </div>

      {/* Confirmar / Resultado */}
      {!result ? (
        <button onClick={() => selected && onAnswer(selected)} disabled={!selected}
          style={{ width: '100%', padding: '12px', background: selected ? C.accent : '#1a1a1a', color: selected ? '#000' : C.textDim, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: selected ? 'pointer' : 'default' }}>
          Confirmar resposta
        </button>
      ) : (
        <div style={{ background: result.is_correct ? C.successDim : C.errorDim, border: `1px solid ${result.is_correct ? C.success + '44' : C.error + '44'}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: result.explanation ? 8 : 0 }}>
            {result.is_correct ? <CheckCircle size={15} color={C.success} /> : <XCircle size={15} color={C.error} />}
            <span style={{ color: result.is_correct ? C.success : C.error, fontWeight: 600, fontSize: 13 }}>
              {result.is_correct ? 'Correto!' : `Gabarito: alternativa ${result.correct}`}
            </span>
          </div>
          {result.explanation && <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.6 }}>{result.explanation}</p>}
        </div>
      )}

      {/* ── Painel de correção inline ────────────────────────────────────── */}
      {editing && (
        <div style={{ marginTop: 16, background: '#0a0e0a', border: `1px solid ${C.accent}33`, borderRadius: 12, padding: '16px 18px' }}>
          <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Corrigir gabarito</p>

          {/* Seleção da letra correta */}
          <p style={{ color: C.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Resposta correta:</p>
          <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
            {Object.keys(question.options).map(opt => (
              <button key={opt} onClick={() => setEditCorrect(opt)}
                style={{ padding: '7px 14px', background: editCorrect === opt ? C.accent : '#1a1a1a', color: editCorrect === opt ? '#000' : C.textMuted, border: `1px solid ${editCorrect === opt ? C.accent : C.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {opt}
              </button>
            ))}
          </div>
          <div style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 7, padding: '7px 11px', marginBottom: 14 }}>
            <p style={{ color: C.accent, fontSize: 12 }}><strong>{editCorrect}:</strong> {question.options[editCorrect]}</p>
          </div>

          {/* Trecho da publicação */}
          <p style={{ color: C.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Trecho da publicação:</p>
          <textarea
            value={editExpl}
            onChange={e => setEditExpl(e.target.value)}
            placeholder='Ex: "Conforme IMO A.1045, item 2.1.3: os cabos laterais devem ter diâmetro mínimo de 18 mm..."'
            style={{ width: '100%', minHeight: 90, background: '#111', border: `1px solid ${editExpl.trim().length >= 20 ? C.accent + '55' : C.border}`, borderRadius: 9, color: C.textPrimary, fontSize: 13, padding: '9px 12px', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <p style={{ color: C.textDim, fontSize: 11 }}>{editExpl.length} chars · mín. 20</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(false)}
                style={{ padding: '7px 14px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={12} /> Cancelar
              </button>
              <button onClick={saveCorrection} disabled={saving || saved || editExpl.trim().length < 20}
                style={{ padding: '7px 16px', background: saved ? '#16a34a' : (editExpl.trim().length < 20 || saving ? '#1a1a1a' : C.accent), color: saved ? '#fff' : (editExpl.trim().length < 20 || saving ? C.textDim : '#000'), border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: editExpl.trim().length < 20 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                {saved ? <><CheckCircle size={12} /> Salvo</> : saving ? 'Salvando...' : <><Save size={12} /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Questions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState(null)
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('all') // 'all' | 'bz'
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [caderno, setCaderno] = useState('')
  const [subjects, setSubjects] = useState([])
  const [cadernos, setCadernos] = useState([])
  const [total, setTotal] = useState(0)

  const load = async () => {
    const p = new URLSearchParams({ limit: 20 })
    if (subject) p.append('subject', subject)
    if (difficulty) p.append('difficulty', difficulty)
    if (filter === 'wrong') p.append('filter', 'wrong')
    if (tab === 'bz') {
      if (caderno) p.append('caderno', caderno)
      else p.append('source', 'bz')
    }
    const r = await api.get(`/questions?${p}`)
    setQuestions(r.data); setCurrent(0); setResult(null)
  }

  useEffect(() => {
    api.get('/questions/subjects').then(r => setSubjects(r.data)).catch(() => {})
    api.get('/questions/count').then(r => setTotal(r.data.total)).catch(() => {})
    api.get('/questions/cadernos').then(r => setCadernos(r.data)).catch(() => {})
    load()
  }, [])

  useEffect(() => { load() }, [filter, subject, difficulty, tab, caderno])

  const handleAnswer = async (sel) => {
    const q = questions[current]
    const r = await api.post(`/questions/${q.id}/answer`, { question_id: q.id, selected: sel })
    setResult(r.data)
  }

  const selStyle = { padding: '7px 14px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSecondary, fontSize: 13, outline: 'none', cursor: 'pointer' }
  const tabStyle = (active) => ({ padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.textPrimary : C.textMuted, background: active ? '#222' : 'transparent', border: 'none', cursor: 'pointer' })

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Questões</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>{total} questões disponíveis</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSecondary, fontSize: 13, cursor: 'pointer' }}>
          <RotateCcw size={13} /> Nova sessão
        </button>
      </div>

      {/* Tabs principais */}
      <div style={{ display: 'flex', gap: 2, background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, marginBottom: 16, width: 'fit-content' }}>
        {[['all','Todas'],['bz','BZ — Cadernos'],['wrong','Que errei']].map(([k,l]) => (
          <button key={k} onClick={() => { setTab(k === 'wrong' ? 'all' : k); setFilter(k === 'wrong' ? 'wrong' : 'all'); setCaderno('') }} style={tabStyle((tab === k) || (k === 'wrong' && filter === 'wrong'))}>{l}</button>
        ))}
      </div>

      {/* Filtros BZ */}
      {tab === 'bz' && cadernos.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setCaderno('')}
              style={{ padding: '5px 12px', background: !caderno ? C.accent : '#1a1a1a', color: !caderno ? '#000' : C.textMuted, border: `1px solid ${!caderno ? C.accent : C.border}`, borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Todos os cadernos
            </button>
            {cadernos.map(c => (
              <button key={c.source} onClick={() => setCaderno(c.name)}
                style={{ padding: '5px 12px', background: caderno === c.name ? C.accent : '#1a1a1a', color: caderno === c.name ? '#000' : C.textMuted, border: `1px solid ${caderno === c.name ? C.accent : C.border}`, borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros gerais */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selStyle}>
          <option value="">Todos os níveis</option>
          <option>Fácil</option><option>Médio</option><option>Difícil</option>
        </select>
        {tab !== 'bz' && (
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...selStyle, maxWidth: 220 }}>
            <option value="">Todas as matérias</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {questions.length === 0 ? (
        tab === 'bz' ? (
          <div style={{ ...card({ padding: 48, textAlign: 'center' }) }}>
            <BookMarked size={32} color={C.textDim} style={{ margin: '0 auto 14px' }} />
            <p style={{ color: C.textSecondary, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Nenhuma questão BZ importada ainda</p>
            <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 20px' }}>
              Vá em <strong style={{ color: C.textMuted }}>Cadernos</strong>, envie o PDF ou TXT do seu caderno BZ e clique em <strong style={{ color: C.textMuted }}>Importar questões exatas</strong>. As questões aparecem aqui automaticamente.
            </p>
            <button onClick={() => navigate('/question-books')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: C.accent, color: '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Ir para Cadernos <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ ...card({ padding: 60, textAlign: 'center' }) }}>
            <p style={{ color: C.textDim }}>Nenhuma questão encontrada com esses filtros.</p>
          </div>
        )
      ) : (
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ color: C.textDim, fontSize: 12 }}>{current + 1}/{questions.length}</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: i === current ? C.accent : i < current ? C.success : '#222' }} />
              ))}
            </div>
          </div>

          <QuestionCard key={questions[current]?.id} question={questions[current]} onAnswer={handleAnswer} result={result} />

          {result && (
            <button onClick={() => { setResult(null); current < questions.length - 1 ? setCurrent(current + 1) : load() }}
              style={{ width: '100%', marginTop: 12, padding: '13px', background: C.accent, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Próxima questão <ChevronRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
