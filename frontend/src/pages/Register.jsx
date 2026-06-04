import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Anchor, ArrowRight } from 'lucide-react'
import { C } from '../theme'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres'); return }
    setError(''); setLoading(true)
    try { await register(form.name, form.email, form.password); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.detail || 'Erro ao criar conta') }
    finally { setLoading(false) }
  }

  const inpStyle = { width: '100%', padding: '13px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }

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
        <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Criar sua conta</h1>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 26 }}>Comece sua preparação para o concurso</p>

        <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="text" placeholder="Seu nome" value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} style={inpStyle} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
          <input type="email" placeholder="Seu e-mail" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} style={inpStyle} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} placeholder="Senha (mín. 8 caracteres)" value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inpStyle, paddingRight: 46 }} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex' }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 13px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: C.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Criando...' : <> Continuar <ArrowRight size={15} /> </>}
          </button>
        </form>
        <p style={{ color: C.textDim, fontSize: 13, marginTop: 20 }}>
          Já possui conta?{' '}<Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
