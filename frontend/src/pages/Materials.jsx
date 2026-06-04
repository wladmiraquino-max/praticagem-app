import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Upload, Cpu, ChevronRight, Trash2, Sparkles, BookOpen, Brain, X } from 'lucide-react'

function MaterialDetail({ material, onClose, onGenerateQuestions }) {
  const [genLoading, setGenLoading] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  const handleGen = async () => {
    setGenLoading(true)
    try {
      const r = await api.post(`/materials/${material.id}/generate-questions`)
      setGenMsg(r.data.message)
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{material.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {material.subject && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{material.subject}</span>
              {material.source && <span>Fonte: {material.source}</span>}
            </div>
          )}

          {material.summary && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2"><BookOpen size={14} /> Resumo</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{material.summary}</p>
            </div>
          )}

          {material.mnemonic && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <h3 className="font-semibold text-purple-800 text-sm mb-2 flex items-center gap-2"><Brain size={14} /> Mnemônico</h3>
              <p className="text-sm text-purple-700 leading-relaxed font-medium">{material.mnemonic}</p>
            </div>
          )}

          {material.sections?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2"><Sparkles size={14} /> Seções</h3>
              <div className="space-y-3">
                {material.sections.map((s, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{s.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{s.content}</p>
                    {s.key_points?.length > 0 && (
                      <ul className="space-y-1">
                        {s.key_points.map((kp, j) => (
                          <li key={j} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-orange-400 mt-0.5">•</span>{kp}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            {genMsg
              ? <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">{genMsg}</p>
              : <button
                  onClick={handleGen}
                  disabled={genLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  {genLoading ? 'Gerando questões...' : 'Gerar questões deste material'}
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

  const load = () => api.get('/materials').then((r) => setMaterials(r.data))
  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    if (subject) form.append('subject', subject)
    try {
      await api.post('/materials/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await load()
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/materials/${id}`)
    setMaterials(materials.filter((m) => m.id !== id))
  }

  return (
    <div className="p-8">
      {selected && <MaterialDetail material={selected} onClose={() => setSelected(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais de Estudo</h1>
          <p className="text-sm text-gray-500">Envie PDFs ou textos — a IA processa e gera resumo, mnemônico e questões</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none"
          >
            <option value="">Selecione a matéria</option>
            {['Manobra','Arte Naval','Arquitetura Naval','Meteorologia e Oceanografia','Legislação Marítima','Navegação e Radar','Comunicações','Segurança da Navegação','Normas e Publicações','Gestão e Procedimentos','Sistemas e Equipamentos','Conhecimentos Portuários','Conhecimentos Gerais'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className={`flex items-center gap-2 ${uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors`}>
            {uploading ? <><Cpu size={16} className="animate-spin" /> Processando...</> : <><Upload size={16} /> Enviar material</>}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <Upload size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nenhum material ainda</p>
          <p className="text-sm text-gray-400 mt-1">Envie um PDF ou texto para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Cpu size={10} /> Processado por IA
                </span>
                <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{m.title}</h3>
              {m.subject && <p className="text-xs text-gray-400 mb-1">Disciplina: {m.subject}</p>}
              {m.source && <p className="text-xs text-gray-400 mb-3 truncate">Fonte: {m.source}</p>}
              {m.summary && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{m.summary}</p>}
              <button
                onClick={() => setSelected(m)}
                className="flex items-center gap-1 text-orange-500 text-xs font-medium hover:underline"
              >
                Ver detalhes <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
