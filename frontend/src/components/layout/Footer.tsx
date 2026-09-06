import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
      {/* Footer Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-bold text-xl">
              <img
                src="/logo-icon.png"
                alt="ZoraEcommerce"
                className="w-8 h-8 object-contain"
              />
              <span>Zora<span className="text-slate-500 font-normal">Ecommerce</span></span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Nền tảng thương mại điện tử thế hệ mới, cam kết 100% hàng chính hãng, giao hỏa tốc 2 giờ và bảo đảm hoàn tiền 200%.
            </p>
            <div className="space-y-1.5 text-slate-500 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Vinhome Smart City, Nam Từ Liêm, Hà Nội</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Hotline: 1900 8888 (8:00 - 22:00)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@zoraecommerce.vn</span>
              </p>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Chăm Sóc Khách Hàng</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Chính sách vận chuyển & giao nhận</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Quy chế đổi trả 15 ngày</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Chính sách bảo mật thanh toán</Link></li>
            </ul>
          </div>

          {/* About ZoraEcommerce */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Về ZoraEcommerce</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Giới thiệu về ZoraEcommerce Mall</Link></li>
              <li><Link to="/seller/orders" className="hover:text-slate-900 transition-colors">Kênh bán hàng cùng ZoraEcommerce</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Chương trình tiếp thị liên kết</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Tuyển dụng nhân tài 2026</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Liên hệ truyền thông & hợp tác</Link></li>
            </ul>
          </div>

          {/* Payments & Security */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Phương Thức Thanh Toán</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['VNPAY-QR', 'COD Tiền mặt', 'Ví MoMo', 'Visa / Mastercard', 'Napas ATM'].map((m) => (
                <span key={m} className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                  {m}
                </span>
              ))}
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-2">Đơn Vị Vận Chuyển</h4>
            <div className="flex flex-wrap gap-2">
              {['SPX Express', 'Giao Hàng Nhanh', 'Giao Hàng Tiết Kiệm', 'Viettel Post'].map((m) => (
                <span key={m} className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 ZoraEcommerce Corporation. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Điều khoản dịch vụ</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Chính sách quyền riêng tư</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Tiêu chuẩn cộng đồng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
