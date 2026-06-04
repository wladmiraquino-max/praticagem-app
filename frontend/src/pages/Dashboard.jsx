import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api'
import { BookOpen, Target, Flame, Clock, ChevronRight, Zap } from 'lucide-react'

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [briefing, setBriefing] = useState('')
  const [qCount, setQCount] = useState(0)

  useEffect(() => {
    api.get('/progress/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get('/questions/count').then((r) => setQCount(r.data.total)).catch(() => {})
  }, [])

  const accuracy = stats ? Math.round(stats.accuracy * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="p-8">
      {/* Banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-3 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-orange-500" />
          <span className="text-sm text-gray-600">Configure seu perfil de estudos para personalizar sua experiência.</span>
        </div>
        <Link to="/preferences" className="bg-orange-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
          Configurar
        </Link>
      </div>

      <h2 className="text-gray-500 text-sm mb-1">{greeting},</h2>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{user?.name}, bons estudos.</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Respondidas" value={stats?.total_answered ?? 0} />
        <StatCard label="Taxa de acerto" value={`${accuracy}%`} sub={`${stats?.correct ?? 0} acertos`} color="text-green-600" />
        <StatCard label="Sequência" value={stats?.streak ?? 0} sub="dia(s) consecutivo(s)" color="text-orange-500" />
        <StatCard label="Questões disponíveis" value={qCount} color="text-blue-600" />
      </div>

      {/* Continue / Quick Access */}
      <Link
        to="/questions"
        className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:border-orange-200 transition-colors mb-6 block"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
            <BookOpen size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Continue seus estudos</p>
            <p className="text-xs text-gray-400">{stats?.total_answered ?? 0} questões respondidas</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </Link>

      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Acesso Rápido</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { to: '/questions', label: 'Questões', sub: 'Responder questões', icon: BookOpen },
          { to: '/performance', label: 'Desempenho', sub: 'Ver estatísticas', icon: Target },
          { to: '/simulados', label: 'Simulados', sub: 'Prova completa', icon: Clock },
        ].map(({ to, label, sub, icon: Icon }) => (
          <Link key={to} to={to} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
              <Icon size={20} className="text-orange-500" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Matérias fracas */}
      {stats?.by_subject?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Desempenho por Matéria</h3>
          <div className="space-y-3">
            {stats.by_subject.slice(0, 5).map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{s.subject}</span>
                  <span>{Math.round(s.accuracy * 100)}% · {s.total} questões</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(s.accuracy * 100)}%`,
                      backgroundColor: s.accuracy >= 0.7 ? '#22c55e' : s.accuracy >= 0.4 ? '#f97316' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
