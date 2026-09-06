import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Store,
  Clock,
  ArrowRight,
  XCircle,
  Eye,
  CheckCircle2,
  Truck,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { HistoryOrderResponse, StatusType } from '../types/order';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatVND, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<StatusType | 'ALL'>('ALL');
  const [orders, setOrders] = useState<HistoryOrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelModalOrder, setCancelModalOrder] = useState<HistoryOrderResponse | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Tôi muốn thay đổi địa chỉ nhận hàng');
  const [customReason, setCustomReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;

  const fetchOrders = (targetPage: number = page) => {
    setLoading(true);
    const statusParam = activeTab === 'ALL' ? undefined : activeTab;

    orderApi
      .getHistoryOrders(statusParam, targetPage, pageSize)
      .then((res) => {
        if (res?.body?.items) {
          setOrders(res.body.items);
          setTotalPages(res.body.totalPages || 1);
          setTotalElements(res.body.totalElements || 0);
        } else {
          setOrders([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch orders', err);
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setPage(0);
    fetchOrders(0);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchOrders(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    const finalReason = cancelReason === 'Khác' ? customReason.trim() || 'Lý do khác' : cancelReason;

    try {
      await orderApi.cancelOrder(cancelModalOrder.orderId, finalReason);
      success('Đã hủy đơn hàng thành công', `Đơn #${cancelModalOrder.orderNumber} đã chuyển sang Đã hủy.`);
      setCancelModalOrder(null);
      setCustomReason('');
      fetchOrders(page);
    } catch (err: any) {
      error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async (order: HistoryOrderResponse) => {
    try {
      for (const item of order.items) {
        await addToCart(item.productId, item.quantity);
      }
      navigate('/cart');
    } catch (err: any) {
      error(err.message || 'Không thể mua lại sản phẩm');
    }
  };

  const tabs: { id: StatusType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Đã giao' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.shopName.toLowerCase().includes(q) ||
      o.items.some((i) => i.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-enter min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Đơn Mua Của Bạn
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi lộ trình giao hàng và lịch sử mua sắm trực tuyến ({totalElements} đơn hàng)
            </p>
          </div>

          {/* Search order input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã đơn, Shop, Sản phẩm..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        {/* Status Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy đơn hàng nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Chưa có đơn hàng nào trong trạng thái này. Hãy dạo quanh ZoraEcommerce để chọn món đồ yêu thích nhé!
            </p>
            <Link to="/" className="inline-flex items-center justify-center mt-5 text-xs py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-all duration-200"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {order.shopAvatarUrl ? (
                      <img
                        src={order.shopAvatarUrl}
                        alt={order.shopName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <Store className="w-4 h-4 text-slate-700" />
                    )}
                    <span className="text-xs font-bold text-slate-900">{order.shopName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      #{order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(order.createDate)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-slate-50 py-2">
                  {order.items.map((item) => (
                    <div key={item.orderItemId} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.productPictureUrl || 'https://picsum.photos/seed/item/100/100'}
                          alt={item.productName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {item.productName}
                          </h4>
                          {item.variantName && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Phân loại: {item.variantName}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">Số lượng: x{item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 shrink-0">
                        {formatVND(item.subTotal || item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-500">Tổng thanh toán:</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatVND(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/orders/${order.orderId}`}
                      className="text-xs py-1.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Xem chi tiết</span>
                    </Link>

                    {/* Buyer Action: Cancel order when PENDING */}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setCancelModalOrder(order);
                          setCancelReason('Tôi muốn thay đổi địa chỉ nhận hàng');
                          setCustomReason('');
                        }}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {/* Buyer Action: Reorder when DELIVERED */}
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mua lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-3">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900 mb-1">Hủy đơn hàng</h3>
              <p className="text-xs text-slate-500 mb-4">
                Bạn có chắc chắn muốn hủy đơn hàng #{cancelModalOrder.orderNumber}?
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Chọn lý do hủy:
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                  >
                    <option value="Tôi muốn thay đổi địa chỉ nhận hàng">
                      Tôi muốn thay đổi địa chỉ nhận hàng
                    </option>
                    <option value="Tôi muốn thay đổi sản phẩm/phân loại">
                      Tôi muốn thay đổi sản phẩm/phân loại
                    </option>
                    <option value="Thời gian giao hàng quá lâu">Thời gian giao hàng quá lâu</option>
                    <option value="Tìm thấy giá tốt hơn ở nơi khác">Tìm thấy giá tốt hơn ở nơi khác</option>
                    <option value="Khác">Lý do khác...</option>
                  </select>
                </div>

                {cancelReason === 'Khác' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nhập lý do cụ thể:
                    </label>
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Nhập lý do của bạn..."
                      className="input-modern text-xs py-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelModalOrder(null)}
                  className="btn-ghost flex-1 text-xs py-2.5"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="btn-primary flex-1 text-xs py-2.5 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
