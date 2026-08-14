import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Search, CheckCircle2, RefreshCw } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function BookLibrary({ books = [], isLoading = false, onSelectBook }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { isDark } = useTheme()

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Select a Book
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Explore structured chapter guides, legal golden datasets, section topics, and instant RAG assistance.
        </p>
      </div>

      {/* Search Input */}
      {books.length > 0 && (
        <div className="relative max-w-md">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, author, or subject..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-sm ${
              isDark
                ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950'
                : 'bg-white border border-slate-200 text-slate-900 focus:bg-white'
            }`}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className={`py-20 text-center space-y-3 rounded-2xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <RefreshCw size={28} className="animate-spin text-indigo-500 mx-auto" />
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading books & database records...</p>
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className={`py-20 text-center space-y-4 rounded-2xl max-w-2xl mx-auto px-6 border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            isDark ? 'bg-indigo-950/60 border border-indigo-800 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
          }`}>
            <BookOpen size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Books Available Yet</h3>
            <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Books will appear here automatically once uploaded by an administrator or published to the MSSQL database.
            </p>
          </div>
        </div>
      ) : (
        /* Book Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isDark ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {book.category || 'Textbook'}
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded border ${
                    isDark ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    <CheckCircle2 size={12} />
                    {book.is_legal ? 'Verified SQL & Pinecone' : `Available (${book.total_pages || 151} Pages)`}
                  </span>
                </div>

                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.title}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Author: {book.author || 'Academic Faculty'} · {book.edition || '2026 Edition'}</p>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {book.description}
                </p>
              </div>

              <div className={`pt-6 mt-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {book.stats?.modules || book.modules?.length || 0} Modules · {book.stats?.topics || 0} Sections
                </span>
                <button
                  onClick={() => onSelectBook(book)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Open Book</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
