import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, BookOpen, ClipboardList, Library, Map,
  MessageSquare, Network, SlidersHorizontal, BarChart2,
  LogOut, Anchor
} from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/questions', icon: BookOpen, label: 'Questões' },
  { to: '/simulados', icon: ClipboardList, label: 'Simulados' },
  { to: '/materials', icon: Library, label: 'Materiais' },
  { to: '/trail', icon: Map, label: 'Trilha de Estudos' },
  { to: '/tutor', icon: MessageSquare, label: 'Tutor IA' },
  { to: '/network', icon: Network, label: 'Mapa do Conhecimento' },
  { to: '/performance', icon: BarChart2, label: 'Desempenho' },
  { to: '/preferences', icon: SlidersHorizontal, label: 'Preferências' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#0f0f13]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#16161d] border-r border-[#2a2a38] flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#2a2a38]">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Anchor size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Praticagem<span className="text-red-500">Study</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'bg-red-600/15 text-red-400 border border-red-600/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[#2a2a38] p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-red-400">premium</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} className="text-slate-500 hover:text-red-400 transition">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
