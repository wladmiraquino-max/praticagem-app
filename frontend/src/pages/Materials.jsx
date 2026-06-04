import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Upload, Cpu, Trash2, Sparkles, BookOpen, Brain, X, ExternalLink, ChevronRight } from 'lucide-react'
import { C, card } from '../theme'

function Detail({ m, onClose }) {
  const [genLoading, setGenLoading] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  const gen = async () => {
    setGenLoading(true)
    try { const r = await api.post(`/materials/${m.id}/generate-questions`); setGenMsg(r.data.message) }
    finally { setGenLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ color: C.textPrimary, fontWeight: 700, fontSize: 16 }}>{m.title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {m.subject && <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: C.accentDim, color: C.accent, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{m.subject}</span>
          </div>}
          {m.summary && <div>
            <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Resumo</p>
            <p style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.summary}</p>
          </div>}
          {m.mnemonic && <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: 14 }}>
            <p style={{ color: '#a855f7', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Mnemônico</p>
            <p style={{ color: '#c084fc', fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>{m.mnemonic}</p>
          </div>}
          {m.sections?.length > 0 && <div>
            <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Seções</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {m.sections.map((s, i) => (
                <div key={i} style={{ background: '#161616', border: `1px solid ${C.border}`, borderRadius: 9, padding: 14 }}>
                  <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{s.title}</p>
                  <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.6, marginBottom: s.key_points?.length ? 8 : 0 }}>{s.content}</p>
                  {s.key_points?.map((kp, j) => <p key={j} style={{ color: C.textMuted, fontSize: 12, paddingLeft: 10, borderLeft: `2px solid ${C.accent}`, marginBottom: 4 }}>{kp}</p>)}
                </div>
              ))}
            </div>
          </div>}
          <div>
            {genMsg
              ? <p style={{ color: C.success, fontSize: 13, background: C.successDim, border: `1px solid ${C.success}33`, borderRadius: 9, padding: '10px 14px' }}>{genMsg}</p>
              : <button onClick={gen} disabled={genLoading} style={{ width: '100%', padding: '12px', background: C.accent, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: genLoading ? 0.6 : 1 }}>
                  <Sparkles size={14} />{genLoading ? 'Gerando...' : 'Gerar questões deste material'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [subject, setSubject] = useState('')
  const fileRef = useRef()

  const load = () => api.get('/materials').then(r => setMaterials(r.data))
  useEffect(() => { load() }, [])

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const form = new FormData(); form.append('file', file); if (subject) form.append('subject', subject)
    try { await api.post('/materials/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }); await load() }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const del = async (id) => { await api.delete(`/materials/${id}`); setMaterials(m => m.filter(x => x.id !== id)) }

  const subjects = ['Manobra','Arte Naval','Arquitetura Naval','Meteorologia e Oceanografia','Legislação Marítima','Navegação e Radar','Comunicações','Segurança da Navegação','Normas e Publicações','Gestão e Procedimentos','Sistemas e Equipamentos','Conhecimentos Portuários','Conhecimentos Gerais']

  return (
    <div style={{ padding: '28px 32px' }}>
      {selected && <Detail m={selected} onClose={() => setSelected(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Materiais de Estudo</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>Envie PDFs ou textos — a IA gera resumo, mnemônico e questões</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="https://stitch.withgoogle.com/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 12, textDecoration: 'none' }}>
            <ExternalLink size={12} /> Google Stitch
          </a>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '8px 12px', background: '#111', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSecondary, fontSize: 13, outline: 'none' }}>
            <option value="">Selecione a matéria</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: uploading ? '#1a1a1a' : C.accent, color: uploading ? C.textMuted : '#000', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? <><Cpu size={13} style={{ animation: 'spin 1s linear infinite' }} /> Processando...</> : <><Upload size={13} /> Enviar material</>}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" onChange={upload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </div>

      {materials.length === 0 ? (
        <div style={{ ...card({ padding: 60, textAlign: 'center', border: `1px dashed ${C.border}` }) }}>
          <Upload size={28} color={C.textDim} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: C.textMuted, fontWeight: 600, fontSize: 14 }}>Nenhum material ainda</p>
          <p style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>Envie um PDF ou texto para começar</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {materials.map(m => (
            <div key={m.id} style={card({ padding: 18 })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ background: C.accentDim, color: C.accent, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Cpu size={9} /> Processado por IA
                </span>
                <button onClick={() => del(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex' }}><Trash2 size={13} /></button>
              </div>
              <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{m.title}</p>
              {m.subject && <p style={{ color: C.accent, fontSize: 11, marginBottom: 3 }}>Disciplina: {m.subject}</p>}
              {m.summary && <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>{m.summary}</p>}
              <button onClick={() => setSelected(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                Ver detalhes <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
