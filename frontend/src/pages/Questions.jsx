import { useEffect, useState } from 'react'
import api from '../api'
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { C, card } from '../theme'

const diffColor = { Fácil: { color: C.success, bg: C.successDim }, Médio: { color: C.accent, bg: C.accentDim }, Difícil: { color: C.error, bg: C.errorDim } }

function QuestionCard({ question, onAnswer, result }) {
  const [selected, setSelected] = useState(null)

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: dc.color, background: dc.bg }}>{question.difficulty}</span>
        <span style={{ color: C.textDim, fontSize: 12 }}>{question.subject}</span>
      </div>

      <p style={{ color: C.textPrimary, fontSize: 15, lineHeight: 1.65, marginBottom: 20, fontWeight: 400 }}>{question.text}</p>

      <div style={{ marginBottom: 16 }}>
        {Object.entries(question.options).map(([opt, text]) => (
          <button key={opt} onClick={() => !result && setSelected(opt)} style={optStyle(opt)}>
            <span style={optLabel(opt)}>{opt}</span>
            <span style={{ color: result ? (opt === result.correct ? C.success : opt === selected && !result.is_correct ? C.error : C.textDim) : (selected === opt ? C.textPrimary : C.textSecondary), fontSize: 13 }}>{text}</span>
          </button>
        ))}
      </div>

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
    </div>
  )
}

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState(null)
  const [filter, setFilter] = useState('all')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [subjects, setSubjects] = useState([])
  const [total, setTotal] = useState(0)

  const load = async () => {
    const p = new URLSearchParams({ limit: 10 })
    if (subject) p.append('subject', subject)
    if (difficulty) p.append('difficulty', difficulty)
    if (filter === 'wrong') p.append('filter', 'wrong')
    const r = await api.get(`/questions?${p}`)
    setQuestions(r.data); setCurrent(0); setResult(null)
  }

  useEffect(() => {
    api.get('/questions/subjects').then(r => setSubjects(r.data)).catch(() => {})
    api.get('/questions/count').then(r => setTotal(r.data.total)).catch(() => {})
    load()
  }, [])

  useEffect(() => { load() }, [filter, subject, difficulty])

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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, padding: 3 }}>
          {[['all','Todas'],['wrong','Que errei']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={tabStyle(filter === k)}>{l}</button>
          ))}
        </div>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selStyle}>
          <option value="">Todos os níveis</option>
          <option>Fácil</option><option>Médio</option><option>Difícil</option>
        </select>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...selStyle, maxWidth: 220 }}>
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {questions.length === 0 ? (
        <div style={{ ...card({ padding: 60, textAlign: 'center' }) }}>
          <p style={{ color: C.textDim }}>Nenhuma questão encontrada com esses filtros.</p>
        </div>
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
