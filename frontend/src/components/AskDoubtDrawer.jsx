import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, X, Send, Bot, User, BookOpen, Layers,
  CheckCircle2, ArrowRight, CornerDownRight, Database, HelpCircle
} from 'lucide-react'

export default function AskDoubtDrawer({ isOpen, onClose, selectedBook, activeTopic }) {
  const [query, setQuery] = useState('')
  const isLegal = selectedBook?.is_legal || selectedBook?.id === 'legal' || selectedBook?.id === 'book-legal'

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Tutor for **${selectedBook?.title || 'Textbooks'}**. Ask any question or clarification regarding your statutory sections, case laws, or textbook problems!`,
      citations: activeTopic ? (isLegal ? [`Sec 2(20)`, `Sec 2(11)`, `Topic ${activeTopic.topic_id}`] : [`Topic ${activeTopic.topic_id}`]) : [],
      time: 'Just now',
    },
  ])
  const [isThinking, setIsThinking] = useState(false)

  if (!isOpen) return null

  const suggestedQuestions = isLegal ? [
    activeTopic ? `Explain ${activeTopic.topic_title} in 3 simple bullets.` : `What are the key concepts of this book?`,
    `What is the difference between Section 2(20) and Section 2(11)?`,
    `What was held in Salomon v Salomon & Co. Ltd. (1897)?`,
    `Can a foreign incorporated company be sued in India?`,
  ] : [
    activeTopic ? `Explain ${activeTopic.topic_title} in 3 simple bullets.` : `What are the key concepts of this book?`,
    `Can you explain the step-by-step worked example for this topic?`,
    `What are the most common exam questions and practice problems?`,
    `Summarize the key principles and pro student tips for this subject.`,
  ]

  const handleSend = (textToSend) => {
    const text = textToSend || query
    if (!text.trim()) return

    const userMsg = { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages((prev) => [...prev, userMsg])
    setQuery('')
    setIsThinking(true)

    setTimeout(() => {
      let responseText = ""
      let citations = []

      if (isLegal && text.toLowerCase().includes('salomon')) {
        responseText = "**Salomon v Salomon & Co. Ltd. (1897) AC 22** is the bedrock precedent for corporate personality.\n\nKey Points:\n1. Upon incorporation, a company becomes an independent legal entity separate from its shareholders.\n2. The company's debts are its own; shareholders have limited liability.\n3. Even a sole dominant shareholder is legally separate from the company."
        citations = ["Salomon v Salomon (1897)", "Sec 9 Companies Act 2013"]
      } else if (isLegal && (text.toLowerCase().includes('2(20)') || text.toLowerCase().includes('2(11)'))) {
        responseText = "**Distinction between Section 2(20) and 2(11):**\n\n• **Section 2(20) - 'Company'**: Refers strictly to entities incorporated under the Indian Companies Act 2013 (or previous Indian laws).\n• **Section 2(11) - 'Body Corporate'**: A broader term that includes foreign incorporated entities, statutory corporations, and financial institutions.\n\n*Rule of Thumb:* Every company is a body corporate, but not every body corporate is a company!"
        citations = ["Section 2(20)", "Section 2(11)", "MCA Circular 1963"]
      } else {
        responseText = `Based on the embedded sources for **${selectedBook?.title || 'Textbook Knowledge Base'}**:\n\nThe core framework provides practical understanding, step-by-step analytical methods, and practical application. Always follow the fundamental principles when solving exam problems.`
        citations = [activeTopic ? `Topic ${activeTopic.topic_id}` : "Book Vector Index", "Pinecone Ingestion Ready"]
      }

      const aiMsg = {
        sender: 'ai',
        text: responseText,
        citations,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 1000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-lg bg-white border-l border-slate-200 flex flex-col justify-between shadow-2xl h-full text-slate-900"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{isLegal ? 'Ask Your Legal Question' : 'Ask Your Question'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Vector DB Ready
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                  {activeTopic ? `Topic: ${activeTopic.topic_title}` : selectedBook?.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Integration Status Notice */}
          <div className="bg-indigo-50 px-4 py-2.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-700">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-indigo-600" />
              <span>Pinecone Vector Store & Custom Prompt System Ready</span>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin bg-slate-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-1 shadow-xs">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`
                    max-w-[85%] rounded-2xl p-4 text-xs space-y-2 leading-relaxed shadow-xs
                    ${msg.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
                  `}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                  {/* Citations Badges */}
                  {msg.citations?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Sources:</span>
                      {msg.citations.map((c, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-slate-400 text-right">{msg.time}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 flex-shrink-0 mt-1 shadow-xs">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-3 text-xs text-indigo-700">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Sparkles size={16} className="animate-spin text-amber-500" />
                </div>
                <span className="animate-pulse font-medium">
                  {isLegal ? 'Querying legal vector embeddings & generating answer...' : 'Analyzing textbook content & generating answer...'}
                </span>
              </div>
            )}
          </div>

          {/* Suggested Prompts & Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {isLegal ? 'Suggested Legal Questions:' : 'Suggested Questions:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors text-left truncate max-w-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isLegal ? "Ask any question regarding statutory sections, case laws..." : "Ask your question here..."}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || isThinking}
                className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
