import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
} from 'lucide-react';
import { shopApi } from '../api/shopApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SellerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập tên gian hàng / Shop của bạn.');
      return;
    }

    setLoading(true);
    try {
      const res = await shopApi.createShop({
        name: name.trim(),
        description: description.trim(),
      });

      if (res?.body) {
        localStorage.setItem('seller_shop', JSON.stringify(res.body));
      }

      // Upgrade user role in context & storage
      updateUser({ role: 'ROLE_SELLER' });
      success('Đăng ký thành công!', `Chào mừng ${name.trim()} gia nhập nền tảng bán hàng ZoraEcommerce!`);
      navigate('/seller/products', { replace: true });
    } catch (err: any) {
      error('Không thể tạo Shop', err.message || 'Có lỗi xảy ra khi tạo gian hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 bg-[#fafafa] flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Perks & Introduction */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Chương trình đối tác người bán 2026</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Mở gian hàng <span className="text-slate-900 underline decoration-slate-300 underline-offset-8">ZoraEcommerce</span> trong 2 phút
              </h1>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Tiếp cận hàng triệu khách hàng trực tuyến mỗi ngày. Công cụ quản lý đơn hàng, kho bãi và sản phẩm chuyên nghiệp hoàn toàn miễn phí.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-900 text-white shrink-0 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">0% Phí duy trì gian hàng</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Không mất phí mở shop ban đầu, hưởng mức chiết khấu ưu đãi nhất thị trường.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Quản lý sản phẩm & tồn kho đa biến thể</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Dễ dàng thêm mẫu mã, kích thước, màu sắc và tự động cập nhật số lượng tồn kho.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bảo vệ quyền lợi nhà bán</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Chính sách thanh toán định kỳ an toàn, bảo vệ trước các đơn hàng hoàn ảo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-xs border border-slate-200/80 relative">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Đăng ký mở gian hàng mới</h2>
                  <p className="text-xs text-slate-500">Chỉ dành cho tài khoản người dùng đã đăng nhập</p>
                </div>
              </div>

              {/* Owner preview info */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="text-slate-400 font-medium block text-xs">Tài khoản đại diện:</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="font-bold text-slate-900 text-sm truncate max-w-[200px]">
                      {user?.fullName || user?.username}
                    </span>
                    {user?.email && (
                      <span className="text-slate-500 text-xs truncate max-w-[220px]">
                        ({user.email})
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs whitespace-nowrap">
                    <span>Người mua</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-900">Người bán</span>
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tên gian hàng / Shop <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Zora Tech Store, Thời Trang Phong Cách..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Tên này sẽ hiển thị công khai trên sàn thương mại điện tử.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mô tả gian hàng
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả các sản phẩm, thương hiệu hoặc thế mạnh của shop bạn..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Đang khởi tạo gian hàng...</span>
                    ) : (
                      <>
                        <Store className="w-4 h-4" />
                        <span>Kích hoạt gian hàng & Bắt đầu bán</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    ← Trở về sàn mua sắm
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboardingPage;
