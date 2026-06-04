import { useEffect, useState } from 'react'
import api from '../api'
import { Clock, FileText, Play, CheckCircle2, XCircle } from 'lucide-react'

function SimuladoCard({ sim, onStart }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:border-orange-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <FileText size={18} className="text-orange-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{sim.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sim.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><FileText size={12} />{sim.question_count} questões</span>
            <span className="flex items-center gap-1"><Clock size={12} />{sim.duration_minutes} min</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onStart(sim)}
        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Play size={14} /> Iniciar
      </button>
    </div>
  )
}

function SimuladoExam({ simulado, onFinish }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(simulado.duration_minutes * 60)
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/simulados/${simulado.id}/questions`).then((r) => setQuestions(r.data))
    const t = setInterval(() => setTimeLeft((v) => { if (v <= 1) { clearInterval(t); handleSubmit(); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    const r = await api.post(`/simulados/${simulado.id}/submit`, { answers })
    onFinish(r.data)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  if (questions.length === 0) return <div className="p-8 text-gray-400">Carregando questões...</div>

  const q = questions[current]

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-gray-900">{simulado.title}</h2>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm font-mono font-bold">
          <Clock size={14} /> {mm}:{ss}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              answers[String(questions[i].id)] ? 'bg-orange-500' : i === current ? 'bg-orange-200' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{current + 1}/{questions.length}</span>
          <span>{q.subject}</span>
        </div>
        <p className="text-gray-900 font-medium leading-relaxed mb-5">{q.text}</p>
        <div className="space-y-3">
          {Object.entries(q.options).map(([opt, text]) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [String(q.id)]: opt })}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-lg border transition-all ${
                answers[String(q.id)] === opt
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt}</span>
              <span className="text-sm text-gray-700">{text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >Anterior</button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(current + 1)} className="px-6 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">Próxima</button>
          : <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
              {submitting ? 'Enviando...' : 'Finalizar'}
            </button>
        }
      </div>
    </div>
  )
}

function SimuladoResult({ result, onBack }) {
  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-6">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${result.score >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
          {result.score >= 60
            ? <CheckCircle2 size={32} className="text-green-600" />
            : <XCircle size={32} className="text-red-600" />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{result.score.toFixed(1)}%</h2>
        <p className="text-gray-500 mt-1">{result.correct} de {result.total} corretas</p>
      </div>

      <div className="space-y-3 mb-6">
        {result.per_question.map((pq, i) => (
          <div key={i} className={`bg-white rounded-lg border p-4 ${pq.is_correct ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex items-start gap-3">
              {pq.is_correct ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="text-sm text-gray-800 font-medium">{pq.text}</p>
                {!pq.is_correct && <p className="text-xs text-red-600 mt-1">Sua resposta: {pq.selected} | Correta: {pq.correct}</p>}
                {pq.explanation && <p className="text-xs text-gray-500 mt-1">{pq.explanation}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600">
        Voltar aos Simulados
      </button>
    </div>
  )
}

export default function Simulados() {
  const [simulados, setSimulados] = useState([])
  const [active, setActive] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => { api.get('/simulados').then((r) => setSimulados(r.data)) }, [])

  if (result) return <SimuladoResult result={result} onBack={() => { setResult(null); setActive(null) }} />
  if (active) return <SimuladoExam simulado={active} onFinish={(r) => setResult(r)} />

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Simulados</h1>
      <p className="text-sm text-gray-500 mb-6">{simulados.length} simulados disponíveis</p>
      <div className="space-y-3 max-w-2xl">
        {simulados.map((s) => (
          <SimuladoCard key={s.id} sim={s} onStart={setActive} />
        ))}
      </div>
    </div>
  )
}
