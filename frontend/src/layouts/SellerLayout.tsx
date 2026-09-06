import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { SellerHeader } from '../components/layout/SellerHeader';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { SellerOnboardingPage } from '../pages/SellerOnboardingPage';
import { Store, LogIn, Lock, ShieldAlert } from 'lucide-react';

export const SellerLayout: React.FC = () => {
  const { user, role, isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  // 1. If not logged in, prompt user to login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Zora Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-900">ZoraEcommerce Seller</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            ← Về trang chủ
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-slate-200 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Đăng nhập Kênh Người Bán</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Bạn cần đăng nhập tài khoản ZoraEcommerce để truy cập các tính năng quản lý gian hàng và đơn hàng.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 1.5. Admin cannot become a seller
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-800">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">ZoraAdmin Console</span>
          </Link>
          <Link to="/admin" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            ← Về Admin Console
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-xs border border-slate-200 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">Giới hạn đặc quyền Admin</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tài khoản hiện tại có vai trò <strong>ROLE_ADMIN</strong>. Quản trị viên hệ thống không được phép đăng ký mở gian hàng hoặc trở thành Người Bán (Seller).
            </p>
            <Link
              to="/admin"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Trở về Bảng điều khiển Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. If logged in but not SELLER role, show onboarding page to register shop
  const isSeller =
    user?.role?.includes('SELLER') ||
    role === 'SELLER' ||
    user?.role === 'SELLER' ||
    user?.role === 'ROLE_SELLER';

  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Zora Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-900">
              ZoraEcommerce Seller Onboarding
            </span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            ← Về trang chủ
          </Link>
        </header>

        <div className="flex-1">
          <SellerOnboardingPage />
        </div>
        <Footer />
      </div>
    );
  }

  // 3. User is authorized SELLER, render seller portal
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <SellerHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
