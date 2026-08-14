import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, BookOpen, MessageSquare, ArrowRight, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [historyItems, setHistoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Fetch active books from backend/Pinecone registry
        const res = await fetch(`${API_BASE_URL}/api/books`)
        const data = await res.json()
        const activeBooks = data.success ? data.books || [] : []
        setBooks(activeBooks)

        // Scan localStorage for all ai_tutor_history_ keys
        const items = []
        const activeBookIds = new Set(activeBooks.map((b) => b.id))

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('ai_tutor_history_')) {
            const bookId = key.replace('ai_tutor_history_', '')
            
            // Filter: ONLY include chats for books that currently exist in Pinecone database (not deleted by admin)
            if (activeBookIds.has(bookId)) {
              try {
                const rawHistory = localStorage.getItem(key)
                const messages = JSON.parse(rawHistory)
                if (Array.isArray(messages) && messages.length > 0) {
                  const book = activeBooks.find((b) => b.id === bookId)
                  const lastMsg = messages[messages.length - 1]
                  const userMessages = messages.filter((m) => m.sender === 'user')

                  items.push({
                    key,
                    bookId,
                    book,
                    messagesCount: messages.length,
                    userQuestionsCount: userMessages.length,
                    lastMessage: lastMsg?.text || '',
                    lastTimestamp: lastMsg?.timestamp || 'Recently',
                    messages
                  })
                }
              } catch (e) {
                console.error('Error parsing chat history:', e)
              }
            }
          }
        }

        setHistoryItems(items)
      } catch (err) {
        console.error('Error loading history data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleContinueChat = (book) => {
    // Navigate to home student page with the selected book
    navigate('/', { state: { selectedBook: book } })
  }

  const handleDeleteHistory = (key, bookId) => {
    localStorage.removeItem(key)
    setHistoryItems((prev) => prev.filter((item) => item.bookId !== bookId))
  }

  const handleClearAllHistory = () => {
    historyItems.forEach((item) => {
      localStorage.removeItem(item.key)
    })
    setHistoryItems([])
  }

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <History size={20} />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Your Chat History</h1>
            </div>
            <p className="text-xs text-slate-400">
              Resume your previous doubt discussions with AI Tutor across active administrator textbooks.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all w-fit"
            >
              <Trash2 size={14} />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Clock size={28} className="animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading your saved conversations...</p>
          </div>
        ) : historyItems.length === 0 ? (
          /* Empty History State */
          <div className="py-16 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl max-w-xl mx-auto px-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">No Active Chat History Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You haven't started any conversations yet, or the books associated with your past chats have been updated. Select a textbook from the library to ask your first doubt!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                <BookOpen size={16} />
                <span>Browse Available Textbooks</span>
              </Link>
            </div>
          </div>
        ) : (
          /* History Items List */
          <div className="space-y-4">
            {historyItems.map((item) => (
              <motion.div
                key={item.bookId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {item.book?.category || 'Textbook'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Active Textbook
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      • {item.userQuestionsCount} questions asked ({item.messagesCount} messages total)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {item.book?.title || 'Selected Textbook'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                      "{item.lastMessage.substring(0, 120)}..."
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-between md:justify-end">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.lastTimestamp}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteHistory(item.key, item.bookId)}
                      title="Delete chat history for this book"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>

                    <button
                      onClick={() => handleContinueChat(item.book)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <span>Continue Chat</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
