import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AdminHeader } from '../components/layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowLeft, Lock } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, role, isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated -> Prompt to login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">ZoraAdmin Console</span>
          </div>
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            ← Về trang chủ
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">Đăng nhập Quản trị viên</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Khu vực dành riêng cho Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản có thẩm quyền để tiếp tục.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but NOT ADMIN -> 403 Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">ZoraAdmin Console</span>
          </div>
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            ← Về trang chủ
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">Truy cập bị từ chối (403)</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tài khoản hiện tại (<strong className="text-slate-800">{user?.email}</strong>) không có quyền Quản trị viên (ROLE_ADMIN) để truy cập hệ thống này.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay về sàn thương mại</span>
              </Link>
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Đổi tài khoản khác</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is authorized ADMIN -> Render Admin Portal
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800">
      <AdminHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
