import { useEffect, useState } from 'react'
import api from '../api'
import { Map, Sparkles, CheckCircle2, Calendar, RefreshCw } from 'lucide-react'

export default function StudyTrail() {
  const [trail, setTrail] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/trail').then((r) => setTrail(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await api.post('/trail/generate')
      setTrail(r.data)
    } finally {
      setLoading(false)
    }
  }

  const sprints = trail?.sprints || []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trilha de Estudos</h1>
          <p className="text-sm text-gray-500">Plano personalizado de 4 semanas gerado por IA</p>
        </div>
        <div className="flex items-center gap-3">
          {trail?.next_at && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg">
              <Calendar size={12} />
              Nova trilha em {new Date(trail.next_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Gerando...' : sprints.length === 0 ? 'Gerar trilha' : 'Atualizar trilha'}
          </button>
        </div>
      </div>

      {sprints.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
          <Map size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-400">Nenhuma trilha gerada</p>
          <p className="text-sm text-gray-400 mt-1">Clique em "Gerar trilha" para criar seu plano de estudos personalizado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600 text-sm">{sprint.sprint}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{sprint.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{sprint.description}</p>

                  {sprint.subjects?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      <span className="text-xs text-gray-400 mr-1">DISCIPLINAS</span>
                      {sprint.subjects.map((s) => (
                        <span key={s} className="bg-orange-50 text-orange-700 text-xs px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  )}

                  {sprint.daily_goal && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Meta diária: <span className="font-medium">{sprint.daily_goal}</span>
                    </div>
                  )}

                  {sprint.tasks?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">O que fazer</p>
                      <div className="space-y-2">
                        {sprint.tasks.map((task, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{task}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
