import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookLibrary from '../components/BookLibrary'
import BookReader from '../components/BookReader'
import { API_BASE_URL } from '../config'
import { useTheme } from '../context/ThemeContext'

const DEFAULT_LEGAL_BOOK = {
  id: 'legal',
  title: 'Legal',
  author: 'Corporate Law Authority (CLA)',
  category: 'Corporate Law & Practice',
  edition: '2026 Legal Edition',
  description: 'Official CLA Legal Textbook & Reference Guide. Powered by Pinecone cla-online vector store and verified MSSQL Golden Datasets.',
  total_pages: 450,
  cover_gradient: 'from-amber-600 to-yellow-800',
  total_chunks: 17592,
  is_legal: true,
  stats: { modules: 0, chapters: 0, topics: 0, totalHours: '0 hrs' },
  modules: []
}

export default function StudentPage() {
  const location = useLocation()
  const { isDark } = useTheme()
  const [books, setBooks] = useState([DEFAULT_LEGAL_BOOK])
  const [selectedBook, setSelectedBook] = useState(location.state?.selectedBook || null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`)
        const data = await res.json()
        if (data.success && Array.isArray(data.books)) {
          let loadedBooks = data.books
          const hasLegal = loadedBooks.some((b) => b.id === 'legal' || b.id === 'book-legal' || b.title?.toLowerCase() === 'legal')
          if (!hasLegal) {
            loadedBooks = [DEFAULT_LEGAL_BOOK, ...loadedBooks]
          }
          setBooks(loadedBooks)

          if (location.state?.selectedBook) {
            const matched = loadedBooks.find((b) => b.id === location.state.selectedBook.id)
            if (matched) {
              setSelectedBook(matched)
            }
          }
        } else {
          setBooks([DEFAULT_LEGAL_BOOK])
        }
      } catch (err) {
        console.error('Error fetching books from backend:', err)
        setBooks([DEFAULT_LEGAL_BOOK])
      } finally {
        setIsLoading(false)
      }
    }
    loadBooks()
  }, [location.state])

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Navbar */}
      <Navbar
        selectedBook={selectedBook}
        onBackToLibrary={() => setSelectedBook(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {selectedBook ? (
          <BookReader
            book={selectedBook}
            onBackToLibrary={() => setSelectedBook(null)}
          />
        ) : (
          <BookLibrary
            books={books}
            isLoading={isLoading}
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}
      </main>
    </div>
  )
}
