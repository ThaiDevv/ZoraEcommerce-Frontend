import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowLeft,
  Banknote,
  Smartphone,
  ShieldCheck,
  QrCode,
  Store,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { useCart } from '../context/CartContext';
import { PaymentMethod } from '../types/payment';
import { AddressResponse } from '../types/auth';
import { formatVND } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { cart, clearCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const savedItemIdsStr = sessionStorage.getItem('checkoutItemIds');
  const selectedItemIds: number[] = savedItemIdsStr ? JSON.parse(savedItemIdsStr) : [];
  const discountAmount = Number(sessionStorage.getItem('checkoutDiscount') || 0);

  // Selected items from cart
  const selectedItems =
    cart?.shopGroups?.flatMap((g) =>
      g.cartItems.filter((item) =>
        selectedItemIds.length > 0 ? selectedItemIds.includes(item.id) : true
      )
    ) || [];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Address state
  const [addressList, setAddressList] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);
  const [creatingAddress, setCreatingAddress] = useState<boolean>(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });

  const loadAddresses = async () => {
    try {
      const res = await userApi.getAddresses();
      if (res?.body && res.body.length > 0) {
        setAddressList(res.body);
        const def = res.body.find((a) => a.isDefault) || res.body[0];
        setSelectedAddress(def);
      } else {
        setAddressList([]);
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.fullName.trim() || !newAddressForm.phone.trim() || !newAddressForm.street.trim() || !newAddressForm.city.trim()) {
      error('Vui lòng điền họ tên, số điện thoại, địa chỉ và tỉnh/thành phố');
      return;
    }

    setCreatingAddress(true);
    try {
      const res = await userApi.createAddress({
        fullName: newAddressForm.fullName.trim(),
        phone: newAddressForm.phone.trim(),
        street: newAddressForm.street.trim(),
        ward: newAddressForm.ward.trim() || undefined,
        district: newAddressForm.district.trim() || undefined,
        city: newAddressForm.city.trim(),
        isDefault: addressList.length === 0,
      });

      if (res?.body) {
        success('Đã thêm địa chỉ giao hàng mới!');
        await loadAddresses();
        setSelectedAddress(res.body);
        setShowNewAddressForm(false);
        setShowAddressModal(false);
        setNewAddressForm({
          fullName: '',
          phone: '',
          street: '',
          ward: '',
          district: '',
          city: '',
        });
      }
    } catch (err: any) {
      error(err.message || 'Không thể tạo địa chỉ mới');
    } finally {
      setCreatingAddress(false);
    }
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handlePlaceOrder = async () => {
    if (isAdmin) {
      error('Tài khoản Quản trị viên (Admin) không được phép đặt hàng');
      return;
    }
    if (selectedItems.length === 0) {
      error('Giỏ hàng trống hoặc chưa chọn sản phẩm nào!');
      return;
    }
    if (!selectedAddress) {
      error('Vui lòng thêm hoặc chọn địa chỉ nhận hàng trước khi đặt hàng!');
      setShowAddressModal(true);
      setShowNewAddressForm(true);
      return;
    }

    setSubmitting(true);

    try {
      await orderApi.createOrder({
        addressId: selectedAddress.id,
        voucherId: null,
        paymentMethod: paymentMethod,
        note: note.trim() || undefined,
        cartItemIds: selectedItems.map((i) => i.id),
      });

      await clearCart();
      sessionStorage.removeItem('checkoutItemIds');
      sessionStorage.removeItem('checkoutDiscount');
      setSubmitting(false);

      success('Đặt hàng thành công!', `Tổng thanh toán: ${formatVND(totalAmount)}`);
      navigate('/orders');
    } catch (err: any) {
      setSubmitting(false);
      error(err.message || 'Không thể tạo đơn hàng, vui lòng thử lại!');
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Chưa có sản phẩm nào được chọn</h2>
          <p className="text-xs text-slate-500 mb-6">
            Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm để tiến hành thanh toán.
          </p>
          <Link to="/cart" className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all">
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <Link to="/cart" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Xác Nhận Đặt Hàng & Thanh Toán
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Order Forms */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Shipping Address Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Địa chỉ nhận hàng
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  {selectedAddress ? 'Thay đổi' : '+ Thêm địa chỉ'}
                </button>
              </div>

              {selectedAddress ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {selectedAddress.fullName}{' '}
                      <span className="font-mono text-slate-500 font-normal">
                        ({selectedAddress.phone})
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedAddress.street}
                      {selectedAddress.ward ? `, ${selectedAddress.ward}` : ''}
                      {selectedAddress.district ? `, ${selectedAddress.district}` : ''}
                      {selectedAddress.city ? `, ${selectedAddress.city}` : ''}
                    </p>
                  </div>
                  {selectedAddress.isDefault && (
                    <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      Mặc định
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Chưa có địa chỉ nhận hàng</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                    Vui lòng thêm địa chỉ để tiếp tục đặt hàng
                  </p>
                  <button
                    onClick={() => {
                      setShowAddressModal(true);
                      setShowNewAddressForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm địa chỉ nhận hàng</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Items Preview */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Sản phẩm đặt mua ({selectedItems.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.productName}</h4>
                        <p className="text-[11px] text-slate-400">Phân loại: {item.variantName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Số lượng: x{item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 shrink-0">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Phương thức thanh toán
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('VNPAY');
                    setShowQrModal(true);
                  }}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'VNPAY'
                      ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">VNPAY-QR / Chuyển khoản</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử
                    </p>
                  </div>
                </button>
              </div>

              {/* Order note */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lời nhắn cho người bán / Shipper:
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  className="input-modern text-xs py-2"
                />
              </div>
            </div>
          </div>

          {/* Right Col: Summary & Place Order */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-5">
              <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Chi Tiết Thanh Toán
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-900">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-slate-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      formatVND(shippingFee)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-sm">
                  <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {submitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo vệ quyền lợi người mua 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection / Creation Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {showNewAddressForm ? 'Thêm Địa Chỉ Nhận Hàng' : 'Địa Chỉ Của Tôi'}
              </h3>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setShowNewAddressForm(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleCreateAddress} className="py-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.fullName}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="input-modern text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      placeholder="Ví dụ: 0912345678"
                      className="input-modern text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    placeholder="Ví dụ: Hà Nội hoặc TP. Hồ Chí Minh"
                    className="input-modern text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quận / Huyện</label>
                    <input
                      type="text"
                      value={newAddressForm.district}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                      placeholder="Ví dụ: Quận Cầu Giấy"
                      className="input-modern text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phường / Xã</label>
                    <input
                      type="text"
                      value={newAddressForm.ward}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, ward: e.target.value })}
                      placeholder="Ví dụ: Phường Dịch Vọng"
                      className="input-modern text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Địa chỉ chi tiết (Tòa nhà, số nhà, đường) *</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.street}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                    placeholder="Ví dụ: 123 Đường Cầu Giấy"
                    className="input-modern text-xs py-2"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="btn-ghost flex-1 text-xs py-2.5"
                  >
                    Quay lại danh sách
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAddress}
                    className="btn-primary flex-1 text-xs py-2.5 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {creatingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-4 space-y-3">
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {addressList.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressModal(false);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">
                            {addr.fullName}{' '}
                            <span className="font-mono text-slate-500 font-normal">({addr.phone})</span>
                            {addr.isDefault && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                Mặc định
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                            {addr.street}
                            {addr.ward ? `, ${addr.ward}` : ''}
                            {addr.district ? `, ${addr.district}` : ''}
                            {addr.city ? `, ${addr.city}` : ''}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm địa chỉ nhận hàng mới</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VNPAY QR Modal Simulator */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Mã VNPAY-QR Thanh Toán</h3>
            <p className="text-xs text-slate-400 mb-4">Quét mã bằng ứng dụng ngân hàng bất kỳ</p>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block mb-4">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ZORASHOP-VNPAY-DEMO"
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-sm font-extrabold text-slate-900 mb-4">
              Số tiền: {formatVND(totalAmount)}
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
            >
              Đã hiểu & Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
