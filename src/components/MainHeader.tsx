import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  HelpCircle, 
  Globe, 
  Phone, 
  ChevronDown,
  QrCode,
  PackageCheck
} from "lucide-react"
import ZoraLogo from "./ZoraLogo"
import { cartApi, type BackendCartItem } from "../api/cartApi"

// Mock search suggestions: Gọn gàng vừa khung, không thanh cuộn
const SEARCH_SUGGESTIONS = [
  "Iphone",
  "Áo Thun Nam",
  "Nike",
  "Bàn Phím",
  "Apple Watch",
  "Sony",
  "Cà Phê",
]

export default function MainHeader() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCartHovered, setIsCartHovered] = useState(false)
  const [isAppQrHovered, setIsAppQrHovered] = useState(false)
  const [isNotifHovered, setIsNotifHovered] = useState(false)
  
  // Real cart state: TUYỆT ĐỐI KHÔNG MOCK khi chưa đăng nhập
  const [cartCount, setCartCount] = useState<number>(0)
  const [cartPreviewItems, setCartPreviewItems] = useState<
    Array<{
      id: number
      name: string
      price: string
      image: string
      variant: string
    }>
  >([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check login & fetch cart on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      cartApi
        .getCart()
        .then((res) => {
          if (res) {
            setCartCount(res.totalItem || 0)
            const allItems: BackendCartItem[] = res.shopGroups?.flatMap((g) => g.cartItems) || []
            if (allItems.length > 0) {
              setCartPreviewItems(
                allItems.slice(0, 5).map((item) => ({
                  id: item.id,
                  name: item.productName,
                  price: Number(item.price).toLocaleString("vi-VN") + "₫",
                  image: item.productImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150",
                  variant: item.variantName || "Mặc định",
                }))
              )
            } else {
              setCartPreviewItems([])
            }
          }
        })
        .catch((err) => {
          console.warn("Lỗi tải giỏ hàng:", err)
          setCartCount(0)
          setCartPreviewItems([])
        })
    } else {
      setIsLoggedIn(false)
      setCartCount(0)
      setCartPreviewItems([])
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSelectKeyword = (keyword: string) => {
    setSearchQuery(keyword)
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`)
  }

  return (
    <header className="w-full bg-white shadow-xs border-b border-slate-100 sticky top-0 z-50 transition-all select-none">
      {/* ================= 1. TOP MICRO BAR (DARK NAVY SLATE TONE) ================= */}
      <div className="bg-[#0f172a] text-slate-300 text-[12px] font-normal border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          
          {/* Top Left Links */}
          <div className="flex items-center gap-4">
            <Link 
              to="/seller/register" 
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#ee4d2d]" />
              <span>Kênh Người Bán</span>
            </Link>
            
            <span className="text-slate-700 hidden sm:inline">|</span>
            
            {/* Tải ứng dụng QR popover */}
            <div 
              className="relative hidden sm:block"
              onMouseEnter={() => setIsAppQrHovered(true)}
              onMouseLeave={() => setIsAppQrHovered(false)}
            >
              <button className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Tải ứng dụng</span>
              </button>

              {isAppQrHovered && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-white p-3 rounded-lg shadow-xl border border-slate-200 z-50 text-slate-800 animate-in fade-in duration-150">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://zoraecommerce.vn/app" 
                    alt="Zora QR Code" 
                    className="w-full aspect-square rounded-md border border-slate-100 p-1"
                  />
                  <p className="text-center text-[11px] font-medium text-slate-600 mt-2">
                    Quét mã để tải Zora App
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <span className="text-[10px] text-center bg-slate-100 py-1 rounded text-slate-700 font-medium">App Store</span>
                    <span className="text-[10px] text-center bg-slate-100 py-1 rounded text-slate-700 font-medium">Google Play</span>
                  </div>
                </div>
              )}
            </div>

            <span className="text-slate-700 hidden md:inline">|</span>

            {/* Kết nối Social */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-slate-400">Kết nối:</span>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#ee4d2d] transition-colors"
                title="Facebook Thái Dev"
              >
                Facebook
              </a>
              <span className="text-slate-700">·</span>
              <a 
                href="https://github.com/ThaiDevv" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#ee4d2d] transition-colors"
                title="GitHub ThaiDevv"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-4">
            <a 
              href="tel:0559826016" 
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#ee4d2d] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#ee4d2d]" />
              <span className="font-medium text-slate-200">0559 826 016</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Notifications Dropdown */}
            <div 
              className="relative hidden sm:block"
              onMouseEnter={() => setIsNotifHovered(true)}
              onMouseLeave={() => setIsNotifHovered(false)}
            >
              <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <div className="relative">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ee4d2d] rounded-full ring-2 ring-[#0f172a]"></span>
                </div>
                <span>Thông Báo</span>
              </button>

              {isNotifHovered && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg shadow-xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 font-medium text-[12px] text-slate-700 flex justify-between items-center">
                    <span>Thông báo mới nhận</span>
                    <span className="text-[11px] text-[#ee4d2d] hover:underline cursor-pointer">Đánh dấu đã đọc</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    <div className="p-3 hover:bg-orange-50/40 transition-colors cursor-pointer flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ee4d2d] flex items-center justify-center shrink-0 text-[11px] font-bold">SALE</div>
                      <div>
                        <p className="text-[12px] font-medium line-clamp-1 text-slate-800">Siêu Hội Zora 9.9 chính thức bắt đầu!</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">Hàng ngàn mã giảm giá 50% đang chờ bạn kích hoạt.</p>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-orange-50/40 transition-colors cursor-pointer flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[11px] font-bold">VOU</div>
                      <div>
                        <p className="text-[12px] font-medium line-clamp-1 text-slate-800">Voucher 50.000₫ đã vào ví của bạn</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">Áp dụng cho mọi đơn hàng từ 0Đ trong tuần này.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <span className="text-slate-700">|</span>
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Trợ Giúp</span>
            </button>

            <span className="text-slate-700">|</span>
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiếng Việt</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <span className="text-slate-700">|</span>

            {/* Auth Links / Profile */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">Tài khoản của tôi</span>
                <span className="text-slate-600">/</span>
                <button
                  onClick={() => {
                    localStorage.removeItem("token")
                    sessionStorage.removeItem("token")
                    setIsLoggedIn(false)
                    setCartCount(0)
                    setCartPreviewItems([])
                    window.location.reload()
                  }}
                  className="font-medium text-slate-200 hover:text-[#ee4d2d] transition-colors cursor-pointer"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/register" 
                  className="font-medium text-slate-200 hover:text-[#ee4d2d] transition-colors"
                >
                  Đăng Ký
                </Link>
                <span className="text-slate-600">/</span>
                <Link 
                  to="/login" 
                  className="font-medium text-slate-200 hover:text-[#ee4d2d] transition-colors"
                >
                  Đăng Nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN ROW: ORIGINAL CRISP WHITE BACKGROUND + GRADIENT LOGO ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 bg-white">
        <div className="flex items-center justify-between gap-6 md:gap-10">
          
          {/* Logo ZoraEcommerce: Logo mặc định gradient, không đổi màu trắng */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 transition-transform group-hover:scale-105 duration-200">
              <ZoraLogo />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Zora<span className="text-[#ee4d2d]">Ecommerce</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 group-hover:text-[#ee4d2d] transition-colors mt-0.5 flex items-center gap-1">
                Sàn TMĐT Uy Tín
              </span>
            </div>
          </Link>

          {/* Search Bar Container */}
          <div className="flex-1 max-w-3xl">
            {/* Search Input Form: Viền cam sắc nét, nền slate-50 focus trắng */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative flex-1 flex items-center bg-slate-50 border-2 border-[#ee4d2d] rounded-lg overflow-hidden shadow-xs focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ee4d2d]/20 transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Shopee bao ship 0Đ - Đăng ký ngay nhận voucher 100k..."
                  className="w-full h-10 px-4 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                />
                
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery("")}
                    className="px-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}

                {/* Search Button (Coral Orange) */}
                <button
                  type="submit"
                  className="h-10 px-6 bg-[#ee4d2d] hover:bg-[#d73211] active:scale-98 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium text-xs tracking-wide shrink-0 shadow-xs"
                  aria-label="Tìm kiếm sản phẩm"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline font-semibold">Tìm Kiếm</span>
                </button>
              </div>
            </form>

            {/* Keyword Suggestions: Gọn gàng không thanh cuộn, màu slate-600 hover cam */}
            <div className="mt-1.5 flex items-center gap-2 overflow-hidden text-[11.5px] text-slate-500">
              {SEARCH_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectKeyword(tag)}
                  className={`transition-all cursor-pointer shrink-0 px-2 py-0.5 rounded-full border ${
                    searchQuery === tag
                      ? "bg-orange-50 border-[#ee4d2d] text-[#ee4d2d] font-semibold"
                      : "bg-slate-50 border-slate-200/80 hover:border-slate-300 hover:text-[#ee4d2d] hover:bg-slate-100 font-normal"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Icon & Preview Popover: Viền thanh lịch, hover cam */}
          <div 
            className="relative shrink-0"
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-[#ee4d2d] transition-all duration-150 group cursor-pointer"
              title="Xem giỏ hàng của bạn"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {/* Badge Item Count: Chỉ hiện khi ĐÃ ĐĂNG NHẬP và CÓ HÀNG trong giỏ */}
              {isLoggedIn && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ee4d2d] text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mini Cart Preview Dropdown */}
            {isCartHovered && (
              <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 p-4 animate-in fade-in duration-150">
                {!isLoggedIn ? (
                  /* Khi CHƯA ĐĂNG NHẬP: Không mock dữ liệu giỏ hàng, hiển thị form mời đăng nhập */
                  <div className="py-6 px-3 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-[#ee4d2d] mb-3">
                      <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Chưa Có Sản Phẩm</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                      Đăng nhập để xem các sản phẩm trong giỏ hàng của bạn
                    </p>
                    <Link
                      to="/login"
                      className="mt-4 px-6 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Đăng Nhập
                    </Link>
                  </div>
                ) : cartPreviewItems.length === 0 ? (
                  /* Khi ĐÃ ĐĂNG NHẬP nhưng giỏ hàng trống */
                  <div className="py-6 px-3 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                      <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Chưa Có Sản Phẩm</p>
                    <p className="text-xs text-slate-400 mt-1">Giỏ hàng của bạn hiện đang trống</p>
                  </div>
                ) : (
                  /* Khi ĐÃ ĐĂNG NHẬP và CÓ SẢN PHẨM THỰC TẾ */
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-[13px] font-semibold text-slate-800">Sản phẩm mới thêm ({cartCount})</span>
                      <span className="text-[11px] text-slate-400">Giỏ hàng Zora</span>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto py-1">
                      {cartPreviewItems.map((item) => (
                        <div key={item.id} className="py-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg px-1.5 transition-colors">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-slate-800 line-clamp-1 leading-snug">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Phân loại: {item.variant}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[13px] font-bold text-[#ee4d2d]">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {cartCount} hàng trong giỏ
                      </span>
                      <Link
                        to="/cart"
                        className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[12px] font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Xem Giỏ Hàng
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
