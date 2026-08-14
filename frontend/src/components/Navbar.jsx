import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, History, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ selectedBook, onBackToLibrary }) {
  const navigate = useNavigate()
  const { theme, toggleTheme, isDark } = useTheme()

  const handleBrandClick = () => {
    if (onBackToLibrary) {
      onBackToLibrary()
    }
    navigate('/')
  }

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBrandClick}
            className={`flex items-center gap-2.5 font-bold transition-colors text-left ${
              isDark ? 'text-white hover:text-indigo-400' : 'text-slate-900 hover:text-indigo-600'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen size={18} />
            </div>
            <div>
              <span className="text-base font-black tracking-tight block leading-none">
                AI Tutor & Legal CLA
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Knowledge & Study Platform
              </span>
            </div>
          </button>

          {/* Current Book Badge if Selected */}
          {selectedBook && (
            <div className={`hidden sm:flex items-center gap-2 ml-4 pl-4 border-l text-xs ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Selected Book:</span>
              <span className={`font-semibold px-2.5 py-0.5 rounded-lg border truncate max-w-[200px] ${
                isDark ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
              }`}>
                {selectedBook.title}
              </span>
              <button
                onClick={handleBrandClick}
                className="text-[11px] text-indigo-500 font-medium underline hover:text-indigo-400"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Right Navigation & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDark ? (
              <>
                <Sun size={15} className="text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          <Link
            to="/history"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History size={14} className="text-indigo-500" />
            <span>History</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
