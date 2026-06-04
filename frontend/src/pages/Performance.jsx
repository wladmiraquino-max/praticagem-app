import { useEffect, useState } from 'react'
import api from '../api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'

export default function Performance() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.get('/progress/stats').then((r) => setStats(r.data)) }, [])

  if (!stats) return <div className="p-8 text-gray-400">Carregando...</div>

  const accuracy = Math.round(stats.accuracy * 100)
  const daysToExam = 525

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Desempenho</h1>
          <p className="text-sm text-gray-500">Análise completa do seu progresso</p>
        </div>
      </div>

      {/* Prova banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{daysToExam} dias até a prova</span> — Prático (praticagem).
          {accuracy >= 60 && ` Com ${accuracy}% de prontidão atual, você estará em torno de ${Math.min(99, accuracy + 10)}% no dia da prova se mantiver o ritmo.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total respondidas', value: stats.total_answered },
          { label: 'Taxa de acerto', value: `${accuracy}%`, color: 'text-green-600' },
          { label: 'Acertos totais', value: stats.correct, sub: `de ${stats.total_answered}` },
          { label: 'Últimos 7 dias', value: stats.recent_activity?.slice(-7).reduce((s, d) => s + d.total, 0) ?? 0, sub: 'questões' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Atividade — Últimos 30 dias</h3>
        {stats.recent_activity?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.recent_activity}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip formatter={(v, n) => [v, n === 'total' ? 'Questões' : 'Corretas']} />
              <Area type="monotone" dataKey="total" stroke="#f97316" fill="url(#colorTotal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-300 py-12 text-sm">Responda questões para ver sua atividade</p>
        )}
      </div>

      {/* Heatmap placeholder */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Últimas 16 semanas</h3>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 112 }).map((_, i) => {
            const dayOffset = 111 - i
            const dateStr = new Date(Date.now() - dayOffset * 86400000).toISOString().slice(0, 10)
            const day = stats.recent_activity?.find((d) => d.date === dateStr)
            const count = day?.total || 0
            return (
              <div
                key={i}
                title={`${dateStr}: ${count} questões`}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: count === 0 ? '#f3f4f6' : count < 5 ? '#fed7aa' : count < 15 ? '#fb923c' : '#ea580c' }}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span>Menos</span>
          {['#f3f4f6','#fed7aa','#fb923c','#ea580c'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>Mais</span>
        </div>
      </div>

      {/* By subject */}
      {stats.by_subject?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Desempenho por Matéria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.by_subject.map((s) => ({ name: s.subject.split(' ')[0], pct: Math.round(s.accuracy * 100) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} width={30} />
              <Tooltip formatter={(v) => [`${v}%`, 'Acerto']} />
              <Bar dataKey="pct" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
