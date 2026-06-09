import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, ClipboardList, Library, Map, MessageSquare, Network, SlidersHorizontal, BarChart2, LogOut, Anchor, BookMarked, Settings, BookText } from 'lucide-react'
import { C } from '../theme'

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/questions', icon: BookOpen, label: 'Questões' },
  { to: '/simulados', icon: ClipboardList, label: 'Simulados' },
  { to: '/materials', icon: Library, label: 'Materiais' },
  { to: '/question-books', icon: BookMarked, label: 'Cadernos' },
  { to: '/trail', icon: Map, label: 'Trilha de Estudos' },
  { to: '/publications', icon: BookText, label: 'Publicações' },
  { to: '/tutor', icon: MessageSquare, label: 'Tutor IA' },
]
const analysisNav = [
  { to: '/performance', icon: BarChart2, label: 'Desempenho' },
  { to: '/network', icon: Network, label: 'Mapa do Conhecimento' },
  { to: '/preferences', icon: SlidersHorizontal, label: 'Preferências' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItem = (active) => ({
    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
    borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: 'pointer', textDecoration: 'none',
    color: active ? C.textPrimary : C.textMuted,
    background: active ? C.accentDim : 'transparent',
    borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent',
    margin: '1px 0', transition: 'all 0.12s',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <aside style={{ width: 220, background: C.sidebar, borderRight: `1px solid ${C.borderSubtle}`, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', top: 0, left: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '18px 16px 16px', borderBottom: `1px solid ${C.borderSubtle}` }}>
          <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Anchor size={14} color="#000" />
          </div>
          <span style={{ color: C.textPrimary, fontWeight: 700, fontSize: 14 }}>Praticagem<span style={{ color: C.accent }}>Study</span></span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {mainNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => navItem(isActive)}>
              <Icon size={14} />{label}
            </NavLink>
          ))}

          <div style={{ padding: '12px 10px 6px', fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Análise</div>

          {analysisNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => navItem(isActive)}>
              <Icon size={14} />{label}
            </NavLink>
          ))}
        </nav>

        {/* Exam info */}
        <div style={{ borderTop: `1px solid ${C.borderSubtle}`, padding: '10px 14px', borderBottom: `1px solid ${C.borderSubtle}` }}>
          <p style={{ color: C.textDim, fontSize: 11 }}>Prático · DPC · Marinha do Brasil</p>
          <p style={{ color: C.textMuted, fontSize: 11, marginTop: 1 }}>Prova prevista: out/nov 2027</p>
        </div>

        {/* User */}
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: C.textPrimary, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ color: C.accent, fontSize: 11 }}>premium</p>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex', padding: 3 }}>
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: C.bg }}>
        {children}
      </main>
    </div>
  )
}
