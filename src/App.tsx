import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Tự động cuộn lên đầu trang khi chuyển trang */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
