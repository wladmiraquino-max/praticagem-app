import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Anchor, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(email, password); navigate('/dashboard') }
    catch { setError('E-mail ou senha incorretos') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Top logo */}
      <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#dc2626', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Anchor size={16} color="#fff" />
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Praticagem<span style={{ color: '#dc2626' }}>Study</span></span>
      </div>

      {/* Form area */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Icon */}
        <div style={{ width: 56, height: 56, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Anchor size={24} color="#dc2626" />
        </div>

        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Acessar plataforma</h1>
        <p style={{ color: '#737373', fontSize: 14, marginBottom: 28, textAlign: 'center' }}>Digite seu e-mail e senha para entrar</p>

        <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Seu e-mail" required
            style={{ width: '100%', padding: '14px 16px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#dc2626'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha" required
              style={{ width: '100%', padding: '14px 48px 14px 16px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#dc2626'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#525252' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#dc2626', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Entrando...' : <> Entrar <ArrowRight size={16} /> </>}
          </button>
        </form>

        <p style={{ color: '#525252', fontSize: 13, marginTop: 24 }}>
          Sem acesso?{' '}
          <Link to="/register" style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
