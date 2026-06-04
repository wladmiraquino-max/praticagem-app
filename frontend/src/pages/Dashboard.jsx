import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api'
import { BookOpen, Target, Flame, Clock, ChevronRight, Anchor, AlertTriangle, MessageSquare, Map, ClipboardList } from 'lucide-react'
import { C, card } from '../theme'

const StatCard = ({ label, value, sub, icon: Icon, hl }) => (
  <div style={{ ...card({ padding: 20 }) }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>{label}</span>
      {Icon && <Icon size={13} color={hl ? C.accent : C.textDim} />}
    </div>
    <p style={{ color: hl ? C.accent : C.textPrimary, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ color: C.textDim, fontSize: 12, marginTop: 6 }}>{sub}</p>}
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/progress/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const accuracy = stats ? Math.round(stats.accuracy * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const now = new Date()

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 3 }}>{days[now.getDay()]}, {now.getDate()} de {months[now.getMonth()]}</p>
      <h1 style={{ color: C.textPrimary, fontSize: 24, fontWeight: 700, marginBottom: 22 }}>{greeting}. Bons estudos.</h1>

      {/* Briefing */}
      <div style={{ ...card({ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }) }}>
        <div style={{ width: 34, height: 34, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Anchor size={15} color={C.accent} />
        </div>
        <div>
          <p style={{ color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>BRIEFING DE HOJE</p>
          <p style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.6 }}>
            {!stats || stats.total_answered === 0
              ? 'Você está a 525 dias do concurso. Comece respondendo questões para ativar sua rede cognitiva e identificar seus pontos fortes e fracos.'
              : `Você respondeu ${stats.total_answered} questões com ${accuracy}% de acerto. ${accuracy < 70 ? 'Reforce as disciplinas com menor desempenho.' : 'Excelente ritmo — mantenha a consistência!'}`
            }
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="Score Geral" value={`${accuracy}%`} sub="Meta: 70%" icon={Target} hl={accuracy >= 70} />
        <StatCard label="Meta de Hoje" value={`${stats?.total_answered ?? 0}/20`} sub="questões respondidas" icon={BookOpen} />
        <StatCard label="Sequência" value={`${stats?.streak ?? 0}`} sub="dias consecutivos" icon={Flame} />
        <StatCard label="Para o Concurso" value="525" sub="dias restantes" icon={Clock} hl />
      </div>

      {/* Middle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 18 }}>
        <div style={card({ padding: 20 })}>
          <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Target size={13} color={C.accent} /> Desempenho por Disciplina
          </h3>
          {stats?.by_subject?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {stats.by_subject.slice(0, 6).map(s => (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: C.textSecondary, fontSize: 12 }}>{s.subject}</span>
                    <span style={{ color: C.textMuted, fontSize: 12 }}>{Math.round(s.accuracy * 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: '#222', borderRadius: 4 }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${Math.round(s.accuracy * 100)}%`, background: s.accuracy >= 0.7 ? C.success : s.accuracy >= 0.4 ? C.accent : C.error, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ color: C.textDim, fontSize: 13 }}>Nenhuma questão respondida ainda.</p>}
        </div>

        <div style={card({ padding: 20 })}>
          <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
            <AlertTriangle size={13} color="#f59e0b" /> Pontos Fracos
          </h3>
          {stats?.by_subject?.filter(s => s.accuracy < 0.6).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.by_subject.filter(s => s.accuracy < 0.6).slice(0, 6).map(s => (
                <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.error, flexShrink: 0 }} />
                  <span style={{ color: C.textSecondary, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</span>
                  <span style={{ color: C.error, fontSize: 12 }}>{Math.round(s.accuracy * 100)}%</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: C.textDim, fontSize: 13 }}>Responda questões para ver.</p>}
        </div>
      </div>

      {/* Quick */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
        {[
          { to: '/questions', icon: BookOpen, label: 'Questões', sub: 'Praticar por disciplina', color: C.blue, bg: C.blueDim },
          { to: '/simulados', icon: ClipboardList, label: 'Simulado', sub: 'Prova completa', color: C.purple, bg: C.purpleDim },
          { to: '/trail', icon: Map, label: 'Trilha', sub: 'Estudo estruturado', color: C.success, bg: C.successDim },
        ].map(({ to, label, sub, icon: Icon, color, bg }) => (
          <Link key={to} to={to} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: 20, textDecoration: 'none', display: 'block' }}>
            <Icon size={20} color={color} style={{ marginBottom: 10 }} />
            <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>{label}</p>
            <p style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* Tutor */}
      <div style={{ background: `linear-gradient(135deg, ${C.accentDim} 0%, ${C.card} 100%)`, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={16} color={C.accent} />
          </div>
          <div>
            <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>Tutor IA</p>
            <p style={{ color: C.textMuted, fontSize: 12 }}>Análise personalizada + plano de estudo baseado no seu desempenho.</p>
          </div>
        </div>
        <Link to="/tutor" style={{ color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          Acessar <ChevronRight size={13} />
        </Link>
      </div>

      {/* Config */}
      <div style={{ ...card({ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }) }}>
        <div>
          <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>Configure seu perfil de estudos</p>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>Leva menos de 1 minuto e personaliza toda a sua experiência.</p>
        </div>
        <Link to="/preferences" style={{ background: C.accent, color: '#000', fontWeight: 700, fontSize: 13, padding: '8px 18px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Configurar
        </Link>
      </div>
    </div>
  )
}
