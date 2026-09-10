import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Package,
  ShieldCheck,
  AlertCircle,
  Store,
  MessageSquare,
  Phone,
  MapPin,
  CreditCard,
  Copy,
  Check,
  FileText,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import MainHeader from '../components/MainHeader'
import { orderApi } from '../api/orderApi'
import { paymentApi } from '../api/paymentApi'
import type { PaymentResponse } from '../types/payment'
import type { DetailOrderResponse, OrderStatus } from '../types/order'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<DetailOrderResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  // Payment states
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false)
  const [paymentCopied, setPaymentCopied] = useState<boolean>(false)

  // Cancel Modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false)
  const [cancelReason, setCancelReason] = useState<string>('Muốn thay đổi địa chỉ giao hàng')
  const [otherCancelReason, setOtherCancelReason] = useState<string>('')
  const [isCancelling, setIsCancelling] = useState<boolean>(false)

  const fetchOrderDetail = async () => {
    if (!orderId) {
      setError('Mã đơn hàng không hợp lệ.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await orderApi.getOrderDetail(orderId)
      setOrder(data)

      // Lấy thông tin & trạng thái giao dịch thanh toán của đơn hàng (GET /api/v1/orders/{orderId}/payment)
      try {
        const payData = await paymentApi.getPaymentStatus(orderId)
        setPaymentInfo(payData)
      } catch (payErr) {
        console.warn('Could not fetch payment status:', payErr)
      }
    } catch (err: any) {
      console.error('Failed to fetch order detail:', err)
      setError(err.message || 'Không tìm thấy thông tin đơn hàng này hoặc bạn không có quyền xem.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const handleCopyOrderNumber = () => {
    if (!order?.orderNumber) return
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmCancelOrder = async () => {
    if (!order) return
    const finalReason = cancelReason === 'Khác' ? otherCancelReason.trim() || 'Lý do khác' : cancelReason
    setIsCancelling(true)
    try {
      await orderApi.cancelOrder(order.orderId, finalReason)
      setOrder((prev) => (prev ? { ...prev, statusType: 'CANCELLED' as OrderStatus } : null))
      setShowCancelModal(false)
      alert('Đơn hàng đã được hủy thành công.')
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng vào lúc này.')
    } finally {
      setIsCancelling(false)
    }
  }

  // Handle process payment: POST /api/v1/orders/{orderId}/payment
  const handleProcessPayment = async () => {
    if (!order) return
    setIsProcessingPayment(true)
    try {
      const payRes = await paymentApi.processPayment(order.orderId)
      setPaymentInfo(payRes)
      // Cập nhật lại chi tiết đơn hàng (VD: PENDING -> CONFIRMED)
      const updated = await orderApi.getOrderDetail(order.orderId)
      setOrder(updated)
      alert(`Thanh toán thành công qua cổng ${payRes.provider}! Trạng thái giao dịch: ${payRes.status}`)
    } catch (err: any) {
      alert(err.message || 'Không thể xử lý thanh toán vào lúc này.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCopyTxnId = (txnId?: string) => {
    if (!txnId) return
    navigator.clipboard.writeText(txnId)
    setPaymentCopied(true)
    setTimeout(() => setPaymentCopied(false), 2000)
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Stepper active index calculator
  const getStepIndex = (status?: OrderStatus): number => {
    switch (status) {
      case 'PENDING':
        return 0
      case 'CONFIRMED':
        return 1
      case 'SHIPPING':
        return 3
      case 'DELIVERED':
      case 'COMPLETED':
        return 4
      case 'CANCELLED':
      case 'REFUNDED':
        return -1
      default:
        return 0
    }
  }

  const currentStep = getStepIndex(order?.statusType)

  const steps = [
    { title: 'Đơn Hàng Đã Đặt', desc: formatDate(order?.createdDate), icon: FileText },
    { title: 'Đã Xác Nhận', desc: 'Shop đã duyệt đơn', icon: CheckCircle2 },
    { title: 'Đã Giao Cho ĐVVC', desc: 'Kiện hàng xuất kho', icon: Package },
    { title: 'Đang Vận Chuyển', desc: 'Đang giao đến bạn', icon: Truck },
    { title: 'Đã Giao Hàng', desc: 'Giao hàng thành công', icon: ShieldCheck }
  ]

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60 text-xs font-medium rounded-xs uppercase tracking-wider">
            Chờ xác nhận
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-xs uppercase tracking-wider">
            Đã xác nhận
          </span>
        )
      case 'SHIPPING':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60 text-xs font-medium rounded-xs uppercase tracking-wider">
            Đang vận chuyển
          </span>
        )
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60 text-xs font-medium rounded-xs uppercase tracking-wider">
            Hoàn thành
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium rounded-xs uppercase tracking-wider">
            Đã hủy
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium rounded-xs uppercase tracking-wider">
            Đã hoàn tiền
          </span>
        )
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-xs uppercase tracking-wider border border-slate-200">
            {status}
          </span>
        )
    }
  }

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)'
      case 'VNPAY':
        return 'Thanh toán trực tuyến qua VNPAY'
      case 'MOMO':
        return 'Ví điện tử MoMo'
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng'
      case 'CREDIT_CARD':
        return 'Thẻ Tín dụng / Ghi nợ quốc tế'
      default:
        return method || 'Thanh toán khi nhận hàng (COD)'
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      {/* Header */}
      <MainHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/user/orders')}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:text-[#ee4d2d] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            TRỞ LẠI DANH SÁCH ĐƠN MUA
          </button>

          {order && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">
                MÃ ĐƠN HÀNG: <strong className="text-slate-900 font-semibold">{order.orderNumber}</strong>
              </span>
              <button
                onClick={handleCopyOrderNumber}
                title="Sao chép mã đơn hàng"
                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#ee4d2d]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="text-slate-300">|</span>
              <div>{getStatusBadge(order.statusType)}</div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xs p-16 shadow-2xs text-center">
            <RefreshCw className="w-10 h-10 text-[#ee4d2d] animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-700">Đang tải thông tin chi tiết đơn hàng...</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-xs p-16 shadow-2xs text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
            <p className="text-xs text-slate-500 mt-2">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={fetchOrderDetail}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xs cursor-pointer"
              >
                Thử lại
              </button>
              <Link
                to="/user/orders"
                className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-xs font-medium rounded-xs shadow-xs"
              >
                Về danh sách đơn
              </Link>
            </div>
          </div>
        )}

        {/* Order Details Content */}
        {!loading && order && (
          <div className="space-y-4">
            {/* 1. TIMELINE STEPPER CARD */}
            <div className="bg-white rounded-xs p-6 shadow-2xs border border-slate-100">
              {order.statusType === 'CANCELLED' ? (
                <div className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-200 rounded-xs text-rose-800">
                  <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-rose-900">
                      Đơn hàng đã được hủy
                    </h3>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Đơn hàng này đã kết thúc và không cần thanh toán. Nếu bạn đã chuyển khoản trước, bộ phận Chăm Sóc Khách Hàng của ZoraShop sẽ liên hệ hoàn tiền trong vòng 24 - 48 giờ.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {/* Stepper Flex with perfectly centered connecting lines */}
                  <div className="flex items-start max-w-4xl mx-auto">
                    {steps.map((step, idx) => {
                      const StepIcon = step.icon
                      const isCompleted = currentStep >= idx
                      const isCurrent = currentStep === idx
                      const isLineActive = currentStep > idx

                      return (
                        <div key={idx} className="flex-1 relative flex flex-col items-center group">
                          {/* Connecting Bar to next node */}
                          {idx < steps.length - 1 && (
                            <div className="absolute top-6 left-1/2 w-full h-[3px] -translate-y-1/2 z-0 bg-slate-200">
                              <div
                                className={`h-full bg-[#ee4d2d] transition-all duration-300 ${
                                  isLineActive ? 'w-full' : 'w-0'
                                }`}
                              />
                            </div>
                          )}

                          {/* Node Circle */}
                          <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#ee4d2d] text-white ring-4 ring-orange-100 shadow-xs'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            <StepIcon className="w-5 h-5 stroke-[2]" />
                          </div>

                          {/* Step Label */}
                          <div className="text-center mt-3 max-w-[130px] px-1">
                            <p
                              className={`text-[12px] font-medium leading-tight ${
                                isCurrent
                                  ? 'text-[#ee4d2d] font-bold'
                                  : isCompleted
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.title}
                            </p>
                            {step.desc && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. SHIPPING & RECEIVING INFO CARD */}
            <div className="bg-white rounded-xs p-6 shadow-2xs border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Địa chỉ nhận hàng */}
                <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#ee4d2d]" />
                    <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                      Địa Chỉ Nhận Hàng
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-sm font-semibold text-slate-900">{order.nameReceive}</p>
                    <p className="text-slate-600 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {order.phoneReceive}
                    </p>
                    <p className="text-slate-500 leading-relaxed pt-1">{order.address}</p>
                  </div>
                </div>

                {/* Right: Thông tin vận chuyển */}
                <div className="md:col-span-7 md:pl-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#ee4d2d]" />
                      <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                        Thông Tin Vận Chuyển
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium">
                      SPX Express Tiêu Chuẩn
                    </span>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-xs border border-slate-200/60 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Mã vận đơn:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        SPX-VN-{order.orderId}-{order.orderNumber.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phương thức giao hàng:</span>
                      <span className="text-slate-700">Giao hàng tận nơi tiêu chuẩn (1-3 ngày làm việc)</span>
                    </div>
                  </div>

                  {/* Vận chuyển timeline log với trục thẳng hàng tuyệt đối */}
                  <div className="space-y-0 pt-1">
                    {[
                      ...(order.statusType === 'DELIVERED' ? [{
                        title: 'Giao hàng thành công',
                        desc: 'Kiện hàng đã được ký nhận bởi người nhận',
                        color: 'bg-[#ee4d2d] ring-4 ring-orange-100',
                        titleColor: 'text-slate-900'
                      }] : []),
                      ...((order.statusType === 'SHIPPING' || order.statusType === 'DELIVERED') ? [{
                        title: 'Đang giao hàng',
                        desc: 'Shipper đang trên đường vận chuyển đến địa chỉ nhận hàng',
                        color: 'bg-[#ee4d2d] ring-4 ring-orange-100',
                        titleColor: 'text-slate-900'
                      }] : []),
                      ...(order.statusType !== 'CANCELLED' ? [{
                        title: 'Đã xuất kho phân loại',
                        desc: 'Kiện hàng đã rời trung tâm xử lý đơn hàng Cầu Giấy Hub',
                        color: 'bg-slate-300',
                        titleColor: 'text-slate-700'
                      }] : []),
                      {
                        title: 'Đơn hàng đã được tạo',
                        desc: formatDate(order.createdDate),
                        color: 'bg-slate-300',
                        titleColor: 'text-slate-700'
                      }
                    ].map((evt, idx, arr) => {
                      const isLast = idx === arr.length - 1
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          {/* Indicator (Dot và Line nằm chung 1 trục dọc) */}
                          <div className="flex flex-col items-center shrink-0 w-4">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1 ${evt.color}`} />
                            {!isLast && <div className="w-0.5 flex-1 min-h-[26px] bg-slate-200 my-0.5" />}
                          </div>

                          {/* Content */}
                          <div className={`text-xs min-w-0 ${!isLast ? 'pb-3' : 'pb-0'}`}>
                            <p className={`font-semibold ${evt.titleColor}`}>
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              {evt.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SHOP HEADER & PRODUCT ITEMS */}
            <div className="bg-white rounded-xs shadow-2xs border border-slate-100 overflow-hidden">
              {/* Shop info bar */}
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                    {order.logoUrl ? (
                      <img src={order.logoUrl} alt={order.shopName} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{order.shopName}</span>
                      <span className="px-1.5 py-0.5 bg-[#ee4d2d] text-white text-[10px] font-bold rounded-xs uppercase">
                        Yêu thích+
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Shop ID: #{order.shopId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Bắt đầu trò chuyện với shop: ${order.shopName}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium rounded-xs cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#ee4d2d]" />
                    Chat Ngay
                  </button>
                  <button
                    onClick={() => navigate(`/shop/${order.shopId}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50 text-xs font-medium rounded-xs cursor-pointer transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Xem Shop
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {order.orderItemResponses.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <Link to={`/product/${item.productId}`} className="shrink-0 group">
                        <img
                          src={
                            item.productPictureUrl ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'
                          }
                          alt={item.productName}
                          className="w-20 h-20 rounded-xs object-cover border border-slate-200 bg-slate-50 group-hover:opacity-90 transition-opacity"
                        />
                      </Link>

                      <div className="space-y-1.5 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-semibold text-slate-900 hover:text-[#ee4d2d] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <span className="inline-block text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-xs">
                            Phân loại: {item.variantName}
                          </span>
                        )}
                        <p className="text-xs text-slate-500">Số lượng: x{item.quantity}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 sm:self-center w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs text-slate-400 sm:hidden">Thành tiền:</span>
                      <div>
                        <div className="text-sm font-bold text-[#ee4d2d]">
                          ₫{Number(item.subtotal).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          (₫{Number(item.price).toLocaleString('vi-VN')} / món)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Cost Breakdown & Payment Summary */}
              <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                {/* Payment & Transaction Info Card */}
                <div className="space-y-2.5 w-full md:max-w-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <span>Thông tin thanh toán & Giao dịch</span>
                    </div>
                    {paymentInfo && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cổng: {paymentInfo.provider}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xs text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phương thức:</span>
                      <span className="font-semibold text-slate-900">
                        {getPaymentMethodLabel(paymentInfo?.paymentMethod || order.method)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Trạng thái giao dịch:</span>
                      <div>
                        {paymentInfo?.status === 'COMPLETED' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-xs bg-orange-50/70 text-[#ee4d2d] font-medium text-[11px] border border-orange-200/60">
                            Đã thanh toán (COMPLETED)
                          </span>
                        ) : paymentInfo?.status === 'FAILED' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-xs bg-slate-100 text-rose-600 font-medium text-[11px] border border-slate-200">
                            Thất bại (FAILED)
                          </span>
                        ) : paymentInfo?.status === 'REFUNDED' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-xs bg-slate-100 text-slate-600 font-medium text-[11px] border border-slate-200">
                            Đã hoàn tiền (REFUNDED)
                          </span>
                        ) : order.method === 'COD' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                            Thanh toán khi nhận hàng (COD)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-xs bg-orange-50/70 text-[#ee4d2d] font-medium text-[11px] border border-orange-200/60">
                            Chờ thanh toán (PENDING)
                          </span>
                        )}
                      </div>
                    </div>

                    {(paymentInfo?.transactionId || order.transactionId) && (
                      <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
                        <span>Mã giao dịch:</span>
                        <div className="flex items-center gap-1.5 font-mono text-slate-800 text-[11px]">
                          <span>{paymentInfo?.transactionId || order.transactionId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTxnId(paymentInfo?.transactionId || order.transactionId)}
                            title="Sao chép mã GD"
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {paymentCopied ? (
                              <Check className="w-3 h-3 text-[#ee4d2d]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentInfo?.paidAt ? (
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Thời gian thanh toán:</span>
                        <span className="text-slate-700 font-medium">{formatDate(paymentInfo.paidAt)}</span>
                      </div>
                    ) : order.method === 'COD' ? (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        Vui lòng chuẩn bị sẵn số tiền chính xác khi shipper giao hàng đến.
                      </p>
                    ) : (
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-amber-600">Đơn hàng chưa hoàn tất thanh toán</span>
                        {order.statusType === 'PENDING' && (
                          <button
                            type="button"
                            onClick={handleProcessPayment}
                            disabled={isProcessingPayment}
                            className="px-2.5 py-1 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[11px] font-semibold rounded-xs shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán ngay'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Totals */}
                <div className="w-full md:w-80 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tổng tiền hàng</span>
                    <span className="font-medium text-slate-900">
                      ₫{Number(order.subtotal).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-slate-900">
                      {order.shippingFee === 0 || !order.shippingFee
                        ? 'Miễn phí'
                        : `₫${Number(order.shippingFee).toLocaleString('vi-VN')}`}
                    </span>
                  </div>

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-[#ee4d2d]">
                      <span>Giảm giá Voucher Zora</span>
                      <span className="font-medium">
                        -₫{Number(order.discountAmount).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-[#ee4d2d]">
                      ₫{Number(order.totalAmount).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. BOTTOM ACTION BAR */}
            <div className="bg-white rounded-xs p-4 shadow-2xs border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#ee4d2d]" />
                <span>ZoraShop Bảo Hiểm: Được đổi trả trong 15 ngày nếu có lỗi từ nhà bán.</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {order.statusType === 'PENDING' && order.method !== 'COD' && paymentInfo?.status !== 'COMPLETED' && (
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                    className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-xs font-semibold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isProcessingPayment ? 'Đang xử lý...' : 'Thanh Toán Đơn Hàng'}
                  </button>
                )}

                {order.statusType === 'PENDING' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xs cursor-pointer transition-colors"
                  >
                    Hủy Đơn Hàng
                  </button>
                )}

                {(order.statusType === 'DELIVERED' || order.statusType === 'COMPLETED') && (
                  <>
                    <button
                      onClick={() => alert('Mở form đánh giá sản phẩm')}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xs cursor-pointer transition-colors"
                    >
                      Đánh Giá
                    </button>
                    <button
                      onClick={() => navigate(`/product/${order.orderItemResponses[0]?.productId || 1}`)}
                      className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-xs font-semibold rounded-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Mua Lại
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate(`/shop/${order.shopId}`)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xs cursor-pointer transition-colors"
                >
                  Liên Hệ Người Bán
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xs max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Chọn lý do hủy đơn hàng</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-500">
                Hãy cho ZoraShop biết lý do bạn muốn hủy đơn hàng này để chúng tôi nâng cao chất lượng phục vụ:
              </p>

              {[
                'Muốn thay đổi địa chỉ giao hàng',
                'Muốn thay đổi sản phẩm trong đơn hàng (kích thước, màu sắc, số lượng)',
                'Tìm thấy giá rẻ hơn ở nơi khác',
                'Thời gian giao hàng quá lâu',
                'Thay đổi ý định mua sắm',
                'Khác'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="accent-[#ee4d2d]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {cancelReason === 'Khác' && (
                <textarea
                  value={otherCancelReason}
                  onChange={(e) => setOtherCancelReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết..."
                  rows={3}
                  className="w-full mt-2 p-2.5 border border-slate-200 rounded-xs text-xs focus:border-[#ee4d2d] focus:outline-none"
                />
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-xs cursor-pointer"
              >
                Không phải bây giờ
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopee Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 ZoraShop Mini Shopee E-Commerce Platform. Tất cả các quyền được bảo lưu.</p>
          <p>Quốc gia & Khu vực: Việt Nam | Singapore | Thái Lan | Indonesia | Malaysia | Philippines</p>
        </div>
      </footer>
    </div>
  )
}
