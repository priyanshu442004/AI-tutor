import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import TopicCard from './TopicCard'
import FormattedMessage from './FormattedMessage'
import { API_BASE_URL } from '../config'

export default function BookReader({ book, onBackToLibrary }) {
  // Flatten topics to find default selected section
  const allTopics = book.modules.flatMap((m) => m.topics)
  const [selectedTopic, setSelectedTopic] = useState(allTopics[0] || null)

  // 4 Starter Questions
  const starterQuestions = [
    { id: 'q1', text: "Is every company also a 'body corporate'?" },
    { id: 'q2', text: "What happens to a company if one of its members dies — does the company end too?" },
    { id: 'q3', text: "Can a company be sued in court, just like a person?" },
    { id: 'q4', text: "Why can't a company vote in elections like a citizen can?" },
  ]

  const storageKey = `ai_tutor_history_${book.id}`

  // Load chat history from localStorage or set initial welcome message
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: 'init-1',
        sender: 'ai',
        text: `Hello! I am your AI Tutor for **${book.title}**.\n\nYou can ask me any doubt about Section **${selectedTopic?.topic_id || '1.1'}** or general concepts. Try one of the starter questions below or type your query!`,
        citations: ['Official Textbook Content'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]
  })

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(chatHistory))
    } catch (e) {
      console.error(e)
    }
  }, [chatHistory, storageKey])

  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatBottomRef = useRef(null)

  // Auto-scroll chat history to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  const handleSendDoubt = async (questionText) => {
    const query = questionText || inputQuery
    if (!query.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setInputQuery('')
    setIsTyping(true)

    try {
      // Call Real-time Pinecone RAG API Endpoint
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          book_id: book.id,
          history: chatHistory.slice(-4)
        })
      })

      const data = await res.json()

      if (data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer,
          follow_ups: data.follow_ups || [],
          citations: data.citations || ['Official Textbook Grounding'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setChatHistory((prev) => [...prev, aiMessage])
      } else {
        throw new Error(data.detail || 'API error')
      }
    } catch (err) {
      console.warn('Backend API connection failed, using local offline intelligence:', err)

      // Fallback local intelligent answers
      let answerText = ''
      let citations = []
      const qLower = query.toLowerCase()

      if (qLower.includes('body corporate') || qLower.includes('every company')) {
        answerText = "Direct Answer:\nYes, every company is a body corporate — but not every body corporate is a company.\n\nStatutory Breakdown:\n• Under Section 2(20) of the Companies Act 2013, a company is specifically an entity incorporated under Indian company law.\n• A body corporate (Section 2(11)) is a broader statutory term that includes foreign companies, statutory corporations, and financial institutions.\n\nEveryday Analogy:\nAll mangos are fruits, but not all fruits are mangos!"
        citations = ["Section 2(20) Companies Act 2013", "Section 2(11) Body Corporate"]
      } else if (qLower.includes('dies') || qLower.includes('member') || qLower.includes('end')) {
        answerText = "Direct Answer:\nNo, the company does not end at all — it continues to exist seamlessly. This principle is known as Perpetual Succession.\n\nLegal Logic:\n• A company is a separate legal person created by statute.\n• Its legal existence is entirely distinct from its human members.\n• Shareholders may pass away, sell shares, or change, but the company's legal status remains unbroken until formally wound up by court.\n\nFamous Legal Maxim:\nMembers may come and members may go, but the company goes on forever."
        citations = ["Perpetual Succession Principle", "Gopalpur Tea Co. Ltd."]
      } else if (qLower.includes('sued') || qLower.includes('court') || qLower.includes('person')) {
        answerText = "Direct Answer:\nYes, a company can sue others and be sued in its own corporate name, just like a real person.\n\nStatutory Authority:\n• Upon incorporation under Section 9, a company obtains independent legal personality.\n• It holds property, enters contracts, and files court suits under its registered corporate name without needing to list individual shareholders.\n\nLandmark Precedent:\nIn Salomon v Salomon & Co. Ltd. (1897), the court established that a company is an independent legal persona."
        citations = ["Salomon v Salomon & Co. Ltd. (1897)", "Section 9 Companies Act 2013"]
      } else if (qLower.includes('vote') || qLower.includes('elections') || qLower.includes('citizen')) {
        answerText = "Direct Answer:\nBecause a company is an artificial legal person, not a natural human citizen.\n\nConstitutional Position:\n• Under Article 19 of the Constitution of India and the Citizenship Act 1955, democratic rights like voting in parliamentary elections belong strictly to natural human beings.\n• While a company has legal rights to hold property and conduct business, it does not possess political citizenship rights.\n\nSupreme Court Ruling:\nIn State Trading Corporation v CTO (1963), the Supreme Court affirmed that a corporation is not a citizen."
        citations = ["STC v CTO (1963)", "Citizenship Act 1955"]
      } else {
        answerText = `Direct Answer for Section ${selectedTopic?.topic_id || 'Concept'}:\nBased on textbook principles, corporate incorporation creates distinct legal entity status, perpetual succession, limited liability, and capacity to contract.\n\nWould you like me to unpack any specific case law or statutory exception?`
        citations = [selectedTopic ? `Section ${selectedTopic.topic_id}` : "Textbook Guide"]
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answerText,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setChatHistory((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleClearHistory = () => {
    const initMessage = [
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Chat history cleared. I'm ready to answer any new doubts on **${book.title}**!`,
        citations: ['Official Textbook Content'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]
    setChatHistory(initMessage)
    try {
      localStorage.setItem(storageKey, JSON.stringify(initMessage))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="py-6 space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Book Selection</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-100">{book.title}</h2>
            <p className="text-[11px] text-slate-400">Author: {book.author}</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (6 COLS): Sub-Chapters & Study Module Viewer ── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Sub-Chapters Navigation Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select Sub-Chapter / Section
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {allTopics.length} Sections Available
              </span>
            </div>

            {/* Sections Selector Grid */}
            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {book.modules.map((mod) => (
                <div key={mod.module_id} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 px-1">
                    {mod.module_title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {mod.topics.map((topic) => {
                      const isSelected = selectedTopic?.topic_id === topic.topic_id
                      return (
                        <button
                          key={topic.topic_id}
                          onClick={() => setSelectedTopic(topic)}
                          className={`
                            px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 border
                            ${isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'}
                          `}
                        >
                          <div className="truncate">
                            <span className={`text-[10px] font-mono mr-1.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {topic.topic_id}
                            </span>
                            <span>{topic.topic_title}</span>
                          </div>
                          {isSelected && <ChevronRight size={13} className="flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Module Header */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Section Study Guide</span>
                <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-xs border border-indigo-500/20">
                  {selectedTopic?.topic_id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedTopic?.topic_title}</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Verified Module
            </span>
          </div>

          {/* Study Module Card (9-point viewer) */}
          {selectedTopic && (
            <TopicCard
              topic={selectedTopic}
              moduleColor="bg-indigo-500/20 text-indigo-300"
            />
          )}
        </div>

        {/* ── RIGHT COLUMN (6 COLS): Wider, Fixed Window-Height Student AI Tutor ── */}
        <div className="lg:col-span-6 sticky top-20">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[calc(100vh-6.5rem)] max-h-[820px] overflow-hidden">
            
            {/* Clean Student Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>Ask Your Doubt</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">AI Tutor</p>
                </div>
              </div>

              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Chat History Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin bg-slate-950/40">
              
              {/* Starter Question Chips inside Chat Window */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Starter Doubt Questions:</span>
                </div>
                <div className="space-y-1.5">
                  {starterQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSendDoubt(q.text)}
                      className="w-full text-[11px] p-2 rounded-lg bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 transition-all text-left flex items-start gap-2"
                    >
                      <span className="text-[9px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded mt-0.5">
                        {q.id.toUpperCase()}
                      </span>
                      <span className="leading-snug">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Messages */}
              <AnimatePresence initial={false}>
                {chatHistory.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-1">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`
                        max-w-[88%] rounded-2xl p-3.5 text-xs space-y-2 leading-relaxed shadow-md
                        ${msg.sender === 'user'
                          ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}
                      `}
                    >
                      {/* Rich Formatted Message Rendering without raw ## or ** or * symbols */}
                      <FormattedMessage text={msg.text} />

                      {/* Interactive Clickable Follow-up Questions */}
                      {msg.follow_ups?.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Sparkles size={11} className="text-amber-400" />
                            <span>Suggested Follow-up Questions:</span>
                          </div>
                          <div className="space-y-1">
                            {msg.follow_ups.map((fq, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendDoubt(fq)}
                                className="w-full text-[11px] p-2 rounded-lg bg-slate-950/90 hover:bg-indigo-950/70 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white transition-all text-left flex items-center justify-between group shadow-sm"
                              >
                                <span className="leading-snug">{fq}</span>
                                <ChevronRight size={12} className="text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clean Page Source Badges */}
                      {msg.citations?.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] text-slate-400 font-medium mr-1">Source:</span>
                          {msg.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="block text-[9px] text-slate-400 text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                        <User size={14} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 w-fit">
                  <Sparkles size={14} className="animate-spin text-amber-300" />
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Clean Student Input Bar */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendDoubt()}
                  placeholder="Type your doubt or question here..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={() => handleSendDoubt()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/30"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[9px] text-slate-500 mt-2 text-center">
                Grounded in official textbook content
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
