import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Anchor } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Anchor size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Entrar</h1>
            <p className="text-sm text-gray-500 mt-1">para continuar em Praticagem</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Seu e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#f5f5f7] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#f5f5f7] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm mt-2"
              >
                {loading ? 'Entrando...' : <> Continuar <ArrowRight size={15} /> </>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Não possui uma conta?{' '}
              <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                Registre-se
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Concurso Prático — Marinha do Brasil · DPC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
