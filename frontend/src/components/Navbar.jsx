import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Database, ShieldCheck, History } from 'lucide-react'

export default function Navbar({ selectedBook, onBackToLibrary }) {
  const navigate = useNavigate()

  const handleBrandClick = () => {
    if (onBackToLibrary) {
      onBackToLibrary()
    }
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 font-bold text-slate-100 hover:text-indigo-400 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen size={18} />
            </div>
            <div className="text-left">
              <span className="text-base font-black tracking-tight text-white block leading-none">
                AI Tutor
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Student Platform</span>
            </div>
          </button>

          {/* Current Book Badge if Selected */}
          {selectedBook && (
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs">
              <span className="text-slate-400">Selected Book:</span>
              <span className="font-semibold text-indigo-300 truncate max-w-[200px]">
                {selectedBook.title}
              </span>
              <button
                onClick={handleBrandClick}
                className="text-[11px] text-slate-400 underline hover:text-slate-200"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Right Navigation Links */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <History size={14} className="text-indigo-400" />
            <span>History</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
