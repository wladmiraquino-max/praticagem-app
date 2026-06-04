import { useEffect, useState } from 'react'
import api from '../api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { C, card } from '../theme'

const StatCard = ({ label, value, sub, color }) => (
  <div style={card({ padding: 20 })}>
    <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>{label}</p>
    <p style={{ color: color || C.textPrimary, fontSize: 28, fontWeight: 700 }}>{value}</p>
    {sub && <p style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>{sub}</p>}
  </div>
)

export default function Performance() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/progress/stats').then(r => setStats(r.data)).catch(() => {}) }, [])
  if (!stats) return <div style={{ padding: 40, color: C.textMuted }}>Carregando...</div>

  const accuracy = Math.round(stats.accuracy * 100)
  const tt = { contentStyle: { background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8 }, labelStyle: { color: C.textMuted }, itemStyle: { color: C.textSecondary } }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Desempenho</h1>
      <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>Análise completa do seu progresso</p>

      <div style={{ background: '#0f1a0a', border: `1px solid ${C.success}33`, borderRadius: 10, padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
        <p style={{ color: C.textSecondary, fontSize: 13 }}><strong style={{ color: C.textPrimary }}>525 dias até a prova</strong> — Prático (Praticagem). {accuracy >= 60 && `Com ${accuracy}% de prontidão atual, você estará em ~${Math.min(99, accuracy + 10)}% no dia da prova se mantiver o ritmo.`}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="Total respondidas" value={stats.total_answered} />
        <StatCard label="Taxa de acerto" value={`${accuracy}%`} color={C.success} sub={`${stats.correct} acertos`} />
        <StatCard label="Acertos totais" value={stats.correct} sub={`de ${stats.total_answered}`} />
        <StatCard label="Últimos 7 dias" value={stats.recent_activity?.slice(-7).reduce((s, d) => s + d.total, 0) ?? 0} sub="questões" color={C.accent} />
      </div>

      {/* Activity */}
      <div style={card({ padding: 20, marginBottom: 16 })}>
        <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Atividade — Últimos 30 dias</h3>
        {stats.recent_activity?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats.recent_activity}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.textDim }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textDim }} axisLine={false} tickLine={false} width={25} />
              <Tooltip {...tt} formatter={v => [v, 'Questões']} />
              <Area type="monotone" dataKey="total" stroke={C.accent} fill="url(#grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p style={{ color: C.textDim, fontSize: 13, textAlign: 'center', padding: 30 }}>Responda questões para ver sua atividade</p>}
      </div>

      {/* Heatmap */}
      <div style={card({ padding: 20, marginBottom: 16 })}>
        <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Últimas 16 semanas</h3>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Array.from({ length: 112 }).map((_, i) => {
            const d = new Date(Date.now() - (111 - i) * 86400000).toISOString().slice(0, 10)
            const n = stats.recent_activity?.find(a => a.date === d)?.total || 0
            return <div key={i} title={`${d}: ${n} questões`} style={{ width: 12, height: 12, borderRadius: 2, background: n === 0 ? '#1a1a1a' : n < 5 ? '#78350f' : n < 15 ? C.accentHover : C.accent }} />
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
          <span style={{ color: C.textDim, fontSize: 11 }}>Menos</span>
          {['#1a1a1a','#78350f', C.accentHover, C.accent].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
          <span style={{ color: C.textDim, fontSize: 11 }}>Mais</span>
        </div>
      </div>

      {/* By subject */}
      {stats.by_subject?.length > 0 && (
        <div style={card({ padding: 20 })}>
          <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Acerto por Matéria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.by_subject.map(s => ({ name: s.subject.split(' ')[0], pct: Math.round(s.accuracy * 100) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textDim }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textDim }} domain={[0, 100]} axisLine={false} tickLine={false} width={28} />
              <Tooltip {...tt} formatter={v => [`${v}%`, 'Acerto']} />
              <Bar dataKey="pct" fill={C.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
