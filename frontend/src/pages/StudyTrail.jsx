import { useEffect, useState } from 'react'
import api from '../api'
import { Map, Sparkles, CheckCircle, Calendar, RefreshCw } from 'lucide-react'
import { C, card } from '../theme'

export default function StudyTrail() {
  const [trail, setTrail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/trail').then(r => setTrail(r.data)).catch(() => {}) }, [])

  const generate = async () => {
    setLoading(true)
    try { const r = await api.post('/trail/generate'); setTrail(r.data) }
    finally { setLoading(false) }
  }

  const sprints = trail?.sprints || []

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Trilha de Estudos</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>Plano personalizado de 4 semanas gerado por IA</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {trail?.next_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 12 }}>
              <Calendar size={12} /> Nova em {new Date(trail.next_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
          <button onClick={generate} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: C.accent, color: '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
            {loading ? 'Gerando...' : sprints.length === 0 ? 'Gerar trilha' : 'Atualizar trilha'}
          </button>
        </div>
      </div>

      {sprints.length === 0 ? (
        <div style={{ ...card({ padding: 60, textAlign: 'center', border: `1px dashed ${C.border}` }) }}>
          <Map size={32} color={C.textDim} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: C.textMuted, fontWeight: 600, fontSize: 14 }}>Nenhuma trilha gerada</p>
          <p style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>Clique em "Gerar trilha" para criar seu plano personalizado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sprints.map((s, i) => (
            <div key={i} style={card({ padding: 22 })}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{s.sprint}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.title}</p>
                  <p style={{ color: C.textSecondary, fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{s.description}</p>
                  {s.subjects?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Disciplinas:</span>
                      {s.subjects.map(sub => (
                        <span key={sub} style={{ background: C.accentDim, color: C.accent, fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20 }}>{sub}</span>
                      ))}
                    </div>
                  )}
                  {s.daily_goal && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', marginBottom: 12 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent }} />
                      <span style={{ color: C.textSecondary, fontSize: 12 }}>Meta diária: <strong style={{ color: C.textPrimary }}>{s.daily_goal}</strong></span>
                    </div>
                  )}
                  {s.tasks?.length > 0 && (
                    <div>
                      <p style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>O que fazer</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {s.tasks.map((t, j) => (
                          <div key={j} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                            <CheckCircle size={13} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
