import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Store,
  Ticket,
  Coins,
  Check,
  Plus,
  RefreshCw,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  Truck,
  X,
} from 'lucide-react'
import ZoraLogo from '../components/ZoraLogo'
import { cartApi, type BackendCartShopGroup } from '../api/cartApi'
import { orderApi, type BackendAddress, type CreateAddressPayload } from '../api/orderApi'
import { paymentApi } from '../api/paymentApi'
import type { PaymentMethod } from '../types/payment'

interface AvailableVoucher {
  code: string
  title: string
  discountAmount: number
  minSpend: number
  type: 'SHIPPING' | 'DISCOUNT'
  expiry: string
}

const AVAILABLE_VOUCHERS: AvailableVoucher[] = [
  {
    code: 'ZORAFREESHIP',
    title: 'Miễn Phí Vận Chuyển',
    discountAmount: 15000,
    minSpend: 0,
    type: 'SHIPPING',
    expiry: '31/12/2026',
  },
  {
    code: 'ZORA50K',
    title: 'Giảm ₫50.000 Đơn Từ 300K',
    discountAmount: 50000,
    minSpend: 300000,
    type: 'DISCOUNT',
    expiry: '31/12/2026',
  },
  {
    code: 'ZORA10PERCENT',
    title: 'Giảm 10% Tối Đa 100K',
    discountAmount: 100000,
    minSpend: 500000,
    type: 'DISCOUNT',
    expiry: '31/12/2026',
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()

  // Cart & items state
  const [loading, setLoading] = useState(true)
  const [checkoutShopGroups, setCheckoutShopGroups] = useState<BackendCartShopGroup[]>([])
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<number[]>([])

  // Address state
  const [addresses, setAddresses] = useState<BackendAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<BackendAddress | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState<number | null>(null)
  const [newAddressForm, setNewAddressForm] = useState<CreateAddressPayload>({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
  })

  // Voucher & Coins state
  const [appliedVoucher, setAppliedVoucher] = useState<AvailableVoucher | null>(null)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [useCoins, setUseCoins] = useState(false)
  const userCoins = 10000 // 10,000 Xu = 10,000 VND

  // Payment Method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('COD')
  const [shopNotes, setShopNotes] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load checkout data
  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      navigate('/login?redirect=/checkout')
      return
    }

    try {
      // 1. Get stored checkout item IDs
      const rawStored = sessionStorage.getItem('zora_checkout_data')
      let itemIds: number[] = []
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored)
          itemIds = parsed.selectedItemIds || []
          if (parsed.appliedVoucherCode) {
            const v = AVAILABLE_VOUCHERS.find((voc) => voc.code === parsed.appliedVoucherCode)
            if (v) setAppliedVoucher(v)
          }
          if (parsed.useCoins) setUseCoins(true)
        } catch {
          itemIds = []
        }
      }

      // 2. Fetch fresh cart
      const cartRes = await cartApi.getCart()
      if (!cartRes || !cartRes.shopGroups || cartRes.shopGroups.length === 0) {
        navigate('/cart')
        return
      }

      // Filter groups containing selected items
      let filteredGroups: BackendCartShopGroup[] = []
      if (itemIds.length > 0) {
        filteredGroups = cartRes.shopGroups
          .map((g) => ({
            ...g,
            cartItems: g.cartItems.filter((it) => itemIds.includes(it.id)),
          }))
          .filter((g) => g.cartItems.length > 0)
      } else {
        // Fallback: take all items in cart if nothing stored
        filteredGroups = cartRes.shopGroups
        itemIds = cartRes.shopGroups.flatMap((g) => g.cartItems).map((it) => it.id)
      }

      if (filteredGroups.length === 0) {
        navigate('/cart')
        return
      }

      setCheckoutShopGroups(filteredGroups)
      setSelectedCartItemIds(itemIds)

      // 3. Fetch buyer addresses
      try {
        const addrList = await orderApi.getAddresses()
        if (Array.isArray(addrList) && addrList.length > 0) {
          setAddresses(addrList)
          const def = addrList.find((a) => a.isDefault) || addrList[0]
          setSelectedAddress(def)
          setTempSelectedAddressId(def.id)
        }
      } catch (err) {
        console.warn('Could not load addresses:', err)
      }
    } catch (err) {
      console.error('Error loading checkout data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Flattened selected items
  const allCheckoutItems = useMemo(() => {
    return checkoutShopGroups.flatMap((g) => g.cartItems)
  }, [checkoutShopGroups])

  // Pricing calculations
  const rawSubtotal = useMemo(() => {
    return allCheckoutItems.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0)
  }, [allCheckoutItems])

  // Shipping fee: 15,000 VND per shop group, waived if free ship voucher applied or rawSubtotal >= 300,000
  const standardShippingFee = useMemo(() => {
    return checkoutShopGroups.length * 15000
  }, [checkoutShopGroups])

  const shippingDiscount = useMemo(() => {
    if (appliedVoucher?.type === 'SHIPPING') return standardShippingFee
    if (rawSubtotal >= 300000) return standardShippingFee
    return 0
  }, [appliedVoucher, standardShippingFee, rawSubtotal])

  const actualShippingFee = Math.max(0, standardShippingFee - shippingDiscount)

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher || appliedVoucher.type === 'SHIPPING') return 0
    if (rawSubtotal < appliedVoucher.minSpend) return 0
    return appliedVoucher.discountAmount
  }, [appliedVoucher, rawSubtotal])

  const coinsDiscount = useMemo(() => {
    return useCoins ? userCoins : 0
  }, [useCoins])

  const finalTotalAmount = Math.max(0, rawSubtotal + actualShippingFee - voucherDiscount - coinsDiscount)

  const formatCurrency = (amount: number) => {
    return `₫${Math.round(amount).toLocaleString('vi-VN')}`
  }

  // Address Modal Handlers
  const handleOpenAddressModal = () => {
    setTempSelectedAddressId(selectedAddress?.id || null)
    setIsAddingNewAddress(false)
    setIsAddressModalOpen(true)
  }

  const handleConfirmAddressSelection = () => {
    const chosen = addresses.find((a) => a.id === tempSelectedAddressId)
    if (chosen) {
      setSelectedAddress(chosen)
    }
    setIsAddressModalOpen(false)
  }

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddressForm.fullName || !newAddressForm.phone || !newAddressForm.street) {
      alert('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.')
      return
    }

    try {
      const added = await orderApi.addAddress(newAddressForm)
      const updatedList = await orderApi.getAddresses()
      setAddresses(updatedList)
      setSelectedAddress(added)
      setTempSelectedAddressId(added.id)
      setIsAddingNewAddress(false)
      setIsAddressModalOpen(false)
      showToast('Đã thêm địa chỉ nhận hàng mới!')
      setNewAddressForm({
        fullName: '',
        phone: '',
        street: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false,
      })
    } catch (err: any) {
      alert(err?.message || 'Không thể thêm địa chỉ lúc này.')
    }
  }

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      await orderApi.setDefaultAddress(addressId)
      const updatedList = await orderApi.getAddresses()
      setAddresses(updatedList)
      const def = updatedList.find((a) => a.id === addressId)
      if (def) setSelectedAddress(def)
      showToast('Đã đặt làm địa chỉ mặc định!')
    } catch (err: any) {
      alert(err?.message || 'Không thể đặt mặc định.')
    }
  }

  // Place Order & Payment Flow
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi đặt hàng!', 'error')
      handleOpenAddressModal()
      return
    }

    if (allCheckoutItems.length === 0) {
      showToast('Không có sản phẩm nào trong đơn hàng.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      // Combine notes from all shops
      const noteParts = Object.entries(shopNotes)
        .filter(([_, note]) => note && note.trim().length > 0)
        .map(([shopId, note]) => `Shop #${shopId}: ${note.trim()}`)
      const combinedNote = noteParts.length > 0 ? noteParts.join(' | ') : 'Đặt hàng từ ZoraShop Checkout'

      const checkoutRes = await orderApi.createOrder({
        addressId: selectedAddress.id,
        paymentMethod: selectedPaymentMethod,
        cartItemIds: selectedCartItemIds,
        note: combinedNote,
      })

      let createdOrders: any[] = []
      if (Array.isArray(checkoutRes)) {
        createdOrders = checkoutRes
      } else if (checkoutRes?.orders && Array.isArray(checkoutRes.orders)) {
        createdOrders = checkoutRes.orders
      } else if (checkoutRes?.body?.orders && Array.isArray(checkoutRes.body.orders)) {
        createdOrders = checkoutRes.body.orders
      } else if (checkoutRes?.orderId || checkoutRes?.id) {
        createdOrders = [checkoutRes]
      }

      let firstOrderId: number | string | null = null

      if (createdOrders.length > 0) {
        for (const ord of createdOrders) {
          const ordId = ord.orderId || ord.id
          if (ordId) {
            if (!firstOrderId) firstOrderId = ordId
            try {
              await paymentApi.processPayment(ordId)
            } catch (payErr: any) {
              console.warn(`Payment processing warning for order #${ordId}:`, payErr)
            }
          }
        }
      }

      sessionStorage.removeItem('zora_checkout_data')
      window.dispatchEvent(new Event('cartUpdated'))

      if (selectedPaymentMethod === 'COD') {
        showToast('Đặt hàng thành công! Đơn hàng sẽ được thanh toán khi nhận hàng (COD).')
      } else if (selectedPaymentMethod === 'VNPAY') {
        showToast('Thanh toán VNPay thành công! Đơn hàng đã được xác nhận thanh toán.')
      } else {
        showToast(`Thanh toán thành công qua ${selectedPaymentMethod}! Đơn hàng đã được xác nhận.`)
      }

      setTimeout(() => {
        if (firstOrderId) {
          navigate(`/orders/${firstOrderId}`)
        } else {
          navigate('/user/orders')
        }
      }, 1200)
    } catch (err: any) {
      console.error('Checkout error:', err)
      showToast(err?.message || 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-800 font-sans antialiased flex flex-col pb-24">
      {/* 1. SHOPEE DEDICATED CHECKOUT HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 text-[#ee4d2d] transition-transform group-hover:scale-105">
                <ZoraLogo />
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#ee4d2d] tracking-tight">ZoraShop</span>
            </Link>

            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Thanh Toán</h1>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#ee4d2d] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </header>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div
            className={`px-4 py-2.5 rounded-xs text-xs font-normal shadow-md ${
              toastMessage.type === 'success'
                ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                : 'bg-neutral-800 text-rose-300 border border-neutral-700'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* MAIN CHECKOUT CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-xs p-16 shadow-2xs text-center border border-slate-200">
            <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Đang chuẩn bị trang thanh toán...</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        ) : (
          <>
            {/* 2. SHOPEE ENVELOPE ADDRESS CARD */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-200/80 overflow-hidden">
              {/* Iconic Shopee Envelope Diagonal Stripe */}
              <div
                className="h-[3.5px] w-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #6fa6d6, #6fa6d6 33px, transparent 0, transparent 41px, #f18d9b 0, #f18d9b 74px, transparent 0, transparent 82px)',
                }}
              />

              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 text-[#ee4d2d] font-bold text-sm sm:text-base uppercase tracking-wide mb-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#ee4d2d]" />
                  <span>Địa Chỉ Nhận Hàng</span>
                </div>

                {selectedAddress ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="font-bold text-slate-900 font-mono">
                        {selectedAddress.fullName} (+84) {selectedAddress.phone.replace(/^0/, '')}
                      </span>
                      <span className="text-slate-600">
                        {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district},{' '}
                        {selectedAddress.city}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="px-1.5 py-0.5 border border-[#ee4d2d] text-[#ee4d2d] text-[10px] font-semibold rounded-xs self-start sm:self-auto">
                          Mặc định
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddressModal}
                      className="text-blue-600 hover:text-[#ee4d2d] font-medium text-xs uppercase cursor-pointer shrink-0 self-start sm:self-auto transition-colors"
                    >
                      Thay Đổi
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Bạn chưa có địa chỉ nhận hàng nào trong sổ địa chỉ.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddressModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ee4d2d] text-white text-xs font-semibold rounded-xs hover:bg-[#d73211] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm Địa Chỉ Mới
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SHOPEE PRODUCT ITEMS GROUPED BY SHOP */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-200/80 overflow-hidden">
              {/* Table Column Headers */}
              <div className="px-4 sm:px-6 py-3 border-b border-slate-100 grid grid-cols-12 text-xs text-slate-400 font-medium">
                <div className="col-span-12 sm:col-span-6 font-semibold text-slate-700">Sản phẩm</div>
                <div className="hidden sm:block sm:col-span-2 text-center">Đơn giá</div>
                <div className="hidden sm:block sm:col-span-2 text-center">Số lượng</div>
                <div className="hidden sm:block sm:col-span-2 text-right font-semibold text-slate-700">Thành tiền</div>
              </div>

              {/* Shop Groups */}
              <div className="divide-y divide-slate-100">
                {checkoutShopGroups.map((group) => {
                  const shopSubtotal = group.cartItems.reduce(
                    (sum, it) => sum + Number(it.price) * Number(it.quantity),
                    0
                  )

                  return (
                    <div key={group.shopId} className="p-4 sm:p-6 space-y-4">
                      {/* Shop Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <Store className="w-4 h-4 text-slate-600" />
                          <span className="font-bold text-sm text-slate-900">{group.shopName}</span>
                          <span className="px-1.5 py-0.5 bg-[#ee4d2d] text-white text-[10px] font-bold rounded-xs uppercase tracking-wider">
                            Yêu thích
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Mở chat với Shop: ${group.shopName}`)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#ee4d2d] hover:underline cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat ngay
                        </button>
                      </div>

                      {/* Items of this shop */}
                      <div className="space-y-3">
                        {group.cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 items-center gap-3 text-xs py-1"
                          >
                            <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                              <img
                                src={
                                  item.imageUrl ||
                                  item.productImage ||
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'
                                }
                                alt={item.productName}
                                className="w-14 h-14 object-cover rounded-xs border border-slate-200 shrink-0 bg-slate-50"
                              />
                              <div className="space-y-1 min-w-0 pr-2">
                                <p className="font-medium text-slate-800 line-clamp-2 leading-snug">
                                  {item.productName}
                                </p>
                                {item.variantName && (
                                  <span className="inline-block text-[11px] text-slate-400">
                                    Phân loại: {item.variantName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="col-span-4 sm:col-span-2 text-left sm:text-center text-slate-600 font-medium">
                              {formatCurrency(item.price)}
                            </div>

                            <div className="col-span-4 sm:col-span-2 text-center text-slate-600">
                              x{item.quantity}
                            </div>

                            <div className="col-span-4 sm:col-span-2 text-right font-bold text-slate-900">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shop Shipping & Note Sub-card */}
                      <div className="bg-slate-50/70 p-3.5 rounded-xs border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        {/* Note to Seller */}
                        <div className="md:col-span-6 flex items-center gap-2">
                          <span className="text-slate-500 whitespace-nowrap">Lời nhắn:</span>
                          <input
                            type="text"
                            value={shopNotes[group.shopId] || ''}
                            onChange={(e) =>
                              setShopNotes((prev) => ({ ...prev, [group.shopId]: e.target.value }))
                            }
                            placeholder="Lưu ý cho Người bán..."
                            className="flex-1 bg-white border border-slate-200 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#ee4d2d]"
                          />
                        </div>

                        {/* Shipping Option */}
                        <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Truck className="w-4 h-4 text-[#ee4d2d] shrink-0" />
                            <span className="font-medium">Vận chuyển Nhanh (SPX Express)</span>
                          </div>
                          <span className="font-semibold text-slate-900">₫15.000</span>
                        </div>
                      </div>

                      {/* Shop Subtotal */}
                      <div className="text-right text-xs text-slate-500 pt-1">
                        <span>Tổng số tiền ({group.cartItems.length} sản phẩm): </span>
                        <span className="text-sm font-bold text-[#ee4d2d]">
                          {formatCurrency(shopSubtotal + 15000)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. SHOPEE VOUCHER & COIN SECTION */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
              {/* Voucher Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#ee4d2d]" />
                  <span className="font-bold text-slate-800">Zora Voucher</span>
                  {appliedVoucher && (
                    <span className="px-2 py-0.5 bg-orange-50 border border-[#ee4d2d] text-[#ee4d2d] text-[11px] font-semibold rounded-xs">
                      {appliedVoucher.title} (-{formatCurrency(appliedVoucher.discountAmount)})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {appliedVoucher && (
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="text-blue-600 hover:text-[#ee4d2d] font-semibold text-xs uppercase cursor-pointer"
                  >
                    {appliedVoucher ? 'Đổi Voucher' : 'Chọn Voucher'}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Zora Xu Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-800">Zora Xu</span>
                  <span className="text-slate-500 text-xs">
                    Dùng 10.000 Xu để được giảm {formatCurrency(userCoins)}
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={(e) => setUseCoins(e.target.checked)}
                    className="w-4 h-4 accent-[#ee4d2d] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#ee4d2d]">
                    [-{formatCurrency(coinsDiscount)}]
                  </span>
                </label>
              </div>
            </div>

            {/* 5. PAYMENT METHOD SECTION */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-200/80 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                  <span>Phương Thức Thanh Toán</span>
                </div>
                <span className="text-xs text-slate-400">Chọn 1 hình thức thanh toán</span>
              </div>

              {/* Method Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {[
                  {
                    id: 'COD',
                    title: 'Thanh toán khi nhận hàng',
                    sub: 'COD tiền mặt',
                  },
                  {
                    id: 'VNPAY',
                    title: 'VNPay / Sandbox',
                    sub: 'Cổng trực tuyến QR',
                  },
                  {
                    id: 'BANK_TRANSFER',
                    title: 'Chuyển khoản Ngân hàng',
                    sub: 'Internet Banking 24/7',
                  },
                  {
                    id: 'MOMO',
                    title: 'Ví MoMo Pay',
                    sub: 'Ví điện tử liên kết',
                  },
                  {
                    id: 'CREDIT_CARD',
                    title: 'Thẻ Quốc tế',
                    sub: 'Visa / MasterCard',
                  },
                ].map((m) => {
                  const isSelected = selectedPaymentMethod === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(m.id as PaymentMethod)}
                      className={`relative p-3 rounded-xs border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#ee4d2d] bg-orange-50/40 text-[#ee4d2d] shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <p className="font-bold text-xs leading-tight">{m.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>

                      {isSelected && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-[#ee4d2d] text-white flex items-center justify-center rounded-bl-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Payment Method Details Note */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xs text-xs space-y-1">
                {selectedPaymentMethod === 'COD' && (
                  <p className="text-slate-600">
                    💵 <strong>Thanh toán khi nhận hàng (COD):</strong> Bạn sẽ thanh toán số tiền đơn hàng cho shipper khi kiện hàng được giao đến địa chỉ của bạn.
                  </p>
                )}
                {selectedPaymentMethod === 'VNPAY' && (
                  <p className="text-slate-600">
                    💳 <strong>Cổng thanh toán VNPay Sandbox:</strong> Đơn hàng sẽ tự động kết nối qua API thanh toán độc lập (`POST /api/v1/orders/{'{'}orderId{'}'}/payment`) và chuyển sang trạng thái <strong>ĐÃ XÁC NHẬN (CONFIRMED)</strong> tức thì.
                  </p>
                )}
                {selectedPaymentMethod === 'BANK_TRANSFER' && (
                  <p className="text-slate-600">
                    🏦 <strong>Chuyển khoản Ngân hàng:</strong> Hỗ trợ tất cả ngân hàng nội địa Napas 24/7. Giao dịch thanh toán được xử lý và xác nhận bảo mật.
                  </p>
                )}
                {selectedPaymentMethod === 'MOMO' && (
                  <p className="text-slate-600">
                    📱 <strong>Ví điện tử MoMo:</strong> Thanh toán tức thì qua ví MoMo Pay an toàn và tiện lợi.
                  </p>
                )}
                {selectedPaymentMethod === 'CREDIT_CARD' && (
                  <p className="text-slate-600">
                    🔒 <strong>Thẻ Quốc tế (Visa / Master):</strong> Bảo mật đạt chuẩn thanh toán quốc tế PCI-DSS.
                  </p>
                )}
              </div>
            </div>

            {/* 6. SHOPEE STICKY BOTTOM CHECKOUT SUMMARY */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-200/80 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col items-end space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between w-full max-w-sm text-slate-500">
                  <span>Tổng tiền hàng:</span>
                  <span className="text-slate-800 font-medium">{formatCurrency(rawSubtotal)}</span>
                </div>

                <div className="flex justify-between w-full max-w-sm text-slate-500">
                  <span>Tổng phí vận chuyển:</span>
                  <span className="text-slate-800 font-medium">{formatCurrency(standardShippingFee)}</span>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between w-full max-w-sm text-[#ee4d2d]">
                    <span>Giảm giá phí vận chuyển:</span>
                    <span className="font-medium">-{formatCurrency(shippingDiscount)}</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex justify-between w-full max-w-sm text-[#ee4d2d]">
                    <span>Voucher Zora giảm giá:</span>
                    <span className="font-medium">-{formatCurrency(voucherDiscount)}</span>
                  </div>
                )}

                {coinsDiscount > 0 && (
                  <div className="flex justify-between w-full max-w-sm text-amber-600">
                    <span>Dùng Zora Xu:</span>
                    <span className="font-medium">-{formatCurrency(coinsDiscount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 w-full max-w-sm pt-2.5 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-xl sm:text-2xl font-black text-[#ee4d2d]">
                    {formatCurrency(finalTotalAmount)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400 text-center sm:text-left">
                  Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{' '}
                  <span className="text-blue-600 hover:underline cursor-pointer">Điều khoản Dịch vụ ZoraShop</span>
                </p>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || allCheckoutItems.length === 0}
                  className="w-full sm:w-auto px-12 py-3.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold text-sm sm:text-base rounded-xs cursor-pointer shadow-xs transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xử lý đơn hàng...
                    </span>
                  ) : (
                    'Đặt Hàng'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xs max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {isAddingNewAddress ? 'Thêm Địa Chỉ Mới' : 'Địa Chỉ Của Tôi'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {!isAddingNewAddress ? (
                <>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-3.5 rounded-xs border cursor-pointer transition-all ${
                          tempSelectedAddressId === addr.id
                            ? 'border-[#ee4d2d] bg-orange-50/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="addressSelection"
                            checked={tempSelectedAddressId === addr.id}
                            onChange={() => setTempSelectedAddressId(addr.id)}
                            className="accent-[#ee4d2d] mt-1"
                          />
                          <div className="flex-1 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                              <span className="text-slate-400 font-mono">|</span>
                              <span className="text-slate-600 font-mono">{addr.phone}</span>
                            </div>
                            <p className="text-slate-600">
                              {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              {addr.isDefault ? (
                                <span className="px-1.5 py-0.5 border border-[#ee4d2d] text-[#ee4d2d] text-[10px] font-semibold rounded-xs">
                                  Mặc định
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleSetDefaultAddress(addr.id)
                                  }}
                                  className="text-[11px] text-slate-500 hover:text-[#ee4d2d] hover:underline cursor-pointer"
                                >
                                  Thiết lập mặc định
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="w-full py-2.5 border border-dashed border-slate-300 hover:border-[#ee4d2d] text-slate-600 hover:text-[#ee4d2d] text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Địa Chỉ Mới
                  </button>
                </>
              ) : (
                <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Họ và tên người nhận *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.fullName}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Ví dụ: 0912345678"
                      className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tỉnh / Thành phố *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="Ví dụ: TP. Hồ Chí Minh"
                      className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Quận / Huyện *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.district}
                        onChange={(e) =>
                          setNewAddressForm((prev) => ({ ...prev, district: e.target.value }))
                        }
                        placeholder="Ví dụ: Quận 1"
                        className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Phường / Xã *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.ward}
                        onChange={(e) =>
                          setNewAddressForm((prev) => ({ ...prev, ward: e.target.value }))
                        }
                        placeholder="Ví dụ: Phường Bến Nghé"
                        className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Địa chỉ chi tiết (Tòa nhà, số nhà, tên đường) *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.street}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({ ...prev, street: e.target.value }))
                      }
                      placeholder="Ví dụ: 123 Đường Lê Lợi"
                      className="w-full p-2.5 border border-slate-200 rounded-xs focus:border-[#ee4d2d] focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddressForm.isDefault}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                      className="accent-[#ee4d2d] rounded cursor-pointer"
                    />
                    <span className="text-slate-700">Đặt làm địa chỉ mặc định</span>
                  </label>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xs cursor-pointer"
                    >
                      Trở lại
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold rounded-xs cursor-pointer shadow-xs"
                    >
                      Lưu Địa Chỉ
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!isAddingNewAddress && (
              <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddressSelection}
                  className="px-6 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-semibold rounded-xs shadow-xs cursor-pointer"
                >
                  Xác Nhận
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xs max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Chọn Zora Voucher</h3>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              {AVAILABLE_VOUCHERS.map((v) => {
                const isEligible = rawSubtotal >= v.minSpend
                const isSelected = appliedVoucher?.code === v.code

                return (
                  <div
                    key={v.code}
                    onClick={() => {
                      if (isEligible) {
                        setAppliedVoucher(v)
                        setIsVoucherModalOpen(false)
                        showToast(`Đã áp dụng mã ${v.code}!`)
                      }
                    }}
                    className={`p-3 rounded-xs border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ee4d2d] bg-orange-50/40'
                        : isEligible
                        ? 'border-slate-200 hover:border-[#ee4d2d]'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono text-sm">{v.code}</span>
                        <span className="px-1.5 py-0.2 bg-[#ee4d2d]/10 text-[#ee4d2d] text-[10px] font-semibold rounded">
                          {v.type === 'SHIPPING' ? 'Miễn Phí Vận Chuyển' : 'Giảm Giá'}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{v.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {v.minSpend > 0
                          ? `Đơn tối thiểu ${formatCurrency(v.minSpend)}`
                          : 'Không giới hạn giá trị đơn'} • HSD: {v.expiry}
                      </p>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="px-3 py-1 bg-[#ee4d2d] text-white text-[11px] font-bold rounded-xs">
                          Đã chọn
                        </span>
                      ) : isEligible ? (
                        <span className="px-3 py-1 border border-[#ee4d2d] text-[#ee4d2d] text-[11px] font-semibold rounded-xs hover:bg-orange-50">
                          Áp Dụng
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa đủ ĐK</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPEE FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p>© 2026 ZoraShop Mini Shopee E-Commerce Platform. Tất cả các quyền được bảo lưu.</p>
          <p>Quốc gia & Khu vực: Việt Nam | Singapore | Thái Lan | Indonesia | Malaysia | Philippines</p>
        </div>
      </footer>
    </div>
  )
}
