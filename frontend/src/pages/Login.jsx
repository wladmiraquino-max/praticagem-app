import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Anchor, ArrowRight } from 'lucide-react'
import { C } from '../theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/dashboard') }
    catch { setError('E-mail ou senha incorretos') }
    finally { setLoading(false) }
  }

  const focusStyle = { borderColor: C.accent }
  const blurStyle = { borderColor: C.border }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Anchor size={14} color="#000" />
        </div>
        <span style={{ color: C.textPrimary, fontWeight: 700, fontSize: 14 }}>Praticagem<span style={{ color: C.accent }}>Study</span></span>
      </div>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Anchor size={22} color={C.accent} />
        </div>
        <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Acessar plataforma</h1>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 26 }}>Digite seu e-mail e senha para entrar</p>

        <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail" required
            style={{ width: '100%', padding: '13px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" required
              style={{ width: '100%', padding: '13px 46px 13px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex' }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 13px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: C.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Entrando...' : <> Entrar <ArrowRight size={15} /> </>}
          </button>
        </form>
        <p style={{ color: C.textDim, fontSize: 13, marginTop: 20 }}>
          Sem acesso?{' '}<Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
