import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Sparkles, Database, Minus } from 'lucide-react'

export default function AskDoubtBot({ selectedBook }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Tutor for **${selectedBook?.title || 'Textbooks'}**. Ask me any doubt or clarification regarding statutory sections or case laws!`,
      citations: ['Pinecone Vector DB Ready'],
      time: 'Just now',
    },
  ])
  const [isThinking, setIsThinking] = useState(false)

  const handleSend = (customText) => {
    const text = customText || query
    if (!text.trim()) return

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setQuery('')
    setIsThinking(true)

    // Simulate AI vector response based on embedded textbook content
    setTimeout(() => {
      let responseText = ''
      let citations = []

      if (text.toLowerCase().includes('salomon')) {
        responseText = "**Salomon v Salomon & Co. Ltd. (1897)** established the doctrine of separate corporate legal personality.\n\nKey Principles:\n1. Upon incorporation, a company becomes an independent legal entity separate from its members.\n2. Shareholders enjoy limited liability for company debts.\n3. A dominant shareholder is legally separate from the company."
        citations = ["Salomon v Salomon (1897)", "Sec 9 Companies Act 2013"]
      } else if (text.toLowerCase().includes('2(20)') || text.toLowerCase().includes('2(11)')) {
        responseText = "**Section 2(20) vs Section 2(11):**\n\n• **Section 2(20) 'Company'**: Only entities incorporated under the Indian Companies Act 2013.\n• **Section 2(11) 'Body Corporate'**: Broader umbrella including foreign companies and statutory corporations."
        citations = ["Section 2(20)", "Section 2(11)"]
      } else {
        responseText = `Based on the vector index for **${selectedBook?.title || 'Legal Textbooks'}**:\n\nThe statutory rule provides that corporate incorporation confers distinct legal personality, perpetual succession, and common seal under law.`
        citations = ["Pinecone Embeddings", "RAG Vector Store"]
      }

      const aiMsg = {
        sender: 'ai',
        text: responseText,
        citations,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 900)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button (ChatGPT Icon) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </div>
          <span className="text-xs tracking-wide">Ask a Doubt</span>
        </motion.button>
      )}

      {/* Floating ChatGPT Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden
              ${isMinimized ? 'h-14' : 'h-[500px]'}
            `}
          >
            {/* ChatGPT Header Bar */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Ask a Doubt AI Bot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">AI Tutor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Notice */}
                <div className="bg-indigo-500/10 px-3 py-1.5 border-b border-indigo-500/20 text-[10px] text-indigo-300 flex items-center gap-1.5">
                  <Database size={11} className="text-indigo-400" />
                  <span>Pinecone Vector DB RAG Search Active</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                          <Bot size={12} />
                        </div>
                      )}

                      <div
                        className={`
                          max-w-[85%] rounded-xl p-3 text-xs space-y-1.5 leading-relaxed
                          ${msg.sender === 'user'
                            ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                            : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none'}
                        `}
                      >
                        <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                        {msg.citations?.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {msg.citations.map((c, i) => (
                              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="block text-[9px] text-slate-400 text-right">{msg.time}</span>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-300">
                      <Sparkles size={13} className="animate-spin text-amber-300" />
                      <span>Searching Pinecone vector DB...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-800 bg-slate-950">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask any doubt about sections or case laws..."
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!query.trim() || isThinking}
                      className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
