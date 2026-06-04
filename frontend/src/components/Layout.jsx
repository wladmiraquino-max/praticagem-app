import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, ClipboardList, Library, Map, MessageSquare, Network, SlidersHorizontal, BarChart2, Heart, LogOut, Anchor, FileText } from 'lucide-react'

const S = {
  sidebar: { width: 230, background: '#111111', borderRight: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', top: 0, left: 0, zIndex: 50 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 18px', borderBottom: '1px solid #1f1f1f' },
  navSection: { padding: '8px 10px 4px', fontSize: 10, fontWeight: 700, color: '#525252', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 8 },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', color: active ? '#fff' : '#737373', background: active ? 'rgba(220,38,38,0.12)' : 'transparent', margin: '1px 0', transition: 'all 0.15s' }),
}

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/questions', icon: BookOpen, label: 'Questões' },
  { to: '/simulados', icon: ClipboardList, label: 'Simulados' },
  { to: '/materials', icon: Library, label: 'Materiais' },
  { to: '/trail', icon: Map, label: 'Trilha de Estudos' },
  { to: '/tutor', icon: MessageSquare, label: 'Tutor IA' },
]
const analysisNav = [
  { to: '/performance', icon: BarChart2, label: 'Desempenho' },
  { to: '/network', icon: Network, label: 'Mapa do Conhecimento' },
  { to: '/preferences', icon: SlidersHorizontal, label: 'Preferências' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={{ width: 30, height: 30, background: '#dc2626', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Anchor size={15} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Praticagem<span style={{ color: '#dc2626' }}>Study</span></span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
          {mainNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => S.navItem(isActive)}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}

          <div style={S.navSection}>Análise</div>

          {analysisNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => S.navItem(isActive)}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: exam info + user */}
        <div style={{ borderTop: '1px solid #1f1f1f' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #1f1f1f' }}>
            <p style={{ color: '#525252', fontSize: 11 }}>Concurso Prático · DPC · Marinha</p>
            <p style={{ color: '#737373', fontSize: 11, marginTop: 2 }}>Prova prevista: out/nov 2027</p>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#e5e5e5', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ color: '#dc2626', fontSize: 11 }}>premium</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#525252', display: 'flex', padding: 4 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 230, minHeight: '100vh', background: '#0a0a0a' }}>
        {children}
      </main>
    </div>
  )
}
