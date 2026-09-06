import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  Store,
  ArrowLeft,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/format';
import { useToast } from '../context/ToastContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { success, error } = useToast();

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  // Sync selected items when cart loads or changes
  useEffect(() => {
    if (cart?.shopGroups) {
      const currentAllIds = cart.shopGroups.flatMap((g) => g.cartItems.map((i) => i.id));
      setSelectedItemIds((prev) => {
        // If nothing selected previously, select all by default
        if (prev.length === 0) return currentAllIds;
        // Keep valid IDs that still exist in cart
        const valid = prev.filter((id) => currentAllIds.includes(id));
        return valid.length > 0 ? valid : currentAllIds;
      });
    } else {
      setSelectedItemIds([]);
    }
  }, [cart]);

  // Toggle single item
  const toggleItem = (id: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle all items in a shop
  const toggleShop = (shopItemIds: number[]) => {
    const allSelected = shopItemIds.every((id) => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !shopItemIds.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...shopItemIds])));
    }
  };

  // Toggle all items in cart
  const allCartItemIds =
    cart?.shopGroups?.flatMap((g) => g.cartItems.map((item) => item.id)) || [];
  const isAllSelected =
    allCartItemIds.length > 0 && allCartItemIds.every((id) => selectedItemIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(allCartItemIds);
    }
  };

  // Handle Clear Cart (DELETE /api/v1/cart)
  const handleConfirmClearCart = async () => {
    try {
      setActionLoading(true);
      setShowClearConfirm(false);
      await clearCart();
      setSelectedItemIds([]);
    } catch {
      error('Không thể làm trống giỏ hàng');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Selected Items (DELETE /api/v1/cart/item/{id})
  const handleDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;
    try {
      setActionLoading(true);
      for (const id of selectedItemIds) {
        await removeItem(id);
      }
      setSelectedItemIds([]);
    } catch {
      error('Không thể xóa các sản phẩm đã chọn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'FREESHIP' || code === 'FREESHIP50K') {
      setDiscountAmount(35000);
      setAppliedVoucher(code);
      success('Áp dụng mã thành công!', 'Bạn được miễn phí 35.000₫ vận chuyển.');
    } else if (code === 'ZORA100K') {
      setDiscountAmount(100000);
      setAppliedVoucher(code);
      success('Áp dụng mã thành công!', 'Bạn được giảm trực tiếp 100.000₫.');
    } else {
      error('Mã giảm giá không hợp lệ', 'Vui lòng thử mã FREESHIP50K hoặc ZORA100K');
    }
  };

  // Calculate total amount for selected items
  const selectedTotal =
    cart?.shopGroups?.reduce((total, group) => {
      const groupSum = group.cartItems
        .filter((item) => selectedItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      return total + groupSum;
    }, 0) || 0;

  const shippingFee = selectedTotal > 500000 ? 0 : 30000;
  const finalTotal = Math.max(0, selectedTotal + shippingFee - discountAmount);

  const handleProceedCheckout = () => {
    if (isAdmin) {
      error('Tài khoản Quản trị viên (Admin) không được phép thanh toán đặt hàng');
      return;
    }
    if (selectedItemIds.length === 0) {
      error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      return;
    }
    sessionStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
    sessionStorage.setItem('checkoutDiscount', JSON.stringify(discountAmount));
    navigate('/checkout');
  };

  // ── State 1: User Not Logged In ───────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Vui lòng đăng nhập tài khoản để xem, đồng bộ và quản lý các sản phẩm trong giỏ hàng của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── State 2: Admin Account Notice ─────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-amber-200 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Tài khoản Quản trị viên (Admin)</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Tài khoản Admin không được phép sử dụng tính năng mua hàng hoặc giỏ hàng. Vui lòng đăng nhập tài khoản người mua (Buyer) để trải nghiệm tính năng giỏ hàng.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
          >
            Đến bảng điều khiển Admin
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.shopGroups || cart.shopGroups.length === 0;

  // ── State 3: Empty Cart ───────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Hãy khám phá hàng ngàn ưu đãi chính hãng hấp dẫn tại ZoraShop ngay hôm nay.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  // ── State 4: Cart Items Loaded ────────────────────────────────────────
  return (
    <div className="page-enter min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Giỏ Hàng Của Bạn
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {(loading || actionLoading) && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                Đang đồng bộ...
              </span>
            )}
            <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              {cart.totalItem} sản phẩm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Col: Multi-Store Grouped Cart Items ───────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Table Header Bar with Clear Cart Action */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900"
                />
                <span>Chọn tất cả ({allCartItemIds.length} sản phẩm)</span>
              </label>

              <div className="flex items-center gap-3 ml-auto">
                {selectedItemIds.length > 0 && (
                  <>
                    <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                      Đã chọn: <strong className="text-slate-900">{selectedItemIds.length}</strong>
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={actionLoading}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                      title="Xóa các mục đang được chọn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa đã chọn ({selectedItemIds.length})</span>
                    </button>
                    <span className="text-slate-300">|</span>
                  </>
                )}

                {/* DELETE /api/v1/cart Trigger */}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={actionLoading}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Xóa toàn bộ sản phẩm khỏi giỏ hàng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả giỏ hàng</span>
                </button>
              </div>
            </div>

            {/* Shop Groups (GET /api/v1/cart response) */}
            {cart.shopGroups.map((group) => {
              const shopItemIds = group.cartItems.map((i) => i.id);
              const isShopAllSelected =
                shopItemIds.length > 0 && shopItemIds.every((id) => selectedItemIds.includes(id));

              return (
                <div
                  key={group.shopId}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isShopAllSelected}
                        onChange={() => toggleShop(shopItemIds)}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900"
                      />
                      <Store className="w-4 h-4 text-slate-700" />
                      <span>{group.shopName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white">
                        MALL
                      </span>
                    </label>

                    <Link
                      to={`/shops/${group.shopId || 1}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Xem shop &gt;
                    </Link>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 px-5">
                    {group.cartItems.map((item) => {
                      const isChecked = selectedItemIds.includes(item.id);
                      const isMaxStock = item.quantity >= item.stock;

                      return (
                        <div
                          key={item.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(item.id)}
                              className="mt-1 w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900 cursor-pointer"
                            />

                            <img
                              src={item.imageUrl || 'https://picsum.photos/seed/cart/200/200'}
                              alt={item.productName}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                {item.productName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                  {item.variantName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SKU: {item.sku}
                                </span>
                                {item.stock <= 5 && (
                                  <span className="text-[10px] text-amber-600 font-medium">
                                    (Chỉ còn {item.stock} cái)
                                  </span>
                                )}
                              </div>
                              <div className="sm:hidden mt-2 flex items-baseline gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {formatVND(item.price)}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-xs text-slate-400 line-through">
                                    {formatVND(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Unit Price (Desktop) */}
                          <div className="hidden sm:block text-right w-28">
                            <p className="text-sm font-bold text-slate-900">{formatVND(item.price)}</p>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-[11px] text-slate-400 line-through">
                                {formatVND(item.originalPrice)}
                              </p>
                            )}
                          </div>

                          {/* Stepper (PUT /api/v1/cart/item/{id}?quantity=X) */}
                          <div className="flex items-center justify-between sm:justify-center gap-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1 || actionLoading}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  title="Giảm số lượng"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-9 text-center text-xs font-bold text-slate-800 font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={isMaxStock || actionLoading}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  title={isMaxStock ? `Đã đạt tối đa kho (${item.stock})` : 'Tăng số lượng'}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              {isMaxStock && (
                                <span className="text-[9px] text-amber-600 font-medium">
                                  Tối đa kho: {item.stock}
                                </span>
                              )}
                            </div>

                            {/* Line Total */}
                            <span className="text-sm font-extrabold text-slate-900 sm:w-28 text-right">
                              {formatVND(item.price * item.quantity)}
                            </span>

                            {/* Individual Delete Button (DELETE /api/v1/cart/item/{id}) */}
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={actionLoading}
                              title="Xóa sản phẩm này"
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right Col: Order Summary & Voucher ─────────────────────── */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-5">
              <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Tóm Tắt Đơn Hàng
              </h3>

              {/* Voucher Form */}
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mã giảm giá (FREESHIP50K)"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Áp dụng
                </button>
              </form>

              {appliedVoucher && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã áp dụng mã: {appliedVoucher}</span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedVoucher(null);
                      setDiscountAmount(0);
                    }}
                    className="text-slate-400 hover:text-rose-500 text-[11px] cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng ({selectedItemIds.length} món):</span>
                  <span className="font-bold text-slate-900">{formatVND(selectedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển dự kiến:</span>
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
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatVND(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                disabled={selectedItemIds.length === 0 || actionLoading}
                className="w-full py-3.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-40 cursor-pointer transition-all"
              >
                <span>TIẾN HÀNH ĐẶT HÀNG</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật thanh toán 100% qua SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Clear Entire Cart Confirmation Modal (DELETE /api/v1/cart) ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-2">
              Xóa toàn bộ giỏ hàng?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Thao tác này sẽ gọi API xóa tất cả {cart.totalItem} sản phẩm đang có trong giỏ hàng. Bạn không thể hoàn tác sau khi xác nhận.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmClearCart}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
