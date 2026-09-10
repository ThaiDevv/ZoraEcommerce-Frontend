import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Layers, 
  LayoutDashboard, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert, 
  Menu, 
  X, 
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import ZoraLogo from '../ZoraLogo'
import { authApi } from '../../api/authApi'
import type { User } from '../../types/auth'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Kiểm tra quyền ADMIN từ localStorage & fetch profile
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const u = JSON.parse(storedUser)
          setCurrentUser(u)
          if (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' || (u.role && u.role.includes('ADMIN'))) {
            setIsAdmin(true)
          }
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (token) {
          const profile = await authApi.getProfile()
          if (profile) {
            setCurrentUser(profile)
            localStorage.setItem('user', JSON.stringify(profile))
            if (profile.role === 'ADMIN' || profile.role === 'ROLE_ADMIN' || (profile.role && profile.role.includes('ADMIN'))) {
              setIsAdmin(true)
            } else {
              setIsAdmin(false)
            }
          }
        } else {
          setIsAdmin(false)
          setCurrentUser(null)
        }
      } catch (err: any) {
        console.warn('Lỗi kiểm tra quyền Admin:', err)
      }
    }

    checkAdminAuth()
  }, [location.pathname])

  // Đăng nhập nhanh Admin Demo với tài khoản buyer@zorashop.com (có ROLE_ADMIN)
  const handleQuickAdminLogin = async () => {
    setIsLoadingLogin(true)
    setAuthError(null)
    try {
      const res = await authApi.login({
        email: 'buyer@zorashop.com',
        password: 'Password123@',
      })
      if (res && res.accessToken) {
        localStorage.setItem('token', res.accessToken)
        localStorage.setItem('refreshToken', res.refreshToken)
        localStorage.setItem('username', res.username || 'Admin')

        const profile = await authApi.getProfile()
        localStorage.setItem('user', JSON.stringify(profile))
        setCurrentUser(profile)
        setIsAdmin(true)
        window.dispatchEvent(new Event('authChanged'))
        window.location.reload()
      }
    } catch (err: any) {
      setAuthError('Không thể đăng nhập Admin tự động. Vui lòng kiểm tra lại kết nối.')
    } finally {
      setIsLoadingLogin(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('username')
    sessionStorage.removeItem('token')
    setCurrentUser(null)
    setIsAdmin(false)
    window.dispatchEvent(new Event('authChanged'))
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Tổng Quan',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Quản Lý Người Dùng',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Quản Lý Danh Mục',
      path: '/admin/categories',
      icon: Layers,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Navbar - Giống hệt phong cách Seller Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 transition-transform group-hover:scale-105 duration-200">
                <ZoraLogo />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  Zora<span className="text-[#ee4d2d]">Ecommerce</span>
                </span>
                <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-400 group-hover:text-[#ee4d2d] transition-colors mt-0.5">
                  Sàn TMĐT Uy Tín
                </span>
              </div>
            </Link>

            <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

            <span className="text-sm font-semibold uppercase tracking-wider bg-orange-50 text-[#ee4d2d] px-2.5 py-1 rounded-md border border-orange-200/60 hidden sm:inline-block">
              Kênh Quản Trị
            </span>
          </div>

          {/* Right Navigation & User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/?preview=true"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#ee4d2d] px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
              title="Mở tab mới xem trước giao diện sàn mua sắm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Sàn (Tab mới)</span>
            </a>


            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-right hidden sm:flex">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[160px]">
                      {currentUser.fullName || currentUser.email}
                    </span>
                    <span className="text-[10.5px] font-semibold text-[#ee4d2d]">
                      Quản trị viên
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100 p-0.5"
                  />
                  {isAdmin && (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ee4d2d] absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-[#ee4d2d] rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdminLogin}
                disabled={isLoadingLogin}
                className="text-xs font-semibold bg-[#ee4d2d] hover:bg-[#d73f1f] text-white px-3 py-1.5 rounded-md transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isLoadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập Admin Demo'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Permission Warning Banner if NOT Admin */}
      {(!currentUser || !isAdmin) && (
        <div className="bg-orange-50/80 border-b border-orange-200/60 py-2.5 px-4 text-xs text-slate-700">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ee4d2d] shrink-0" />
              <span>
                {currentUser 
                  ? `Tài khoản '${currentUser.email}' chưa có quyền ADMIN. Hãy đăng nhập tài khoản quản trị để thực hiện thao tác.` 
                  : 'Bạn đang xem Kênh Quản Trị ở chế độ khách.'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleQuickAdminLogin}
                disabled={isLoadingLogin}
                className="bg-[#ee4d2d] hover:bg-[#d73f1f] text-white px-3 py-1 rounded font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isLoadingLogin ? 'Đang xác thực...' : 'Đăng nhập Admin Demo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {authError && (
        <div className="bg-orange-50 border-b border-orange-200 py-2 px-4 text-xs text-[#ee4d2d] font-medium text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#ee4d2d]" />
          <span>{authError}</span>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation - Đồng bộ hoàn toàn với Seller Sidebar */}
        <aside className={`md:w-64 shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs sticky top-22">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
              Trung Tâm Quản Trị
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin')
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-orange-50 text-[#ee4d2d] font-semibold border-l-4 border-[#ee4d2d]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#ee4d2d]' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-[#ee4d2d]" />}
                  </Link>
                )
              })}
            </nav>


          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Header Banner for Page - Đồng bộ hoàn toàn với Seller Banner */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ee4d2d]" />
                Quản Trị Hệ Thống
              </span>
            </div>
          </div>

          {/* Render Page Children */}
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ZoraShop Admin Console. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Bảo mật hệ thống</span>
            <span>Quy chuẩn vận hành</span>
            <span>Hỗ trợ kỹ thuật</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
