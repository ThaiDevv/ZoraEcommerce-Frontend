import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ArrowLeft, PackageCheck, Package, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SellerHeader: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const savedShopName = (() => {
    try {
      const saved = localStorage.getItem('seller_shop');
      if (saved) return JSON.parse(saved).name;
    } catch {}
    return user?.fullName ? `Shop của ${user.fullName}` : 'Zora Official Store';
  })();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Seller Title */}
          <div className="flex items-center gap-4">
            <Link to="/seller/products" className="flex items-center gap-2.5">
              <img
                src="/logo-icon.png"
                alt="ZoraEcommerce Seller"
                className="w-9 h-9 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight">
                  ZoraEcommerce Seller
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Kênh Quản Lý Người Bán</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 ml-6 border-l border-slate-200 pl-6">
              <Link
                to="/seller/products"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/seller/products'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Quản Lý Sản Phẩm</span>
              </Link>

              <Link
                to="/seller/inventory"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/seller/inventory')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Quản Lý Kho Hàng</span>
              </Link>

              <Link
                to="/seller/orders"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/seller/orders')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Quản Lý Đơn Hàng</span>
              </Link>

              <Link
                to="/seller/shop"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/seller/shop')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Hồ Sơ Shop</span>
              </Link>
            </nav>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg max-w-[200px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">Shop: <strong>{savedShopName}</strong></span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-white shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về sàn mua sắm</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
