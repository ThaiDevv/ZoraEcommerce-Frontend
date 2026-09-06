import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  Store,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  XCircle,
  ShieldCheck,
  Phone,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { DetailOrderResponse, StatusType } from '../types/order';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatVND, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { addToCart } = useCart();

  const [order, setOrder] = useState<DetailOrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Tôi muốn thay đổi địa chỉ nhận hàng');
  const [customReason, setCustomReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);

  const fetchOrderDetail = () => {
    if (!id) return;
    setLoading(true);
    orderApi
      .getOrderDetail(id)
      .then((res) => {
        if (res?.body) {
          setOrder(res.body);
        } else {
          setOrder(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load order detail', err);
        setOrder(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    const finalReason = cancelReason === 'Khác' ? customReason.trim() || 'Lý do khác' : cancelReason;

    try {
      await orderApi.cancelOrder(order.orderId, finalReason);
      success('Đã hủy đơn hàng thành công', `Đơn #${order.orderNumber} đã chuyển sang trạng thái Đã hủy.`);
      setShowCancelModal(false);
      fetchOrderDetail();
    } catch (err: any) {
      error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    try {
      for (const item of order.orderItemResponses) {
        await addToCart(item.productId, item.quantity);
      }
      navigate('/cart');
    } catch (err: any) {
      error(err.message || 'Không thể mua lại sản phẩm');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="animate-spin w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full mx-auto mb-3" />
        <span className="text-xs text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center justify-center py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Quay lại danh sách đơn
        </Link>
      </div>
    );
  }

  const steps: { key: StatusType; label: string; icon: any }[] = [
    { key: 'PENDING', label: 'Đặt hàng thành công', icon: Clock },
    { key: 'CONFIRMED', label: 'Shop xác nhận', icon: CheckCircle2 },
    { key: 'SHIPPING', label: 'Đang vận chuyển', icon: Truck },
    { key: 'DELIVERED', label: 'Giao thành công', icon: Check },
  ];

  const getStepIndex = (status: StatusType) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'SHIPPING':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.statusType);

  return (
    <div className="page-enter min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Chi Tiết Đơn Hàng #{order.orderNumber}
                </h1>
                <StatusBadge status={order.statusType} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Đặt ngày: {formatDate(order.createdDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {order.statusType === 'PENDING' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-xs py-1.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
              >
                Hủy đơn hàng
              </button>
            )}

            {order.statusType === 'DELIVERED' && (
              <button
                onClick={handleReorder}
                className="text-xs py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mua lại</span>
              </button>
            )}

            <Link
              to="/orders"
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold transition-colors shadow-xs"
            >
              Quay lại
            </Link>
          </div>
        </div>

        {/* ── Order Timeline Stepper ───────────────────────────────────── */}
        {order.statusType !== 'CANCELLED' && order.statusType !== 'REFUNDED' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-4 relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-0">
                <div
                  className="h-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${(Math.max(0, currentStep) / 3) * 100}%` }}
                />
              </div>

              {steps.map((s, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-slate-900/10 scale-105' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs mt-2 font-semibold ${
                        isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 rounded-3xl border border-rose-200 p-6 text-center text-rose-800">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <h3 className="font-bold text-sm">Đơn hàng này đã bị hủy</h3>
            <p className="text-xs text-rose-600 mt-0.5">
              Đơn hàng không tiếp tục xử lý.
            </p>
          </div>
        )}

        {/* ── Shipping & Payment Info ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Địa chỉ nhận hàng</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {order.nameReceive}{' '}
              <span className="font-mono text-slate-500 font-normal">({order.phoneReceive})</span>
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{order.address}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Phương thức thanh toán</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {order.method === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'VNPAY-QR / Chuyển khoản'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {order.method === 'COD'
                ? 'Shipper sẽ thu tiền mặt khi giao hàng'
                : 'Đã thanh toán điện tử'}
            </p>
            {order.transactionId && (
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Mã giao dịch: {order.transactionId}
              </p>
            )}
          </div>
        </div>

        {/* ── Items List ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            {order.logoUrl ? (
              <img
                src={order.logoUrl}
                alt={order.shopName}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <Store className="w-4 h-4 text-slate-700" />
            )}
            <h3 className="text-xs font-bold text-slate-900">{order.shopName}</h3>
          </div>

          <div className="divide-y divide-slate-100 py-2">
            {order.orderItemResponses.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
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
                  {formatVND(item.subtotal || item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Calculations */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold text-slate-900">{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-slate-900">
                {order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Giảm giá:</span>
                <span>-{formatVND(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-sm">
              <span className="font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatVND(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Hủy đơn hàng</h3>
            <p className="text-xs text-slate-500 mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng #{order.orderNumber}?
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
                onClick={() => setShowCancelModal(false)}
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
  );
};
