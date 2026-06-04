import { useEffect, useState } from 'react'
import api from '../api'
import { Brain, Target } from 'lucide-react'
import { C, card } from '../theme'

const COLORS = { 'Manobra':'#ef4444','Arte Naval':'#f97316','Arquitetura Naval':'#eab308','Meteorologia e Oceanografia':'#22c55e','Legislação Marítima':'#3b82f6','Navegação e Radar':'#8b5cf6','Comunicações':'#ec4899','Segurança da Navegação':'#14b8a6','Normas e Publicações':C.accent,'Gestão e Procedimentos':'#10b981','Sistemas e Equipamentos':'#6366f1','Conhecimentos Portuários':'#84cc16','Outros Assuntos':'#94a3b8','Conhecimentos Gerais':'#0ea5e9' }

export default function Network() {
  const [knowledge, setKnowledge] = useState([])
  useEffect(() => { api.get('/progress/knowledge').then(r => setKnowledge(r.data)).catch(() => {}) }, [])

  const dominated = knowledge.filter(k => k.mastery >= 80).length
  const building = knowledge.filter(k => k.mastery >= 40 && k.mastery < 80).length
  const weak = knowledge.filter(k => k.mastery > 0 && k.mastery < 40).length
  const coverage = knowledge.length > 0 ? (knowledge.length / 14) * 100 : 0
  const avg = knowledge.length ? knowledge.reduce((s, k) => s + k.mastery, 0) / knowledge.length : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Brain size={20} color={C.accent} />
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700 }}>Mapa do Conhecimento</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>Atualizado a cada resposta — reflexo do seu domínio real</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[['Dominados', dominated, C.success],['Em construção', building, C.accent],['Fracos', weak, C.error],['Cobertura', `${coverage.toFixed(0)}%`, C.textPrimary]].map(([l,v,color]) => (
          <div key={l} style={card({ padding: 18 })}>
            <p style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{l}</p>
            <p style={{ color, fontSize: 28, fontWeight: 700 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Prontidão */}
      <div style={card({ padding: 18, marginBottom: 18 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ color: C.textSecondary, fontSize: 13, fontWeight: 600 }}>Prontidão para o concurso</p>
          <p style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>~{Math.max(4, Math.round(52 - coverage / 2))} semanas</p>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: C.textDim, marginBottom: 10 }}>
          <span>Mastery médio: {avg.toFixed(0)}% / 60%</span>
          <span>Cobertura: {coverage.toFixed(0)}% / 70%</span>
        </div>
        <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3 }}>
          <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.accentHover})`, width: `${Math.min(100, coverage)}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* By subject bars */}
      {knowledge.length > 0 && (
        <div style={card({ padding: 20, marginBottom: 18 })}>
          <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Domínio por disciplina</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {knowledge.map(k => (
              <div key={k.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: C.textSecondary, fontSize: 12 }}>{k.subject}</span>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{k.mastery.toFixed(0)}% · {k.concept_count} conceitos</span>
                </div>
                <div style={{ height: 4, background: '#1a1a1a', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${k.mastery}%`, background: COLORS[k.subject] || C.accent, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bubble map */}
      <div style={card({ padding: 20 })}>
        <h3 style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Sua rede por matéria</h3>
        <p style={{ color: C.textDim, fontSize: 12, marginBottom: 14 }}>Tamanho = conceitos estudados · Cor = nível de domínio</p>
        {knowledge.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Brain size={32} color={C.textDim} style={{ margin: '0 auto 10px' }} />
            <p style={{ color: C.textDim, fontSize: 13 }}>Responda questões para construir sua rede</p>
          </div>
        ) : (
          <div style={{ position: 'relative', height: 240, background: '#0e0e0e', borderRadius: 10, overflow: 'hidden' }}>
            {knowledge.map((k, i) => {
              const size = Math.max(44, Math.min(96, 44 + k.concept_count * 5))
              const cols = 4
              const x = ((i % cols) / cols) * 90 + 5
              const y = (Math.floor(i / cols) / Math.ceil(knowledge.length / cols)) * 80 + 10
              return (
                <div key={k.subject} title={`${k.subject}: ${k.mastery.toFixed(0)}%`}
                  style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: k.mastery === 0 ? '#1a1a1a' : COLORS[k.subject] || C.accent, opacity: k.mastery === 0 ? 0.4 : 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', color: '#fff', fontSize: size < 60 ? 9 : 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, padding: 4, cursor: 'default' }}>
                  {k.subject.split(' ').slice(0, 2).join(' ')}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
