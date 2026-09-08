import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { authApi } from '../api/authApi'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu')
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      })

      if (response && (response as any).accessToken) {
        const token = (response as any).accessToken
        if (rememberMe) {
          localStorage.setItem('token', token)
          if ((response as any).refreshToken) {
            localStorage.setItem('refreshToken', (response as any).refreshToken)
          }
        } else {
          sessionStorage.setItem('token', token)
        }
      }

      navigate('/')
    } catch (err: any) {
      setErrorMessage(err?.message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Centered Luxury Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_16px_40px_-12px_rgba(15,23,42,0.05)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left: Minimalist Visual Accent (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-orange-50/60 via-slate-50 to-white p-10 flex-col justify-between border-r border-slate-100">
          {/* Logo */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Trang chủ
            </Link>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="ZoraEcommerce Logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans']">
                Zora<span className="text-[#ee4d2d]">Ecommerce</span>
              </span>
            </div>
          </div>

          {/* Minimalist Message */}
          <div className="my-auto py-6">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] mb-2">
              Mua sắm tinh tế.
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Sản phẩm chọn lọc, bảo hành chính hãng và giao hàng hỏa tốc.
            </p>
          </div>

          {/* Clean Subtle Footer */}
          <div className="text-[11px] text-slate-400">
            © 2026 ZoraEcommerce
          </div>
        </div>

        {/* Right: Clean Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] mb-1">
                Đăng nhập
              </h1>
              <p className="text-xs text-slate-400">
                Nhập thông tin tài khoản để tiếp tục
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-slate-400 hover:text-[#ee4d2d] transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer accent-[#ee4d2d]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#ee4d2d] hover:bg-[#d73211] active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-white text-slate-300">hoặc</span>
              </div>
            </div>

            {/* Social Logins - Minimalist Google & Apple */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-medium text-slate-700"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.3-.7-.5-1.5-.5-2.4z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-medium text-slate-700"
              >
                <svg className="w-3.5 h-3.5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.34-.55.63-1.03 1.68-.9 2.69 1 .08 2.03-.5 2.58-1.18z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Bottom Register Switcher */}
            <div className="mt-7 text-center text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-medium text-[#ee4d2d] hover:underline"
              >
                Đăng ký
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
