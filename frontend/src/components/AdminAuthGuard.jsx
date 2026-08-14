import { useState } from 'react'
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminAuthGuard({ children }) {
  const { isDark } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true'
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (username.trim() === 'admin123' && password === 'admin007') {
      sessionStorage.setItem('admin_authenticated', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid admin credentials! Please check your username and password.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return (
      <div>
        {/* Top Admin Session Bar */}
        <div className={`border-b px-4 py-1.5 flex items-center justify-between text-[11px] ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Authenticated Admin Session</span>
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>(user: admin123)</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-400 underline transition-colors"
          >
            Log Out Admin
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`w-full max-w-md border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs border ${
            isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <ShieldCheck size={28} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Portal Access</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Please enter your administrator credentials to proceed.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isDark ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className={`w-full pl-3.5 pr-4 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className={`w-full pl-3.5 pr-4 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound size={16} />
            <span>Unlock Admin Panel</span>
          </button>
        </form>

        <div className={`pt-4 border-t text-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 text-xs transition-colors font-medium ${
              isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <ArrowLeft size={14} />
            <span>Return to Student Platform</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
