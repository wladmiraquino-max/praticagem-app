import { useEffect, useState } from 'react'
import api from '../api'
import { CheckCircle2, XCircle, RotateCcw, Volume2, Star, ChevronRight } from 'lucide-react'

function QuestionCard({ question, onAnswer, result }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (opt) => {
    if (result) return
    setSelected(opt)
  }

  const handleConfirm = () => {
    if (!selected) return
    onAnswer(selected)
  }

  const optColors = (opt) => {
    if (!result) {
      return selected === opt
        ? 'border-orange-500 bg-orange-50'
        : 'border-gray-200 hover:border-gray-300 bg-white'
    }
    if (opt === result.correct) return 'border-green-500 bg-green-50'
    if (opt === selected && !result.is_correct) return 'border-red-500 bg-red-50'
    return 'border-gray-200 bg-white opacity-60'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          question.difficulty === 'Fácil' ? 'bg-green-100 text-green-700' :
          question.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>{question.difficulty}</span>
        <span className="text-xs text-gray-400">{question.subject}</span>
      </div>

      <p className="text-gray-900 font-medium leading-relaxed mb-6">{question.text}</p>

      <div className="space-y-3 mb-6">
        {Object.entries(question.options).map(([opt, text]) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`w-full text-left flex items-center gap-3 p-3.5 rounded-lg border transition-all ${optColors(opt)}`}
          >
            <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
              {opt}
            </span>
            <span className="text-sm text-gray-700">{text}</span>
          </button>
        ))}
      </div>

      {!result ? (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Confirmar resposta
        </button>
      ) : (
        <div className={`rounded-lg p-4 ${result.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.is_correct
              ? <CheckCircle2 size={18} className="text-green-600" />
              : <XCircle size={18} className="text-red-600" />}
            <span className={`font-semibold text-sm ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
              {result.is_correct ? 'Correto!' : `Errado — Gabarito: ${result.correct}`}
            </span>
          </div>
          {result.explanation && (
            <p className="text-xs text-gray-600 leading-relaxed">{result.explanation}</p>
          )}
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

  const loadQuestions = async () => {
    const params = new URLSearchParams({ limit: 10 })
    if (subject) params.append('subject', subject)
    if (difficulty) params.append('difficulty', difficulty)
    if (filter === 'wrong') params.append('filter', 'wrong')
    const r = await api.get(`/questions?${params}`)
    setQuestions(r.data)
    setCurrent(0)
    setResult(null)
  }

  useEffect(() => {
    api.get('/questions/subjects').then((r) => setSubjects(r.data)).catch(() => {})
    api.get('/questions/count').then((r) => setTotal(r.data.total)).catch(() => {})
    loadQuestions()
  }, [])

  useEffect(() => { loadQuestions() }, [filter, subject, difficulty])

  const handleAnswer = async (selected) => {
    const q = questions[current]
    const r = await api.post(`/questions/${q.id}/answer`, { question_id: q.id, selected })
    setResult(r.data)
  }

  const handleNext = () => {
    setResult(null)
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    } else {
      loadQuestions()
    }
  }

  const tabs = [
    { key: 'all', label: 'Todas' },
    { key: 'wrong', label: 'Que errei' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
          <p className="text-sm text-gray-500">{total} questões disponíveis</p>
        </div>
        <button onClick={loadQuestions} className="flex items-center gap-2 text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50">
          <RotateCcw size={14} /> Sessão guiada
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todos os níveis</option>
          <option>Fácil</option>
          <option>Médio</option>
          <option>Difícil</option>
        </select>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todas as matérias</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Nenhuma questão encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span>{current + 1}/{questions.length} (+{total - questions.length})</span>
          </div>

          <QuestionCard
            key={questions[current]?.id}
            question={questions[current]}
            onAnswer={handleAnswer}
            result={result}
          />

          {result && (
            <button
              onClick={handleNext}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Próxima questão <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
