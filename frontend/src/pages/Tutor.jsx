import { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Send, Bot, User, ChevronDown } from 'lucide-react'

export default function Tutor() {
  const [agents, setAgents] = useState([])
  const [activeAgent, setActiveAgent] = useState(null)
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    api.get('/tutor/agents').then((r) => {
      setAgents(r.data)
      if (r.data.length > 0) setActiveAgent(r.data[0])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleAgentChange = (agent) => {
    setActiveAgent(agent)
    setHistory([])
  }

  const handleSend = async () => {
    if (!input.trim() || !activeAgent) return
    const msg = input.trim()
    setInput('')
    const userMsg = { role: 'user', content: msg }
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setLoading(true)
    try {
      const apiHistory = newHistory.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
      const r = await api.post('/tutor/chat', {
        agent_id: activeAgent.id,
        message: msg,
        history: apiHistory,
      })
      setHistory([...newHistory, { role: 'assistant', content: r.data.response }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Agent selector */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Agentes Especialistas</h2>
          <p className="text-xs text-gray-400 mt-0.5">14 agentes disponíveis</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => handleAgentChange(a)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                activeAgent?.id === a.id
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs text-gray-400 mr-2">#{a.id}</span>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bot size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{activeAgent?.name || 'Selecione um agente'}</p>
              <p className="text-xs text-gray-400">{activeAgent?.subject}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 && (
            <div className="text-center py-12">
              <Bot size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Pergunte sobre {activeAgent?.subject || 'qualquer tema do concurso'}</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Explique os critérios IMO para manobras', 'Gere 3 questões de múltipla escolha', 'Crie um mnemônico para lembrar'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-orange-600" />
                </div>
              )}
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-orange-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Pergunte ao ${activeAgent?.name || 'agente'}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
