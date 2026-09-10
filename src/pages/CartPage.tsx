import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store,
  MessageSquare,
  Check,
  ChevronRight,
  Ticket,
  Coins,
  Truck,
  ArrowRight,
  Sparkles,
  X,
  Tag,
  AlertCircle,
} from 'lucide-react'
import MainHeader from '../components/MainHeader'
import { cartApi, type BackendCartItem, type BackendCartShopGroup } from '../api/cartApi'
import { productApi } from '../api/productApi'
import type { ProductSummaryResponse } from '../types/product'

interface CartVoucher {
  code: string
  title: string
  discountAmount: number
  minSpend: number
  type: 'SHIPPING' | 'DISCOUNT' | 'COIN'
  expiry: string
}

const AVAILABLE_VOUCHERS: CartVoucher[] = [
  {
    code: 'ZORAFREESHIP',
    title: 'Miễn Phí Vận Chuyển Toàn Quốc',
    discountAmount: 30000,
    minSpend: 0,
    type: 'SHIPPING',
    expiry: '31.12.2026',
  },
  {
    code: 'ZORA50K',
    title: 'Giảm 50.000₫ cho đơn từ 500.000₫',
    discountAmount: 50000,
    minSpend: 500000,
    type: 'DISCOUNT',
    expiry: '30.09.2026',
  },
  {
    code: 'ZORA100K',
    title: 'Giảm 100.000₫ cho đơn công nghệ từ 2.000.000₫',
    discountAmount: 100000,
    minSpend: 2000000,
    type: 'DISCOUNT',
    expiry: '30.09.2026',
  },
  {
    code: 'FASHION15K',
    title: 'Giảm 15.000₫ cho đơn thời trang từ 150.000₫',
    discountAmount: 15000,
    minSpend: 150000,
    type: 'DISCOUNT',
    expiry: '30.09.2026',
  },
]

export default function CartPage() {
  const navigate = useNavigate()

  // Tách rời giao diện: Admin không dùng giỏ hàng mua sắm, chuyển về Dashboard
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const u = JSON.parse(storedUser)
        const role = u.role || ""
        if (role.includes("ADMIN") || role === "ROLE_ADMIN" || role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true })
        }
      }
    } catch {}
  }, [navigate])


  // Cart state
  const [shopGroups, setShopGroups] = useState<BackendCartShopGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Selection state: map of itemId -> boolean
  const [selectedItemIds, setSelectedItemIds] = useState<Record<number, boolean>>({})

  // Voucher state
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [voucherCodeInput, setVoucherCodeInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<CartVoucher | null>(AVAILABLE_VOUCHERS[0])

  // Zora Coins state
  const [useCoins, setUseCoins] = useState(false)
  const userCoins = 10000 // 10,000 Xu = 10,000 VND


  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Recommended products
  const [recommendations, setRecommendations] = useState<ProductSummaryResponse[]>([])

  // Load cart on mount
  useEffect(() => {
    loadCart()
    loadRecommendations()
  }, [])

  const loadCart = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const loggedIn = !!token
    setIsLoggedIn(loggedIn)

    if (loggedIn) {
      try {
        const res = await cartApi.getCart()
        if (res && res.shopGroups && res.shopGroups.length > 0) {
          setShopGroups(res.shopGroups)
          // Default: select all items
          const initialSelection: Record<number, boolean> = {}
          res.shopGroups.forEach((g) => {
            g.cartItems.forEach((it) => {
              initialSelection[it.id] = true
            })
          })
          setSelectedItemIds(initialSelection)
        } else {
          // Check guest cart as well
          loadGuestCart()
        }
      } catch (err) {
        console.error('Error fetching backend cart:', err)
        loadGuestCart()
      }
    } else {
      loadGuestCart()
    }
    setIsLoading(false)
  }

  const loadGuestCart = () => {
    try {
      const guestItems = JSON.parse(localStorage.getItem('zora_guest_cart') || '[]')
      if (Array.isArray(guestItems) && guestItems.length > 0) {
        // Group guest items by shop
        const groupMap: Record<number, BackendCartShopGroup> = {}
        const initialSelection: Record<number, boolean> = {}

        guestItems.forEach((item: any) => {
          const shopId = item.shopId || 1
          const shopName = item.shopName || 'Shop Official Vietnam'
          const shopLogo = item.shopLogo || 'https://picsum.photos/200/200?random=1'

          if (!groupMap[shopId]) {
            groupMap[shopId] = {
              shopId,
              shopName,
              shopLogo,
              cartItems: [],
            }
          }

          const cartItem: BackendCartItem = {
            id: item.id || Date.now(),
            variantId: item.variantId,
            sku: item.sku || `SKU-${item.id}`,
            productName: item.productName || item.name || 'Sản phẩm',
            variantName: item.variantName || 'Mặc định',
            price: item.price || 0,
            originalPrice: item.originalPrice,
            quantity: item.quantity || 1,
            stock: item.stock || 50,
            imageUrl: item.imageUrl || item.primaryImageUrl,
          }

          groupMap[shopId].cartItems.push(cartItem)
          initialSelection[cartItem.id] = true
        })

        setShopGroups(Object.values(groupMap))
        setSelectedItemIds(initialSelection)
      } else {
        setShopGroups([])
      }
    } catch {
      setShopGroups([])
    }
  }

  const loadRecommendations = async () => {
    try {
      const res = await productApi.getProducts({ size: 12 })
      if (res?.items) {
        setRecommendations(res.items)
      }
    } catch {
      // Ignore recommendations error
    }
  }

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  // All cart items flat
  const allCartItems = useMemo(() => {
    return shopGroups.flatMap((g) => g.cartItems)
  }, [shopGroups])

  // Selected items flat
  const selectedItems = useMemo(() => {
    return allCartItems.filter((it) => selectedItemIds[it.id])
  }, [allCartItems, selectedItemIds])

  // Are all items selected?
  const isAllSelected = useMemo(() => {
    if (allCartItems.length === 0) return false
    return allCartItems.every((it) => selectedItemIds[it.id])
  }, [allCartItems, selectedItemIds])

  // Toggle select all
  const handleToggleSelectAll = () => {
    const nextState = !isAllSelected
    const updated: Record<number, boolean> = {}
    allCartItems.forEach((it) => {
      updated[it.id] = nextState
    })
    setSelectedItemIds(updated)
  }

  // Toggle select shop
  const handleToggleSelectShop = (shopId: number) => {
    const shop = shopGroups.find((g) => g.shopId === shopId)
    if (!shop) return

    const isShopAllSelected = shop.cartItems.every((it) => selectedItemIds[it.id])
    const nextState = !isShopAllSelected

    setSelectedItemIds((prev) => {
      const updated = { ...prev }
      shop.cartItems.forEach((it) => {
        updated[it.id] = nextState
      })
      return updated
    })
  }

  // Toggle individual item
  const handleToggleSelectItem = (itemId: number) => {
    setSelectedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // Update item quantity
  const handleUpdateQuantity = async (itemId: number, newQty: number, maxStock: number) => {
    if (newQty < 1) {
      handleRemoveItem(itemId)
      return
    }
    if (newQty > maxStock) {
      showToast(`Số lượng vượt quá tồn kho hiện có (${maxStock} sản phẩm)`, 'error')
      return
    }

    // Optimistic UI update
    setShopGroups((prev) =>
      prev.map((group) => ({
        ...group,
        cartItems: group.cartItems.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it)),
      }))
    )

    if (isLoggedIn) {
      try {
        await cartApi.updateItemQuantity(itemId, newQty)
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (err: any) {
        showToast(err?.message || 'Không thể cập nhật số lượng', 'error')
        loadCart()
      }
    } else {
      // Update guest cart
      const guestItems = JSON.parse(localStorage.getItem('zora_guest_cart') || '[]')
      const updated = guestItems.map((it: any) => (it.id === itemId ? { ...it, quantity: newQty } : it))
      localStorage.setItem('zora_guest_cart', JSON.stringify(updated))
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  // Remove single item
  const handleRemoveItem = async (itemId: number) => {
    // Optimistic update
    setShopGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          cartItems: group.cartItems.filter((it) => it.id !== itemId),
        }))
        .filter((group) => group.cartItems.length > 0)
    )

    setSelectedItemIds((prev) => {
      const updated = { ...prev }
      delete updated[itemId]
      return updated
    })

    if (isLoggedIn) {
      try {
        await cartApi.removeItem(itemId)
        showToast('Đã xóa sản phẩm khỏi giỏ hàng')
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (err: any) {
        showToast(err?.message || 'Không thể xóa sản phẩm', 'error')
        loadCart()
      }
    } else {
      const guestItems = JSON.parse(localStorage.getItem('zora_guest_cart') || '[]')
      const updated = guestItems.filter((it: any) => it.id !== itemId)
      localStorage.setItem('zora_guest_cart', JSON.stringify(updated))
      showToast('Đã xóa sản phẩm khỏi giỏ hàng')
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  // Remove all selected items
  const handleRemoveSelectedItems = async () => {
    const selectedIds = Object.keys(selectedItemIds)
      .filter((id) => selectedItemIds[Number(id)])
      .map(Number)

    if (selectedIds.length === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm để xóa', 'error')
      return
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
      return
    }

    for (const id of selectedIds) {
      await handleRemoveItem(id)
    }
  }

  // Financial calculations
  const rawSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
  }, [selectedItems])

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher || rawSubtotal === 0) return 0
    if (rawSubtotal < appliedVoucher.minSpend) return 0
    return appliedVoucher.discountAmount
  }, [appliedVoucher, rawSubtotal])

  const coinDiscount = useMemo(() => {
    if (!useCoins || rawSubtotal === 0) return 0
    // Maximum 50% of subtotal can be paid by coins
    return Math.min(userCoins, Math.round(rawSubtotal * 0.5))
  }, [useCoins, rawSubtotal])

  const finalTotal = useMemo(() => {
    const total = rawSubtotal - voucherDiscount - coinDiscount
    return Math.max(0, total)
  }, [rawSubtotal, voucherDiscount, coinDiscount])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  // Handle Apply Custom Voucher
  const handleApplyCustomVoucher = () => {
    const code = voucherCodeInput.trim().toUpperCase()
    if (!code) return

    const matched = AVAILABLE_VOUCHERS.find((v) => v.code === code)
    if (matched) {
      if (rawSubtotal < matched.minSpend) {
        showToast(`Đơn hàng chưa đạt mức tối thiểu ${formatCurrency(matched.minSpend)} để áp dụng mã này`, 'error')
        return
      }
      setAppliedVoucher(matched)
      setIsVoucherModalOpen(false)
      setVoucherCodeInput('')
      showToast(`Áp dụng mã giảm giá ${code} thành công!`)
    } else {
      showToast('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng', 'error')
    }
  }

  // Handle Checkout Click - Chuyển hướng sang Trang Thanh Toán riêng biệt (/checkout) chuẩn Shopee
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      showToast('Bạn vẫn chưa chọn sản phẩm nào để mua.', 'error')
      return
    }

    if (!isLoggedIn) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng', 'error')
      setTimeout(() => {
        navigate('/login', { state: { from: '/checkout' } })
      }, 1000)
      return
    }

    const selectedIds = selectedItems.map((it) => it.id)
    sessionStorage.setItem(
      'zora_checkout_data',
      JSON.stringify({
        selectedItemIds: selectedIds,
        appliedVoucherCode: appliedVoucher?.code || null,
        useCoins,
      })
    )

    navigate('/checkout')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-slate-800 font-sans antialiased">

      {/* Main Header */}
      <div className="relative z-50">
        <MainHeader />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 transition-all duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xs shadow-md text-xs font-medium border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-[#ee4d2d] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Cart Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 space-y-3">
        
        {/* Breadcrumb & Cart Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#ee4d2d]" />
              <span>Giỏ Hàng Của Bạn</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              ({allCartItems.length} sản phẩm)
            </span>
          </div>

          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-[#ee4d2d] transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-medium">Giỏ Hàng</span>
          </nav>
        </div>

        {/* Free Shipping Incentive Bar (Clean Shopee Standard) */}
        <div className="bg-white border border-slate-200 rounded-xs p-3 px-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#ee4d2d] text-white font-semibold text-[11px] uppercase tracking-wide">
              <Truck className="w-3.5 h-3.5" />
              <span>Freeship Xtra</span>
            </div>

            <div className="text-xs text-slate-700 truncate sm:text-clip">
              <span className="font-semibold text-slate-900">Miễn Phí Vận Chuyển Đơn Từ 0Đ:</span>{' '}
              <span className="text-slate-500">
                Áp dụng voucher Freeship toàn quốc, đồng kiểm khi nhận hàng.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVoucherModalOpen(true)}
            className="shrink-0 text-xs font-semibold text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lấy mã</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Not Logged In Warning Banner */}
        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-xs p-3 px-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Bạn đang duyệt giỏ hàng dưới tư cách <strong>Khách</strong>. Đăng nhập để lưu và đồng bộ giỏ hàng!
              </span>
            </div>
            <Link
              to="/login"
              state={{ from: '/cart' }}
              className="px-3.5 py-1.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-medium rounded-xs text-xs transition-colors shrink-0"
            >
              Đăng Nhập
            </Link>
          </div>
        )}

        {/* CART CONTENT */}
        {isLoading ? (
          <div className="bg-white rounded-xs p-16 text-center space-y-3 border border-slate-200 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-100 mx-auto" />
            <div className="text-xs font-medium text-slate-400">Đang tải giỏ hàng của bạn...</div>
          </div>
        ) : allCartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xs p-12 sm:p-16 text-center space-y-4 border border-slate-200">
            <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-orange-50 text-[#ee4d2d]">
              <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Giỏ hàng của bạn còn trống</h3>
              <p className="text-xs text-slate-400">
                Hàng ngàn sản phẩm chính hãng với ưu đãi hấp dẫn đang chờ bạn khám phá.
              </p>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer uppercase tracking-wider"
              >
                <span>MUA SẮM NGAY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Cart List */
          <div className="space-y-3">
            
            {/* Table Header Row (Desktop) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 bg-white rounded-xs px-5 py-3 border border-slate-200 text-xs font-medium text-slate-500 items-center">
              <div className="col-span-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded-xs border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer accent-[#ee4d2d]"
                />
                <span className="font-semibold text-slate-800">Sản Phẩm ({allCartItems.length})</span>
              </div>
              <div className="col-span-2 text-center">Đơn Giá</div>
              <div className="col-span-2 text-center">Số Lượng</div>
              <div className="col-span-2 text-right">Số Tiền</div>
              <div className="col-span-1 text-center">Thao Tác</div>
            </div>

            {/* SHOP GROUPS LIST */}
            {shopGroups.map((group) => {
              const isShopAllSelected = group.cartItems.every((it) => selectedItemIds[it.id])

              return (
                <div
                  key={group.shopId}
                  className="bg-white rounded-md border border-slate-200 overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="p-3.5 sm:px-5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isShopAllSelected}
                        onChange={() => handleToggleSelectShop(group.shopId)}
                        className="w-4 h-4 rounded-xs border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer accent-[#ee4d2d]"
                      />

                      <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                        Yêu thích+
                      </span>

                      <Link
                        to={`/shop/${group.shopId}`}
                        className="font-semibold text-slate-900 hover:text-[#ee4d2d] flex items-center gap-1.5 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-slate-500" />
                        <span>{group.shopName}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </Link>

                      <button
                        onClick={() => showToast(`Đang kết nối chat với shop ${group.shopName}...`)}
                        className="hidden sm:inline-flex items-center gap-1 text-slate-500 hover:text-[#ee4d2d] px-2 py-0.5 rounded-xs border border-slate-200 bg-white text-[11px] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Tag className="w-3 h-3 text-[#ee4d2d]" />
                      <span className="text-[#ee4d2d] font-medium">Voucher Shop: Giảm 15k</span>
                    </div>
                  </div>

                  {/* Items in this Shop */}
                  <div className="divide-y divide-slate-100">
                    {group.cartItems.map((item) => {
                      const isSelected = !!selectedItemIds[item.id]

                      return (
                        <div
                          key={item.id}
                          className={`p-4 sm:px-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center transition-colors ${
                            isSelected ? 'bg-orange-50/20' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          {/* Product Info (Checkbox + Img + Name + Variant) */}
                          <div className="lg:col-span-5 flex items-start gap-3.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectItem(item.id)}
                              className="w-4 h-4 rounded-xs border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer mt-3 accent-[#ee4d2d]"
                            />

                            <Link
                              to={`/product/${item.sku || item.id}`}
                              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-slate-50 border border-slate-200 shrink-0"
                            >
                              <img
                                src={
                                  item.imageUrl ||
                                  item.productImage ||
                                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
                                }
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </Link>

                            <div className="space-y-1 min-w-0 flex-1">
                              <Link
                                to={`/product/${item.sku || item.id}`}
                                className="text-xs sm:text-sm font-medium text-slate-900 hover:text-[#ee4d2d] line-clamp-2 leading-snug transition-colors"
                              >
                                {item.productName}
                              </Link>

                              {item.variantName && (
                                <div className="inline-block px-2 py-0.5 rounded-xs bg-slate-100 text-slate-600 text-[11px]">
                                  Phân loại: {item.variantName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Unit Price */}
                          <div className="lg:col-span-2 text-left lg:text-center text-xs">
                            <span className="lg:hidden text-slate-400 mr-2">Đơn giá:</span>
                            <span className="text-slate-700 font-medium">
                              {formatCurrency(item.price)}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="lg:col-span-2 flex items-center justify-start lg:justify-center">
                            <div className="flex items-center border border-slate-300 rounded-xs overflow-hidden bg-white">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.stock || 99)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
                                title="Giảm số lượng"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 text-center text-xs font-semibold text-slate-800 border-x border-slate-200 py-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.stock || 99)}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Tăng số lượng"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="lg:col-span-2 flex items-center justify-between lg:justify-end text-xs">
                            <span className="lg:hidden text-slate-400">Tổng tiền:</span>
                            <span className="font-semibold text-[#ee4d2d] text-sm">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="lg:col-span-1 flex items-center justify-end lg:justify-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer p-1"
                              title="Xóa sản phẩm này"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="lg:hidden">Xóa</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* VOUCHERS & ZORA COINS BAR */}
            <div className="bg-white rounded-md p-4 border border-slate-200 space-y-3">
              
              {/* Voucher Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Ticket className="w-4 h-4 text-[#ee4d2d] shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Zora Voucher: </span>
                    {appliedVoucher ? (
                      <span className="text-[#ee4d2d] font-semibold">
                        {appliedVoucher.title} (-{formatCurrency(voucherDiscount)})
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa áp dụng mã giảm giá</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="text-xs font-medium text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                >
                  <span>Chọn Hoặc Nhập Mã</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zora Coins Section */}
              <div className="flex items-center justify-between text-xs text-slate-700 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Zora Xu: </span>
                    <span className="text-slate-500">
                      Bạn có {userCoins.toLocaleString('vi-VN')} Xu (Dùng tối đa {formatCurrency(coinDiscount)})
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={() => setUseCoins(!useCoins)}
                    disabled={selectedItems.length === 0}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ee4d2d]"></div>
                </label>
              </div>

            </div>

            {/* STICKY BOTTOM CHECKOUT BAR (CLEAN SHOPEE STYLE) */}
            <div className="sticky bottom-0 z-30 bg-white border border-slate-200 rounded-md px-4 sm:px-6 py-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Left Controls */}
              <div className="flex items-center gap-4 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded-xs border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d] cursor-pointer accent-[#ee4d2d]"
                  />
                  <span>Chọn Tất Cả ({allCartItems.length})</span>
                </label>

                <button
                  onClick={handleRemoveSelectedItems}
                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Xóa ({selectedItems.length})
                </button>
              </div>

              {/* Right: Totals and CTA Button */}
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-xs text-slate-500">
                      Tổng thanh toán ({selectedItems.length} sản phẩm):
                    </span>
                    <span className="text-base sm:text-xl font-bold text-[#ee4d2d]">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                  {(voucherDiscount > 0 || coinDiscount > 0) && (
                    <div className="text-[11px] text-[#ee4d2d] font-medium">
                      Tiết kiệm {formatCurrency(voucherDiscount + coinDiscount)}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.length === 0}
                  className="px-8 py-2.5 rounded-xs bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider shrink-0"
                >
                  MUA HÀNG ({selectedItems.length})
                </button>
              </div>

            </div>

          </div>
        )}

        {/* RECOMMENDED PRODUCTS */}
        {recommendations.length > 0 && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ee4d2d]" />
                <span>CÓ THỂ BẠN CŨNG THÍCH</span>
              </h2>
              <Link to="/" className="text-xs font-medium text-[#ee4d2d] hover:underline flex items-center gap-1">
                <span>Xem tất cả</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug || item.id}`}
                  className="group bg-white rounded-md overflow-hidden border border-slate-200 hover:border-[#ee4d2d] transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-bold px-1 py-0.5 rounded-bl-md">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    )}
                    <img
                      src={item.primaryImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-normal text-slate-800 line-clamp-2 leading-snug group-hover:text-[#ee4d2d] transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-[#ee4d2d]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.soldCount ? (
                        <span className="text-[10px] text-slate-400">Đã bán {item.soldCount}</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* VOUCHER MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xs w-full max-w-md overflow-hidden shadow-xl border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#ee4d2d]" />
                <span>Chọn Zora Voucher</span>
              </h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Promo Code */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã voucher Zora"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xs border border-slate-200 focus:outline-hidden focus:border-[#ee4d2d] uppercase bg-white font-medium"
              />
              <button
                onClick={handleApplyCustomVoucher}
                disabled={!voucherCodeInput.trim()}
                className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d73211] disabled:opacity-40 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
              >
                Áp Dụng
              </button>
            </div>

            {/* Vouchers List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-50">
              {AVAILABLE_VOUCHERS.map((v) => {
                const isSelected = appliedVoucher?.code === v.code
                const isEligible = rawSubtotal >= v.minSpend

                return (
                  <div
                    key={v.code}
                    onClick={() => {
                      if (isEligible) {
                        setAppliedVoucher(isSelected ? null : v)
                      }
                    }}
                    className={`p-3 rounded-xs border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#ee4d2d] bg-orange-50/40'
                        : isEligible
                        ? 'border-slate-200 hover:border-orange-200 hover:bg-slate-50'
                        : 'border-slate-100 opacity-50 cursor-not-allowed bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#ee4d2d] uppercase tracking-wider">{v.code}</span>
                        {isSelected && (
                          <span className="bg-[#ee4d2d] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-800">{v.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Đơn tối thiểu: {formatCurrency(v.minSpend)} • HSD: {v.expiry}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#ee4d2d] bg-[#ee4d2d] text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium rounded-xs transition-colors cursor-pointer"
              >
                Trở Lại
              </button>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
              >
                Đồng Ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 ZoraShop Mini Shopee E-Commerce Platform. Tất cả các quyền được bảo lưu.</p>
          <p>Quốc gia & Khu vực: Việt Nam | Singapore | Thái Lan | Indonesia | Malaysia | Philippines</p>
        </div>
      </div>
    </div>
  )
}
