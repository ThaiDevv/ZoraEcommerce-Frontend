import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authApi } from '../api/authApi'
import ZoraLogo from '../components/ZoraLogo'
import AuthTopbar from '../components/AuthTopbar'
import AuthFooter from '../components/AuthFooter'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  // Check if redirected from registration
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail)
      setInfoMessage('Đăng ký tài khoản thành công! Vui lòng đăng nhập để bắt đầu.')
    }
  }, [location.state])

  // Full page mouse parallax for animated aurora background
  const [pageMouse, setPageMouse] = useState({ x: 0, y: 0 })

  const handlePageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window
    const x = (e.clientX / innerWidth - 0.5) * 2
    const y = (e.clientY / innerHeight - 0.5) * 2
    setPageMouse({
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
    })
  }

  // Interactive 3D Perspective Tilt & Specular Light for artwork
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  })

  const handleArtMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Gentle 3D rotation (-6deg to +6deg)
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTilt({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      glareX: Math.round(glareX),
      glareY: Math.round(glareY),
      isHovered: true,
    })
  }

  const handleArtMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setIsLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const response = await authApi.login({
        email: normalizedEmail,
        password,
      })

      const token = response?.accessToken || (response as any)?.token
      if (token) {
        if (rememberMe) {
          localStorage.setItem('token', token)
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken)
          }
        } else {
          sessionStorage.setItem('token', token)
        }
        if (response.username) {
          localStorage.setItem('username', response.username)
        }
      }

      // Fetch user profile info
      try {
        const profile = await authApi.getProfile()
        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile))
        }
      } catch (profileErr) {
        console.warn('Could not fetch user profile details:', profileErr)
      }

      navigate('/')
    } catch (err: any) {
      setErrorMessage(err?.message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      onMouseMove={handlePageMouseMove}
      className="relative min-h-[100dvh] w-full bg-[#F8FAFC] flex flex-col justify-between overflow-x-hidden select-none"
    >
      {/* ================= ANIMATED LUXURY BACKGROUND ================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle Warm Base */}
        <div className="absolute inset-0 bg-[#F8FAFC]" />

        {/* Elegant Architectural Blueprint Dot Grid with Breathing Mask */}
        <div
          className="absolute inset-0 opacity-[0.4] transition-opacity duration-1000"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1.1px, transparent 1.1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)',
          }}
        />

        {/* Interactive Parallax Aurora Fluid Mesh */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${pageMouse.x * 30}px, ${pageMouse.y * 30}px, 0)`,
          }}
        >
          {/* Orb 1: Coral Sunrise (Top Left) */}
          <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-[#ee4d2d]/25 via-orange-300/30 to-amber-200/25 blur-[110px] animate-aurora-1" />

          {/* Orb 2: Champagne Amber (Bottom Right) */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-br from-amber-200/30 via-orange-200/25 to-[#ee4d2d]/20 blur-[120px] animate-aurora-2" />

          {/* Orb 3: Soft Rose Quartz (Center Right) */}
          <div className="absolute top-[25%] -right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-rose-200/30 via-pink-100/25 to-orange-200/20 blur-[90px] animate-aurora-3" />

          {/* Orb 4: Pearl Mist (Bottom Left) */}
          <div className="absolute -bottom-[10%] left-[15%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-t from-slate-200/40 via-blue-50/20 to-transparent blur-[100px] animate-ambient-pulse" />
        </div>

        {/* Floating Luxury Micro-Sparkles */}
        <div className="absolute inset-0">
          {[
            { top: '18%', left: '15%', delay: '0s', dur: '6s', size: 'w-1.5 h-1.5' },
            { top: '28%', left: '84%', delay: '1.5s', dur: '7.5s', size: 'w-2 h-2' },
            { top: '76%', left: '18%', delay: '3s', dur: '8s', size: 'w-1 h-1' },
            { top: '65%', left: '88%', delay: '2s', dur: '6.5s', size: 'w-1.5 h-1.5' },
            { top: '15%', left: '72%', delay: '4s', dur: '7s', size: 'w-1 h-1' },
            { top: '84%', left: '42%', delay: '0.8s', dur: '9s', size: 'w-2 h-2' },
          ].map((sparkle, idx) => (
            <div
              key={idx}
              className={`absolute ${sparkle.size} rounded-full bg-[#ee4d2d]/45 blur-[0.5px] pointer-events-none`}
              style={{
                top: sparkle.top,
                left: sparkle.left,
                animation: `sparkle-float ${sparkle.dur} ease-in-out infinite`,
                animationDelay: sparkle.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* ================= TOPBAR ================= */}
      <AuthTopbar title="Đăng nhập" />

      {/* ================= MAIN CONTENT: CENTERED LUXURY CARD ================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(15,23,42,0.08),0_10px_30px_-10px_rgba(238,77,45,0.08),0_0_0_1px_rgba(255,255,255,0.9)] border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* ================= LEFT COLUMN: Seamless Luxury Showcase (5 cols) ================= */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-b from-[#F2EFE8] via-[#F6F4EE] to-[#F8F6F1] p-8 flex-col justify-between border-r border-slate-200/50 overflow-hidden">
            
            {/* Ambient Lighting Accents */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top of Left Showcase: Monogram Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/90 border border-white/60 shadow-xs flex items-center justify-center p-1 shrink-0">
                  <ZoraLogo className="w-full h-full" />
                </div>
                <span className="text-sm font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans']">
                  Zora<span className="text-[#ee4d2d]">Ecommerce</span>
                </span>
              </div>
              <span className="text-[11px] text-[#ee4d2d] font-medium tracking-wide">
                ✦ Luxury Edition
              </span>
            </div>

            {/* Center: Editorial Typography + Seamlessly Blended 3D Art Piece */}
            <div className="relative z-10 my-auto py-2">
              
              {/* Elegant Editorial Typography */}
              <div className="mb-3 text-left">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] leading-snug">
                  Mua sắm <span className="italic font-serif font-normal text-[#ee4d2d] text-[1.12em]">tinh tế</span>
                  <span className="block text-slate-700 font-medium text-lg mt-0.5 tracking-normal">
                    & chuẩn gu từng khoảnh khắc.
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-light mt-1 leading-relaxed">
                  Đón nhận trải nghiệm mua sắm đẳng cấp và mở hộp đầy cảm hứng.
                </p>
              </div>

              {/* Interactive 3D Perspective Canvas with Seamless Dissolve Mask */}
              <div
                onMouseMove={handleArtMouseMove}
                onMouseLeave={handleArtMouseLeave}
                style={{ perspective: 1000 }}
                className="relative cursor-pointer select-none group"
              >
                <div
                  style={{
                    transform: tilt.isHovered
                      ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
                      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                    transition: tilt.isHovered
                      ? 'transform 0.15s ease-out'
                      : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                  className="relative rounded-3xl overflow-hidden flex items-center justify-center"
                >
                  {/* Clean Studio Boutique Shopping Bag & Gift Box with Seamless Radial Dissolve */}
                  <img
                    src="/images/auth-art.jpg?v=2"
                    alt="Zora Luxury Boutique Shopping Bag"
                    style={{
                      maskImage: 'radial-gradient(ellipse 90% 86% at 50% 50%, black 62%, transparent 96%)',
                      WebkitMaskImage: 'radial-gradient(ellipse 90% 86% at 50% 50%, black 62%, transparent 96%)',
                    }}
                    className="w-full h-auto aspect-[3/4] max-h-[320px] object-cover object-center block transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Dynamic Specular Light Glare tracking cursor */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: tilt.isHovered ? 0.3 : 0,
                      background: `radial-gradient(circle 260px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.75), transparent 70%)`,
                      maskImage: 'radial-gradient(ellipse 90% 86% at 50% 50%, black 62%, transparent 96%)',
                      WebkitMaskImage: 'radial-gradient(ellipse 90% 86% at 50% 50%, black 62%, transparent 96%)',
                    }}
                  />
                </div>

                {/* Soft ambient warm aura behind the artwork */}
                <div
                  className="absolute inset-x-6 bottom-0 h-28 bg-gradient-to-t from-orange-400/10 via-amber-200/10 to-transparent -z-10 blur-2xl transition-all duration-700 pointer-events-none"
                  style={{
                    transform: tilt.isHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
              </div>
            </div>

            {/* Bottom: Refined micro-proof */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-300/40">
              <span>© 2026 ZoraEcommerce</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="text-[#ee4d2d] animate-pulse">✦</span> Chuẩn mực thượng lưu
              </span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Clean Form (7 cols) ================= */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] mb-1">
                  Đăng nhập
                </h2>
                <p className="text-xs text-slate-400">
                  Nhập thông tin tài khoản để tiếp tục
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-[#FFF5F5] border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Info / Success Alert */}
              {infoMessage && (
                <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-orange-50/90 via-[#FFF8F5] to-amber-50/70 border border-[#ee4d2d]/25 text-slate-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in duration-300">
                  <div className="w-5 h-5 rounded-full bg-[#ee4d2d]/10 border border-[#ee4d2d]/20 flex items-center justify-center text-[#ee4d2d] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-700 flex-1">{infoMessage}</span>
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
                      <span>Đang đăng nhập...</span>
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

              {/* Social Logins - Google & Facebook */}
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
                  <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
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
      </main>

      {/* ================= CHÂN BAR (FOOTER BAR) ================= */}
      <AuthFooter />
    </div>
  )
}
