import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Layers, 
  Store, 
  UserCheck,
  RefreshCw,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi, { type AdminUserResponse } from '../../api/adminApi'
import type { CategoryResponse } from '../../types/product'

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersRes, catRes] = await Promise.all([
        adminApi.getUsers(0, 100),
        adminApi.getCategoryTree(),
      ])

      if (usersRes && usersRes.items) {
        setUsers(usersRes.items)
        setTotalUsers(usersRes.totalElements || usersRes.items.length)
      }
      if (Array.isArray(catRes)) {
        setCategories(catRes)
      }
    } catch (err: any) {
      console.error('Lỗi nạp dữ liệu dashboard admin:', err)
      setError('Không thể tải dữ liệu quản trị. Vui lòng kiểm tra quyền ADMIN.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const buyerCount = users.filter((u) => u.role === 'BUYER').length
  const sellerCount = users.filter((u) => u.role === 'SELLER').length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const activeCount = users.filter((u) => u.isActive).length
  const inactiveCount = users.filter((u) => !u.isActive).length

  const countAllCategories = (cats: CategoryResponse[]) => {
    let l1 = 0, l2 = 0, l3 = 0
    const traverse = (list: CategoryResponse[]) => {
      for (const item of list) {
        if (item.level === 1) l1++
        else if (item.level === 2) l2++
        else if (item.level === 3) l3++
        if (item.children && item.children.length > 0) {
          traverse(item.children)
        }
      }
    }
    traverse(cats)
    return { total: l1 + l2 + l3, l1, l2, l3 }
  }

  const catStats = countAllCategories(categories)

  return (
    <AdminLayout
      title="Tổng Quan Quản Trị"
      subtitle="Thống kê tài khoản người dùng và hệ thống danh mục sản phẩm."
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-slate-500">Số liệu cập nhật theo thời gian thực</span>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-md shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : 'text-slate-500'}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="bg-orange-50/80 border border-orange-200/60 text-slate-700 p-3.5 rounded-lg text-xs mb-5 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#ee4d2d] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tổng Người Dùng</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {isLoading ? '...' : totalUsers}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span>Hoạt động: <strong className="text-slate-800">{activeCount}</strong></span>
            <span>Bị khóa: <strong className="text-slate-500">{inactiveCount}</strong></span>
          </div>
        </div>

        
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Người Bán (SELLER)</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {isLoading ? '...' : sellerCount}
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Gian hàng đang hoạt động</span>
          </div>
        </div>

        
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Người Mua (BUYER)</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {isLoading ? '...' : buyerCount}
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Tài khoản mua sắm cá nhân</span>
          </div>
        </div>

        
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tổng Danh Mục</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {isLoading ? '...' : catStats.total}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span>Cấp 1: <strong>{catStats.l1}</strong></span>
            <span>Cấp 2: <strong>{catStats.l2}</strong></span>
            <span>Cấp 3: <strong>{catStats.l3}</strong></span>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Quản Lý Người Dùng</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">{totalUsers} tài khoản</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Buyer</span>
                <span className="font-bold text-slate-800">{buyerCount}</span>
              </div>
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Seller</span>
                <span className="font-bold text-slate-800">{sellerCount}</span>
              </div>
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Admin</span>
                <span className="font-bold text-slate-800">{adminCount}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/users"
            className="w-full py-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Quản Lý Người Dùng</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Quản Lý Danh Mục</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">{catStats.total} danh mục</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Cấp 1 (Gốc)</span>
                <span className="font-bold text-slate-800">{catStats.l1}</span>
              </div>
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Cấp 2 (Nhánh)</span>
                <span className="font-bold text-slate-800">{catStats.l2}</span>
              </div>
              <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Cấp 3 (Lá)</span>
                <span className="font-bold text-slate-800">{catStats.l3}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/categories"
            className="w-full py-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Cây Danh Mục Hàng Hóa</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ee4d2d]" />
            <h3 className="text-sm font-bold text-slate-900">Người Dùng Gần Đây</h3>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-[#ee4d2d] hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả ({totalUsers})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[11px]">
              <tr>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4 text-center">Vai Trò</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.slice(0, 5).map((u, idx) => (
                <tr key={u.email || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{u.fullName}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11.5px]">{u.email}</td>
                  <td className="py-2.5 px-4 text-slate-500">{u.phone || '—'}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      u.role === 'ADMIN'
                        ? 'bg-slate-800 text-slate-100'
                        : u.role === 'SELLER'
                        ? 'bg-orange-50 text-[#ee4d2d] border border-orange-200/60'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Bị khóa
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
