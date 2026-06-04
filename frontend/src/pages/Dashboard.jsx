import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api'
import { BookOpen, Target, Flame, Clock, ChevronRight, Anchor, AlertTriangle, MessageSquare, Map, ClipboardList, SlidersHorizontal } from 'lucide-react'

const card = { background: '#161616', border: '1px solid #222', borderRadius: 12 }

function StatCard({ label, value, sub, icon: Icon, highlight }) {
  return (
    <div style={{ ...card, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ color: '#737373', fontSize: 12, fontWeight: 500 }}>{label}</p>
        {Icon && <Icon size={14} color={highlight ? '#dc2626' : '#525252'} />}
      </div>
      <p style={{ color: highlight ? '#dc2626' : '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#525252', fontSize: 12, marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [qCount, setQCount] = useState(0)

  useEffect(() => {
    api.get('/progress/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/questions/count').then(r => setQCount(r.data.total)).catch(() => {})
  }, [])

  const accuracy = stats ? Math.round(stats.accuracy * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const now = new Date()

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <p style={{ color: '#737373', fontSize: 13, marginBottom: 4 }}>{days[now.getDay()]}, {now.getDate()} de {months[now.getMonth()]}</p>
      <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>{greeting}. Bons estudos.</h1>

      {/* Briefing */}
      <div style={{ ...card, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Anchor size={16} color="#dc2626" />
        </div>
        <div>
          <p style={{ color: '#dc2626', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>BRIEFING DE HOJE</p>
          <p style={{ color: '#a3a3a3', fontSize: 13, lineHeight: 1.6 }}>
            {!stats || stats.total_answered === 0
              ? `Você está a 525 dias do concurso. Comece com qualquer questão para destravar seu progresso e calibrar sua rede cognitiva.`
              : `Você respondeu ${stats.total_answered} questões com ${accuracy}% de acerto. ${accuracy < 70 ? 'Reforce as disciplinas com menor domínio.' : 'Ótimo desempenho — mantenha a consistência diária!'}`}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard label="Score Geral" value={`${accuracy}%`} sub={`Meta: 70%`} icon={Target} highlight={accuracy >= 70} />
        <StatCard label="Meta de Hoje" value={`${stats?.total_answered ?? 0}/20`} sub="questões respondidas" icon={BookOpen} />
        <StatCard label="Sequência" value={stats?.streak ?? 0} sub={`dias · máx ${stats?.streak ?? 0}`} icon={Flame} />
        <StatCard label="Para o Concurso" value="525" sub="dias restantes" icon={Clock} highlight />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Desempenho */}
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={14} color="#dc2626" /> Desempenho por Disciplina
          </h3>
          {stats?.by_subject?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.by_subject.slice(0, 5).map(s => (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#a3a3a3', fontSize: 12 }}>{s.subject}</span>
                    <span style={{ color: '#737373', fontSize: 12 }}>{Math.round(s.accuracy * 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${Math.round(s.accuracy * 100)}%`, background: s.accuracy >= 0.7 ? '#16a34a' : s.accuracy >= 0.4 ? '#dc2626' : '#7f1d1d', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#525252', fontSize: 13 }}>Nenhuma questão respondida ainda.</p>
          )}
        </div>

        {/* Pontos Fracos */}
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#f59e0b" /> Pontos Fracos
          </h3>
          {stats?.by_subject?.filter(s => s.accuracy < 0.6).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.by_subject.filter(s => s.accuracy < 0.6).slice(0, 5).map(s => (
                <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                  <span style={{ color: '#a3a3a3', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</span>
                  <span style={{ color: '#dc2626', fontSize: 12 }}>{Math.round(s.accuracy * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#525252', fontSize: 13 }}>Responda questões para ver.</p>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        {[
          { to: '/questions', icon: BookOpen, label: 'Questões', sub: 'Praticar por disciplina', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
          { to: '/simulados', icon: ClipboardList, label: 'Simulado', sub: 'Prova completa', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)' },
          { to: '/trail', icon: Map, label: 'Trilha', sub: 'Estudo estruturado', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
        ].map(({ to, icon: Icon, label, sub, color, bg, border }) => (
          <Link key={to} to={to} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 20, textDecoration: 'none', display: 'block', transition: 'opacity 0.15s' }}>
            <Icon size={22} color={color} style={{ marginBottom: 12 }} />
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{label}</p>
            <p style={{ color: '#737373', fontSize: 12, marginTop: 3 }}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* Tutor IA CTA */}
      <div style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, #161616 100%)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="#dc2626" />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Tutor IA</p>
            <p style={{ color: '#737373', fontSize: 12, marginTop: 2 }}>Análise personalizada + plano de estudo baseado no seu desempenho.</p>
          </div>
        </div>
        <Link to="/tutor" style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          Acessar <ChevronRight size={14} />
        </Link>
      </div>

      {/* Config banner */}
      <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#e5e5e5', fontWeight: 600, fontSize: 14 }}>Configure seu perfil de estudos</p>
          <p style={{ color: '#737373', fontSize: 12, marginTop: 2 }}>Leva menos de 1 minuto e personaliza toda a sua experiência.</p>
        </div>
        <Link to="/preferences" style={{ background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 18px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Configurar
        </Link>
      </div>
    </div>
  )
}
