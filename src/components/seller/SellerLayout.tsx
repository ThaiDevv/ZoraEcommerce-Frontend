import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  ShoppingBag, 
  Package, 
  Warehouse, 
  Store, 
  ArrowLeft, 
  LogOut, 
  UserCheck, 
  ShieldAlert,
  Sparkles, 
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { authApi } from '../../api/authApi'
import { sellerApi } from '../../api/sellerApi'
import type { User } from '../../types/auth'
import ZoraLogo from '../ZoraLogo'
import RegisterShopModal from './RegisterShopModal'

interface SellerLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function SellerLayout({ children, title, subtitle }: SellerLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  interface CurrentShopInfo {
    id: number | null
    name: string
    description?: string
    logoUrl?: string
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentShop, setCurrentShop] = useState<CurrentShopInfo | null>(() => {
    try {
      const saved = localStorage.getItem('current_seller_shop')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isSeller, setIsSeller] = useState<boolean>(false)
  const [isLoadingLogin, setIsLoadingLogin] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false)

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (storedUser && token) {
        const parsed: User = JSON.parse(storedUser)
        setCurrentUser(parsed)
        const role = parsed.role || ''
        const hasSellerRole = role.includes('SELLER') || role === 'ROLE_SELLER' || role === 'SELLER'
        setIsSeller(hasSellerRole)
      } else {
        setCurrentUser(null)
        setIsSeller(false)
      }
    } catch {
      setCurrentUser(null)
      setIsSeller(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [location.pathname])

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const pRes = await sellerApi.getSellerProducts({ page: 0, size: 1 })
        const items = pRes?.items || pRes?.content || []
        if (items.length > 0 && items[0].shopId) {
          const sId = items[0].shopId
          const sName = items[0].shopName || 'Gian hàng của tôi'
          try {
            const detail = await sellerApi.getShopDetails(sId)
            const info: CurrentShopInfo = {
              id: sId,
              name: detail?.name || sName,
              description: detail?.description || 'Gian hàng chính hãng trên ZoraShop.',
              logoUrl: detail?.logoUrl
            }
            setCurrentShop(info)
            localStorage.setItem('current_seller_shop', JSON.stringify(info))
          } catch {
            const info: CurrentShopInfo = {
              id: sId,
              name: sName,
              description: 'Gian hàng chính hãng trên ZoraShop.'
            }
            setCurrentShop(info)
            localStorage.setItem('current_seller_shop', JSON.stringify(info))
          }
        }
      } catch (e) {
        console.error('Lỗi khi tải thông tin shop của tài khoản:', e)
      }
    }

    if (currentUser && isSeller) {
      fetchShopInfo()
    }
  }, [currentUser, isSeller])


  const handleQuickSellerLogin = async () => {
    setIsLoadingLogin(true)
    setAuthError(null)
    try {
      const loginRes = await authApi.login({
        email: 'seller3@zorashop.com',
        password: 'Password123@'
      })

      const token = loginRes?.accessToken || (loginRes as any)?.token
      if (token) {
        localStorage.setItem('token', token)
        sessionStorage.setItem('token', token)
        if (loginRes.refreshToken) {
          localStorage.setItem('refreshToken', loginRes.refreshToken)
        }
        if (loginRes.username) {
          localStorage.setItem('username', loginRes.username)
        }

        // Fetch user profile
        try {
          const profile = await authApi.getProfile()
          localStorage.setItem('user', JSON.stringify(profile))
          setCurrentUser(profile)
          setIsSeller(true)
        } catch {
          const fallbackUser: User = {
            email: 'seller3@zorashop.com',
            fullName: 'Electro Mini Superstore (Seller)',
            role: 'ROLE_SELLER',
            isActive: true
          }
          localStorage.setItem('user', JSON.stringify(fallbackUser))
          setCurrentUser(fallbackUser)
          setIsSeller(true)
        }
        window.location.reload()
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Đăng nhập Seller Demo thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoadingLogin(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('username')
    localStorage.removeItem('current_seller_shop')
    sessionStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Quản Lý Đơn Hàng',
      path: '/seller/orders',
      icon: ShoppingBag,
      description: 'Duyệt đơn, giao vận & chi tiết'
    },
    {
      name: 'Quản Lý Sản Phẩm',
      path: '/seller/products',
      icon: Package,
      description: 'Thêm mới, sửa & xóa sản phẩm'
    },
    {
      name: 'Quản Lý Kho Hàng',
      path: '/seller/inventory',
      icon: Warehouse,
      description: 'Tồn kho & lịch sử biến động'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none"
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

            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider bg-orange-50 text-[#ee4d2d] px-2.5 py-1 rounded-md border border-orange-200/60 hidden sm:inline-block">
              Kênh Người Bán
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Links */}
            {currentShop?.id && (
              <Link
                to={`/shop/${currentShop.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#ee4d2d] px-3 py-1.5 rounded-md hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-200"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Shop</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            )}

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chế độ người mua</span>
            </Link>

            {/* User Dropdown / Info */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] font-bold text-xs overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.fullName?.charAt(0) || 'S'
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight max-w-[150px] truncate">
                    {currentShop?.name || currentUser.fullName || 'Người Bán'}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5">
                    <UserCheck className="w-2.5 h-2.5" /> {isSeller ? (currentShop?.name ? 'Chủ gian hàng' : 'Shop Đối Tác') : currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickSellerLogin}
                disabled={isLoadingLogin}
                className="text-xs font-semibold bg-[#ee4d2d] hover:bg-[#d73f1f] text-white px-3 py-1.5 rounded-md transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập Seller Demo'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Non-Seller or Logged-out Warning Alert */}
      {(!currentUser || !isSeller) && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {currentUser 
                  ? `Tài khoản '${currentUser.email}' chưa có gian hàng (SELLER). Hãy đăng ký mở shop để bắt đầu bán hàng.` 
                  : 'Bạn đang xem Kênh Người Bán ở chế độ khách.'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {currentUser && !isSeller && (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="bg-[#ee4d2d] hover:bg-[#d73f1f] text-white px-3 py-1 rounded font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  <span>Đăng Ký Mở Shop Ngay</span>
                </button>
              )}
              <Link
                to="/seller/register"
                className="bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 px-2.5 py-1 rounded font-medium text-xs transition-colors shrink-0"
              >
                Trang giới thiệu mở Shop
              </Link>
              <button
                onClick={handleQuickSellerLogin}
                disabled={isLoadingLogin}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded font-medium text-xs transition-colors shrink-0 flex items-center gap-1 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
              >
                {isLoadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập Seller Demo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {authError && (
        <div className="bg-red-50 border-b border-red-200 py-2 px-4 text-xs text-red-800 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{authError}</span>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className={`md:w-64 shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs sticky top-22">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
              Trung Tâm Quản Lý
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (item.path === '/seller/orders' && location.pathname === '/seller')
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

            {/* Shop Quick Stats / Preview Box */}
            <div className="mt-6 pt-4 border-t border-slate-100 px-3">
              <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Store className="w-4 h-4 text-[#ee4d2d]" />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {currentShop?.name || currentUser?.fullName || 'Gian hàng của tôi'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5 line-clamp-2">
                  {currentShop?.description || 'Gian hàng phân phối sản phẩm chính hãng trên ZoraShop.'}
                </p>
                {currentShop?.id ? (
                  <Link
                    to={`/shop/${currentShop.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#ee4d2d] hover:underline flex items-center gap-1"
                  >
                    <span>Truy cập gian hàng</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-400">Đang đồng bộ thông tin shop...</span>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Header Banner for Page */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-[#ee4d2d] border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ee4d2d] mr-1.5 animate-pulse"></span>
                Hệ Thống Trực Tuyến
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
          <span>© 2026 ZoraShop Seller Centre. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Quy chuẩn Người bán</span>
            <span>Chính sách Vận chuyển</span>
            <span>Hỗ trợ kỹ thuật</span>
          </div>
        </div>
      </footer>
      {/* Register Shop Modal */}
      <RegisterShopModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  )
}
