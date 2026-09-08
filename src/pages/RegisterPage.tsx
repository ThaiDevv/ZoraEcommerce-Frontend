import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { authApi } from '../api/authApi'
import ZoraLogo from '../components/ZoraLogo'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  // Password Strength Calculation (0 to 4)
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Yếu', color: 'bg-rose-500', textColor: 'text-rose-600' }
      case 2:
        return { score: 2, label: 'Trung bình', color: 'bg-amber-500', textColor: 'text-amber-600' }
      case 3:
        return { score: 3, label: 'Khá tốt', color: 'bg-blue-500', textColor: 'text-blue-600' }
      case 4:
        return { score: 4, label: 'Bảo mật cao', color: 'bg-emerald-500', textColor: 'text-emerald-600' }
      default:
        return { score: 1, label: 'Quá ngắn', color: 'bg-rose-400', textColor: 'text-rose-500' }
    }
  }, [password])

  // Password confirmation matching state
  const isPasswordMatch = useMemo(() => {
    if (!confirmPassword) return null
    return password === confirmPassword
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email')
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật')
      return
    }

    setIsLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      // 1. Send registration payload to Spring Boot backend
      await authApi.register({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        phone: phone.trim() ? phone.trim() : undefined,
      })

      setSuccessMessage('Đăng ký tài khoản thành công! Đang tự động đăng nhập...')

      // 2. Seamless auto-login to obtain tokens
      try {
        const loginRes = await authApi.login({
          email: normalizedEmail,
          password,
        })
        const token = loginRes.accessToken || (loginRes as any).token
        if (token) {
          localStorage.setItem('token', token)
          if (loginRes.refreshToken) {
            localStorage.setItem('refreshToken', loginRes.refreshToken)
          }
          if (loginRes.username) {
            localStorage.setItem('username', loginRes.username)
          }
        }

        // Fetch user profile if available
        try {
          const profile = await authApi.getProfile()
          if (profile) {
            localStorage.setItem('user', JSON.stringify(profile))
          }
        } catch {
          // non-blocking
        }

        setTimeout(() => {
          navigate('/')
        }, 1200)
      } catch {
        // Fallback: redirect to login page with prefilled email
        setTimeout(() => {
          navigate('/login', { state: { registeredEmail: email.trim() } })
        }, 1200)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng ký không thành công. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      onMouseMove={handlePageMouseMove}
      className="relative min-h-[100dvh] w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none"
    >
      {/* ================= ANIMATED LUXURY BACKGROUND ================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle Warm Base */}
        <div className="absolute inset-0 bg-[#F8FAFC]" />

        {/* Elegant Architectural Dot Grid with Radial Breathing Mask */}
        <div
          className="absolute inset-0 opacity-[0.4] transition-opacity duration-1000"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1.1px, transparent 1.1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)',
          }}
        />

        {/* Interactive Parallax Aurora Fluid Mesh - Warm Gold & Coral Amber Accents */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${pageMouse.x * 30}px, ${pageMouse.y * 30}px, 0)`,
          }}
        >
          {/* Orb 1: Coral Sunrise (Top Left) */}
          <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-[#ee4d2d]/25 via-orange-300/30 to-amber-200/25 blur-[110px] animate-aurora-1" />

          {/* Orb 2: Champagne Amber & Gold (Bottom Right) */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-br from-amber-200/30 via-orange-200/25 to-[#ee4d2d]/20 blur-[120px] animate-aurora-2" />

          {/* Orb 3: Soft Rose Quartz (Center Right) */}
          <div className="absolute top-[25%] -right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-rose-200/30 via-pink-100/25 to-orange-200/20 blur-[90px] animate-aurora-3" />

          {/* Orb 4: Pearl Mist (Bottom Left) */}
          <div className="absolute -bottom-[10%] left-[15%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-t from-slate-200/40 via-blue-50/20 to-transparent blur-[100px] animate-ambient-pulse" />
        </div>

        {/* Floating Luxury Micro-Sparkles */}
        <div className="absolute inset-0">
          {[
            { top: '16%', left: '12%', delay: '0s', dur: '6s', size: 'w-1.5 h-1.5' },
            { top: '24%', left: '86%', delay: '1.5s', dur: '7.5s', size: 'w-2 h-2' },
            { top: '78%', left: '16%', delay: '3s', dur: '8s', size: 'w-1 h-1' },
            { top: '68%', left: '85%', delay: '2s', dur: '6.5s', size: 'w-1.5 h-1.5' },
            { top: '12%', left: '74%', delay: '4s', dur: '7s', size: 'w-1 h-1' },
            { top: '86%', left: '45%', delay: '0.8s', dur: '9s', size: 'w-2 h-2' },
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

      {/* ================= CENTERED LUXURY CARD ================= */}
      <div className="relative z-10 w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(15,23,42,0.08),0_10px_30px_-10px_rgba(238,77,45,0.08),0_0_0_1px_rgba(255,255,255,0.9)] border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* ================= LEFT COLUMN: VIP Member Art Showcase (5 cols) ================= */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-b from-[#F2EFE8] via-[#F6F4EE] to-[#F8F6F1] p-8 flex-col justify-between border-r border-slate-200/50 overflow-hidden">
          
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Logo & Back Navigation */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-white shadow-xs flex items-center justify-center p-1 shrink-0">
                <ZoraLogo className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans']">
                Zora<span className="text-[#ee4d2d]">Ecommerce</span>
              </span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Trang chủ
            </Link>
          </div>

          {/* Center: Editorial Typography + VIP Invitation 3D Art Piece */}
          <div className="relative z-10 my-auto py-2">
            
            {/* Welcoming Editorial Typography */}
            <div className="mb-4 text-left">
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] leading-snug">
                Khởi đầu <span className="italic font-serif font-normal text-[#ee4d2d] text-[1.12em]">đặc quyền</span>
                <span className="block text-slate-700 font-medium text-lg mt-0.5 tracking-normal">
                  & phong cách riêng biệt.
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                Trở thành hội viên Zora Club để mở khóa thế giới mua sắm thượng lưu và tận hưởng quà tặng chào mừng.
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
                {/* Bespoke Luxury VIP Welcome Box Artwork */}
                <img
                  src="/images/register-art.jpg"
                  alt="Zora VIP Membership Welcome Invitation"
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
              <ShieldCheck className="w-3.5 h-3.5 text-[#ee4d2d]" /> Bảo mật thông tin 100%
            </span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Refined Registration Form (7 cols) ================= */}
        <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 shadow-xs flex items-center justify-center p-1 shrink-0">
                  <ZoraLogo className="w-full h-full" />
                </div>
                <span className="font-bold text-lg text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans']">
                  Zora<span className="text-[#ee4d2d]">Ecommerce</span>
                </span>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans'] mb-1">
                Tạo tài khoản mới
              </h1>
              <p className="text-xs text-slate-400">
                Đăng ký để nhận trọn bộ đặc quyền mua sắm cao cấp
              </p>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#FFF5F5] border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
                <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-50/90 via-[#FFF8F5] to-amber-50/70 border border-[#ee4d2d]/25 text-slate-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in duration-300">
                <div className="w-5 h-5 rounded-full bg-[#ee4d2d]/10 border border-[#ee4d2d]/20 flex items-center justify-center text-[#ee4d2d] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-700 flex-1">{successMessage}</span>
                <span className="relative flex h-2 w-2 ml-1 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ee4d2d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ee4d2d]"></span>
                </span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              
              {/* Row 1: Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="register-fullname"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Họ và tên <span className="text-[#ee4d2d]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="register-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label
                    htmlFor="register-phone"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="register-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      autoComplete="tel"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="space-y-1">
                <label
                  htmlFor="register-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email <span className="text-[#ee4d2d]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="register-password"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Mật khẩu <span className="text-[#ee4d2d]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      autoComplete="new-password"
                      required
                      className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Xác nhận mật khẩu <span className="text-[#ee4d2d]">*</span>
                    </label>
                    {isPasswordMatch !== null && (
                      <span className={`text-[10px] font-medium ${isPasswordMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isPasswordMatch ? '✓ Khớp' : 'Chưa khớp'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      required
                      className={`w-full pl-9 pr-9 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                        isPasswordMatch === false
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
                          : isPasswordMatch === true
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15'
                          : 'border-slate-200 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Dynamic Interactive Password Strength Meter */}
              {password.length > 0 && (
                <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                    <span className={`font-semibold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step
                            ? passwordStrength.color
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-500 leading-snug">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer accent-[#ee4d2d] shrink-0"
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-700 font-medium underline hover:text-[#ee4d2d]">
                      Điều khoản dịch vụ
                    </a>{' '}
                    và{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-700 font-medium underline hover:text-[#ee4d2d]">
                      Chính sách bảo mật
                    </a>{' '}
                    của Zora.
                  </span>
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
                    <span>Đang khởi tạo tài khoản...</span>
                  </>
                ) : (
                  <span>Tạo tài khoản</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-white text-slate-300">hoặc đăng ký bằng</span>
              </div>
            </div>

            {/* Social Signups - Google & Facebook */}
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

            {/* Bottom Login Switcher */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Đã có tài khoản Zora?{' '}
              <Link
                to="/login"
                className="font-medium text-[#ee4d2d] hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
