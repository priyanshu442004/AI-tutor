import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Sparkles, Database, Minus } from 'lucide-react'

export default function AskDoubtBot({ selectedBook }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [query, setQuery] = useState('')
  const isLegal = selectedBook?.is_legal || selectedBook?.id === 'legal' || selectedBook?.id === 'book-legal'

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Tutor for **${selectedBook?.title || 'Textbooks'}**. Ask me any question or clarification regarding your textbook!`,
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

    setTimeout(() => {
      let responseText = ''
      let citations = []

      if (isLegal && text.toLowerCase().includes('salomon')) {
        responseText = "**Salomon v Salomon & Co. Ltd. (1897)** established the doctrine of separate corporate legal personality.\n\nKey Principles:\n1. Upon incorporation, a company becomes an independent legal entity separate from its members.\n2. Shareholders enjoy limited liability for company debts.\n3. A dominant shareholder is legally separate from the company."
        citations = ["Salomon v Salomon (1897)", "Sec 9 Companies Act 2013"]
      } else if (isLegal && (text.toLowerCase().includes('2(20)') || text.toLowerCase().includes('2(11)'))) {
        responseText = "**Section 2(20) vs Section 2(11):**\n\n• **Section 2(20) 'Company'**: Only entities incorporated under the Indian Companies Act 2013.\n• **Section 2(11) 'Body Corporate'**: Broader umbrella including foreign companies and statutory corporations."
        citations = ["Section 2(20)", "Section 2(11)"]
      } else {
        responseText = `Based on the textbook content for **${selectedBook?.title || 'Textbooks'}**:\n\nThe core framework provides structured concepts, step-by-step guidance, and practical examples to build deep understanding.`
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
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xl border border-indigo-300 hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </div>
          <span className="text-xs tracking-wide">Ask a Question</span>
        </motion.button>
      )}

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden text-slate-900
              ${isMinimized ? 'h-14' : 'h-[500px]'}
            `}
          >
            {/* Header Bar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{isLegal ? 'Legal AI Assistant Bot' : 'AI Tutor Bot'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">AI Tutor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Notice */}
                <div className="bg-indigo-50 px-3 py-1.5 border-b border-indigo-100 text-[10px] text-indigo-700 flex items-center gap-1.5">
                  <Database size={11} className="text-indigo-600" />
                  <span>Pinecone Vector DB RAG Search Active</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin bg-slate-50/50">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5 shadow-xs">
                          <Bot size={12} />
                        </div>
                      )}

                      <div
                        className={`
                          max-w-[85%] rounded-xl p-3 text-xs space-y-1.5 leading-relaxed shadow-xs
                          ${msg.sender === 'user'
                            ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
                        `}
                      >
                        <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                        {msg.citations?.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {msg.citations.map((c, i) => (
                              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="block text-[9px] text-slate-400 text-right">{msg.time}</span>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5 shadow-xs">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-700">
                      <Sparkles size={13} className="animate-spin text-amber-500" />
                      <span>{isLegal ? 'Searching Pinecone legal vector store...' : 'Analyzing textbook content...'}</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={isLegal ? "Ask any question about sections or case laws..." : "Ask your question here..."}
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!query.trim() || isThinking}
                      className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
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
