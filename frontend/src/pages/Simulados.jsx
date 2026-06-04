import { useEffect, useState } from 'react'
import api from '../api'
import { Clock, Play, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { C, card } from '../theme'

function SimList({ simulados, onStart }) {
  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Simulados</h1>
      <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 22 }}>{simulados.length} simulados disponíveis</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680 }}>
        {simulados.map(s => (
          <div key={s.id} style={{ ...card({ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }) }}>
            <div style={{ width: 42, height: 42, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} color={C.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>{s.title}</p>
              <p style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>{s.description}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <span style={{ color: C.textDim, fontSize: 12 }}>📋 {s.question_count} questões</span>
                <span style={{ color: C.textDim, fontSize: 12 }}>⏱ {s.duration_minutes} min</span>
              </div>
            </div>
            <button onClick={() => onStart(s)} style={{ background: C.accent, color: '#000', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Play size={13} /> Iniciar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimExam({ simulado, onFinish }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(simulado.duration_minutes * 60)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get(`/simulados/${simulado.id}/questions`).then(r => setQuestions(r.data))
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { clearInterval(t); handleSubmit(); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async () => {
    const r = await api.post(`/simulados/${simulado.id}/submit`, { answers })
    onFinish(r.data)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  if (!questions.length) return <div style={{ padding: 40, color: C.textMuted }}>Carregando questões...</div>
  const q = questions[current]

  return (
    <div style={{ padding: '28px 32px', maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ color: C.textPrimary, fontSize: 16, fontWeight: 600 }}>{simulado.title}</h2>
        <div style={{ background: timeLeft < 300 ? C.errorDim : C.accentDim, border: `1px solid ${timeLeft < 300 ? C.error + '44' : C.accentBorder}`, borderRadius: 8, padding: '7px 14px', color: timeLeft < 300 ? C.error : C.accent, fontFamily: 'monospace', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} /> {mm}:{ss}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, flexWrap: 'wrap' }}>
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ width: 28, height: 5, borderRadius: 3, border: 'none', cursor: 'pointer', background: answers[String(questions[i].id)] ? C.accent : i === current ? C.accentBorder : '#222' }} />
        ))}
      </div>

      <div style={card({ padding: 24, marginBottom: 14 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ color: C.textMuted, fontSize: 12 }}>{current + 1} de {questions.length}</span>
          <span style={{ color: C.textDim, fontSize: 12 }}>{q.subject}</span>
        </div>
        <p style={{ color: C.textPrimary, fontSize: 15, lineHeight: 1.65, marginBottom: 18 }}>{q.text}</p>
        <div>
          {Object.entries(q.options).map(([opt, text]) => {
            const sel = answers[String(q.id)] === opt
            return (
              <button key={opt} onClick={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 9, border: `1px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentDim : 'transparent', cursor: 'pointer', marginBottom: 7, transition: 'all 0.12s' }}>
                <span style={{ width: 26, height: 26, background: sel ? C.accent : '#222', color: sel ? '#000' : C.textDim, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{opt}</span>
                <span style={{ color: sel ? C.textPrimary : C.textSecondary, fontSize: 13 }}>{text}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{ padding: '10px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, opacity: current === 0 ? 0.4 : 1 }}>
          <ChevronLeft size={14} /> Anterior
        </button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(current + 1)} style={{ flex: 1, padding: '10px', background: C.accent, color: '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              Próxima <ChevronRight size={14} />
            </button>
          : <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: C.success, color: '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Finalizar simulado
            </button>
        }
      </div>
    </div>
  )
}

function SimResult({ result, onBack }) {
  const pct = result.score.toFixed(0)
  return (
    <div style={{ padding: '28px 32px', maxWidth: 680 }}>
      <div style={{ ...card({ padding: 32, textAlign: 'center', marginBottom: 16 }) }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: Number(pct) >= 60 ? C.successDim : C.errorDim, border: `2px solid ${Number(pct) >= 60 ? C.success : C.error}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {Number(pct) >= 60 ? <CheckCircle size={28} color={C.success} /> : <XCircle size={28} color={C.error} />}
        </div>
        <p style={{ color: Number(pct) >= 60 ? C.success : C.error, fontSize: 40, fontWeight: 700 }}>{pct}%</p>
        <p style={{ color: C.textMuted, fontSize: 14, marginTop: 6 }}>{result.correct} de {result.total} questões corretas</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {result.per_question.map((pq, i) => (
          <div key={i} style={{ ...card({ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: pq.is_correct ? C.success + '33' : C.error + '33' }) }}>
            {pq.is_correct ? <CheckCircle size={14} color={C.success} style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={14} color={C.error} style={{ flexShrink: 0, marginTop: 1 }} />}
            <div>
              <p style={{ color: C.textSecondary, fontSize: 12 }}>{pq.text.substring(0, 90)}...</p>
              {!pq.is_correct && <p style={{ color: C.error, fontSize: 11, marginTop: 4 }}>Sua: {pq.selected} · Correta: {pq.correct}</p>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{ width: '100%', padding: 13, background: C.accent, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Voltar aos Simulados
      </button>
    </div>
  )
}

export default function Simulados() {
  const [simulados, setSimulados] = useState([])
  const [active, setActive] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => { api.get('/simulados').then(r => setSimulados(r.data)) }, [])

  if (result) return <SimResult result={result} onBack={() => { setResult(null); setActive(null) }} />
  if (active) return <SimExam simulado={active} onFinish={r => setResult(r)} />
  return <SimList simulados={simulados} onStart={setActive} />
}
