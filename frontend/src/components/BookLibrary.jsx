import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Search, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react'

export default function BookLibrary({ books = [], isLoading = false, onSelectBook }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Select a Textbook
        </h1>
        <p className="text-sm text-slate-400">
          Choose an administrator-uploaded textbook below to explore structured chapter guides, section topics, and instant Q&A assistance.
        </p>
      </div>

      {/* Search Input (only shown if books exist) */}
      {books.length > 0 && (
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, author, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <RefreshCw size={28} className="animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400">Fetching available textbooks from vector database...</p>
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl max-w-2xl mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">No Textbooks Available Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The library is currently empty. Textbooks will appear here automatically once uploaded by an administrator.
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
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {book.category || 'Textbook'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Available ({book.total_pages || 151} Pages)
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-100">{book.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Author: {book.author || 'Academic Faculty'} · {book.edition || 'Standard Edition'}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {book.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {book.stats?.modules || book.modules?.length || 0} Modules · {book.stats?.topics || 0} Sections
                </span>
                <button
                  onClick={() => onSelectBook(book)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Select Book</span>
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
