import { useState } from 'react'
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminAuthGuard({ children }) {
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
        {/* Subtle Top Admin Session Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">Authenticated Admin Session</span>
            <span className="font-mono text-slate-500">(user: admin123)</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline transition-colors"
          >
            Log Out Admin
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-md">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Access</h1>
          <p className="text-xs text-slate-400">
            Please enter your administrator credentials to proceed.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound size={16} />
            <span>Unlock Admin Panel</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Student Platform</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
