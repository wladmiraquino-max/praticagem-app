import { useEffect, useState } from 'react'
import api from '../api'
import { Key, CheckCircle, AlertCircle, Save, Eye, EyeOff } from 'lucide-react'
import { C, card, input, btn } from '../theme'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState(null) // { configured, prefix }
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok'|'err', text }

  useEffect(() => {
    api.get('/settings/ai-key')
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ configured: false, prefix: '' }))
  }, [])

  const handleSave = async () => {
    if (!apiKey.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      const r = await api.post('/settings/ai-key', { api_key: apiKey.trim() })
      setMessage({ type: 'ok', text: r.data.message })
      setStatus({ configured: true, prefix: apiKey.trim().slice(0, 12) + '...' })
      setApiKey('')
    } catch (e) {
      setMessage({ type: 'err', text: e.response?.data?.detail || 'Erro ao salvar chave.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: C.textPrimary, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Configurações</h1>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Configure integrações necessárias para as funcionalidades de IA.</p>
      </div>

      {/* API Key Card */}
      <div style={{ ...card(), padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Key size={16} color={C.accent} />
          <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 15 }}>Chave Anthropic (Claude)</p>
        </div>

        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Necessária para o Tutor IA, extração de questões dos cadernos e importação de gabaritos comentados.
          Obtenha em <span style={{ color: C.accent }}>console.anthropic.com</span>.
        </p>

        {/* Status atual */}
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: status.configured ? C.successDim : C.errorDim, border: `1px solid ${status.configured ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: 20 }}>
            {status.configured
              ? <CheckCircle size={14} color={C.success} />
              : <AlertCircle size={14} color={C.error} />}
            <span style={{ color: status.configured ? C.success : C.error, fontSize: 13, fontWeight: 500 }}>
              {status.configured
                ? `Chave configurada: ${status.prefix}`
                : 'Chave não configurada — funcionalidades de IA indisponíveis'}
            </span>
          </div>
        )}

        {/* Input */}
        <label style={{ color: C.textSecondary, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
          {status?.configured ? 'Substituir chave atual' : 'Inserir chave Anthropic'}
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{ ...input(), paddingRight: 44, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button
            onClick={() => setShowKey(v => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex' }}
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey.trim() || saving}
          style={{ ...btn(), opacity: (!apiKey.trim() || saving) ? 0.5 : 1 }}
        >
          <Save size={14} />
          {saving ? 'Salvando...' : 'Salvar chave'}
        </button>

        {/* Feedback */}
        {message && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: message.type === 'ok' ? C.successDim : C.errorDim, border: `1px solid ${message.type === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {message.type === 'ok'
              ? <CheckCircle size={14} color={C.success} />
              : <AlertCircle size={14} color={C.error} />}
            <span style={{ color: message.type === 'ok' ? C.success : C.error, fontSize: 13 }}>{message.text}</span>
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{ ...card(), padding: 18, background: C.accentDim, border: `1px solid ${C.accentBorder}` }}>
        <p style={{ color: C.accent, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Sobre a chave</p>
        <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.6 }}>
          A chave é salva localmente no servidor ({String.raw`backend\.env`}) e carregada automaticamente a cada reinício.
          Ela nunca é enviada para fora deste servidor local.
        </p>
      </div>
    </div>
  )
}
