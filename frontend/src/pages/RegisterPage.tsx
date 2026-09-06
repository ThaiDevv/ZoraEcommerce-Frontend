import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserResponse } from '../types/auth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!fullname.trim() || !phone.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (fullname.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Định dạng email không hợp lệ (ví dụ: ten@domain.com).');
      return;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số).');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Call Backend Registration
      const regRes = await authApi.register({
        fullname: fullname.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      // 2. Auto Login after Registration
      try {
        const loginRes = await authApi.login({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (loginRes?.body?.accessToken) {
          const token = loginRes.body.accessToken;
          let userProfile: UserResponse = {
            id: 1,
            email: email.trim().toLowerCase(),
            username: regRes?.body?.fullName || fullname.trim(),
            fullName: regRes?.body?.fullName || fullname.trim(),
            phone: phone.trim(),
            role: 'ROLE_BUYER',
          };

          try {
            const profileRes = await authApi.getProfile();
            if (profileRes?.body) {
              userProfile = profileRes.body;
            }
          } catch {
            // Use constructed profile if getProfile fails
          }

          login(token, userProfile);
          success('Đăng ký thành công!', `Chào mừng ${userProfile.fullName} đến với ZoraEcommerce!`);
          navigate('/', { replace: true });
          return;
        }
      } catch {
        // If auto-login fails, redirect to /login
      }

      success('Đăng ký tài khoản thành công!', 'Vui lòng đăng nhập với thông tin vừa tạo.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      if (serverMsg && typeof serverMsg === 'string' && !serverMsg.includes('status code')) {
        setError(serverMsg);
      } else {
        setError('Đăng ký không thành công. Email hoặc số điện thoại có thể đã được sử dụng.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 bg-[#fafafa] selection:bg-slate-900 selection:text-white overflow-hidden">
      {/* ── Rich Ambient Glowing Background ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right soft slate ambient orb */}
        <div
          className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(203, 213, 225, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Bottom-left subtle slate ambient orb */}
        <div
          className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 0%, rgba(241, 245, 249, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Architectural geometric micro-dot grid */}
        <div
          className="absolute inset-0 opacity-[0.38]"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.1px, transparent 1.1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ── Top Floating Navigation ────────────────────────────── */}
      <header className="relative z-10 w-full max-w-lg mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-xs text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-200 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Về trang chủ</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Đã có tài khoản?</span>
          <Link to="/login" className="font-bold text-slate-900 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* ── Centered Balanced Registration Card ─────────────────── */}
      <main className="relative z-10 w-full max-w-lg">
        <div
          className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-9 relative overflow-hidden transition-all shadow-xs"
        >
          {/* Top Slate Accent Stripe */}
          <div
            className="absolute top-0 inset-x-0 h-1"
            style={{
              background: 'linear-gradient(90deg, #0f172a 0%, #475569 50%, #0f172a 100%)',
            }}
          />

          {/* Brand Logo & Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center mb-2.5 group">
              <img
                src="/logo.png"
                alt="ZoraEcommerce"
                className="h-13 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <h1
              className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tạo Tài Khoản Mới
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Điền thông tin để bắt đầu trải nghiệm mua sắm tại ZoraEcommerce
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Fullname & Phone */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Email đăng ký <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded-md border-slate-300 focus:ring-slate-900 cursor-pointer accent-slate-900 shrink-0"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  Tôi đồng ý với{' '}
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Điều khoản dịch vụ bảo vệ người dùng và đảm bảo giao dịch minh bạch trên ZoraEcommerce.');
                    }}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Chính sách bảo mật cam kết bảo vệ dữ liệu người dùng.');
                    }}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Chính sách bảo mật
                  </a>{' '}
                  của ZoraEcommerce.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-slate-900 hover:bg-slate-800 shadow-xs hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none mt-2"
              style={{
                fontFamily: 'var(--font-display)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng Ký Tài Khoản</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Hoặc đăng ký nhanh bằng
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => alert('Đăng ký qua Google đang được cấu hình OAuth.')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Đăng ký qua Facebook đang được cấu hình OAuth.')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Đã có tài khoản ZoraEcommerce? </span>
            <Link
              to="/login"
              className="font-bold text-slate-900 hover:text-slate-700 transition-colors inline-flex items-center gap-1 hover:underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
