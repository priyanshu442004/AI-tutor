import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, BookOpen, MessageSquare, ArrowRight, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config'
import { useTheme } from '../context/ThemeContext'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [books, setBooks] = useState([])
  const [historyItems, setHistoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`)
        const data = await res.json()
        const activeBooks = data.success ? data.books || [] : []
        setBooks(activeBooks)

        const items = []
        const activeBookIds = new Set(activeBooks.map((b) => b.id))

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('ai_tutor_history_')) {
            const bookId = key.replace('ai_tutor_history_', '')
            
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl border ${
                isDark ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
              }`}>
                <History size={20} />
              </div>
              <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Chat History</h1>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Resume your previous doubt discussions with AI Tutor across active textbooks.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all w-fit shadow-xs ${
                isDark
                  ? 'bg-slate-900 hover:bg-rose-950/60 border-slate-800 hover:border-rose-800 text-slate-300 hover:text-rose-300'
                  : 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700'
              }`}
            >
              <Trash2 size={14} />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className={`py-20 text-center space-y-3 border rounded-2xl shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Clock size={28} className="animate-spin text-indigo-500 mx-auto" />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading your saved conversations...</p>
          </div>
        ) : historyItems.length === 0 ? (
          /* Empty History State */
          <div className={`py-16 text-center space-y-4 border rounded-2xl max-w-xl mx-auto px-6 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
              isDark ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Active Chat History Found</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                You haven't started any conversations yet. Select a textbook from the library to ask your first doubt!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
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
                className={`border rounded-2xl p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isDark ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {item.book?.category || 'Textbook'}
                    </span>
                    <span className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded border ${
                      isDark ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      <CheckCircle2 size={11} />
                      Active Book
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      • {item.userQuestionsCount} questions asked ({item.messagesCount} messages total)
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.book?.title || 'Selected Textbook'}
                    </h3>
                    <p className={`text-xs mt-0.5 line-clamp-1 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      "{item.lastMessage.substring(0, 120)}..."
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 justify-between md:justify-end ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.lastTimestamp}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteHistory(item.key, item.bookId)}
                      title="Delete chat history for this book"
                      className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors ${
                        isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
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
