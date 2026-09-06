import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { UserResponse } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'BUYER' | 'SELLER' | 'ADMIN'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Confirmation modal for toggling active
  const [targetUser, setTargetUser] = useState<UserResponse | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers(page, pageSize);
      if (res?.body?.items) {
        setUsers(res.body.items);
        setTotalPages(res.body.totalPages || 1);
        setTotalElements(res.body.totalElements || res.body.items.length);
      } else {
        setUsers([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách người dùng:', err);
      error('Không thể tải người dùng', err.message || 'Lỗi kết nối máy chủ.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  // Handle Toggle Active
  const handleToggleActive = async () => {
    if (!targetUser) return;

    // Prevent admin from locking their own account
    if (targetUser.email === currentAdmin?.email) {
      error('Không được phép', 'Bạn không thể tự khóa tài khoản Admin đang đăng nhập.');
      setTargetUser(null);
      return;
    }

    setToggling(true);
    try {
      const res = await adminApi.changeActive(targetUser.email);
      const updatedUser = res?.body;
      const isNowActive = updatedUser ? updatedUser.isActive : !targetUser.isActive;

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.email === targetUser.email ? { ...u, isActive: isNowActive } : u
        )
      );

      if (isNowActive) {
        success('Mở khóa thành công', `Tài khoản ${targetUser.email} đã được kích hoạt lại.`);
      } else {
        info('Đã khóa tài khoản', `Tài khoản ${targetUser.email} đã bị vô hiệu hóa truy cập.`);
      }
    } catch (err: any) {
      error('Thao tác thất bại', err.message || 'Không thể thay đổi trạng thái tài khoản.');
    } finally {
      setToggling(false);
      setTargetUser(null);
    }
  };

  // Filtered in-memory for responsive search & filtering
  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchUsername = u.username?.toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchPhone && !matchUsername) {
        return false;
      }
    }

    if (selectedRole !== 'ALL') {
      const roleStr = u.role?.toUpperCase() || '';
      if (!roleStr.includes(selectedRole)) return false;
    }

    if (selectedStatus !== 'ALL') {
      const isActive = u.isActive !== false;
      if (selectedStatus === 'ACTIVE' && !isActive) return false;
      if (selectedStatus === 'INACTIVE' && isActive) return false;
    }

    return true;
  });

  const activeCount = users.filter((u) => u.isActive !== false).length;
  const lockedCount = users.filter((u) => u.isActive === false).length;
  const sellerCount = users.filter((u) => u.role?.includes('SELLER')).length;

  return (
    <div className="page-enter py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Quản trị tài khoản
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Danh sách người dùng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu thông tin, phân quyền và kiểm soát kích hoạt tài khoản trên hệ thống ZoraEcommerce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* ── Metric Highlights ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Tổng tài khoản trang</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Trên trang hiển thị hiện tại</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Đang hoạt động</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Bình thường</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Tài khoản bị khóa</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{lockedCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Vô hiệu hóa đăng nhập</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Người Bán (Seller)</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{sellerCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Đã có vai trò SELLER</span>
        </div>
      </div>

      {/* ── Filter & Search Bar ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Email, Họ tên, Username..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Role Select */}
        <div className="w-full sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="BUYER">Người mua (BUYER)</option>
            <option value="SELLER">Người bán (SELLER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        {/* Status Select */}
        <div className="w-full sm:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã bị khóa</option>
          </select>
        </div>
      </div>

      {/* ── Main Users Table ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4 sm:px-6">Người Dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                    <p className="text-xs">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700 text-xs">Không tìm thấy người dùng phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.'
                        : 'Chưa có người dùng nào trong cơ sở dữ liệu.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.isActive !== false;
                  const roleStr = u.role?.toUpperCase() || 'BUYER';
                  const isCurrent = u.email === currentAdmin?.email;

                  return (
                    <tr
                      key={u.email || u.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName || u.email}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (u.fullName || u.username || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 truncate max-w-[150px] block">
                                {u.fullName || u.username || 'Chưa đặt tên'}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  BẠN
                                </span>
                              )}
                            </div>
                            {u.username && (
                              <span className="text-[11px] text-slate-400 block truncate">
                                @{u.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 text-xs truncate max-w-[180px] block">
                          {u.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-500 text-xs">
                          {u.phone || '—'}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {roleStr.includes('ADMIN') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-white">
                            <ShieldAlert className="w-3 h-3" />
                            <span>ADMIN</span>
                          </span>
                        ) : roleStr.includes('SELLER') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            <span>SELLER</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <span>BUYER</span>
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Tài khoản hiện tại
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTargetUser(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                              isActive
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Mở khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ─────────────────────────────────── */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-800">{filteredUsers.length}</strong> / <strong className="text-slate-800">{totalElements}</strong> tài khoản
            {totalPages > 1 && ` (Trang ${page + 1}/${totalPages})`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>

            <span className="px-2 font-semibold text-slate-800">
              Trang {page + 1}
            </span>

            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal for Change Active ──────────────── */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  targetUser.isActive !== false
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}
              >
                {targetUser.isActive !== false ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {targetUser.isActive !== false
                    ? 'Xác nhận khóa tài khoản?'
                    : 'Xác nhận mở khóa tài khoản?'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {targetUser.isActive !== false
                    ? 'Người dùng này sẽ bị chặn đăng nhập và thao tác trên hệ thống ngay lập tức.'
                    : 'Người dùng sẽ được khôi phục quyền đăng nhập vào hệ thống.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{targetUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="text-slate-800">{targetUser.fullName || targetUser.username || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vai trò:</span>
                <span className="text-slate-900 font-semibold">{targetUser.role}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={toggling}
                onClick={() => setTargetUser(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={toggling}
                onClick={handleToggleActive}
                className={`py-2 px-4 rounded-xl font-medium text-xs text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  targetUser.isActive !== false
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {toggling ? (
                  <span>Đang xử lý...</span>
                ) : targetUser.isActive !== false ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Xác nhận khóa</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Xác nhận mở khóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
