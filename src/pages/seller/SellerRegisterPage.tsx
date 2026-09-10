import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Star,
  Package,
  ArrowRight,
  Truck,
  Users,
  ArrowLeft,
  ShoppingBag,
  Zap
} from 'lucide-react'
import ZoraLogo from '../../components/ZoraLogo'
import { sellerApi, type ShopResponse } from '../../api/sellerApi'
import { authApi } from '../../api/authApi'
import type { User } from '../../types/auth'

export default function SellerRegisterPage() {
  const navigate = useNavigate()
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSeller, setIsSeller] = useState<boolean>(false)

  // Form State
  const [shopName, setShopName] = useState<string>('')
  const [shopDescription, setShopDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [createdShop, setCreatedShop] = useState<ShopResponse | null>(null)

  // Quick Login State
  const [isLoadingQuickLogin, setIsLoadingQuickLogin] = useState<boolean>(false)

  const checkUserStatus = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (storedUser && token) {
        const parsed: User = JSON.parse(storedUser)
        setCurrentUser(parsed)
        const role = parsed.role || ''
        const hasSellerRole = role.includes('SELLER') || role === 'ROLE_SELLER' || role === 'SELLER'
        setIsSeller(hasSellerRole)

        if (hasSellerRole || localStorage.getItem('current_seller_shop')) {
          navigate('/seller/orders', { replace: true })
          return
        }

        try {
          const pRes = await sellerApi.getSellerProducts({ page: 0, size: 1 })
          const items = pRes?.items || pRes?.content || []
          if (items.length > 0 && items[0].shopId) {
            localStorage.setItem('current_seller_shop', JSON.stringify({
              id: items[0].shopId,
              name: items[0].shopName
            }))
            navigate('/seller/orders', { replace: true })
            return
          }
        } catch {
          // ignore
        }
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
    checkUserStatus()
  }, [])

  // Quick login for test buyer account
  const handleQuickBuyerLogin = async () => {
    setIsLoadingQuickLogin(true)
    setErrorMessage(null)
    try {
      const res = await authApi.login({
        email: 'buyer2@zorashop.com',
        password: 'Password123@'
      })
      const token = res?.accessToken || (res as any)?.token
      if (token) {
        localStorage.setItem('token', token)
        sessionStorage.setItem('token', token)
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken)
        if (res.username) localStorage.setItem('username', res.username)

        const profile = await authApi.getProfile()
        localStorage.setItem('user', JSON.stringify(profile))
        setCurrentUser(profile)
        setIsSeller(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập tài khoản người mua thất bại.')
    } finally {
      setIsLoadingQuickLogin(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = shopName.trim()
    if (trimmedName.length < 3) {
      setErrorMessage('Tên gian hàng phải có ít nhất 3 ký tự.')
      return
    }
    if (trimmedName.length > 50) {
      setErrorMessage('Tên gian hàng không được vượt quá 50 ký tự.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await sellerApi.createShop({
        name: trimmedName,
        description: shopDescription.trim() || 'Gian hàng chính hãng phân phối sản phẩm uy tín trên ZoraShop.'
      })

      setCreatedShop(res)

      // Refresh profile to update role to SELLER
      try {
        const updated = await authApi.getProfile()
        localStorage.setItem('user', JSON.stringify(updated))
      } catch {
        const cur = localStorage.getItem('user')
        if (cur) {
          const u = JSON.parse(cur)
          u.role = 'ROLE_SELLER'
          localStorage.setItem('user', JSON.stringify(u))
        }
      }

      // Cache shop info
      localStorage.setItem('current_seller_shop', JSON.stringify({
        id: res.id,
        name: res.name,
        description: res.description
      }))

      setIsSuccess(true)
    } catch (err: any) {
      console.error('Lỗi đăng ký shop:', err)
      const msg = err.response?.data?.message || err.message || 'Không thể hoàn tất đăng ký mở shop.'
      if (msg.includes('already has a shop') || msg.includes('đã có shop')) {
        setErrorMessage('Tài khoản của bạn đã có một gian hàng trước đó rồi. Bạn có thể truy cập ngay vào Kênh Người Bán.')
      } else {
        setErrorMessage(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToSellerOrders = () => {
    navigate('/seller/orders')
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-800">
      {/* Topbar Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider bg-orange-50 text-[#ee4d2d] px-2.5 py-1 rounded-md border border-orange-200/60 hidden sm:inline-block">
              Đăng Ký Mở Shop
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về trang chủ</span>
            </Link>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] font-bold text-[11px] overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.fullName?.charAt(0) || 'U'
                  )}
                </div>
                <span className="font-bold text-slate-800 truncate max-w-[130px] hidden md:inline">
                  {currentUser.fullName || currentUser.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-orange-500 to-[#ee4d2d] rounded-2xl p-6 sm:p-10 text-white shadow-md mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-2xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cơ Hội Kinh Doanh Toàn Diện Cùng ZoraShop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Đăng Ký Mở Gian Hàng Bán Hàng Ngay Hôm Nay
            </h1>
            <p className="text-white/90 text-xs sm:text-sm mt-2.5 leading-relaxed">
              Biến tài khoản của bạn thành Người bán hàng chuyên nghiệp trong 30 giây. Miễn phí khởi tạo, tiếp cận hàng triệu người mua, quản lý đơn hàng & tồn kho thông minh.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 z-10 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <div className="text-sm font-bold">Kích Hoạt Tức Thì</div>
                <div className="text-[11px] text-white/80">Không cần chờ xét duyệt thủ công</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm font-bold">Chi Phí 0đ</div>
                <div className="text-[11px] text-white/80">Miễn phí đăng ký mở gian hàng</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Benefits Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0 border border-orange-200/60">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Hàng Triệu Khách Hàng</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Tiếp cận lượng người mua dồi dào trên toàn hệ sinh thái ZoraShop.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Quản Lý Đơn Trực Quan</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Xử lý duyệt đơn, bàn giao vận chuyển và theo dõi trạng thái đơn hàng mượt mà.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Kiểm Soát Tồn Kho</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ phân loại đa biến thể và nhật ký biến động kho minh bạch.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Giao Vận Đa Kênh</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ thanh toán COD, VNPay tiện lợi và kết nối đơn vị vận chuyển uy tín.</p>
            </div>
          </div>
        </div>

        {/* Main Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form or Status */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
            {isSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-orange-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto border-2 border-orange-200 shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Mở Gian Hàng Thành Công!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Chúc mừng bạn đã chính thức trở thành Người bán trên ZoraShop. Gian hàng <strong>"{createdShop?.name}"</strong> đã sẵn sàng đón nhận những đơn hàng đầu tiên!
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto shadow-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] shrink-0 font-bold">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{createdShop?.name}</h4>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Gian hàng đã kích hoạt
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 border-t border-slate-200/60 pt-2.5">
                    {createdShop?.description || 'Gian hàng chính hãng trên ZoraShop.'}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleGoToSellerOrders}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d73f1f] text-white font-bold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Truy Cập Kênh Người Bán Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/"
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors text-center"
                  >
                    Về trang chủ mua sắm
                  </Link>
                </div>
              </div>
            ) : isSeller ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-200">
                  <Store className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bạn Đã Là Người Bán Hàng!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Tài khoản <strong className="text-slate-800">{currentUser?.email}</strong> hiện đã sở hữu gian hàng <strong className="text-[#ee4d2d]">"{'Shop Đối Tác'}"</strong> trên ZoraShop.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleGoToSellerOrders}
                    className="px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d73f1f] text-white font-bold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Vào Quản Lý Đơn & Sản Phẩm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !currentUser ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Vui Lòng Đăng Nhập Tài Khoản Để Mở Shop</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Bạn cần đăng nhập bằng tài khoản người dùng ZoraShop để liên kết và tạo gian hàng bán hàng của mình.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#ee4d2d] hover:bg-[#d73f1f] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    Đăng nhập tài khoản của bạn
                  </Link>

                  <button
                    onClick={handleQuickBuyerLogin}
                    disabled={isLoadingQuickLogin}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingQuickLogin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>Đăng nhập nhanh Buyer Demo</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-base font-bold text-slate-900">Thông Tin Thiết Lập Gian Hàng</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Điền tên và mô tả để khởi tạo hồ sơ bán hàng</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Shop Name */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tên gian hàng / Shop của bạn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Ví dụ: TechShop - Phụ Kiện Điện Tử Thông Minh"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tên này sẽ hiển thị trên nhãn sản phẩm và trang cửa hàng công khai.
                  </p>
                </div>

                {/* Shop Description */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Mô tả gian hàng
                  </label>
                  <textarea
                    rows={4}
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    placeholder="Giới thiệu về ngành hàng, thế mạnh sản phẩm, cam kết chất lượng, bảo hành và chính sách khách hàng..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
                  />
                </div>

                {/* Agreement */}
                <div className="p-3.5 bg-orange-50/70 border border-orange-200/70 rounded-lg text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[#ee4d2d]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cam kết tiêu chuẩn Người Bán ZoraShop</span>
                  </div>
                  <p>
                    Bằng việc bấm <strong>"Xác Nhận Đăng Ký Mở Shop"</strong>, bạn đồng ý tuân thủ toàn bộ quy định về bản quyền thương hiệu, không bán hàng giả, hàng cấm và cam kết giao hàng đúng thời hạn quy định.
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !shopName.trim()}
                    className="w-full py-3 bg-[#ee4d2d] hover:bg-[#d73f1f] text-white font-bold text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                    <span>Xác Nhận Đăng Ký Mở Shop</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Live Card Preview & Checklist */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Preview Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ee4d2d]" />
                  Xem Trước Gian Hàng
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  Thời Gian Thực
                </span>
              </div>

              {/* Card representation */}
              <div className="bg-linear-to-b from-slate-50 to-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] font-bold text-lg shadow-xs shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {shopName.trim() || 'Tên Shop Của Bạn'}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Online ngay bây giờ
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-[#ee4d2d] bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded">
                    Đối tác
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-white p-2.5 rounded-lg border border-slate-100">
                  {shopDescription.trim() || 'Mô tả giới thiệu gian hàng và sản phẩm sẽ hiển thị tại đây...'}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-2.5 text-[11px]">
                  <div>
                    <div className="text-slate-400 text-[10px]">Đánh giá</div>
                    <div className="font-bold text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> 5.0
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Sản phẩm</div>
                    <div className="font-bold text-slate-800 mt-0.5">0</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Phản hồi</div>
                    <div className="font-bold text-slate-800 mt-0.5">100%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Journey Steps */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Lộ Trình Bán Hàng 3 Bước
              </h3>
              <ol className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800">Đăng ký mở Shop:</strong> Điền tên gian hàng và kích hoạt quyền Người bán trong 30 giây.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800">Đăng sản phẩm đầu tiên:</strong> Vào mục <em>"Quản Lý Sản Phẩm"</em> thêm tên, hình ảnh, giá và phân loại hàng.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800">Duyệt đơn & Giao hàng:</strong> Khách đặt hàng, Shop bấm <em>"Xác nhận đơn"</em> và <em>"Giao cho ĐVVC"</em> để nhận tiền.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ZoraEcommerce Seller Onboarding. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Quy định mở Shop</span>
            <span>Chính sách Người bán</span>
            <span>Hotline hỗ trợ: 0559 826 016</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
