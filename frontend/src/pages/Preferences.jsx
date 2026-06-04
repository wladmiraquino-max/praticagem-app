import { useEffect, useState } from 'react'
import api from '../api'
import { Check, Save } from 'lucide-react'
import { C, card } from '../theme'

const OPT = {
  difficulty: ['Automático (SM-2)', 'Fácil', 'Médio', 'Difícil'],
  format: ['Misto', 'Questões', 'Leitura', 'Tutor IA'],
  schedule: ['Flexível', 'Manhã', 'Tarde', 'Noite'],
  session_volume: ['Curta (15-20)', 'Médio (30q)', 'Longa (50+)'],
}

const Section = ({ title, desc, children }) => (
  <div style={{ marginBottom: 28 }}>
    <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{title}</p>
    {desc && <p style={{ color: C.textDim, fontSize: 12, marginBottom: 12 }}>{desc}</p>}
    {children}
  </div>
)

const Chips = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${value === o ? C.accent : C.border}`, background: value === o ? C.accentDim : 'transparent', color: value === o ? C.accent : C.textSecondary, fontSize: 13, fontWeight: value === o ? 600 : 400, cursor: 'pointer', transition: 'all 0.12s' }}>
        {o}
      </button>
    ))}
  </div>
)

export default function Preferences() {
  const [prefs, setPrefs] = useState({ difficulty: 'Automático (SM-2)', format: 'Misto', schedule: 'Flexível', session_volume: 'Médio (30q)', notes: '', exam_date: '10/11/2027', daily_hours: 2 })
  const [saved, setSaved] = useState(false)

  useEffect(() => { api.get('/preferences').then(r => setPrefs(r.data)).catch(() => {}) }, [])

  const save = async () => {
    await api.put('/preferences', prefs)
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 620 }}>
      <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Preferências de estudo</h1>
      <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 28 }}>O tutor IA e a trilha vão respeitar essas escolhas.</p>

      <Section title="Dificuldade favorita" desc="Como você prefere que as questões sejam recomendadas.">
        <Chips options={OPT.difficulty} value={prefs.difficulty} onChange={v => setPrefs({ ...prefs, difficulty: v })} />
      </Section>

      <Section title="Formato favorito" desc="A trilha vai priorizar esse formato nas sugestões.">
        <Chips options={OPT.format} value={prefs.format} onChange={v => setPrefs({ ...prefs, format: v })} />
      </Section>

      <Section title="Horário preferido" desc="Quando você costuma estudar com mais foco.">
        <Chips options={OPT.schedule} value={prefs.schedule} onChange={v => setPrefs({ ...prefs, schedule: v })} />
      </Section>

      <Section title="Volume de sessão" desc="Tamanho das listas que o tutor sugere.">
        <Chips options={OPT.session_volume} value={prefs.session_volume} onChange={v => setPrefs({ ...prefs, session_volume: v })} />
      </Section>

      <Section title="Data prevista da prova">
        <input type="text" value={prefs.exam_date} onChange={e => setPrefs({ ...prefs, exam_date: e.target.value })} placeholder="DD/MM/AAAA"
          style={{ padding: '10px 14px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, color: C.textPrimary, fontSize: 14, outline: 'none', width: 160 }} />
        <p style={{ color: C.textDim, fontSize: 12, marginTop: 6 }}>Previsão — o edital oficial ainda não foi publicado.</p>
      </Section>

      <Section title={`Horas disponíveis por dia: ${prefs.daily_hours}h`}>
        <input type="range" min={1} max={8} value={prefs.daily_hours} onChange={e => setPrefs({ ...prefs, daily_hours: Number(e.target.value) })}
          style={{ width: '100%', accentColor: C.accent }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: C.textDim, fontSize: 11 }}>1h</span>
          <span style={{ color: C.textDim, fontSize: 11 }}>8h</span>
        </div>
      </Section>

      <Section title="Notas pessoais para o tutor" desc='Ex: "Sou náutico com 5 anos de experiência", "Tenho dificuldade em meteorologia"'>
        <textarea value={prefs.notes} onChange={e => setPrefs({ ...prefs, notes: e.target.value })} rows={4} maxLength={500} placeholder="(opcional)"
          style={{ width: '100%', padding: '12px 14px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 9, color: C.textPrimary, fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        <p style={{ color: C.textDim, fontSize: 11, textAlign: 'right', marginTop: 4 }}>{prefs.notes.length}/500</p>
      </Section>

      <button onClick={save} style={{ padding: '12px 28px', background: saved ? C.success : C.accent, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.2s' }}>
        {saved ? <><Check size={15} /> Salvo!</> : <><Save size={15} /> Salvar preferências</>}
      </button>
    </div>
  )
}
