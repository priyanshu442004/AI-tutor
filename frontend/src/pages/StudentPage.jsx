import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookLibrary from '../components/BookLibrary'
import BookReader from '../components/BookReader'
import { API_BASE_URL } from '../config'

export default function StudentPage() {
  const location = useLocation()
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(location.state?.selectedBook || null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`)
        const data = await res.json()
        if (data.success) {
          const loadedBooks = data.books || []
          setBooks(loadedBooks)

          // If location state passed a book, match it with live books
          if (location.state?.selectedBook) {
            const matched = loadedBooks.find((b) => b.id === location.state.selectedBook.id)
            if (matched) {
              setSelectedBook(matched)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching books from backend:', err)
        setBooks([])
      } finally {
        setIsLoading(false)
      }
    }
    loadBooks()
  }, [location.state])

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100 flex flex-col font-sans">
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
