import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Anchor, Eye, EyeOff } from 'lucide-react'

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

  const field = (label, key, type, placeholder) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={key === 'password' ? (showPwd ? 'text' : 'password') : type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#f5f5f7] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition pr-10"
        />
        {key === 'password' && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Anchor size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Criar sua conta</h1>
            <p className="text-sm text-gray-500 mt-1">para continuar em Praticagem</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {field('Nome', 'name', 'text', 'Seu nome')}
              {field('Seu e-mail', 'email', 'email', 'email@exemplo.com')}
              {field('Senha', 'password', 'password', 'Mínimo 8 caracteres')}
              <p className="text-xs text-gray-400 -mt-2">Sua senha deve conter 8 ou mais caracteres.</p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm mt-2"
              >
                {loading ? 'Criando conta...' : <> Continuar <ArrowRight size={15} /> </>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Possui uma conta?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>

          <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Concurso Prático — Marinha do Brasil · DPC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
