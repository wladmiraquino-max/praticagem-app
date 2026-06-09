import { useEffect, useState } from 'react'
import api from '../api'
import { Clock, Play, CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen, Filter } from 'lucide-react'
import { C, card } from '../theme'

// ── Extrai numero da rodada do titulo ────────────────────────────────────────
function getRodadaNum(title) {
  const m = title.match(/(\d+)[aªÂ°]?\s*Rodada/i)
  return m ? parseInt(m[1]) : null
}

function getBadge(title) {
  if (title.includes('Megasimulado')) return { label: 'MEGA', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  if (title.includes('Completo'))    return { label: 'COMPLETO', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }
  if (title.startsWith('BZ'))        return { label: 'BZ', color: C.accent, bg: C.accentDim }
  return null
}

function getMateria(title) {
  const parts = title.split('—')
  return parts.length >= 3 ? parts[parts.length - 1].trim() : null
}

// ── Lista de Simulados ────────────────────────────────────────────────────────
function SimList({ simulados, onStart }) {
  const [filter, setFilter] = useState('todos')

  const rodadas = [...new Set(
    simulados.map(s => getRodadaNum(s.title)).filter(Boolean)
  )].sort((a, b) => b - a)

  const filtered = simulados.filter(s => {
    if (filter === 'todos') return true
    if (filter === 'genericos') return !s.title.startsWith('BZ')
    if (filter === 'mega') return s.title.includes('Megasimulado') || s.title.includes('Completo')
    const n = getRodadaNum(s.title)
    return String(n) === filter
  })

  const tabStyle = (k) => ({
    padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: filter === k ? 700 : 400,
    color: filter === k ? C.textPrimary : C.textMuted,
    background: filter === k ? '#222' : 'transparent',
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Simulados</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>{simulados.length} simulados disponíveis</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 4, background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, marginBottom: 20, overflowX: 'auto', width: 'fit-content' }}>
        <button style={tabStyle('todos')} onClick={() => setFilter('todos')}>Todos</button>
        <button style={tabStyle('mega')} onClick={() => setFilter('mega')}>Completos</button>
        {rodadas.map(r => (
          <button key={r} style={tabStyle(String(r))} onClick={() => setFilter(String(r))}>
            {r}ª Rodada
          </button>
        ))}
        <button style={tabStyle('genericos')} onClick={() => setFilter('genericos')}>Gerais</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...card({ padding: 48, textAlign: 'center' }) }}>
          <p style={{ color: C.textDim }}>Nenhum simulado nesta categoria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 740 }}>
          {filtered.map(s => {
            const badge = getBadge(s.title)
            const materia = getMateria(s.title)
            const rodada = getRodadaNum(s.title)
            return (
              <div key={s.id} style={{ ...card({ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }) }}>
                <div style={{ width: 44, height: 44, background: badge ? badge.bg : C.accentDim, border: `1px solid ${badge ? badge.color + '44' : C.accentBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={18} color={badge ? badge.color : C.accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    {badge && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, color: badge.color, background: badge.bg, letterSpacing: '0.06em' }}>
                        {badge.label}
                      </span>
                    )}
                    {rodada && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, color: C.textMuted, background: '#1a1a1a' }}>
                        {rodada}ª RODADA
                      </span>
                    )}
                  </div>
                  <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {materia || s.title}
                  </p>
                  {s.description && (
                    <p style={{ color: C.textDim, fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                    <span style={{ color: C.textDim, fontSize: 11 }}>📋 {s.question_count} questões</span>
                    <span style={{ color: C.textDim, fontSize: 11 }}>⏱ {s.duration_minutes} min</span>
                  </div>
                </div>
                <button onClick={() => onStart(s)}
                  style={{ background: C.accent, color: '#000', fontWeight: 700, fontSize: 12, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <Play size={12} /> Iniciar
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Simulado em andamento ─────────────────────────────────────────────────────
function SimExam({ simulado, onFinish }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(simulado.duration_minutes * 60)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get(`/simulados/${simulado.id}/questions`).then(r => setQuestions(r.data))
    const t = setInterval(() => setTimeLeft(v => {
      if (v <= 1) { clearInterval(t); handleSubmit(); return 0 }
      return v - 1
    }), 1000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async () => {
    const r = await api.post(`/simulados/${simulado.id}/submit`, { answers })
    onFinish(r.data)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const answered = Object.keys(answers).length

  if (!questions.length) return <div style={{ padding: 40, color: C.textMuted, textAlign: 'center' }}>Carregando questões...</div>
  const q = questions[current]

  return (
    <div style={{ padding: '24px 32px', maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{simulado.title}</p>
          <p style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{answered}/{questions.length} respondidas</p>
        </div>
        <div style={{ background: timeLeft < 300 ? C.errorDim : C.accentDim, border: `1px solid ${timeLeft < 300 ? C.error + '55' : C.accentBorder}`, borderRadius: 8, padding: '7px 14px', color: timeLeft < 300 ? C.error : C.accent, fontFamily: 'monospace', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} /> {mm}:{ss}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 16, flexWrap: 'wrap' }}>
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ width: 26, height: 5, borderRadius: 3, border: 'none', cursor: 'pointer', background: answers[String(questions[i].id)] ? C.accent : i === current ? C.accentBorder : '#1a1a1a' }} />
        ))}
      </div>

      {/* Questão */}
      <div style={card({ padding: 22, marginBottom: 12 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: C.textDim, fontSize: 12 }}>Questão {current + 1} de {questions.length}</span>
          <span style={{ color: C.textDim, fontSize: 11 }}>{q.subject}</span>
        </div>
        <p style={{ color: C.textPrimary, fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{q.text}</p>
        <div>
          {Object.entries(q.options).map(([opt, text]) => {
            const sel = answers[String(q.id)] === opt
            return (
              <button key={opt} onClick={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 9, border: `1px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentDim : 'transparent', cursor: 'pointer', marginBottom: 6, transition: 'all 0.12s' }}>
                <span style={{ width: 26, height: 26, background: sel ? C.accent : '#1a1a1a', color: sel ? '#000' : C.textDim, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{opt}</span>
                <span style={{ color: sel ? C.textPrimary : C.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navegação */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
          style={{ padding: '10px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, opacity: current === 0 ? 0.4 : 1 }}>
          <ChevronLeft size={14} /> Anterior
        </button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(current + 1)}
              style={{ flex: 1, padding: '10px', background: C.accent, color: '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              Próxima <ChevronRight size={14} />
            </button>
          : <button onClick={handleSubmit}
              style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Finalizar Simulado ({answered}/{questions.length} respondidas)
            </button>
        }
      </div>
    </div>
  )
}

// ── Resultado ─────────────────────────────────────────────────────────────────
function SimResult({ result, onBack }) {
  const pct = result.score.toFixed(0)
  const approved = Number(pct) >= 60
  return (
    <div style={{ padding: '28px 32px', maxWidth: 680 }}>
      <div style={{ ...card({ padding: 32, textAlign: 'center', marginBottom: 16 }) }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: approved ? C.successDim : C.errorDim, border: `2px solid ${approved ? C.success : C.error}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {approved ? <CheckCircle size={30} color={C.success} /> : <XCircle size={30} color={C.error} />}
        </div>
        <p style={{ color: approved ? C.success : C.error, fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{pct}%</p>
        <p style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>{result.correct} de {result.total} questões corretas</p>
        <p style={{ color: approved ? C.success : C.error, fontSize: 12, marginTop: 6, fontWeight: 600 }}>
          {approved ? 'Aprovado — acima de 60%' : 'Abaixo de 60% — continue praticando!'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16, maxHeight: 400, overflowY: 'auto' }}>
        {result.per_question.map((pq, i) => (
          <div key={i} style={{ ...card({ padding: '11px 14px', display: 'flex', gap: 9, alignItems: 'flex-start', borderColor: pq.is_correct ? C.success + '33' : C.error + '33' }) }}>
            {pq.is_correct
              ? <CheckCircle size={13} color={C.success} style={{ flexShrink: 0, marginTop: 2 }} />
              : <XCircle size={13} color={C.error} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div style={{ minWidth: 0 }}>
              <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{pq.text.substring(0, 100)}...</p>
              {!pq.is_correct && (
                <p style={{ color: C.error, fontSize: 11, marginTop: 3 }}>
                  Sua: <strong>{pq.selected}</strong> · Correta: <strong>{pq.correct}</strong>
                  {pq.explanation && <span style={{ color: C.textDim }}> — {pq.explanation.substring(0, 80)}</span>}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onBack}
        style={{ width: '100%', padding: 13, background: C.accent, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Voltar aos Simulados
      </button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Simulados() {
  const [simulados, setSimulados] = useState([])
  const [active, setActive] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/simulados').then(r => {
      // Ordena: BZ Completos primeiro, depois por rodada desc, depois gerais
      const sorted = [...r.data].sort((a, b) => {
        const aMega = a.title.includes('Megasimulado') || a.title.includes('Completo') ? 1 : 0
        const bMega = b.title.includes('Megasimulado') || b.title.includes('Completo') ? 1 : 0
        if (aMega !== bMega) return bMega - aMega
        const aR = getRodadaNum(a.title) || 0
        const bR = getRodadaNum(b.title) || 0
        return bR - aR
      })
      setSimulados(sorted)
    })
  }, [])

  if (result) return <SimResult result={result} onBack={() => { setResult(null); setActive(null) }} />
  if (active)  return <SimExam simulado={active} onFinish={r => setResult(r)} />
  return <SimList simulados={simulados} onStart={setActive} />
}
