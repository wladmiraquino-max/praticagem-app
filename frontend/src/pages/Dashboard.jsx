import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api'
import {
  BookOpen, Target, Flame, Clock, ChevronRight,
  Anchor, AlertTriangle, MessageSquare, Map, ClipboardList
} from 'lucide-react'

function StatCard({ label, value, sub, accent = false, icon: Icon }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-red-600/10 border-red-600/20' : 'bg-[#1c1c25] border-[#2a2a38]'}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        {Icon && <Icon size={14} className={accent ? 'text-red-400' : 'text-slate-500'} />}
      </div>
      <p className={`text-3xl font-bold ${accent ? 'text-red-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
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
  const timeLabel = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const dayNames = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']
  const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const now = new Date()
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} de ${monthNames[now.getMonth()]}`

  return (
    <div className="p-8">
      <p className="text-slate-400 text-sm mb-1">{dateStr}</p>
      <h1 className="text-2xl font-bold text-white mb-6">{timeLabel}. Bons estudos.</h1>

      {/* Briefing */}
      <div className="bg-[#1c1c25] border border-[#2a2a38] rounded-xl p-5 flex items-start gap-4 mb-6">
        <div className="w-9 h-9 bg-red-600/15 border border-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Anchor size={16} className="text-red-400" />
        </div>
        <div>
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">BRIEFING DE HOJE</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {!stats || stats.total_answered === 0
              ? 'Você está iniciando sua preparação. Comece com qualquer questão para destravar seu progresso e calibrar sua rede cognitiva.'
              : `Você respondeu ${stats.total_answered} questões com ${accuracy}% de acerto. ${accuracy < 70 ? 'Foque nas matérias com menor domínio.' : 'Ótimo ritmo — mantenha a consistência!'}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Score Geral" value={`${accuracy}%`} sub="Meta: 70%" accent={accuracy >= 70} icon={Target} />
        <StatCard label="Meta de Hoje" value={`${stats?.total_answered ?? 0}/20`} sub="questões" icon={BookOpen} />
        <StatCard label="Sequência" value={stats?.streak ?? 0} sub="dias consecutivos" icon={Flame} />
        <StatCard label="Para a Prova" value="525" sub="dias restantes" icon={Clock} />
      </div>

      {/* Desempenho + Pontos Fracos */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-[#1c1c25] border border-[#2a2a38] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={14} className="text-red-400" /> Desempenho por Disciplina
          </h3>
          {stats?.by_subject?.length > 0 ? (
            <div className="space-y-3">
              {stats.by_subject.slice(0, 5).map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{s.subject}</span>
                    <span>{Math.round(s.accuracy * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a38] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.round(s.accuracy * 100)}%`,
                      backgroundColor: s.accuracy >= 0.7 ? '#16a34a' : s.accuracy >= 0.4 ? '#dc2626' : '#7f1d1d'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Nenhuma questão respondida ainda.</p>
          )}
        </div>

        <div className="bg-[#1c1c25] border border-[#2a2a38] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-yellow-500" /> Pontos Fracos
          </h3>
          {stats?.by_subject?.filter(s => s.accuracy < 0.6).length > 0 ? (
            <div className="space-y-2">
              {stats.by_subject.filter(s => s.accuracy < 0.6).slice(0, 4).map(s => (
                <div key={s.subject} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-xs text-slate-400 truncate">{s.subject}</span>
                  <span className="text-xs text-red-400 ml-auto">{Math.round(s.accuracy * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Responda questões para ver.</p>
          )}
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { to: '/questions', label: 'Questões', sub: 'Praticar por disciplina', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { to: '/simulados', label: 'Simulado', sub: 'Prova completa', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { to: '/trail', label: 'Trilha', sub: 'Estudo estruturado', icon: Map, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        ].map(({ to, label, sub, icon: Icon, color, bg }) => (
          <Link key={to} to={to} className={`${bg} border rounded-xl p-5 hover:opacity-80 transition block`}>
            <Icon size={22} className={`${color} mb-3`} />
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Tutor CTA */}
      <div className="bg-gradient-to-r from-red-950/40 to-[#1c1c25] border border-red-900/30 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600/20 border border-red-600/30 rounded-xl flex items-center justify-center">
            <MessageSquare size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Tutor IA</p>
            <p className="text-xs text-slate-400">Análise personalizada + plano de estudo baseado no seu desempenho.</p>
          </div>
        </div>
        <Link to="/tutor" className="text-red-400 text-sm font-semibold hover:text-red-300 flex items-center gap-1 whitespace-nowrap">
          Acessar <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
