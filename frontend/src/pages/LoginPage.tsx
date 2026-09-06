import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      if (res?.body?.accessToken) {
        const token = res.body.accessToken;
        const initialIsSeller = email.toLowerCase().includes('seller');

        // Default user response
        let userProfile: UserResponse = {
          id: 1,
          email: email.trim(),
          username: res.body.username || email.trim().split('@')[0],
          fullName: res.body.username || email.trim().split('@')[0],
          role: initialIsSeller ? 'ROLE_SELLER' : 'ROLE_BUYER',
        };

        // Try getting fresh profile from API
        try {
          const profileRes = await authApi.getProfile();
          if (profileRes?.body) {
            userProfile = profileRes.body;
          }
        } catch {
          // Keep default profile if getProfile fails
        }

        login(token, userProfile);
        success('Đăng nhập thành công', `Chào mừng ${userProfile.fullName || 'bạn'} quay trở lại!`);

        const isAdmin = userProfile.role?.includes('ADMIN');
        const isSeller = userProfile.role?.includes('SELLER');

        const fromPath = (location.state as any)?.from?.pathname;
        if (fromPath) {
          navigate(fromPath, { replace: true });
        } else if (isAdmin) {
          navigate('/admin', { replace: true });
        } else if (isSeller) {
          navigate('/seller/products', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      if (serverMsg && typeof serverMsg === 'string' && !serverMsg.includes('status code')) {
        setError(serverMsg);
      } else {
        setError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 bg-[#fafafa] selection:bg-slate-900 selection:text-white overflow-hidden">
      {/* ── Rich Ambient Glowing Background ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left soft slate ambient orb */}
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(203, 213, 225, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Bottom-right subtle slate ambient orb */}
        <div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 0%, rgba(241, 245, 249, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Central subtle highlight */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, transparent 65%)',
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
      <header className="relative z-10 w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-xs text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-200 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* ── Centered Balanced Auth Card ─────────────────────────── */}
      <main className="relative z-10 w-full max-w-md">
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
              Đăng Nhập Tài Khoản
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chào mừng bạn quay lại ZoraEcommerce
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Email đăng nhập
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vidu@zoraecommerce.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-700"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Mật khẩu
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Vui lòng liên hệ quản trị viên để được hỗ trợ khôi phục mật khẩu.');
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 transition-all duration-200 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded-md border-slate-300 focus:ring-slate-900 cursor-pointer accent-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-xs cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Ngay</span>
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
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => alert('Đăng nhập qua Google đang được cấu hình OAuth.')}
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
              onClick={() => alert('Đăng nhập qua Facebook đang được cấu hình OAuth.')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Chưa có tài khoản ZoraEcommerce? </span>
            <Link
              to="/register"
              className="font-bold text-slate-900 hover:underline transition-colors inline-flex items-center gap-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Đăng ký ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
