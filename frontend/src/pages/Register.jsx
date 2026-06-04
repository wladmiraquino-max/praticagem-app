import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Eye, EyeOff, Anchor } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres'); return }
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
          <Anchor size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Praticagem<span className="text-red-500">Study</span></span>
      </div>

      <div className="w-full max-w-[400px]">
        <h1 className="text-2xl font-bold text-white text-center mb-1">Criar sua conta</h1>
        <p className="text-slate-400 text-sm text-center mb-8">Comece sua preparação para o concurso</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Seu nome" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl bg-[#1c1c25] border border-[#2a2a38] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition" />

          <input type="email" placeholder="Seu e-mail" value={form.email} required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl bg-[#1c1c25] border border-[#2a2a38] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition" />

          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} placeholder="Senha (mín. 8 caracteres)" value={form.password} required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-[#1c1c25] border border-[#2a2a38] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition pr-12" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 px-4 py-2.5 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-sm">
            {loading ? 'Criando conta...' : <> Continuar <ArrowRight size={15} /> </>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Já possui conta?{' '}
          <Link to="/login" className="text-red-400 font-semibold hover:text-red-300 transition">Entrar</Link>
        </p>
      </div>

      <p className="mt-12 text-xs text-slate-600">Concurso Prático · Marinha do Brasil · DPC</p>
    </div>
  )
}
