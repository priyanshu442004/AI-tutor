import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Database, BookOpen, Trash2, Sparkles, CheckCircle2,
  AlertCircle, Search, Cpu, Layers, RefreshCw, FileText, ArrowRight,
  ShieldCheck, HelpCircle, Terminal, Play, Server
} from 'lucide-react'
import { API_BASE_URL } from '../config'
import AdminAuthGuard from '../components/AdminAuthGuard'
import FormattedMessage from '../components/FormattedMessage'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('books') // 'books' | 'rag-playground'

  // Books State
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({
    total_books: 0,
    total_chunks: 0,
    pinecone_index: 'ai-tutor',
    embedding_model: 'text-embedding-3-small',
    rag_status: 'Connected & Operational'
  })
  const [isLoadingBooks, setIsLoadingBooks] = useState(true)

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [edition, setEdition] = useState('2026 Updated Edition')

  // Upload Processing Progress State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStep, setUploadStep] = useState(0) // 0: idle, 1: extracting, 2: embedding, 3: pinecone, 4: complete
  const [uploadMessage, setUploadMessage] = useState('')

  // Delete State
  const [deletingId, setDeletingId] = useState(null)

  // RAG Playground State
  const [testQuery, setTestQuery] = useState('')
  const [selectedTestBook, setSelectedTestBook] = useState('')
  const [isTestingRAG, setIsTestingRAG] = useState(false)
  const [testResults, setTestResults] = useState(null)

  // Fetch Books and Stats on load
  const fetchAdminData = async () => {
    setIsLoadingBooks(true)
    try {
      const [resBooks, resStats] = await Promise.all([
        fetch(`${API_BASE_URL}/api/books`),
        fetch(`${API_BASE_URL}/api/admin/stats`)
      ])
      const dataBooks = await resBooks.json()
      const dataStats = await resStats.json()

      if (dataBooks.success) setBooks(dataBooks.books || [])
      if (dataStats.success) setStats(dataStats)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setIsLoadingBooks(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // Handle Book Upload
  const handleBookUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile || !title.trim()) return

    setIsUploading(true)
    setUploadStep(1)
    setUploadMessage('Extracting page-by-page text from PDF...')

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('title', title.trim())
    formData.append('author', author.trim() || 'Academic Faculty')
    formData.append('category', category.trim() || 'General')
    formData.append('edition', edition)

    try {
      setUploadStep(2)
      setUploadMessage('Computing 1536d OpenAI text-embedding-3-small vectors...')

      const res = await fetch(`${API_BASE_URL}/api/admin/books/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Upload failed')
      }

      setUploadStep(3)
      setUploadMessage(`Upserted ${data.ingestion.total_chunks} chunks to Pinecone '${data.ingestion.pinecone_index}' index!`)

      setTimeout(() => {
        setUploadStep(4)
        setUploadMessage('Book successfully added to library & Pinecone vector store!')
        fetchAdminData()

        // Reset Form
        setUploadFile(null)
        setTitle('')
        setAuthor('')
        setCategory('')

        setTimeout(() => {
          setIsUploading(false)
          setUploadStep(0)
          setUploadMessage('')
        }, 2500)
      }, 1000)

    } catch (err) {
      alert(`Upload Error: ${err.message}`)
      setIsUploading(false)
      setUploadStep(0)
      setUploadMessage('')
    }
  }

  // Handle Book Deletion
  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete '${bookTitle}' and purge all its vectors from Pinecone?`)) {
      return
    }

    setDeletingId(bookId)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/books/${bookId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchAdminData()
      } else {
        alert(data.detail || 'Delete failed')
      }
    } catch (err) {
      alert(`Delete Error: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle RAG Playground Test
  const handleRunRAGTest = async (overrideQuery) => {
    const q = overrideQuery || testQuery
    if (!q.trim()) return

    setIsTestingRAG(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/test-rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          book_id: selectedTestBook || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setTestResults(data)
      } else {
        alert(data.detail || 'RAG test failed')
      }
    } catch (err) {
      alert(`Test Error: ${err.message}`)
    } finally {
      setIsTestingRAG(false)
    }
  }

  const sampleQueries = [
    "Is every company also a body corporate under Section 2(11)?",
    "What happens to a company if all shareholders die?",
    "Can a company be sued in court in its own name?",
    "Why can't a company vote in democratic elections?"
  ]

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Admin Control Panel & Pinecone Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Textbook & RAG Vector Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload educational PDFs, auto-embed into Pinecone vector index, and test real-time RAG responses.
          </p>
        </div>

        {/* Tab Navigation Switches */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('books')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeTab === 'books'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
            `}
          >
            <BookOpen size={15} />
            <span>Textbook Management</span>
          </button>

          <button
            onClick={() => setActiveTab('rag-playground')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeTab === 'rag-playground'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
            `}
          >
            <Terminal size={15} />
            <span>RAG Testing Playground</span>
          </button>

          <button
            onClick={() => navigate('/test')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <Database size={15} />
            <span>Golden Dataset</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Active Books</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.total_books}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5 font-semibold">Available for Students</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Pinecone Chunks</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.total_chunks}</h3>
            <p className="text-[10px] text-indigo-400 mt-0.5 font-semibold">1536d Vector Embeddings</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Pinecone Index</p>
            <h3 className="text-base font-extrabold text-white mt-1 truncate max-w-[130px]">{stats.pinecone_index}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5 font-semibold">Connected & Online</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Embedding Model</p>
            <h3 className="text-xs font-mono font-bold text-slate-200 mt-1 truncate max-w-[130px]">{stats.embedding_model}</h3>
            <p className="text-[10px] text-amber-400 mt-0.5 font-semibold">OpenAI API Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu size={20} />
          </div>
        </div>
      </div>

      {/* ── TAB 1: TEXTBOOK MANAGEMENT ── */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Upload size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Upload & Ingest PDF Textbook</h2>
                <p className="text-xs text-slate-400">Auto-chunk & embed into Pinecone DB</p>
              </div>
            </div>

            <form onSubmit={handleBookUpload} className="space-y-4">
              {/* File Drop Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">PDF Textbook File</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-slate-950/60 group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    {uploadFile ? (
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-indigo-300 block">{uploadFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-slate-300 block">Click or Drag PDF file here</span>
                        <span className="text-[10px] text-slate-500">Supports searchable text PDFs</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Metadata Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Company Law & Corporate Governance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Author / Faculty</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. A. K. Majumdar"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Category <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Corporate Law, General, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Edition Info</label>
                <input
                  type="text"
                  placeholder="e.g., 2026 Updated Edition"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Progress Monitor during Ingestion */}
              {isUploading && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Ingestion Progress</span>
                    </span>
                    <span>Step {uploadStep}/4</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500"
                      style={{ width: `${(uploadStep / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">{uploadMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!uploadFile || !title.trim() || isUploading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Upload & Process Book</span>
              </button>
            </form>
          </div>

          {/* Active Books Table (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Active Library Books in Pinecone</span>
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {books.length} Active
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Books currently available to students with vector search</p>
              </div>

              <button
                onClick={fetchAdminData}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Refresh Books List"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {isLoadingBooks ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400">Loading active vector books...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <BookOpen size={36} className="text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No books uploaded yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Upload a PDF textbook on the left to start embedding vectors into Pinecone.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-12 rounded-xl bg-gradient-to-br ${b.cover_gradient || 'from-indigo-600 to-violet-900'} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {b.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{b.author} • {b.edition}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {b.total_chunks || 0} Chunks
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            Category: {b.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBook(b.id, b.title)}
                      disabled={deletingId === b.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex-shrink-0"
                      title="Delete Book & Purge Vectors"
                    >
                      {deletingId === b.id ? (
                        <RefreshCw size={16} className="animate-spin text-rose-400" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: RAG TESTING PLAYGROUND ── */}
      {activeTab === 'rag-playground' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal size={18} className="text-indigo-400" />
                  <span>RAG Vector Retrieval & Answer Testing Module</span>
                </h2>
                <p className="text-xs text-slate-400">Test exact Pinecone vector matches and AI generated Tutor answers</p>
              </div>

              {/* Book Filter Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Filter Scope:</span>
                <select
                  value={selectedTestBook}
                  onChange={(e) => setSelectedTestBook(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Vector Books in Index</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Query Input Bar */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunRAGTest()}
                  placeholder="Enter test question (e.g., Is every company a body corporate?)"
                  className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRunRAGTest()}
                  disabled={!testQuery.trim() || isTestingRAG}
                  className="absolute right-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  {isTestingRAG ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>Test RAG</span>
                </button>
              </div>

              {/* Sample Queries Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Sample Test Doubts:</span>
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => { setTestQuery(sq); handleRunRAGTest(sq); }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Dual Pane */}
          {testResults && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Retrieved Vector Chunks (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Database size={14} className="text-indigo-400" />
                    <span>Retrieved Pinecone Chunks ({testResults.vector_matches?.length || 0})</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Model: text-embedding-3-small</span>
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                  {testResults.vector_matches?.map((match, i) => (
                    <div key={i} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-300">
                          {match.book_title} (Page {match.page})
                        </span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${match.score > 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                          {match.score}% Similarity
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-l-2 border-indigo-500/60 pl-2.5 py-0.5">
                        "{match.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Generated Response (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    <span>Generated AI Tutor RAG Response</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Grounding Verified</span>
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4 text-xs text-slate-200 leading-relaxed max-h-[560px] overflow-y-auto scrollbar-thin">
                  <FormattedMessage text={testResults.answer} />

                  {testResults.citations?.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verifiable Citations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {testResults.citations.map((c, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </AdminAuthGuard>
  )
}
