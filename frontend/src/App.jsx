import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StudentPage from './pages/StudentPage'
import HistoryPage from './pages/HistoryPage'
import TestPage from './pages/TestPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

