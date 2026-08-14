import { motion } from 'framer-motion'
import { Download, FileJson, FileText, File } from 'lucide-react'
import { exportJSON, exportPDF, exportDOCX } from '../api'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ExportBar({ dataset }) {
  const [loading, setLoading] = useState(null)

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
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-900',
      fn: () => { exportJSON(dataset) },
    },
    {
      key: 'pdf',
      label: 'PDF',
      sublabel: 'Printable report',
      icon: FileText,
      color: 'bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-900',
      fn: () => exportPDF(dataset),
    },
    {
      key: 'docx',
      label: 'DOCX',
      sublabel: 'Word document',
      icon: File,
      color: 'bg-sky-50 border-sky-200 hover:border-sky-400 text-sky-900',
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
            transition-all duration-200 cursor-pointer shadow-sm
            disabled:opacity-60 disabled:cursor-not-allowed
            group ${color}
          `}
        >
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-xs">
            {loading === key ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon size={18} />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-none mb-0.5">{label}</p>
            <p className="text-xs text-slate-500 leading-none">{sublabel}</p>
          </div>
          <Download size={14} className="ml-auto text-slate-400 group-hover:text-slate-700 transition-colors" />
        </button>
      ))}
    </motion.div>
  )
}
