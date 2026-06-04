import { useEffect, useState } from 'react'
import api from '../api'
import { Save, Check } from 'lucide-react'

const OPTIONS = {
  difficulty: ['Automático (SM-2)', 'Fácil', 'Médio', 'Difícil'],
  format: ['Misto', 'Questões', 'Leitura', 'Tutor IA'],
  schedule: ['Flexível', 'Manhã', 'Tarde', 'Noite'],
  session_volume: ['Curta (15-20)', 'Médio (30q)', 'Longa (50+)'],
}

function OptionGroup({ label, description, options, value, onChange }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{label}</h3>
      {description && <p className="text-xs text-gray-400 mb-3">{description}</p>}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              value === opt
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    difficulty: 'Automático (SM-2)',
    format: 'Misto',
    schedule: 'Flexível',
    session_volume: 'Médio (30q)',
    notes: '',
    exam_date: '10/11/2027',
    daily_hours: 2,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/preferences').then((r) => setPrefs(r.data)).catch(() => {})
  }, [])

  const handleSave = async () => {
    await api.put('/preferences', prefs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Preferências de estudo</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">O tutor IA e a trilha vão respeitar essas escolhas. Tudo opcional.</p>

      <OptionGroup
        label="Dificuldade favorita"
        description="Como você prefere que as questões sejam recomendadas."
        options={OPTIONS.difficulty}
        value={prefs.difficulty}
        onChange={(v) => setPrefs({ ...prefs, difficulty: v })}
      />

      <OptionGroup
        label="Formato favorito"
        description="A trilha vai priorizar esse formato nas sugestões."
        options={OPTIONS.format}
        value={prefs.format}
        onChange={(v) => setPrefs({ ...prefs, format: v })}
      />

      <OptionGroup
        label="Horário preferido"
        description="Quando você costuma estudar com mais foco."
        options={OPTIONS.schedule}
        value={prefs.schedule}
        onChange={(v) => setPrefs({ ...prefs, schedule: v })}
      />

      <OptionGroup
        label="Volume de sessão"
        description="Tamanho das listas que o tutor sugere."
        options={OPTIONS.session_volume}
        value={prefs.session_volume}
        onChange={(v) => setPrefs({ ...prefs, session_volume: v })}
      />

      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Data prevista da prova</h3>
        <input
          type="text"
          value={prefs.exam_date}
          onChange={(e) => setPrefs({ ...prefs, exam_date: e.target.value })}
          placeholder="DD/MM/AAAA"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
        />
        <p className="text-xs text-gray-400 mt-1">Previsão — o edital oficial ainda não foi publicado.</p>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Horas disponíveis por dia</h3>
        <input
          type="range"
          min={1}
          max={8}
          value={prefs.daily_hours}
          onChange={(e) => setPrefs({ ...prefs, daily_hours: Number(e.target.value) })}
          className="w-full accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1h</span>
          <span className="font-medium text-orange-600">{prefs.daily_hours}h</span>
          <span>8h</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Notas pessoais para o tutor</h3>
        <p className="text-xs text-gray-400 mb-2">O que você quer que o tutor IA saiba sobre você?</p>
        <textarea
          value={prefs.notes}
          onChange={(e) => setPrefs({ ...prefs, notes: e.target.value })}
          placeholder='Ex: "Sou náutico com 5 anos de experiência", "Tenho dificuldade em meteorologia"'
          rows={4}
          maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{prefs.notes.length}/500</p>
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {saved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Salvar preferências</>}
      </button>
    </div>
  )
}
