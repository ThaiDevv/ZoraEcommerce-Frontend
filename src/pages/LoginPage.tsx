import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { authApi } from '../api/authApi'

export default function LoginPage() {
  const navigate = useNavigate()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Request & Validation states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Basic client validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.')
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      })

      // Store tokens
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

      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...')

      // Redirect after smooth delay
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err: any) {
      const msg =
        err?.message ||
        'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-[#ee4d2d] selection:text-white">
      {/* Main Split-Screen Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ================= LEFT COLUMN: Editorial Brand Showcase (5 cols) ================= */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-slate-50 p-10 flex-col justify-between border-r border-slate-100 overflow-hidden">
          
          {/* Subtle decorative ambient circles (no harsh gradients) */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-orange-200/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />

          {/* Top: Logo & Back Link */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Quay lại trang chủ
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-[#ee4d2d] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-orange-500/30">
                Z
              </span>
              <span className="text-2xl font-black tracking-tight text-[#0F172A] font-['Plus_Jakarta_Sans']">
                Zora<span className="text-[#ee4d2d]">Ecommerce</span>
              </span>
            </div>
          </div>

          {/* Middle: Brand Editorial Message */}
          <div className="relative z-10 my-auto py-8">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#ee4d2d] bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60 mb-4">
              Hệ thống bán lẻ chính hãng
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] leading-tight font-['Plus_Jakarta_Sans'] mb-4">
              Mua Sắm Thông Minh, <br />
              Nâng Tầm Phong Cách.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-8">
              Khám phá hàng ngàn ưu đãi độc quyền từ các thương hiệu uy tín hàng đầu với trải nghiệm tiện lợi và an tâm tuyệt đối.
            </p>

            {/* 3 Value Pillars with refined 1.5px stroke icons */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>100% Sản phẩm chính hãng & nguồn gốc rõ ràng</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Giao hàng hỏa tốc trong 2h tại khu vực nội thành</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span>Đổi trả miễn phí 15 ngày với thủ tục minh bạch</span>
              </div>
            </div>
          </div>

          {/* Bottom: Subtle Customer Trust Proof */}
          <div className="relative z-10 pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 ZoraEcommerce</span>
            <span>Bảo mật chuẩn SSL 256-bit</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: High-Trust Auth Form (7 cols) ================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-white">
          
          {/* Mobile Back button & Brand header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Trang chủ
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-lg bg-[#ee4d2d] text-white flex items-center justify-center font-bold text-sm">
                Z
              </span>
              <span className="font-bold text-lg text-[#0F172A]">
                Zora<span className="text-[#ee4d2d]">Ecommerce</span>
              </span>
            </div>
          </div>

          {/* Form Content Wrapper */}
          <div className="w-full max-w-md mx-auto my-auto py-2">
            
            {/* Header Text */}
            <div className="mb-8 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] mb-2">
                Đăng Nhập
              </h1>
              <p className="text-sm text-slate-500">
                Chào mừng bạn trở lại! Nhập thông tin tài khoản để tiếp tục.
              </p>
            </div>

            {/* Contextual Alert Messages */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Field 1: Email Input */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email <span className="text-[#ee4d2d]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ee4d2d] focus:ring-3 focus:ring-[#ee4d2d]/15 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password Input */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Mật khẩu <span className="text-[#ee4d2d]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ee4d2d] focus:ring-3 focus:ring-[#ee4d2d]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] focus:ring-offset-0 cursor-pointer accent-[#ee4d2d]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#ee4d2d] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Primary Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#ee4d2d] hover:bg-[#d73211] active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng Nhập</span>
                )}
              </button>
            </form>

            {/* Social Auth Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                className="h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
                title="Đăng nhập bằng Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              </button>

              {/* Facebook */}
              <button
                type="button"
                className="h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
                title="Đăng nhập bằng Facebook"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* Apple */}
              <button
                type="button"
                className="h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
                title="Đăng nhập bằng Apple ID"
              >
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.34-.55.63-1.03 1.68-.9 2.69 1 .08 2.03-.5 2.58-1.18z" />
                </svg>
              </button>
            </div>

            {/* Bottom Account Switcher */}
            <div className="mt-8 text-center text-xs text-slate-500">
              Bạn chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold text-[#ee4d2d] hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* Legal microcopy footer */}
          <div className="text-[11px] text-slate-400 text-center mt-6">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link to="/terms" className="underline hover:text-slate-600">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="underline hover:text-slate-600">
              Chính sách bảo mật
            </Link>{' '}
            của ZoraEcommerce.
          </div>
        </div>

      </div>
    </div>
  )
}
