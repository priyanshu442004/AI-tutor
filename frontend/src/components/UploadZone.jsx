import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, X, CheckCircle2 } from 'lucide-react'

export default function UploadZone({ onFile, file, disabled }) {
  const [dragOver, setDragOver] = useState(false)

  const onDrop = useCallback(
    (accepted) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDropAccepted: () => setDragOver(false),
  })

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)} · PDF</p>
            </div>
            {!disabled && (
              <button
                onClick={(e) => { e.stopPropagation(); onFile(null) }}
                className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            {...getRootProps()}
            className={`
              relative w-full rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
              transition-all duration-300 outline-none
              ${isDragActive
                ? 'border-indigo-400 bg-indigo-500/8 shadow-lg shadow-indigo-500/10'
                : 'border-slate-600/50 bg-slate-800/30 hover:border-indigo-500/60 hover:bg-slate-800/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />

            {/* Animated background blob */}
            {isDragActive && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-indigo-500/5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}

            <motion.div
              animate={{ y: isDragActive ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                ${isDragActive ? 'bg-indigo-500/20' : 'bg-slate-700/60'}
              `}>
                {isDragActive
                  ? <FileText size={28} className="text-indigo-400" />
                  : <Upload size={28} className="text-slate-400" />
                }
              </div>
              <div>
                <p className="text-base font-semibold text-slate-200 mb-1">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
                </p>
                <p className="text-sm text-slate-400">
                  or <span className="text-indigo-400 font-medium underline underline-offset-2">click to browse</span> — PDF files only
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
