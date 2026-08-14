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
import { generateDataset } from '../api'
import AdminAuthGuard from '../components/AdminAuthGuard'

export default function TestPage() {
  const [file, setFile] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [uploadPct, setUploadPct] = useState(0)
  const [dataset, setDataset] = useState(null)
  const [error, setError] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)

  const reset = () => {
    setFile(null)
    setPhase('idle')
    setUploadPct(0)
    setDataset(null)
    setError(null)
    setElapsedSec(0)
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
      <div className="min-h-screen bg-[#0a0f1e] text-slate-100 pb-16">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0f1e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' } },
          }}
        />

        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6">
          {/* Back Link */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Admin Dashboard</span>
            </Link>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
              Route: /test
            </span>
          </div>

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                GoldenGen AI (Testing Backend)
              </h1>
              <p className="text-xs text-slate-400 font-medium">RAG Knowledge Base & Golden Dataset Generator</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 leading-tight mb-3">
              Upload PDF to generate{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Golden Datasets
              </span>
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Upload an educational PDF and DeepSeek AI will generate a complete, 9-section structured knowledge base ready for vector database ingestion.
            </p>
          </div>
        </header>

        {/* ── Main content ── */}
        <AnimatePresence mode="wait">
          {phase !== 'done' ? (
            <motion.div
              key="upload-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 sm:p-8 mb-8"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Database size={15} className="text-indigo-400" />
                Upload Source PDF
              </h3>

              <UploadZone
                onFile={setFile}
                file={file}
                disabled={phase === 'uploading' || phase === 'generating'}
              />

              {phase === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-3 p-4 bg-rose-500/8 border border-rose-500/25 rounded-xl"
                >
                  <AlertCircle size={17} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-300 mb-0.5">Generation failed</p>
                    <p className="text-xs text-rose-300/70 leading-relaxed">{error}</p>
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
                    transition-all duration-200 shadow-lg shadow-indigo-500/20
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
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
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
                  className="mt-5 p-4 bg-indigo-500/6 border border-indigo-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <BrainCircuit size={16} className="text-indigo-400" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 border-t-indigo-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-300">DeepSeek AI is working…</p>
                      <p className="text-xs text-slate-400">Extracting structure, generating pedagogy, building RAG metadata</p>
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
              className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-300 mb-0.5">
                  Golden Dataset generated — {subTopicsCount} sub-topics created
                </p>
                <p className="text-xs text-slate-400">
                  {file?.name} · Completed in {elapsedSec}s with DeepSeek AI
                </p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 border border-slate-600 transition-colors flex-shrink-0"
              >
                <RotateCcw size={13} />
                New PDF
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'done' && dataset && (
          <div className="space-y-6">
            <ExportBar dataset={dataset} />
            <DatasetViewer dataset={dataset} />
          </div>
        )}
      </div>
    </div>
    </AdminAuthGuard>
  )
}
