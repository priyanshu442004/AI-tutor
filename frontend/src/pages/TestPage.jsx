import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import {
  BrainCircuit, Sparkles, RotateCcw, CheckCircle2,
  AlertCircle, Loader2, Database, ChevronRight, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'

import UploadZone from '../components/UploadZone'
import DatasetViewer from '../components/DatasetViewer'
import ExportBar from '../components/ExportBar'
import { generateDataset, acceptGoldenDataset } from '../api'
import AdminAuthGuard from '../components/AdminAuthGuard'
import { useTheme } from '../context/ThemeContext'

export default function TestPage() {
  const { isDark } = useTheme()
  const [file, setFile] = useState(null)
  const [sectionName, setSectionName] = useState('Section 1.1')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [uploadPct, setUploadPct] = useState(0)
  const [dataset, setDataset] = useState(null)
  const [error, setError] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)

  const reset = () => {
    setFile(null)
    setSectionName('Section 1.1')
    setIsAccepted(false)
    setIsAccepting(false)
    setPhase('idle')
    setUploadPct(0)
    setDataset(null)
    setError(null)
    setElapsedSec(0)
  }

  const handleAcceptDataset = async () => {
    if (!dataset || !sectionName.trim()) {
      toast.error('Please specify a valid section name (e.g. Section 1.1).')
      return
    }

    setIsAccepting(true)
    try {
      const res = await acceptGoldenDataset({
        section_name: sectionName.trim(),
        dataset: dataset,
        pdf_filename: file?.name || '',
        book_id: 'legal'
      })
      if (res.success) {
        setIsAccepted(true)
        toast.success(`Published to Legal book under '${sectionName.trim()}'!`)
      } else {
        toast.error(res.message || 'Failed to accept dataset.')
      }
    } catch (err) {
      toast.error(`Accept Error: ${err.message}`)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleGenerate = async () => {
    if (!file) { toast.error('Please upload a PDF first.'); return }
    setPhase('uploading')
    setError(null)

    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    try {
      const result = await generateDataset(file, (pct) => {
        setUploadPct(pct)
        if (pct === 100) setPhase('generating')
      })
      clearInterval(timer)
      setDataset(result.dataset)
      setPhase('done')
      toast.success('Golden Dataset generated successfully!')
    } catch (err) {
      clearInterval(timer)
      const msg = err.response?.data?.detail || err.message || 'Generation failed'
      setError(msg)
      setPhase('error')
      toast.error(msg)
    }
  }

  const subTopicsCount = dataset
    ? (dataset.sub_topics?.length || (dataset.modules || []).reduce((a, m) => a + (m.topics?.length || 0), 0))
    : 0

  return (
    <AdminAuthGuard>
      <div className={`min-h-screen pb-16 transition-colors ${
        isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6">
          {/* Back Link */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Admin Dashboard</span>
            </Link>
            <span className={`text-xs px-3 py-1 rounded-full border font-mono ${
              isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              Route: /test
            </span>
          </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                GoldenGen AI Generator
              </h1>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>RAG Knowledge Base & Legal Golden Dataset System</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Upload PDF to generate{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Golden Datasets
              </span>
            </h2>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Upload an educational or legal PDF and DeepSeek AI will generate a complete, 9-section structured knowledge base ready for MSSQL database & Pinecone ingestion.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {phase !== 'done' ? (
            <motion.div
              key="upload-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`border rounded-2xl p-6 sm:p-8 mb-8 shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Database size={15} className="text-indigo-500" />
                Upload Source PDF
              </h3>

              {/* Section Name Input */}
              <div className="mt-4 mb-4 space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Section Name <span className="text-indigo-400 font-normal">(Required for Legal Book Publishing e.g., section 1.1, section 1.2)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. section 1.1, section 1.2"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>

              <UploadZone
                onFile={setFile}
                file={file}
                disabled={phase === 'uploading' || phase === 'generating'}
              />

              {phase === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 flex items-start gap-3 p-4 rounded-xl border ${
                    isDark ? 'bg-rose-950/60 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <AlertCircle size={17} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-0.5">Generation failed</p>
                    <p className="text-xs leading-relaxed opacity-90">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                <button
                  onClick={handleGenerate}
                  disabled={!file || phase === 'uploading' || phase === 'generating'}
                  className="
                    w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5
                    px-7 py-3.5 rounded-xl font-bold text-sm text-white
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    hover:from-indigo-500 hover:to-violet-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-md shadow-indigo-600/20
                    active:scale-[0.98]
                  "
                >
                  {(phase === 'uploading' || phase === 'generating') ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      {phase === 'uploading' ? `Uploading ${uploadPct}%` : `Generating… ${elapsedSec}s`}
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Generate Golden Dataset
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>

                {phase === 'error' && (
                  <button
                    onClick={reset}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border transition-colors ${
                      isDark
                        ? 'text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
                        : 'text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw size={15} />
                    Start over
                  </button>
                )}
              </div>

              {phase === 'generating' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-5 p-4 border rounded-xl ${
                    isDark ? 'bg-indigo-950/60 border-indigo-800' : 'bg-indigo-50 border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-indigo-900/80' : 'bg-indigo-100'
                      }`}>
                        <BrainCircuit size={16} className="text-indigo-400" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 border-t-indigo-500 animate-spin" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-indigo-200' : 'text-indigo-900'}`}>DeepSeek AI is working…</p>
                      <p className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Extracting structure, generating pedagogy, building RAG metadata</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                isDark ? 'bg-emerald-950/60 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-emerald-900/80 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className={`text-sm font-bold mb-0.5 flex items-center gap-2 ${
                    isDark ? 'text-emerald-200' : 'text-emerald-900'
                  }`}>
                    <span>Golden Dataset generated ({subTopicsCount} sub-topics)</span>
                    {isAccepted && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                        isDark ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        ✓ Published to Legal Book
                      </span>
                    )}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Section Name: <span className="font-mono text-indigo-400 font-bold">{sectionName}</span> · {file?.name} · Completed in {elapsedSec}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors flex-shrink-0 ${
                    isDark
                      ? 'text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw size={13} />
                  New PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'done' && dataset && (
          <div className="space-y-6">
            {/* Accept Section Bar for Legal Book */}
            <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-indigo-200'
            }`}>
              <div className="space-y-1 text-left w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Legal Book Publishing</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>MSSQL Database</span>
                </div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Publish this Golden Dataset as <span className="text-emerald-500 font-mono">'{sectionName}'</span> in Legal Book
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Clicking Accept saves this section into the SQL database so students will see it under the Legal book study guides.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="Section Name (e.g. section 1.1)"
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 max-w-[160px] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  onClick={handleAcceptDataset}
                  disabled={isAccepting || isAccepted}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex-shrink-0
                    ${isAccepted
                      ? isDark ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300 cursor-default' : 'bg-emerald-50 border border-emerald-300 text-emerald-800 cursor-default'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'}
                  `}
                >
                  {isAccepting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>{isAccepted ? 'Accepted & Published' : 'Accept'}</span>
                </button>
              </div>
            </div>

            <ExportBar dataset={dataset} />
            <DatasetViewer dataset={dataset} />
          </div>
        )}
      </div>
    </div>
    </AdminAuthGuard>
  )
}
