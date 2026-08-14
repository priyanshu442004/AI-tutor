import { motion } from 'framer-motion'
import { Download, FileJson, FileText, File } from 'lucide-react'
import { exportJSON, exportPDF, exportDOCX } from '../api'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ExportBar({ dataset }) {
  const [loading, setLoading] = useState(null) // 'json' | 'pdf' | 'docx'

  const handle = async (type, fn) => {
    setLoading(type)
    try {
      await fn(dataset)
      toast.success(`Downloaded as ${type.toUpperCase()}`)
    } catch (e) {
      toast.error(`Export failed: ${e.message || 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  const buttons = [
    {
      key: 'json',
      label: 'JSON',
      sublabel: 'Machine-readable',
      icon: FileJson,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400/60 text-amber-300',
      spin: 'border-amber-400',
      fn: () => { exportJSON(dataset) },
    },
    {
      key: 'pdf',
      label: 'PDF',
      sublabel: 'Printable report',
      icon: FileText,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 hover:border-rose-400/60 text-rose-300',
      spin: 'border-rose-400',
      fn: () => exportPDF(dataset),
    },
    {
      key: 'docx',
      label: 'DOCX',
      sublabel: 'Word document',
      icon: File,
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 hover:border-sky-400/60 text-sky-300',
      spin: 'border-sky-400',
      fn: () => exportDOCX(dataset),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      {buttons.map(({ key, label, sublabel, icon: Icon, color, fn }) => (
        <button
          key={key}
          onClick={() => handle(key, fn)}
          disabled={loading !== null}
          className={`
            flex-1 relative flex items-center gap-3 px-5 py-4 rounded-xl border
            bg-gradient-to-br transition-all duration-200 cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed
            group ${color}
          `}
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            {loading === key ? (
              <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${color.split(' ').find(c => c.startsWith('text-'))}`} />
            ) : (
              <Icon size={18} />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-none mb-0.5">{label}</p>
            <p className="text-xs opacity-70 leading-none">{sublabel}</p>
          </div>
          <Download size={14} className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </motion.div>
  )
}
