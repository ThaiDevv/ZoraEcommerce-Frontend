import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  UserCheck,
  UserX,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { UserResponse } from '../types/auth';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers(0, 50);
      if (res?.body?.items) {
        setUsers(res.body.items);
        setTotalUsers(res.body.totalElements || res.body.items.length);
      }
    } catch (err) {
      console.warn('Could not load stats from adminApi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const lockedUsers = users.filter((u) => u.isActive === false).length;
  const sellerUsers = users.filter((u) => u.role?.includes('SELLER')).length;

  return (
    <div className="page-enter py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Hệ thống quản trị
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Xin chào <strong className="text-slate-700">{user?.fullName || user?.username || 'Admin'}</strong>. Giám sát số liệu người dùng và phân quyền vận hành ZoraEcommerce.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium transition-colors shadow-2xs"
          >
            <FolderTree className="w-4 h-4 text-slate-600" />
            <span>Quản lý danh mục</span>
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Quản lý người dùng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── System Rule Notice ────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
        <div>
          <span className="font-semibold text-slate-900">Quy chuẩn vai trò Quản trị viên:</span> Tài khoản Admin được cấu hình độc lập để vận hành hệ thống, không tham gia giỏ hàng mua sắm và không thể đăng ký gian hàng Người bán (Seller).
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tổng tài khoản</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalUsers}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Đã đăng ký trong hệ thống</p>
        </div>

        {/* Active Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Đang hoạt động</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{activeUsers}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Trạng thái Active bình thường</p>
        </div>

        {/* Locked Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tài khoản bị khóa</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{lockedUsers}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Đã vô hiệu hóa đăng nhập</p>
        </div>

        {/* Sellers */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tài khoản Người Bán</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{sellerUsers}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Có vai trò ROLE_SELLER</p>
        </div>
      </div>

      {/* ── Recent Users Preview ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Người dùng mới cập nhật
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các tài khoản gần đây trên hệ thống
            </p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả người dùng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Chưa có người dùng nào.</p>
          ) : (
            users.slice(0, 5).map((u) => {
              const isActive = u.isActive !== false;
              return (
                <div key={u.email} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                      {(u.fullName || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-xs text-slate-900 block">
                        {u.fullName || u.username}
                      </span>
                      <span className="text-slate-500 text-[11px]">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {u.role || 'BUYER'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                    >
                      {isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
