import { useState, useEffect, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi, { type AdminUserResponse } from '../../api/adminApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'BUYER' | 'SELLER' | 'ADMIN'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  // Modal confirm toggle active
  const [targetUser, setTargetUser] = useState<AdminUserResponse | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const fetchUsers = async (pageIdx = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await adminApi.getUsers(pageIdx, pageSize)
      if (res && res.items) {
        setUsers(res.items)
        setPage(pageIdx)
        setTotalPages(res.totalPages || 1)
        setTotalElements(res.totalElements || res.items.length)
      }
    } catch (err: any) {
      console.error('Lỗi nạp danh sách người dùng:', err)
      setError(
        err.response?.data?.message || 
        'Không thể lấy danh sách người dùng. Vui lòng kiểm tra quyền ADMIN.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page])

  // Filter users by keyword, role, status
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Keyword
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase().trim()
        const matchName = u.fullName?.toLowerCase().includes(q)
        const matchEmail = u.email?.toLowerCase().includes(q)
        const matchPhone = u.phone?.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchPhone) return false
      }

      // Role
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false
      }

      // Status
      if (statusFilter === 'ACTIVE' && !u.isActive) return false
      if (statusFilter === 'INACTIVE' && u.isActive) return false

      return true
    })
  }, [users, searchKeyword, roleFilter, statusFilter])

  const handleOpenToggleConfirm = (user: AdminUserResponse) => {
    setTargetUser(user)
    setIsConfirmModalOpen(true)
  }

  const handleExecuteToggleActive = async () => {
    if (!targetUser) return
    setIsToggling(true)
    try {
      const updated = await adminApi.toggleUserActive(targetUser.email)
      
      setUsers((prev) =>
        prev.map((u) => (u.email === targetUser.email ? { ...u, isActive: updated.isActive } : u))
      )

      setSuccessToast(
        updated.isActive
          ? `Đã mở khóa tài khoản cho "${targetUser.fullName}".`
          : `Đã khóa tài khoản của "${targetUser.fullName}".`
      )

      setIsConfirmModalOpen(false)
      setTargetUser(null)
      setTimeout(() => setSuccessToast(null), 3500)
    } catch (err: any) {
      console.error('Lỗi khi đổi trạng thái user:', err)
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <AdminLayout
      title="Quản Lý Người Dùng"
      subtitle="Danh sách tài khoản, phân loại vai trò và kiểm soát trạng thái hoạt động."
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-4 p-3 bg-slate-900 text-white rounded-md text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#ee4d2d] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-[#ee4d2d] rounded-md text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#ee4d2d] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white transition-colors"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200 text-xs">
            {(['ALL', 'BUYER', 'SELLER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-[#ee4d2d] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {r === 'ALL' ? 'Tất cả' : r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 outline-none focus:border-[#ee4d2d] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã bị khóa</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchUsers(page)}
            disabled={isLoading}
            className="h-9 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Tải lại</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[11px]">
              <tr>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4 text-center">Vai Trò</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#ee4d2d]" />
                      <span className="text-xs">Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-600">Không tìm thấy người dùng phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Info */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100 shrink-0"
                        />
                        <span className="font-semibold text-slate-900 truncate">{user.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-2.5 px-4 font-mono text-[11.5px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.phone || '—'}</span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-slate-800 text-slate-100'
                            : user.role === 'SELLER'
                            ? 'bg-orange-50 text-[#ee4d2d] border border-orange-200/60'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      {user.role === 'ADMIN' && user.email === 'admin@zorashop.com' ? (
                        <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                      ) : (
                        <button
                          onClick={() => handleOpenToggleConfirm(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                            user.isActive
                              ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              : 'bg-white border-orange-200 text-[#ee4d2d] hover:bg-orange-50'
                          }`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.isActive ? (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Khóa</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-[#ee4d2d]" />
                              <span>Mở khóa</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{totalElements}</strong> tài khoản (Trang <strong>{page + 1}</strong> / {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || isLoading}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const pageNumber = idx
              const isActive = page === pageNumber
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#ee4d2d] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              )
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"
              >
                {targetUser.isActive ? <Lock className="w-5 h-5 text-slate-600" /> : <Unlock className="w-5 h-5 text-[#ee4d2d]" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {targetUser.isActive ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{targetUser.fullName} ({targetUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {targetUser.isActive ? (
                <>
                  Bạn có chắc chắn muốn <strong className="text-slate-900">khóa tài khoản</strong> này? Người dùng sẽ không thể đăng nhập hoặc mua hàng.
                </>
              ) : (
                <>
                  Bạn có muốn <strong className="text-slate-900">mở khóa hoạt động</strong> cho tài khoản này?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false)
                  setTargetUser(null)
                }}
                disabled={isToggling}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteToggleActive}
                disabled={isToggling}
                className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  targetUser.isActive
                    ? 'bg-slate-800 hover:bg-slate-900'
                    : 'bg-[#ee4d2d] hover:bg-[#d73f1f]'
                }`}
              >
                {isToggling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{targetUser.isActive ? 'Xác nhận Khóa' : 'Xác nhận Mở khóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
