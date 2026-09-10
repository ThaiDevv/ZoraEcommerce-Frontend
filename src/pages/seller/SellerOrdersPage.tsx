import { useState, useEffect, useCallback } from 'react'
import SellerLayout from '../../components/seller/SellerLayout'
import { sellerApi, type OrderSummaryResponse, type SellerOrderDetailResponse } from '../../api/sellerApi'
import type { OrderStatus } from '../../types/order'
import {
  Search,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Eye,
  User,
  Calendar,
  CreditCard,
  X,
  ShoppingBag
} from 'lucide-react'

type TabType = 'ALL' | OrderStatus

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([])
  const [allOrdersForCount, setAllOrdersForCount] = useState<OrderSummaryResponse[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Order Detail Modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [orderDetail, setOrderDetail] = useState<SellerOrderDetailResponse | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const fetchCounts = useCallback(async () => {
    try {
      const allRes = await sellerApi.getSellerOrders({ page: 0, size: 200 })
      setAllOrdersForCount(allRes.items || allRes.content || [])
    } catch (e) {
      console.error('Lỗi khi tải số lượng tab:', e)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab
      const res = await sellerApi.getSellerOrders({
        status: statusParam,
        page: 0,
        size: 50
      })
      setOrders(res.items || res.content || [])
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err)
      showToast('error', err.response?.data?.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // Open Order Detail
  const handleOpenDetail = async (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsLoadingDetail(true)
    try {
      const detail = await sellerApi.getSellerOrderDetail(orderId)
      setOrderDetail(detail)
    } catch (err: any) {
      console.error('Lỗi khi lấy chi tiết đơn:', err)
      showToast('error', err.response?.data?.message || 'Không thể lấy thông tin chi tiết đơn hàng.')
      setSelectedOrderId(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Action: Confirm Order
  const handleConfirmOrder = async (orderId: number) => {
    setIsActionLoading(orderId)
    try {
      await sellerApi.confirmOrder(orderId)
      showToast('success', `Đã duyệt đơn hàng #${orderId} thành công!`)
      if (selectedOrderId === orderId) {
        const detail = await sellerApi.getSellerOrderDetail(orderId)
        setOrderDetail(detail)
      }
      fetchOrders()
      fetchCounts()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Duyệt đơn hàng thất bại.')
    } finally {
      setIsActionLoading(null)
    }
  }

  // Action: Ship Order
  const handleShipOrder = async (orderId: number) => {
    setIsActionLoading(orderId)
    try {
      await sellerApi.shipOrder(orderId)
      showToast('success', `Đã bàn giao đơn hàng #${orderId} cho Đơn vị vận chuyển!`)
      if (selectedOrderId === orderId) {
        const detail = await sellerApi.getSellerOrderDetail(orderId)
        setOrderDetail(detail)
      }
      fetchOrders()
      fetchCounts()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Chuyển trạng thái giao hàng thất bại.')
    } finally {
      setIsActionLoading(null)
    }
  }

  // Action: Deliver Order
  const handleDeliverOrder = async (orderId: number) => {
    setIsActionLoading(orderId)
    try {
      await sellerApi.deliverOrder(orderId)
      showToast('success', `Xác nhận giao thành công đơn hàng #${orderId}!`)
      if (selectedOrderId === orderId) {
        const detail = await sellerApi.getSellerOrderDetail(orderId)
        setOrderDetail(detail)
      }
      fetchOrders()
      fetchCounts()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Cập nhật giao hàng thất bại.')
    } finally {
      setIsActionLoading(null)
    }
  }

  const formatPrice = (amount?: number) => {
    if (typeof amount !== 'number') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60">
            Chờ xác nhận
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Đã xác nhận
          </span>
        )
      case 'SHIPPING':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60">
            Đang giao hàng
          </span>
        )
      case 'DELIVERED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-orange-50/70 text-[#ee4d2d] border border-orange-200/60">
            Giao thành công
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Đã hủy
          </span>
        )
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-xs text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        )
    }
  }

  // Filter orders by search text
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
      o.orderId.toString().includes(q)
    )
  })

  // Quick Tab Counts calculated from all orders so switching tabs doesn't clear badges
  const countPending = allOrdersForCount.filter((o) => o.status === 'PENDING').length
  const countConfirmed = allOrdersForCount.filter((o) => o.status === 'CONFIRMED').length
  const countShipping = allOrdersForCount.filter((o) => o.status === 'SHIPPING').length
  const countDelivered = allOrdersForCount.filter((o) => o.status === 'DELIVERED').length
  const countCancelled = allOrdersForCount.filter((o) => o.status === 'CANCELLED').length

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận', count: countPending },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: countConfirmed },
    { key: 'SHIPPING', label: 'Đang giao', count: countShipping },
    { key: 'DELIVERED', label: 'Giao thành công', count: countDelivered },
    { key: 'CANCELLED', label: 'Đã hủy', count: countCancelled }
  ]

  return (
    <SellerLayout 
      title="Quản Lý Đơn Hàng" 
      subtitle="Theo dõi, duyệt đơn hàng và chuyển giao cho đối tác vận chuyển"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xs shadow-md border text-xs font-normal transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-neutral-800 text-neutral-100 border-neutral-700' 
            : 'bg-neutral-800 text-rose-300 border-neutral-700'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs mb-5 overflow-x-auto">
        <div className="flex border-b border-slate-100 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all relative ${
                  isActive
                    ? 'border-[#ee4d2d] text-[#ee4d2d] font-bold bg-orange-50/30'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#ee4d2d] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã đơn hoặc Tên khách..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Đang tải danh sách đơn hàng từ máy chủ...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Không có đơn hàng nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${searchQuery}".` 
              : activeTab === 'SHIPPING' && countConfirmed > 0
              ? `Chưa có đơn hàng nào đang giao. Bạn có ${countConfirmed} đơn ở mục "Đã xác nhận" cần bàn giao cho đơn vị vận chuyển.`
              : `Hiện chưa có đơn hàng nào trong trạng thái "${tabs.find(t => t.key === activeTab)?.label}".`}
          </p>
          {activeTab === 'SHIPPING' && countConfirmed > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setActiveTab('CONFIRMED')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
              >
                <span>Chuyển sang mục "Đã xác nhận" để giao hàng</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isProcessing = isActionLoading === order.orderId
            return (
              <div 
                key={order.orderId}
                className="bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      #{order.orderNumber || order.orderId}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.createdDate ? new Date(order.createdDate).toLocaleString('vi-VN') : 'Mới tạo'}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.buyerName || 'Khách vãng lai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {order.paymentMethod} • {order.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                    </span>
                  </div>
                </div>

                {/* Order Body Details */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
                      <span className="font-medium text-slate-900">
                        Số lượng mặt hàng: <strong className="text-slate-800">{order.totalItems || 1}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Mã tham chiếu hệ thống: <span className="font-mono text-slate-600">ID_{order.orderId}</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-500 mb-0.5">Tổng tiền thanh toán</div>
                    <div className="text-lg font-black text-[#ee4d2d]">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenDetail(order.orderId)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    {/* Action button based on Order Status */}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleConfirmOrder(order.orderId)}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Xác nhận đơn</span>
                      </button>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleShipOrder(order.orderId)}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        <span>Giao cho ĐVVC</span>
                      </button>
                    )}

                    {order.status === 'SHIPPING' && (
                      <button
                        onClick={() => handleDeliverOrder(order.orderId)}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Xác nhận đã giao</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  Chi Tiết Đơn Hàng #{orderDetail?.orderNumber || selectedOrderId}
                </h3>
                {orderDetail && getStatusBadge(orderDetail.status)}
              </div>
              <button
                onClick={() => {
                  setSelectedOrderId(null)
                  setOrderDetail(null)
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {isLoadingDetail ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Đang tải thông tin chi tiết đơn hàng...</p>
                </div>
              ) : orderDetail ? (
                <>
                  {/* Customer & Shipping Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-[#ee4d2d]" />
                        Thông tin người nhận
                      </h4>
                      <div className="space-y-1 text-slate-600">
                        <p><strong className="text-slate-800">Họ tên:</strong> {orderDetail.receiverName}</p>
                        <p><strong className="text-slate-800">Điện thoại:</strong> {orderDetail.receiverPhone}</p>
                        <p className="flex items-start gap-1">
                          <strong className="text-slate-800 shrink-0">Địa chỉ:</strong>
                          <span>{orderDetail.shippingAddress}</span>
                        </p>
                        {orderDetail.note && (
                          <p className="text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                            <strong>Ghi chú của khách:</strong> {orderDetail.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
                        <CreditCard className="w-3.5 h-3.5 text-[#ee4d2d]" />
                        Thanh toán & Vận chuyển
                      </h4>
                      <div className="space-y-1 text-slate-600">
                        <p><strong className="text-slate-800">Hình thức:</strong> {orderDetail.paymentMethod}</p>
                        <p>
                          <strong className="text-slate-800">Trạng thái:</strong>{' '}
                          <span className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold ${
                            orderDetail.paymentStatus === 'PAID' 
                              ? 'bg-orange-50 text-[#ee4d2d] border border-orange-200/80' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {orderDetail.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </p>
                        {orderDetail.transactionId && (
                          <p><strong className="text-slate-800">Mã GD:</strong> {orderDetail.transactionId}</p>
                        )}
                        <p><strong className="text-slate-800">Thời gian tạo:</strong> {new Date(orderDetail.createdDate).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider text-slate-700">
                      Danh sách sản phẩm trong đơn
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <tr>
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3">Phân loại</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-center">SL</th>
                            <th className="p-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orderDetail.items && orderDetail.items.length > 0 ? (
                            orderDetail.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    {item.productPictureUrl ? (
                                      <img 
                                        src={item.productPictureUrl} 
                                        alt={item.productName} 
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60'
                                        }}
                                        className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0 bg-slate-100"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-400 shrink-0">
                                        <Package className="w-5 h-5" />
                                      </div>
                                    )}
                                    <span className="font-medium text-slate-800 line-clamp-2">
                                      {item.productName}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-500 font-mono">
                                  {item.variantName || 'Mặc định'}
                                </td>
                                <td className="p-3 text-right font-medium text-slate-700">
                                  {formatPrice(item.price)}
                                </td>
                                <td className="p-3 text-center font-bold text-slate-800">
                                  x{item.quantity}
                                </td>
                                <td className="p-3 text-right font-bold text-[#ee4d2d]">
                                  {formatPrice(item.subtotal || item.price * item.quantity)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-400">
                                Không có thông tin sản phẩm
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-end">
                    <div className="w-full sm:w-72 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Tiền hàng:</span>
                        <span>{formatPrice(orderDetail.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(orderDetail.shippingFee)}</span>
                      </div>
                      {orderDetail.discountAmount > 0 && (
                        <div className="flex justify-between text-[#ee4d2d] font-semibold">
                          <span>Giảm giá:</span>
                          <span>-{formatPrice(orderDetail.discountAmount)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                        <span>Tổng thanh toán:</span>
                        <span className="text-[#ee4d2d] text-base">{formatPrice(orderDetail.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedOrderId(null)
                  setOrderDetail(null)
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {orderDetail?.status === 'PENDING' && (
                  <button
                    onClick={() => handleConfirmOrder(orderDetail.orderId)}
                    disabled={isActionLoading === orderDetail.orderId}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Xác nhận đơn ngay</span>
                  </button>
                )}

                {orderDetail?.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleShipOrder(orderDetail.orderId)}
                    disabled={isActionLoading === orderDetail.orderId}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Giao hàng cho ĐVVC</span>
                  </button>
                )}

                {orderDetail?.status === 'SHIPPING' && (
                  <button
                    onClick={() => handleDeliverOrder(orderDetail.orderId)}
                    disabled={isActionLoading === orderDetail.orderId}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Xác nhận đã giao thành công</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  )
}
