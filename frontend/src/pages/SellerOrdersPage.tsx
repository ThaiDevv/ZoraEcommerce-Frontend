import React, { useEffect, useState } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Truck,
  Check,
  Eye,
  X,
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { sellerOrderApi } from '../api/sellerOrderApi';
import { OrderSummaryResponse, SellerOrderDetailResponse, StatusType } from '../types/order';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatVND, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';

export const SellerOrdersPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<StatusType | 'ALL'>('ALL');
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrderDetailResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;

  const syncOrders = (targetPage: number = page) => {
    setLoading(true);
    const statusParam = activeTab === 'ALL' ? undefined : activeTab;

    sellerOrderApi
      .getOrders(statusParam, targetPage, pageSize)
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
        console.error('Failed to load seller orders', err);
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setPage(0);
    syncOrders(0);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      syncOrders(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Actions
  const handleConfirm = async (orderId: number, orderNum: string) => {
    try {
      await sellerOrderApi.confirmOrder(orderId);
      success('Đã xác nhận đơn hàng', `Đơn #${orderNum} đã sẵn sàng xuất kho.`);
      syncOrders(page);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED' });
      }
    } catch (err: any) {
      error(err.message || 'Không thể xác nhận đơn hàng');
    }
  };

  const handleShip = async (orderId: number, orderNum: string) => {
    try {
      await sellerOrderApi.shipOrder(orderId);
      success('Đã bàn giao đơn hàng', `Đơn #${orderNum} đang trên đường giao.`);
      syncOrders(page);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'SHIPPING' });
      }
    } catch (err: any) {
      error(err.message || 'Không thể bàn giao đơn hàng');
    }
  };

  const handleComplete = async (orderId: number, orderNum: string) => {
    try {
      await sellerOrderApi.deliverOrder(orderId);
      success('Đơn hàng đã hoàn thành', `Đơn #${orderNum} đã giao thành công.`);
      syncOrders(page);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'DELIVERED',
          paymentStatus: 'COMPLETED',
        });
      }
    } catch (err: any) {
      error(err.message || 'Không thể hoàn thành đơn hàng');
    }
  };

  const handleViewDetail = async (orderId: number) => {
    try {
      const res = await sellerOrderApi.getOrderDetail(orderId);
      if (res?.body) {
        setSelectedOrder(res.body);
      }
    } catch (err: any) {
      error(err.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  const tabs: { id: StatusType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Tất cả đơn' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Đã hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  // Stats calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const shippingCount = orders.filter((o) => o.status === 'SHIPPING').length;

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-enter min-h-screen bg-slate-50/70 py-8 px-4 sm:px-8 pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Đơn Hàng Của Shop
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi, xác nhận và xử lý đóng gói vận chuyển cho khách hàng ({totalElements} đơn hàng)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => syncOrders(page)}
              className="text-xs py-2 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Làm mới danh sách
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Doanh thu trang</span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-2 truncate">
              {formatVND(totalRevenue)}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chờ xác nhận</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-amber-600 mt-2">
              {pendingCount}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Đang giao hàng</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Truck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-blue-600 mt-2">
              {shippingCount}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng số đơn</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-600 mt-2">
              {totalElements}
            </p>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã đơn, Tên người mua..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Mã đơn & Ngày đặt</th>
                  <th className="py-3.5 px-6">Khách hàng</th>
                  <th className="py-3.5 px-6">Số lượng</th>
                  <th className="py-3.5 px-6">Thanh toán</th>
                  <th className="py-3.5 px-6">Tổng tiền</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="animate-spin w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-2" />
                      <span>Đang tải danh sách đơn hàng...</span>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-sm">Chưa có đơn hàng nào</p>
                      <p className="text-[11px] mt-0.5">Các đơn hàng mới của khách sẽ xuất hiện ở đây</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900 block">
                          #{order.orderNumber}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.createdDate)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900">{order.buyerName}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {order.totalItems} sản phẩm
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 inline-block">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`text-[10px] block font-semibold ${
                              order.paymentStatus === 'COMPLETED'
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {order.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {formatVND(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(order.orderId)}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Action: Confirm */}
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(order.orderId, order.orderNumber)}
                              className="text-xs py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs transition-all"
                            >
                              Xác nhận đơn
                            </button>
                          )}

                          {/* Action: Ship */}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleShip(order.orderId, order.orderNumber)}
                              className="text-xs py-1 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs transition-all"
                            >
                              Giao ĐVVC
                            </button>
                          )}

                          {/* Action: Complete */}
                          {order.status === 'SHIPPING' && (
                            <button
                              onClick={() => handleComplete(order.orderId, order.orderNumber)}
                              className="text-xs py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs transition-all"
                            >
                              Giao thành công
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hiển thị trang {page + 1} / {totalPages} ({totalElements} đơn)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Chi Tiết Đơn Hàng #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(selectedOrder.createdDate)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                {/* Customer info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>Thông tin người nhận:</span>
                  </h4>
                  <p className="text-slate-900 font-semibold">
                    {selectedOrder.receiverName}{' '}
                    <span className="font-mono text-slate-500 font-normal">
                      ({selectedOrder.receiverPhone})
                    </span>
                  </p>
                  <p className="text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.shippingAddress}</span>
                  </p>
                  {selectedOrder.note && (
                    <p className="text-amber-700 bg-amber-50 p-2 rounded-xl mt-2 border border-amber-200/60">
                      <strong>Lời nhắn:</strong> {selectedOrder.note}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Danh sách sản phẩm:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.productPictureUrl || 'https://picsum.photos/seed/item/100/100'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">
                              {item.productName}
                            </p>
                            {item.variantName && (
                              <p className="text-[11px] text-slate-400">{item.variantName}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          {formatVND(item.price)} x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hình thức thanh toán:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái thanh toán:</span>
                    <span
                      className={`font-bold ${
                        selectedOrder.paymentStatus === 'COMPLETED'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {selectedOrder.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 'Chưa thanh toán (COD)'}
                    </span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Mã giao dịch:</span>
                      <span>{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </div>

                {/* Status & Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                  <span>Trạng thái đơn:</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="flex items-center justify-between text-base font-black text-slate-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span>{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-ghost flex-1 text-xs py-2.5"
                >
                  Đóng
                </button>
                {selectedOrder.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(selectedOrder.orderId, selectedOrder.orderNumber)}
                    className="btn-primary flex-1 text-xs py-2.5 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  >
                    Xác nhận đơn ngay
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleShip(selectedOrder.orderId, selectedOrder.orderNumber)}
                    className="btn-primary flex-1 text-xs py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    Giao ĐVVC ngay
                  </button>
                )}
                {selectedOrder.status === 'SHIPPING' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(selectedOrder.orderId, selectedOrder.orderNumber)}
                    className="btn-primary flex-1 text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    Giao thành công
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
