import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star,
  ShoppingBag,
  UserCheck,
  MessageSquare,
  Users,
  Calendar,
  Filter,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Zap,
  Check,
  Tag,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import MainHeader from '../components/MainHeader'
import AuthFooter from '../components/AuthFooter'
import { shopApi, isProductFromShop, type ShopProfile } from '../api/shopApi'
import { productApi } from '../api/productApi'
import type { ProductSummaryResponse } from '../types/product'

export default function ShopPage() {
  const { id } = useParams<{ id: string }>()
  const shopId = id ? parseInt(id) || 1 : 1

  const [shop, setShop] = useState<ShopProfile | null>(null)
  const [isLoadingShop, setIsLoadingShop] = useState(true)

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(128500)

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'all' | 'best' | 'vouchers' | 'about'>('home')

  // Vouchers claim state
  const [claimedVouchers, setClaimedVouchers] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Products belonging specifically to this shop
  const [shopProducts, setShopProducts] = useState<ProductSummaryResponse[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  // Sort state
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'sales' | 'price_asc' | 'price_desc'>('popular')
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)

  // Current page
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Load shop data & load shop-specific products
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoadingShop(true)
      setIsLoadingProducts(true)
      try {
        const shopData = await shopApi.getShopById(shopId)
        if (!isMounted) return
        setShop(shopData)
        setFollowersCount(shopData.totalFollowers)

        // Fetch products specifically for this shop from backend
        const productRes = await productApi.getProducts({ shopId, size: 50 })
        if (!isMounted) return

        if (productRes?.items && productRes.items.length > 0) {
          // FILTER: Only keep products that strictly belong to this exact shop!
          const filtered = productRes.items.filter((p) => {
            if (p.shopId && p.shopId === shopId) return true
            return isProductFromShop(p.shopName, shopData)
          })
          setShopProducts(filtered)
        } else {
          setShopProducts([])
        }
      } catch (err) {
        console.error('Error loading shop data:', err)
      } finally {
        if (isMounted) {
          setIsLoadingShop(false)
          setIsLoadingProducts(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [shopId])

  // Handle follow toggle
  const handleFollowToggle = () => {
    setIsFollowing((prev) => {
      const next = !prev
      setFollowersCount((c) => (next ? c + 1 : c - 1))
      showToast(next ? 'Đã theo dõi Shop thành công!' : 'Đã bỏ theo dõi Shop')
      return next
    })
  }

  // Handle claim voucher
  const handleClaimVoucher = (voucherCode: string) => {
    setClaimedVouchers((prev) => ({ ...prev, [voucherCode]: true }))
    showToast(`Đã lưu mã giảm giá ${voucherCode} vào ví voucher của bạn!`)
  }

  const showToast = (text: string) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered & Sorted products for this shop
  const displayProducts = useMemo(() => {
    let result = [...shopProducts]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.name.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    // Price range filter
    const min = parseFloat(minPrice)
    const max = parseFloat(maxPrice)
    if (!isNaN(min)) {
      result = result.filter((p) => p.price >= min)
    }
    if (!isNaN(max)) {
      result = result.filter((p) => p.price <= max)
    }

    // Rating filter
    if (ratingFilter !== null) {
      result = result.filter((p) => (p.ratingAvg || 5) >= ratingFilter)
    }

    // Sort
    if (sortBy === 'sales') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    } else if (sortBy === 'latest') {
      result.sort((a, b) => b.id - a.id)
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else {
      // Popular
      result.sort((a, b) => ((b.ratingAvg || 5) * (b.soldCount || 1)) - ((a.ratingAvg || 5) * (a.soldCount || 1)))
    }

    return result
  }, [shopProducts, selectedCategory, minPrice, maxPrice, ratingFilter, sortBy])

  // Paginated products
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return displayProducts.slice(start, start + itemsPerPage)
  }, [displayProducts, currentPage])

  // Top best sellers for the showcase banner
  const bestSellerProducts = useMemo(() => {
    return [...shopProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4)
  }, [shopProducts])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased relative selection:bg-orange-100 selection:text-[#ee4d2d]">

      {/* Main Header */}
      <div className="relative z-50">
        <MainHeader />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in duration-150">
          <div className="px-4 py-2.5 rounded-xs shadow-md text-xs font-normal border bg-neutral-800 text-neutral-100 border-neutral-700">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Shop Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-[#ee4d2d] transition-colors">
            Zora
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Cửa hàng chính hãng</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium">{shop?.name || 'Shop Official'}</span>
        </nav>

        {/* ========================================================================= */}
        {/* 1. SHOPEE STANDARD SHOP HERO HEADER (2 KHỐI KINH ĐIỂN CỦA SHOPEE)        */}
        {/* ========================================================================= */}
        {isLoadingShop ? (
          <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200/80 animate-pulse h-48 flex items-center justify-center text-slate-400 text-xs">
            Đang tải thông tin cửa hàng...
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-xs border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* KHỐI TRÁI: THẺ DANH TÍNH SHOP (~40% width) */}
            <div className="lg:col-span-5 relative p-6 sm:p-7 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#1e1b4b] text-white">
              {/* Background Blur Overlay from Shop Banner */}
              <div 
                className="absolute inset-0 opacity-25 bg-cover bg-center filter blur-sm scale-110 pointer-events-none"
                style={{
                  backgroundImage: `url(${shop?.bannerUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'})`,
                }}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Top Identity Row */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Circular Avatar */}
                <div className="relative w-20 h-20 rounded-full border-2 border-white/90 shadow-xl overflow-hidden shrink-0 bg-white">
                  <img
                    src={shop?.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200'}
                    alt={shop?.name}
                    className="w-full h-full object-cover"
                  />
                  {shop?.isMall && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#d0011b] text-white text-[9px] font-black text-center py-0.5 uppercase tracking-tighter">
                      Mall
                    </span>
                  )}
                </div>

                {/* Name & Online Status */}
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5 line-clamp-1">
                    <span>{shop?.name || 'Shop Official Vietnam'}</span>
                    {shop?.isOfficial && (
                      <span className="bg-blue-500 text-white rounded-full p-0.5 inline-flex" title="Đã xác thực chính hãng">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </h1>

                  <div className="flex items-center gap-1.5 text-xs text-[#ee4d2d]">
                    <span className="w-2 h-2 rounded-full bg-[#ee4d2d] animate-pulse" />
                    <span>Online 5 phút trước</span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    {shop?.location || 'TP. Hồ Chí Minh'} • Đổi trả 7 ngày
                  </div>
                </div>
              </div>

              {/* Bottom Shopee Action Buttons */}
              <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={handleFollowToggle}
                  className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-white text-slate-900 border border-white shadow-xs'
                      : 'bg-transparent hover:bg-white/10 text-white border border-white/70 hover:border-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#ee4d2d]" />
                      <span>Đang Theo Dõi</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold leading-none">+</span>
                      <span>THEO DÕI</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => showToast(`Đang kết nối chat với cửa hàng ${shop?.name}...`)}
                  className="h-9 rounded-xl text-xs font-semibold bg-[#ee4d2d] hover:bg-[#d73211] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>CHAT NGAY</span>
                </button>
              </div>
            </div>

            {/* KHỐI PHẢI: LƯỚI 6 CHỈ SỐ KINH ĐIỂN SHOPEE (~60% width) */}
            <div className="lg:col-span-7 p-6 sm:p-7 flex items-center bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 w-full text-xs text-slate-600">
                
                {/* 1. Sản Phẩm */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Sản Phẩm:</div>
                    <div className="text-sm font-bold text-slate-900">{shopProducts.length || shop?.totalProducts || 4}</div>
                  </div>
                </div>

                {/* 2. Đang Theo */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Đang Theo:</div>
                    <div className="text-sm font-bold text-slate-900">{shop?.followingCount || 8}</div>
                  </div>
                </div>

                {/* 3. Tỉ Lệ Phản Hồi Chat */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Tỉ Lệ Phản Hồi Chat:</div>
                    <div className="text-sm font-bold text-[#ee4d2d]">
                      {shop?.responseRate || '99%'}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">({shop?.responseTime || 'Vài phút'})</span>
                    </div>
                  </div>
                </div>

                {/* 4. Người Theo Dõi */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Người Theo Dõi:</div>
                    <div className="text-sm font-bold text-slate-900">{formatNumber(followersCount)}</div>
                  </div>
                </div>

                {/* 5. Đánh Giá */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Đánh Giá:</div>
                    <div className="text-sm font-bold text-[#ee4d2d]">
                      {shop?.rating?.toFixed(1) || '4.9'}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">({formatNumber(shop?.ratingCount || 5210)} Đánh Giá)</span>
                    </div>
                  </div>
                </div>

                {/* 6. Tham Gia */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Tham Gia:</div>
                    <div className="text-sm font-bold text-slate-900">{shop?.joinedTime || '3 Năm Trước'}</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SHOPEE SHOP NAVIGATION TABS (THANH MENU ĐIỀU HƯỚNG CỦA SHOP)           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
            {[
              { id: 'home', label: 'DẠO' },
              { id: 'all', label: `TẤT CẢ SẢN PHẨM (${shopProducts.length})` },
              { id: 'best', label: 'BÁN CHẠY NHẤT' },
              { id: 'vouchers', label: 'MÃ GIẢM GIÁ' },
              { id: 'about', label: 'HỒ SƠ SHOP' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#ee4d2d] text-[#ee4d2d]'
                    : 'border-transparent hover:text-[#ee4d2d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SHOPEE VOUCHER CARDS (DẢI VOUCHER RĂNG CƯA CAM SHOPEE RIÊNG CỦA SHOP)  */}
        {/* ========================================================================= */}
        {shop?.vouchers && shop.vouchers.length > 0 && (
          <div className="bg-white rounded-md p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Tag className="w-4 h-4 text-[#ee4d2d]" />
                <span>MÃ GIẢM GIÁ ĐỘC QUYỀN TỪ {shop.name.toUpperCase()}</span>
              </div>
              <span className="text-xs text-slate-400">Thu thập voucher để giảm thêm khi thanh toán</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shop.vouchers.map((vc) => {
                const isClaimed = claimedVouchers[vc.code]
                return (
                  <div
                    key={vc.code}
                    className="relative rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50/90 to-amber-50/70 p-3 flex items-center justify-between shadow-2xs overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-extrabold text-[#ee4d2d] leading-none">{vc.discount}</div>
                      <div className="text-[11px] text-slate-700 font-medium line-clamp-1">{vc.minSpend}</div>
                      <div className="text-[10px] text-slate-400">{vc.expiry}</div>
                    </div>

                    <button
                      onClick={() => handleClaimVoucher(vc.code)}
                      disabled={isClaimed}
                      className={`shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isClaimed
                          ? 'bg-slate-200 text-slate-500 cursor-default'
                          : 'bg-[#ee4d2d] hover:bg-[#d73211] text-white shadow-xs active:scale-95'
                      }`}
                    >
                      {isClaimed ? 'Đã Lưu' : 'Lưu'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SHOP HERO BANNER SLIDER / SHOWCASE (TAB: DẠO)                         */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="relative rounded-lg overflow-hidden shadow-xs border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#ee4d2d] border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {shop?.isMall ? 'Gian Hàng Zora Mall Chính Hãng' : 'Cửa Hàng Uy Tín'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {shop?.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {shop?.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-5 py-2.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Xem Tất Cả ({shopProducts.length}) Sản Phẩm Của Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hero Image Showcase from the shop's first product */}
            {shopProducts.length > 0 && (
              <div className="shrink-0 w-64 sm:w-72 aspect-square rounded-md overflow-hidden border border-white/10 shadow-2xl bg-white/5 p-2">
                <img
                  src={shopProducts[0].primaryImageUrl}
                  alt={shopProducts[0].name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TOP BÁN CHẠY CỦA SHOP (BEST SELLERS ROW)                              */}
        {/* ========================================================================= */}
        {(activeTab === 'home' || activeTab === 'best') && bestSellerProducts.length > 0 && (
          <div className="bg-white rounded-md p-5 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>TOP SẢN PHẨM BÁN CHẠY NHẤT CỦA SHOP</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('all')
                  setSortBy('sales')
                }}
                className="text-xs font-semibold text-[#ee4d2d] hover:underline cursor-pointer"
              >
                Xem tất cả top bán chạy →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {bestSellerProducts.map((p, idx) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug || p.id}`}
                  className="group bg-slate-50/60 rounded-xl overflow-hidden border border-slate-200/70 hover:border-[#ee4d2d] hover:bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                    {/* Rank Badge */}
                    <span className={`absolute top-2 left-2 z-10 text-[10px] font-black px-2 py-0.5 rounded shadow-xs text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : idx === 2 ? 'bg-orange-600' : 'bg-slate-700'
                    }`}>
                      TOP {idx + 1}
                    </span>

                    <img
                      src={p.primaryImageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-[#ee4d2d] transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-[#ee4d2d]">
                        {formatCurrency(p.price)}
                      </span>
                      <span className="text-[10px] text-slate-400">Đã bán {formatNumber(p.soldCount || 100)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. SHOPEE FULL CATALOG: SIDEBAR FILTER (TRÁI) & PRODUCTS GRID (PHẢI)      */}
        {/* ========================================================================= */}
        {(activeTab === 'home' || activeTab === 'all' || activeTab === 'best') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ================= CỘT TRÁI: SIDEBAR BỘ LỌC SHOPEE (25% width) ================= */}
            <aside className="lg:col-span-3 bg-white rounded-md p-5 shadow-xs border border-slate-200/80 space-y-6">
              
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
                <Filter className="w-4 h-4 text-[#ee4d2d]" />
                <span>BỘ LỌC CỦA SHOP</span>
              </div>

              {/* Danh Mục Của Shop (Riêng cho shop này!) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Danh Mục Của Shop
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {shop?.categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setCurrentPage(1)
                      }}
                      className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-orange-50 font-bold text-[#ee4d2d]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-[#ee4d2d]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nơi Gửi Hàng */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Nơi Gửi Hàng
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'hcm', label: shop?.location || 'TP. Hồ Chí Minh' },
                  ].map((loc) => (
                    <label key={loc.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === loc.id}
                        onChange={() => setSelectedLocation(loc.id)}
                        className="accent-[#ee4d2d]"
                      />
                      <span>{loc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Đơn Vị Vận Chuyển */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Đơn Vị Vận Chuyển
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="accent-[#ee4d2d] rounded" />
                    <span className="flex items-center gap-1 font-medium text-[#ee4d2d]">
                      <Truck className="w-3.5 h-3.5" />
                      Hỏa Tốc (2 Giờ)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="accent-[#ee4d2d] rounded" />
                    <span>Nhanh (Freeship Xtra)</span>
                  </label>
                </div>
              </div>

              {/* Khoảng Giá (Từ - Đến) */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Khoảng Giá
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="₫ TỪ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#ee4d2d]"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="₫ ĐẾN"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>

                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-full py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  ÁP DỤNG
                </button>
              </div>

              {/* Đánh Giá Sao */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Đánh Giá
                </h3>

                <div className="space-y-1.5 text-xs">
                  {[5, 4, 3].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                      className={`w-full text-left py-1 px-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                        ratingFilter === stars ? 'bg-orange-50 text-[#ee4d2d] font-bold' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span>từ {stars} sao</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedLocation('all')
                  setMinPrice('')
                  setMaxPrice('')
                  setRatingFilter(null)
                  setCurrentPage(1)
                }}
                className="w-full py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                XÓA BỘ LỌC
              </button>

            </aside>

            {/* ================= CỘT PHẢI: LƯỚI SẢN PHẨM & THANH SẮP XẾP (75% width) ================= */}
            <div className="lg:col-span-9 space-y-4">
              
              {/* Thanh Sắp Xếp Chuẩn Shopee */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-500 mr-1">Sắp xếp theo:</span>

                  {[
                    { id: 'popular', label: 'Phổ Biến' },
                    { id: 'latest', label: 'Mới Nhất' },
                    { id: 'sales', label: 'Bán Chạy' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        setSortBy(btn.id as any)
                        setCurrentPage(1)
                      }}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                        sortBy === btn.id
                          ? 'bg-[#ee4d2d] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}

                  {/* Giá Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        sortBy === 'price_asc' || sortBy === 'price_desc'
                          ? 'bg-[#ee4d2d] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      <span>
                        {sortBy === 'price_asc'
                          ? 'Giá: Thấp đến Cao'
                          : sortBy === 'price_desc'
                          ? 'Giá: Cao đến Thấp'
                          : 'Giá'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isPriceDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20">
                        <button
                          onClick={() => {
                            setSortBy('price_asc')
                            setIsPriceDropdownOpen(false)
                            setCurrentPage(1)
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] text-xs font-medium cursor-pointer"
                        >
                          Giá: Thấp đến Cao
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('price_desc')
                            setIsPriceDropdownOpen(false)
                            setCurrentPage(1)
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] text-xs font-medium cursor-pointer"
                        >
                          Giá: Cao đến Thấp
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini Pagination Counter */}
                <div className="flex items-center gap-2 text-slate-500">
                  <span>
                    <strong className="text-[#ee4d2d]">{currentPage}</strong>/{totalPages}
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-2 py-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2 py-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Lưới Sản Phẩm 4 Cột */}
              {isLoadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 space-y-3 animate-pulse border border-slate-200/60">
                      <div className="w-full aspect-square bg-slate-200 rounded-lg" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="bg-white rounded-md p-12 text-center space-y-3 shadow-xs border border-slate-200/80">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Cửa hàng chưa có sản phẩm phù hợp với bộ lọc này</h4>
                  <p className="text-xs text-slate-400">Hãy thử xóa hoặc chọn danh mục khác.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {paginatedProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug || p.id}`}
                      className="group bg-white rounded-md overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between hover:-translate-y-1"
                    >
                      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                        {/* Mall Badge */}
                        {shop?.isMall && (
                          <span className="absolute top-2 left-2 z-10 bg-[#d0011b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase">
                            Mall
                          </span>
                        )}

                        {/* Discount Tag */}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-md shadow-xs">
                            -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                          </span>
                        )}

                        <img
                          src={p.primaryImageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <h3 className="text-xs font-medium text-slate-800 group-hover:text-[#ee4d2d] line-clamp-2 leading-relaxed transition-colors">
                          {p.name}
                        </h3>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-semibold text-[#ee4d2d] bg-orange-50 border border-orange-200 px-1 py-0.2 rounded">
                              Freeship Xtra
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-xs sm:text-sm font-bold text-[#ee4d2d]">
                              {formatCurrency(p.price)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Đã bán {formatNumber(p.soldCount || 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Full Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-6 text-xs font-semibold">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Trang trước
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#ee4d2d] text-white shadow-xs'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Trang sau
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TAB HỒ SƠ SHOP (ABOUT & GUARANTEES)                                   */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-md p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              Thông Tin & Giới Thiệu Cửa Hàng
            </h2>

            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p>{shop?.description}</p>
              <p>
                Toàn bộ sản phẩm được phân phối trực tiếp từ nhà sản xuất hoặc nhà nhập khẩu chính ngạch, có đầy đủ hóa đơn chứng từ VAT và tem bảo hành điện tử chính hãng.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 space-y-2">
                <ShieldCheck className="w-6 h-6 text-[#ee4d2d]" />
                <h4 className="text-sm font-bold text-slate-900">100% Chính Hãng</h4>
                <p className="text-xs text-slate-500">Cam kết hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái.</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                <RotateCcw className="w-6 h-6 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">7 Ngày Miễn Phí Đổi Trả</h4>
                <p className="text-xs text-slate-500">Đổi trả sản phẩm dễ dàng trong 7 ngày nếu không ưng ý.</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/60 border border-emerald-100 space-y-2">
                <Truck className="w-6 h-6 text-[#ee4d2d]" />
                <h4 className="text-sm font-bold text-slate-900">Giao Hàng Toàn Quốc</h4>
                <p className="text-xs text-slate-500">Miễn phí vận chuyển toàn quốc cho đơn hàng từ 0đ.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <div className="relative z-10 pt-8">
        <AuthFooter />
      </div>
    </div>
  )
}
