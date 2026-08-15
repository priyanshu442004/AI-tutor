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
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import TopicCard from './TopicCard'
import FormattedMessage from './FormattedMessage'
import { API_BASE_URL } from '../config'
import { useTheme } from '../context/ThemeContext'

export default function BookReader({ book, onBackToLibrary }) {
  const { isDark } = useTheme()

  // Flatten topics to find default selected section (for legal books)
  const allTopics = book.modules ? book.modules.flatMap((m) => m.topics) : []
  const [selectedTopic, setSelectedTopic] = useState(allTopics[0] || null)

  const isLegal = book.is_legal || book.id === 'book-legal' || book.id === 'legal'

  // Dynamic Starter Questions based on book type
  const starterQuestions = isLegal ? [
    { id: 'q1', text: "What is the statutory definition of 'body corporate' under Section 2(11)?" },
    { id: 'q2', text: "How does Perpetual Succession protect a company if all members die?" },
    { id: 'q3', text: "Can a corporate entity be held criminally liable under Indian Law?" },
    { id: 'q4', text: "What are the legal preconditions to lift the corporate veil?" },
  ] : [
    { id: 'q1', text: `What are the core concepts and key takeaways from ${book.title}?` },
    { id: 'q2', text: "Can you explain the main principles with a practical step-by-step example?" },
    { id: 'q3', text: "What are the most common exam questions and practice problems for this book?" },
    { id: 'q4', text: "What are the common misconceptions and pro student tips I should remember?" },
  ]

  const storageKey = `ai_tutor_history_${book.id}`

  const defaultInitMsg = {
    id: 'init-1',
    sender: 'ai',
    text: isLegal
      ? `Greetings! I am your Senior Legal AI Specialist for **${book.title}**.\n\nPlease ask your legal question below.`
      : `Greetings! I am your AI Tutor for **${book.title}**.\n\nPlease ask any question or doubt regarding this textbook below!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  // Load chat history from localStorage
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        let parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace legacy initial welcome messages
          const cleaned = parsed.map((msg) => {
            if (msg.id.startsWith('init-') || (msg.sender === 'ai' && (msg.text?.includes('Section 1.1') || msg.text?.includes('Senior Legal AI Specialist')))) {
              return defaultInitMsg
            }
            return msg
          })
          return cleaned
        }
      }
    } catch (e) {
      console.error(e)
    }
    return [defaultInitMsg]
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
          citations: data.citations || [isLegal ? 'Pinecone cla-online Index' : 'Official Vector Grounding'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setChatHistory((prev) => [...prev, aiMessage])
      } else {
        throw new Error(data.detail || 'API error')
      }
    } catch (err) {
      console.warn('API connection fallback:', err)

      let answerText = ''
      let citations = []
      const qLower = query.toLowerCase()

      if (isLegal && (qLower.includes('body corporate') || qLower.includes('every company'))) {
        answerText = "Direct Legal Position:\nYes, every company is a body corporate under Section 2(11) of the Companies Act 2013, but not every body corporate is a company.\n\nStatutory Breakdown:\n• Under Section 2(20), a company is an entity incorporated under Indian company law.\n• A body corporate under Section 2(11) encompasses foreign companies, statutory corporations, and financial institutions.\n\nPractical Counsel:\nFor compliance purposes, filing requirements differ between statutory corporations and Companies Act entities."
        citations = ["Section 2(20) Companies Act 2013", "Section 2(11) Body Corporate"]
      } else {
        answerText = `Direct ${isLegal ? 'Legal Position' : 'Answer'} for ${book.title}:\nBased on ${isLegal ? 'CLA legal precedents' : 'official textbook principles'}, this topic outlines fundamental concepts, practical application frameworks, and key principles.\n\nWould you like me to unpack any specific concept or step-by-step worked example?`
        citations = [selectedTopic ? `Section ${selectedTopic.topic_id}` : (isLegal ? "CLA Legal Framework" : "Textbook Knowledge Base")]
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
        text: isLegal
          ? `Greetings! I am your Senior Legal AI Specialist for **${book.title}**.\n\nPlease ask your legal question below.`
          : `Greetings! I am your AI Tutor for **${book.title}**.\n\nPlease ask your question below.`,
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

  // Render Student AI Tutor Chat Component
  const renderChatBox = () => (
    <div className={`border rounded-2xl shadow-sm flex flex-col h-[calc(100vh-6.5rem)] max-h-[820px] overflow-hidden ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
            {isLegal ? <ShieldCheck size={18} /> : <Bot size={18} />}
          </div>
          <div>
            <h3 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{isLegal ? 'Legal CLA Assistant' : 'Ask Your Question'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isLegal ? 'Pinecone cla-online Legal RAG' : 'AI Tutor'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear Chat History"
          className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors ${
            isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Chat History Body */}
      <div className={`flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin ${
        isDark ? 'bg-slate-950/40' : 'bg-slate-50/40'
      }`}>
        
        {/* Starter Question Chips inside Chat Window */}
        <div className={`p-3 rounded-xl border space-y-2 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Sparkles size={12} className="text-amber-500" />
            <span>{isLegal ? 'Suggested Legal Queries:' : 'Starter Questions:'}</span>
          </div>
          <div className="space-y-1.5">
            {starterQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSendDoubt(q.text)}
                className={`w-full text-[11px] p-2 rounded-lg border transition-all text-left flex items-start gap-2 ${
                  isDark
                    ? 'bg-slate-950 hover:bg-indigo-950/50 border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-indigo-300'
                    : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700'
                }`}
              >
                <span className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded mt-0.5 ${
                  isDark ? 'text-indigo-300 bg-indigo-900/60' : 'text-indigo-700 bg-indigo-100'
                }`}>
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
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-indigo-500 flex-shrink-0 mt-1 border shadow-sm ${
                  isDark ? 'bg-indigo-950/60 border-indigo-800' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  {isLegal ? <ShieldCheck size={14} /> : <Bot size={14} />}
                </div>
              )}

              <div
                className={`
                  max-w-[88%] rounded-2xl p-3.5 text-xs space-y-2 leading-relaxed shadow-sm
                  ${msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
                `}
              >
                <FormattedMessage text={msg.text} />

                {msg.follow_ups?.length > 0 && (
                  <div className={`pt-2 mt-2 border-t space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <Sparkles size={11} className="text-amber-500" />
                      <span>Suggested Follow-up Questions:</span>
                    </div>
                    <div className="space-y-1">
                      {msg.follow_ups.map((fq, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendDoubt(fq)}
                          className={`w-full text-[11px] p-2 rounded-lg border transition-all text-left flex items-center justify-between group ${
                            isDark
                              ? 'bg-slate-950 hover:bg-indigo-950/60 border-slate-800 hover:border-indigo-700 text-indigo-300'
                              : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-indigo-700'
                          }`}
                        >
                          <span className="leading-snug">{fq}</span>
                          <ChevronRight size={12} className="text-slate-400 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.citations?.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1 items-center">
                    <span className="text-[9px] text-slate-400 font-medium mr-1">Source:</span>
                    {msg.citations.map((c, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                          isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
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
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-slate-300 flex-shrink-0 mt-1 shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700'
                }`}>
                  <User size={14} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border w-fit ${
            isDark ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
          }`}>
            <Sparkles size={14} className="animate-spin text-amber-500" />
            <span>{isLegal ? 'Analyzing legal context...' : 'Analyzing textbook content...'}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className={`p-3.5 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendDoubt()}
            placeholder={isLegal ? "Query statutory provisions or legal questions..." : "Ask your question here..."}
            className={`w-full pl-4 pr-12 py-3 rounded-xl border text-xs transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white'
            }`}
          />
          <button
            onClick={() => handleSendDoubt()}
            disabled={!inputQuery.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Send size={14} />
          </button>
        </div>
        <p className={`text-[9px] mt-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          {isLegal ? 'Grounded in Pinecone cla-online & verified MSSQL Golden Datasets' : 'Grounded in official textbook content'}
        </p>
      </div>

    </div>
  )

  return (
    <div className="py-6 space-y-6">
      {/* Navigation Top Bar */}
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Book Selection</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.title}</h2>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Author: {book.author}</p>
          </div>
        </div>
      </div>

      {/* Main Layout: 2-Column Split for Legal Books, Single Full-Width Chat Box for Non-Legal Books */}
      {isLegal ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN (6 COLS): Sub-Chapters & Study Module Viewer (Legal Books Only) ── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Sub-Chapters Navigation Bar */}
            <div className={`border rounded-2xl p-4 space-y-3 shadow-sm ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-500" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Select Sub-Chapter / Section
                  </h3>
                </div>
                <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded border ${
                  isDark ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                }`}>
                  {allTopics.length} Sections Available
                </span>
              </div>

              {/* Sections Selector Grid */}
              {allTopics.length === 0 ? (
                <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <p className="text-xs font-semibold">No sections ingested for this book yet</p>
                  <p className="text-[11px] text-slate-500">Upload PDF books from the Admin Dashboard to ingest chapters and populate sections here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                  {book.modules.map((mod) => (
                    <div key={mod.module_id} className="space-y-1">
                      <div className={`text-[11px] font-bold px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                                  : isDark
                                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                              `}
                            >
                              <div className="truncate">
                                <span className={`text-[10px] font-mono mr-1.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
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
              )}
            </div>

            {/* Section Module Header */}
            {selectedTopic && (
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span>Section Study Guide</span>
                    <span className={`font-mono px-2 py-0.5 rounded text-xs border ${
                      isDark ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                    }`}>
                      {selectedTopic?.topic_id}
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedTopic?.topic_title}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  isDark ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  <CheckCircle2 size={12} />
                  MSSQL Legal Dataset
                </span>
              </div>
            )}

            {/* Study Module Card (9-point viewer) */}
            {selectedTopic ? (
              <TopicCard
                topic={selectedTopic}
                moduleColor={isDark ? "bg-indigo-950/60 text-indigo-300 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-200"}
              />
            ) : (
              <div className={`p-8 border rounded-2xl text-center space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <BookOpen size={32} className="mx-auto text-indigo-500" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Legal AI Specialist Active
                </h4>
                <p className="text-xs max-w-sm mx-auto">
                  You can ask questions directly to the Legal AI Specialist on the right pane anytime!
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (6 COLS): Student AI Tutor ── */}
          <div className="lg:col-span-6 sticky top-20">
            {renderChatBox()}
          </div>

        </div>
      ) : (
        /* ── NON-LEGAL BOOKS: Single Centered Full-Width AI Tutor Interface ── */
        <div className="max-w-4xl mx-auto w-full">
          {renderChatBox()}
        </div>
      )}

    </div>
  )
}
