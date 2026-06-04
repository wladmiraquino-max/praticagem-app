import { useEffect, useState } from 'react'
import api from '../api'
import { Brain } from 'lucide-react'

const SUBJECT_COLORS = {
  'Manobra': '#ef4444',
  'Arte Naval': '#f97316',
  'Arquitetura Naval': '#eab308',
  'Meteorologia e Oceanografia': '#22c55e',
  'Legislação Marítima': '#3b82f6',
  'Navegação e Radar': '#8b5cf6',
  'Comunicações': '#ec4899',
  'Segurança da Navegação': '#14b8a6',
  'Normas e Publicações': '#f59e0b',
  'Gestão e Procedimentos': '#10b981',
  'Sistemas e Equipamentos': '#6366f1',
  'Conhecimentos Portuários': '#84cc16',
  'Outros Assuntos': '#94a3b8',
  'Conhecimentos Gerais': '#0ea5e9',
}

export default function Network() {
  const [knowledge, setKnowledge] = useState([])

  useEffect(() => { api.get('/progress/knowledge').then((r) => setKnowledge(r.data)) }, [])

  const dominated = knowledge.filter((k) => k.mastery >= 80).length
  const building = knowledge.filter((k) => k.mastery >= 40 && k.mastery < 80).length
  const weak = knowledge.filter((k) => k.mastery > 0 && k.mastery < 40).length
  const totalConcepts = knowledge.reduce((s, k) => s + k.concept_count, 0)
  const avgMastery = knowledge.length > 0 ? knowledge.reduce((s, k) => s + k.mastery, 0) / knowledge.length : 0
  const coverage = knowledge.length > 0 ? (knowledge.length / 14) * 100 : 0

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Brain size={24} className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sua Rede Cognitiva</h1>
          <p className="text-sm text-gray-500">Mapa do que você sabe — atualizado a cada resposta</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Conceitos dominados', value: dominated, color: 'text-green-600' },
          { label: 'Em construção', value: building, color: 'text-yellow-600' },
          { label: 'Fracos', value: weak, color: 'text-red-600' },
          { label: 'Cobertura do grafo', value: `${coverage.toFixed(0)}%`, color: 'text-gray-900' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Prontidão */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Prontidão para o concurso</p>
          <p className="text-sm font-bold text-orange-600">~{Math.max(4, Math.round(52 - coverage / 2))} semanas</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Mastery médio: {avgMastery.toFixed(0)}% / 60%</span>
          <span>Cobertura: {coverage.toFixed(0)}% / 70%</span>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, coverage)}%` }} />
        </div>
      </div>

      {/* Domínio por disciplina */}
      {knowledge.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Domínio por disciplina</h3>
          <div className="space-y-3">
            {knowledge.map((k) => (
              <div key={k.subject}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{k.subject}</span>
                  <span>{k.mastery.toFixed(0)}% · {k.concept_count} conceitos</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${k.mastery}%`,
                      backgroundColor: SUBJECT_COLORS[k.subject] || '#f97316',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Bubble visualization */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Sua rede por matéria</h3>
        <p className="text-xs text-gray-400 mb-4">Tamanho = nº de conceitos estudados · Cor = domínio</p>
        {knowledge.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <Brain size={40} className="mx-auto mb-3" />
            <p className="text-sm">Responda questões para construir sua rede</p>
          </div>
        ) : (
          <div className="relative h-64 bg-gray-50 rounded-xl overflow-hidden">
            {knowledge.map((k, i) => {
              const size = Math.max(40, Math.min(100, 40 + k.concept_count * 5))
              const x = (i % 4) * 25 + 5 + Math.random() * 5
              const y = Math.floor(i / 4) * 40 + 10
              return (
                <div
                  key={k.subject}
                  className="absolute flex items-center justify-center rounded-full text-white text-xs font-medium text-center leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    width: size,
                    height: size,
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: k.mastery === 0 ? '#e5e7eb' : SUBJECT_COLORS[k.subject] || '#f97316',
                    color: k.mastery === 0 ? '#9ca3af' : 'white',
                    transform: 'translate(-50%, -50%)',
                    fontSize: size < 60 ? '10px' : '11px',
                  }}
                  title={`${k.subject}: ${k.mastery.toFixed(0)}% domínio`}
                >
                  {k.subject.length > 12 ? k.subject.split(' ')[0] : k.subject}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
