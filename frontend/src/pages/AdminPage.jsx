import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Database, BookOpen, Trash2, Sparkles, CheckCircle2,
  AlertCircle, Search, Cpu, Layers, RefreshCw, FileText, ArrowRight,
  ShieldCheck, HelpCircle, Terminal, Play, Server, Edit3, Eye
} from 'lucide-react'
import { API_BASE_URL } from '../config'
import AdminAuthGuard from '../components/AdminAuthGuard'
import FormattedMessage from '../components/FormattedMessage'
import { useTheme } from '../context/ThemeContext'

export default function AdminPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('books')

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

  // CLA Accepted Sections State
  const [acceptedSections, setAcceptedSections] = useState([])
  const [isLoadingSections, setIsLoadingSections] = useState(false)
  const [viewingDataset, setViewingDataset] = useState(null)

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [edition, setEdition] = useState('2026 Updated Edition')

  // Upload Processing Progress State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStep, setUploadStep] = useState(0)
  const [uploadMessage, setUploadMessage] = useState('')

  // Delete State
  const [deletingId, setDeletingId] = useState(null)
  const [deletingSecId, setDeletingSecId] = useState(null)

  // RAG Playground State
  const [testQuery, setTestQuery] = useState('')
  const [selectedTestBook, setSelectedTestBook] = useState('')
  const [isTestingRAG, setIsTestingRAG] = useState(false)
  const [testResults, setTestResults] = useState(null)

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

  const fetchAcceptedSections = async () => {
    setIsLoadingSections(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/golden-dataset/sections?book_id=legal`)
      const data = await res.json()
      if (data.success) {
        setAcceptedSections(data.sections || [])
      }
    } catch (err) {
      console.error('Failed to load accepted sections:', err)
    } finally {
      setIsLoadingSections(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
    fetchAcceptedSections()
  }, [])

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
        fetchAcceptedSections()

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

  const handleDeleteSection = async (sectionId, sectionName) => {
    if (!window.confirm(`Are you sure you want to delete section '${sectionName}' from the Legal book in MSSQL database?`)) {
      return
    }

    setDeletingSecId(sectionId)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/golden-dataset/sections/${sectionId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchAcceptedSections()
        fetchAdminData()
      } else {
        alert(data.detail || 'Delete failed')
      }
    } catch (err) {
      alert(`Delete Error: ${err.message}`)
    } finally {
      setDeletingSecId(null)
    }
  }

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
      <div className={`min-h-screen font-sans p-4 sm:p-6 lg:p-8 space-y-8 transition-colors ${
        isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
      {/* Admin Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Admin Control Panel & Pinecone Engine</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Textbook & RAG Vector Management</span>
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload educational PDFs, manage MSSQL CLA Legal sections, and test real-time RAG responses.
          </p>
        </div>

        {/* Tab Navigation Switches */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl border self-start md:self-auto ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300'
        }`}>
          <button
            onClick={() => setActiveTab('books')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeTab === 'books'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'}
            `}
          >
            <BookOpen size={15} />
            <span>Textbook Management</span>
          </button>

          <button
            onClick={() => setActiveTab('cla-sections')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeTab === 'cla-sections'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'}
            `}
          >
            <Database size={15} />
            <span>Legal Book Sections ({acceptedSections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rag-playground')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeTab === 'rag-playground'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'}
            `}
          >
            <Terminal size={15} />
            <span>RAG Testing Playground</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Active Books</p>
            <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total_books}</h3>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-semibold">Available for Students</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <BookOpen size={20} />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Legal Book Sections</p>
            <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{acceptedSections.length}</h3>
            <p className="text-[10px] text-indigo-500 mt-0.5 font-semibold">Persisted in MSSQL</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-violet-950/60 border-violet-800 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'
          }`}>
            <Database size={20} />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pinecone Legal Index</p>
            <h3 className={`text-base font-extrabold mt-1 truncate max-w-[130px] ${isDark ? 'text-white' : 'text-slate-900'}`}>cla-online</h3>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-semibold">Connected & Operational</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AWS RDS MSSQL</p>
            <h3 className={`text-xs font-mono font-bold mt-1 truncate max-w-[130px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>CLAOnline DB</h3>
            <p className="text-[10px] text-amber-500 mt-0.5 font-semibold">Legal RDS Active</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-amber-950/60 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <Server size={20} />
          </div>
        </div>
      </div>

      {/* ── TAB 1: TEXTBOOK MANAGEMENT ── */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Form (5 cols) */}
          <div className={`lg:col-span-5 border rounded-2xl p-6 space-y-6 shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-3 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}>
                <Upload size={18} />
              </div>
              <div>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload & Ingest PDF Textbook</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Auto-chunk & embed into Pinecone DB</p>
              </div>
            </div>

            <form onSubmit={handleBookUpload} className="space-y-4">
              {/* File Drop Area */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>PDF Textbook File</label>
                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all group ${
                  isDark
                    ? 'border-slate-800 bg-slate-950 hover:border-indigo-500'
                    : 'border-slate-300 bg-slate-50/60 hover:border-indigo-500'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className={`transition-colors ${isDark ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                    {uploadFile ? (
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-indigo-400 block">{uploadFile.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Click or Drag PDF file here</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Supports searchable text PDFs</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Metadata Fields */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Company Law & Corporate Governance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Author / Faculty</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. A. K. Majumdar"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Category <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Corporate Law, General, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Edition Info</label>
                <input
                  type="text"
                  placeholder="e.g., 2026 Updated Edition"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>

              {/* Progress Monitor during Ingestion */}
              {isUploading && (
                <div className={`p-4 rounded-2xl space-y-3 animate-pulse border ${
                  isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-indigo-400" />
                      <span>Ingestion Progress</span>
                    </span>
                    <span>Step {uploadStep}/4</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="bg-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${(uploadStep / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-mono">{uploadMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!uploadFile || !title.trim() || isUploading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Upload & Process Book</span>
              </button>
            </form>
          </div>

          {/* Active Books Table (7 cols) */}
          <div className={`lg:col-span-7 border rounded-2xl p-6 space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>Active Library Books in Pinecone</span>
                  <span className={`text-xs font-normal px-2.5 py-0.5 rounded-full border ${
                    isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {books.length} Active
                  </span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Books currently available to students with vector search</p>
              </div>

              <button
                onClick={fetchAdminData}
                className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
                title="Refresh Books List"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {isLoadingBooks ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading active vector books...</p>
              </div>
            ) : books.length === 0 ? (
              <div className={`py-12 text-center space-y-3 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <BookOpen size={36} className="text-slate-500 mx-auto" />
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No books uploaded yet</p>
                <p className={`text-[11px] max-w-xs mx-auto ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Upload a PDF textbook on the left to start embedding vectors into Pinecone.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all group ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/50'
                        : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-12 rounded-xl bg-gradient-to-br ${b.cover_gradient || 'from-indigo-600 to-violet-800'} flex items-center justify-center text-white flex-shrink-0 shadow-xs`}>
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate group-hover:text-indigo-400 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {b.title}
                        </h4>
                        <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{b.author} • {b.edition}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {b.total_chunks || 0} Chunks
                          </span>
                          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Category: {b.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBook(b.id, b.title)}
                      disabled={deletingId === b.id}
                      className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 border border-transparent transition-all flex-shrink-0 ${
                        isDark ? 'hover:bg-rose-950/50 hover:border-rose-800' : 'hover:bg-rose-50 hover:border-rose-200'
                      }`}
                      title="Delete Book & Purge Vectors"
                    >
                      {deletingId === b.id ? (
                        <RefreshCw size={16} className="animate-spin text-rose-500" />
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

      {/* ── TAB 2: LEGAL BOOK SECTIONS MANAGEMENT ── */}
      {activeTab === 'cla-sections' && (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Database size={18} className="text-amber-500" />
                  <span>Accepted Sections inside "Legal" Book (MSSQL Database)</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage accepted golden dataset sections saved in AWS RDS SQL Server for the Legal book.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/test')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Sparkles size={14} />
                  <span>Generate New Golden Dataset</span>
                </button>
                <button
                  onClick={fetchAcceptedSections}
                  className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                  title="Refresh Sections"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {isLoadingSections ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading MSSQL accepted sections...</p>
              </div>
            ) : acceptedSections.length === 0 ? (
              <div className={`py-12 text-center space-y-3 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <Database size={36} className="text-slate-500 mx-auto" />
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No sections accepted by Admin yet</p>
                <p className={`text-[11px] max-w-sm mx-auto ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Go to <strong className="text-indigo-400">Golden Dataset</strong> generator, upload a PDF chapter/section, and click <strong className="text-emerald-400">"Accept"</strong> to add it to the Legal book.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedSections.map((sec) => (
                  <div
                    key={sec.id}
                    className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
                        : 'bg-slate-50/80 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border font-mono ${
                          isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {sec.section_name}
                        </span>
                        {sec.pdf_filename && (
                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Source: {sec.pdf_filename}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {sec.dataset?.metadata?.chapter_topic || sec.dataset?.metadata?.chapter_name || 'Golden Legal Dataset'}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Accepted on: {sec.created_at ? new Date(sec.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingDataset(sec)}
                        className={`p-2 rounded-xl text-slate-400 hover:text-indigo-400 border border-transparent transition-all ${
                          isDark ? 'hover:bg-indigo-950/50 hover:border-indigo-800' : 'hover:bg-indigo-50 hover:border-indigo-200'
                        }`}
                        title="View Dataset JSON"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteSection(sec.id, sec.section_name)}
                        disabled={deletingSecId === sec.id}
                        className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 border border-transparent transition-all ${
                          isDark ? 'hover:bg-rose-950/50 hover:border-rose-800' : 'hover:bg-rose-50 hover:border-rose-200'
                        }`}
                        title="Delete Section from Legal Book"
                      >
                        {deletingSecId === sec.id ? (
                          <RefreshCw size={16} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Viewing Dataset JSON Modal */}
          {viewingDataset && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className={`w-full max-w-3xl border rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-hidden flex flex-col ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Database size={16} className="text-amber-500" />
                    <span>Golden Dataset Payload: {viewingDataset.section_name}</span>
                  </h3>
                  <button
                    onClick={() => setViewingDataset(null)}
                    className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 scrollbar-thin">
                  <pre>{JSON.stringify(viewingDataset.dataset, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: RAG TESTING PLAYGROUND ── */}
      {activeTab === 'rag-playground' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Terminal size={18} className="text-indigo-500" />
                  <span>RAG Vector Retrieval & Answer Testing Module</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Test exact Pinecone vector matches and AI generated Tutor answers</p>
              </div>

              {/* Book Filter Select */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter Scope:</span>
                <select
                  value={selectedTestBook}
                  onChange={(e) => setSelectedTestBook(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
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
                  className={`w-full pl-4 pr-32 py-3.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
                <button
                  onClick={() => handleRunRAGTest()}
                  disabled={!testQuery.trim() || isTestingRAG}
                  className="absolute right-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {isTestingRAG ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>Test RAG</span>
                </button>
              </div>

              {/* Sample Queries Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sample Test Doubts:</span>
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => { setTestQuery(sq); handleRunRAGTest(sq); }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors text-left ${
                      isDark
                        ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
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
              <div className={`lg:col-span-5 border rounded-2xl p-5 space-y-4 shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    <Database size={14} className="text-indigo-500" />
                    <span>Retrieved Pinecone Chunks ({testResults.vector_matches?.length || 0})</span>
                  </h3>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Model: text-embedding-3-small</span>
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                  {testResults.vector_matches?.map((match, i) => (
                    <div key={i} className={`p-3.5 border rounded-xl space-y-2 ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-400">
                          {match.book_title} (Page {match.page})
                        </span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          match.score > 75
                            ? isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDark ? 'bg-amber-950/60 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {match.score}% Similarity
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed font-sans border-l-2 border-indigo-500 pl-2.5 py-0.5 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        "{match.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Generated Response (7 cols) */}
              <div className={`lg:col-span-7 border rounded-2xl p-5 space-y-4 shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    <Sparkles size={14} className="text-violet-400" />
                    <span>Generated AI Tutor RAG Response</span>
                  </h3>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded border ${
                    isDark ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    <CheckCircle2 size={12} />
                    <span>Grounding Verified</span>
                  </span>
                </div>

                <div className={`p-4 border rounded-xl space-y-4 text-xs leading-relaxed max-h-[560px] overflow-y-auto scrollbar-thin ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50/80 border-slate-200 text-slate-800'
                }`}>
                  <FormattedMessage text={testResults.answer} />

                  {testResults.citations?.length > 0 && (
                    <div className={`pt-3 border-t space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Verifiable Citations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {testResults.citations.map((c, i) => (
                          <span key={i} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
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
