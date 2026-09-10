import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  ShoppingBag,
  Bell,
  Ticket,
  Search,
  Store,
  Package,
  CheckCircle2,
  RefreshCw,
  Plus,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import MainHeader from '../components/MainHeader'
import { authApi } from '../api/authApi'
import { orderApi } from '../api/orderApi'
import type { User } from '../types/auth'
import type { HistoryOrder, OrderStatus, AddressResponse } from '../types/order'

interface UserProfilePageProps {
  defaultTab?: 'profile' | 'orders' | 'address' | 'password'
}

export default function UserProfilePage({ defaultTab = 'profile' }: UserProfilePageProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine initial tab based on path or prop
  const getInitialTab = (): 'profile' | 'orders' | 'address' | 'password' => {
    if (location.pathname.includes('/orders')) return 'orders'
    if (location.pathname.includes('/address')) return 'address'
    if (location.pathname.includes('/password')) return 'password'
    return defaultTab
  }

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'address' | 'password'>(getInitialTab)
  const [activeOrderSubTab, setActiveOrderSubTab] = useState<string>('ALL')
  const [orderSearchKeyword, setOrderSearchKeyword] = useState<string>('')

  // User State
  const [user, setUser] = useState<User>({
    fullName: 'Thai Mua Do',
    email: 'thaimuado12@gmail.com',
    phone: '0987654321',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
    role: 'BUYER',
  })
  const [username, setUsername] = useState<string>('thaimuado12')
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE')
  const [birthDay, setBirthDay] = useState<string>('26')
  const [birthMonth, setBirthMonth] = useState<string>('10')
  const [birthYear, setBirthYear] = useState<string>('2002')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null)
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Orders State
  const [orders, setOrders] = useState<HistoryOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

  // Addresses State
  const [addresses, setAddresses] = useState<AddressResponse[]>([
    {
      id: 1,
      recipientName: 'Thai Mua Do',
      phone: '0987654321',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Thành',
      streetAddress: 'Số 123 Đường Nguyễn Trãi',
      isDefault: true,
    },
  ])

  // Sync tab with URL if navigated
  useEffect(() => {
    if (location.pathname.includes('/orders')) {
      setActiveTab('orders')
    } else if (location.pathname.includes('/address')) {
      setActiveTab('address')
    } else if (location.pathname.includes('/password')) {
      setActiveTab('password')
    } else if (location.pathname.includes('/profile')) {
      setActiveTab('profile')
    }
  }, [location.pathname])

  const applyProfileData = (data: any) => {
    setUser((prev) => ({
      ...prev,
      ...data,
      avatarUrl: data.avatarUrl || prev.avatarUrl,
    }))

    if (data.phone) {
      setPhoneInput(data.phone)
    }

    if (data.sex) {
      setGender(data.sex === 'FEMALE' ? 'FEMALE' : 'MALE')
    }

    const rawDob = data.dateOfBirth || data.birthDate
    if (rawDob) {
      const parts = String(rawDob).split('-')
      if (parts.length === 3) {
        setBirthYear(parts[0])
        setBirthMonth(String(parseInt(parts[1], 10)))
        setBirthDay(String(parseInt(parts[2], 10)))
      }
    }
  }

  // Load user data on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) setUsername(storedUsername)

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        applyProfileData(parsed)
      } catch (e) {
        console.warn('Could not parse user:', e)
      }
    }

    // Try fetching latest profile from backend if logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      authApi
        .getProfile()
        .then((data) => {
          if (data) {
            applyProfileData(data)
            localStorage.setItem('user', JSON.stringify(data))
          }
        })
        .catch(() => {})

      fetchAddresses()
    }
  }, [])

  const fetchAddresses = async () => {
    try {
      const list = await orderApi.getAddresses()
      if (Array.isArray(list)) {
        const mapped = list.map((a: any) => ({
          id: a.id,
          recipientName: a.fullName || a.recipientName || 'Người nhận',
          phone: a.phone || '',
          streetAddress: a.street || a.streetAddress || '',
          ward: a.ward || '',
          district: a.district || '',
          province: a.city || a.province || '',
          isDefault: !!a.isDefault,
        }))
        setAddresses(mapped)
      }
    } catch (err) {
      console.warn('Error loading addresses:', err)
    }
  }

  // Address modal & actions state
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    isDefault: false,
  })

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await orderApi.addAddress({
        fullName: newAddress.fullName.trim(),
        phone: newAddress.phone.trim(),
        street: newAddress.streetAddress.trim(),
        ward: newAddress.ward.trim(),
        district: newAddress.district.trim(),
        city: newAddress.province.trim(),
        isDefault: newAddress.isDefault,
      })
      setIsAddAddressModalOpen(false)
      setNewAddress({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false,
      })
      await fetchAddresses()
    } catch (err: any) {
      alert(err.message || 'Không thể thêm địa chỉ mới')
    }
  }

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await orderApi.setDefaultAddress(id)
      await fetchAddresses()
    } catch (err: any) {
      alert(err.message || 'Không thể đặt làm địa chỉ mặc định')
    }
  }

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return
    try {
      await orderApi.deleteAddress(id)
      await fetchAddresses()
    } catch (err: any) {
      alert(err.message || 'Không thể xóa địa chỉ')
    }
  }

  // Change password states
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' })
      return
    }

    setIsSubmittingPassword(true)
    setPasswordMsg(null)
    try {
      await authApi.changePassword(oldPassword, newPassword)
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.' })
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  // Load orders when activeTab is 'orders'
  useEffect(() => {
    if (activeTab !== 'orders') return

    const fetchOrders = async () => {
      setIsLoadingOrders(true)
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (!token) {
          setOrders([])
          setIsLoadingOrders(false)
          return
        }

        const params: any = { page: 0, size: 20 }
        if (activeOrderSubTab !== 'ALL') {
          params.status = activeOrderSubTab
        }

        const res = await orderApi.getBuyerOrders(params)
        const orderList = res?.items || res?.content || (Array.isArray(res) ? res : [])
        setOrders(orderList)
      } catch (err) {
        console.warn('Error fetching orders:', err)
        setOrders([])
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [activeTab, activeOrderSubTab])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccessMsg(null)
    setProfileErrorMsg(null)
    setPhoneError(null)

    if (!user.fullName || !user.fullName.trim()) {
      setProfileErrorMsg('Họ và tên không được để trống.')
      return
    }

    const targetPhone = isEditingPhone ? phoneInput.trim() : (user.phone ? user.phone.trim() : '')

    if (isEditingPhone) {
      if (!targetPhone) {
        setPhoneError('Vui lòng nhập số điện thoại hoặc nhấn Hủy.')
        return
      }
      if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(targetPhone)) {
        setPhoneError('Số điện thoại không hợp lệ (cần 10 chữ số, ví dụ: 0912345678).')
        return
      }
    }

    setIsSavingProfile(true)

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const formattedMonth = String(birthMonth).padStart(2, '0')
      const formattedDay = String(birthDay).padStart(2, '0')
      const birthDateStr = `${birthYear}-${formattedMonth}-${formattedDay}`
      const sexVal: 'MALE' | 'FEMALE' = gender === 'FEMALE' ? 'FEMALE' : 'MALE'

      if (token) {
        const updated = await authApi.updateProfile({
          fullName: user.fullName.trim(),
          phone: targetPhone || undefined,
          sex: sexVal,
          birthDate: birthDateStr,
        })
        if (updated) {
          applyProfileData(updated)
          localStorage.setItem('user', JSON.stringify(updated))
        }
      } else {
        const updatedLocal = {
          ...user,
          fullName: user.fullName.trim(),
          phone: targetPhone || user.phone,
          sex: sexVal,
          dateOfBirth: birthDateStr,
        }
        setUser(updatedLocal)
        localStorage.setItem('user', JSON.stringify(updatedLocal))
      }

      setIsEditingPhone(false)
      setPhoneError(null)
      window.dispatchEvent(new Event('cartUpdated'))
      setProfileSuccessMsg('Hồ sơ của bạn đã được cập nhật thành công!')
      setTimeout(() => setProfileSuccessMsg(null), 4000)
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể lưu hồ sơ lúc này.'
      setProfileErrorMsg(errorMsg)
      if (errorMsg.includes('Số điện thoại') || errorMsg.toLowerCase().includes('phone')) {
        setPhoneError(errorMsg)
        setIsEditingPhone(true)
      }
      setTimeout(() => setProfileErrorMsg(null), 5000)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return
    setCancellingOrderId(orderId)
    try {
      await orderApi.cancelOrder(orderId, 'Khách hàng yêu cầu hủy đơn')
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
      )
      alert('Đã gửi yêu cầu hủy đơn hàng thành công!')
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng lúc này.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-block text-[11px] font-medium text-[#ee4d2d] bg-orange-50/70 px-2 py-0.5 rounded-xs border border-orange-200/60 uppercase">
            HOÀN THÀNH
          </span>
        )
      case 'SHIPPING':
        return (
          <span className="inline-block text-[11px] font-medium text-[#ee4d2d] bg-orange-50/70 px-2 py-0.5 rounded-xs border border-orange-200/60 uppercase">
            ĐANG GIAO HÀNG
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-block text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200 uppercase">
            ĐÃ XÁC NHẬN
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-block text-[11px] font-medium text-[#ee4d2d] bg-orange-50/70 px-2 py-0.5 rounded-xs border border-orange-200/60 uppercase">
            CHỜ XÁC NHẬN
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200 uppercase">
            ĐÃ HỦY
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200 uppercase">
            ĐÃ HOÀN TIỀN
          </span>
        )
      default:
        return (
          <span className="inline-block text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200 uppercase">
            {status}
          </span>
        )
    }
  }

  // Filter orders by search keyword
  const filteredOrders = orders.filter((order) => {
    if (!orderSearchKeyword.trim()) return true
    const q = orderSearchKeyword.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.shopName.toLowerCase().includes(q) ||
      order.items.some((it) => it.productName.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-800 font-sans flex flex-col">
      <MainHeader />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT SIDEBAR (EXACT SHOPEE DESIGN) ================= */}
          <aside className="md:col-span-3 lg:col-span-3 xl:col-span-2 space-y-4">
            {/* User Profile Header Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                  }
                  alt={user.fullName || username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-slate-900 truncate">
                  {username || 'thaimuado12'}
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-[12px] text-slate-500 hover:text-[#ee4d2d] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Sửa Hồ Sơ</span>
                </button>
              </div>
            </div>

            {/* Sidebar Navigation Tree */}
            <nav className="space-y-1 text-[13px] select-none">
              {/* Menu Item: Tài Khoản Của Tôi */}
              <div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xs transition-colors cursor-pointer font-medium ${
                    activeTab === 'profile' || activeTab === 'address' || activeTab === 'password'
                      ? 'text-[#ee4d2d]'
                      : 'text-slate-700 hover:text-[#ee4d2d]'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-[#ee4d2d]" />
                  <span>Tài Khoản Của Tôi</span>
                </button>

                {/* Sub-menu */}
                <div className="pl-7 pr-2 space-y-1 pt-0.5 pb-1.5">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`block w-full text-left py-1 text-[13px] transition-colors cursor-pointer ${
                      activeTab === 'profile'
                        ? 'text-[#ee4d2d] font-semibold'
                        : 'text-slate-600 hover:text-[#ee4d2d]'
                    }`}
                  >
                    Hồ Sơ
                  </button>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`block w-full text-left py-1 text-[13px] transition-colors cursor-pointer ${
                      activeTab === 'address'
                        ? 'text-[#ee4d2d] font-semibold'
                        : 'text-slate-600 hover:text-[#ee4d2d]'
                    }`}
                  >
                    Địa Chỉ
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`block w-full text-left py-1 text-[13px] transition-colors cursor-pointer ${
                      activeTab === 'password'
                        ? 'text-[#ee4d2d] font-semibold'
                        : 'text-slate-600 hover:text-[#ee4d2d]'
                    }`}
                  >
                    Đổi Mật Khẩu
                  </button>
                </div>
              </div>

              {/* Menu Item: Đơn Mua */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xs transition-colors cursor-pointer font-medium ${
                  activeTab === 'orders'
                    ? 'text-[#ee4d2d]'
                    : 'text-slate-700 hover:text-[#ee4d2d]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                <span>Đơn Mua</span>
              </button>

              {/* Menu Item: Thông Báo */}
              <button
                onClick={() => alert('Chức năng Thông Báo đang được cập nhật')}
                className="w-full flex items-center gap-2.5 px-2 py-2 text-slate-700 hover:text-[#ee4d2d] transition-colors cursor-pointer font-medium"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Thông Báo</span>
              </button>

              {/* Menu Item: Kho Voucher */}
              <button
                onClick={() => alert('Kho voucher của bạn có 5 mã giảm giá!')}
                className="w-full flex items-center gap-2.5 px-2 py-2 text-slate-700 hover:text-[#ee4d2d] transition-colors cursor-pointer font-medium"
              >
                <Ticket className="w-4 h-4 text-red-500" />
                <span>Kho Voucher</span>
              </button>
              {/* Menu Item: Kênh Quản Trị dành cho ADMIN */}
              {(user.role?.includes('ADMIN') || user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  className="w-full flex items-center gap-2.5 px-2 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/70 rounded-xs transition-colors cursor-pointer font-bold border-t border-slate-100 mt-2 pt-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Kênh Quản Trị Hệ Thống</span>
                </Link>
              )}

            </nav>
          </aside>

          {/* ================= RIGHT MAIN CONTENT PANEL ================= */}
          <section className="md:col-span-9 lg:col-span-9 xl:col-span-10 bg-white rounded-xs shadow-xs p-6 border border-slate-100 min-h-[560px]">
            
            {/* ----------------- TAB 1: HỒ SƠ CỦA TÔI ----------------- */}
            {activeTab === 'profile' && (
              <div>
                <div className="border-b border-slate-100 pb-4">
                  <h1 className="text-[18px] font-medium text-slate-900">Hồ Sơ Của Tôi</h1>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm text-[13px] flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-[13px] flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                  {/* Left Form (70%) */}
                  <form onSubmit={handleSaveProfile} className="lg:col-span-8 space-y-5">
                    {/* Username */}
                    <div className="grid grid-cols-12 items-center text-[13px]">
                      <label className="col-span-4 text-right pr-6 text-slate-500">Tên đăng nhập</label>
                      <div className="col-span-8 font-medium text-slate-800">
                        {username || 'thaimuado12'}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="grid grid-cols-12 items-center text-[13px]">
                      <label className="col-span-4 text-right pr-6 text-slate-500">Tên</label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={user.fullName || ''}
                          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xs text-[13px] focus:outline-none focus:border-[#ee4d2d] transition-colors"
                          placeholder="Nhập họ và tên của bạn"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-12 items-center text-[13px]">
                      <label className="col-span-4 text-right pr-6 text-slate-500">Email</label>
                      <div className="col-span-8 flex items-center gap-3">
                        <span className="text-slate-800">
                          {user.email ? `${user.email.slice(0, 3)}***@${user.email.split('@')[1] || 'gmail.com'}` : 'chua_co_email'}
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-12 items-start text-[13px]">
                      <label className="col-span-4 text-right pr-6 pt-2 text-slate-500">Số điện thoại</label>
                      <div className="col-span-8">
                        {!isEditingPhone ? (
                          <div className="flex items-center gap-3 py-1.5">
                            <span className="text-slate-800 font-medium">
                              {user.phone ? (
                                user.phone.length >= 10
                                  ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}`
                                  : `*******${user.phone.slice(-3)}`
                              ) : (
                                <span className="text-slate-400 font-normal italic">Chưa liên kết</span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPhoneInput(user.phone || '')
                                setIsEditingPhone(true)
                                setPhoneError(null)
                                setProfileErrorMsg(null)
                              }}
                              className="text-[#ee4d2d] hover:underline text-[12px] font-medium cursor-pointer"
                            >
                              {user.phone ? 'Thay Đổi' : 'Thêm'}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-w-sm">
                            <div className="flex items-center gap-2">
                              <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '')
                                  setPhoneInput(val)
                                  if (phoneError) setPhoneError(null)
                                }}
                                placeholder="Nhập số điện thoại (10 chữ số)"
                                maxLength={10}
                                autoFocus
                                className={`flex-1 px-3 py-2 border rounded-xs text-[13px] focus:outline-none transition-colors ${
                                  phoneError
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-slate-300 focus:border-[#ee4d2d]'
                                }`}
                              />
                              <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="px-3 py-2 text-[12px] text-white bg-[#ee4d2d] hover:bg-[#d93c1d] rounded-xs transition-colors shrink-0 cursor-pointer font-medium disabled:opacity-50"
                              >
                                {isSavingProfile ? '...' : 'Lưu'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingPhone(false)
                                  setPhoneInput(user.phone || '')
                                  setPhoneError(null)
                                }}
                                className="px-3 py-2 text-[12px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors shrink-0 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                            {phoneError && (
                              <p className="text-[12px] text-red-500 flex items-center gap-1 animate-in fade-in">
                                {phoneError}
                              </p>
                            )}
                            <p className="text-[11px] text-slate-400">
                              Định dạng số điện thoại Việt Nam gồm 10 chữ số (ví dụ: 0912345678, 0381234567)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="grid grid-cols-12 items-center text-[13px]">
                      <label className="col-span-4 text-right pr-6 text-slate-500">Giới tính</label>
                      <div className="col-span-8 flex items-center gap-6">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="MALE"
                            checked={gender === 'MALE'}
                            onChange={() => setGender('MALE')}
                            className="text-[#ee4d2d] focus:ring-[#ee4d2d]"
                          />
                          <span>Nam</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="FEMALE"
                            checked={gender === 'FEMALE'}
                            onChange={() => setGender('FEMALE')}
                            className="text-[#ee4d2d] focus:ring-[#ee4d2d]"
                          />
                          <span>Nữ</span>
                        </label>

                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="grid grid-cols-12 items-center text-[13px]">
                      <label className="col-span-4 text-right pr-6 text-slate-500">Ngày sinh</label>
                      <div className="col-span-8 grid grid-cols-3 gap-2">
                        <select
                          value={birthDay}
                          onChange={(e) => setBirthDay(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xs text-[13px] focus:outline-none focus:border-[#ee4d2d]"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              Ngày {d}
                            </option>
                          ))}
                        </select>
                        <select
                          value={birthMonth}
                          onChange={(e) => setBirthMonth(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xs text-[13px] focus:outline-none focus:border-[#ee4d2d]"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>
                              Tháng {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xs text-[13px] focus:outline-none focus:border-[#ee4d2d]"
                        >
                          {Array.from({ length: 80 }, (_, i) => 2024 - i).map((y) => (
                            <option key={y} value={y}>
                              Năm {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="grid grid-cols-12 pt-2">
                      <div className="col-span-4" />
                      <div className="col-span-8">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[14px] font-medium rounded-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Right Avatar Uploader (30%) */}
                  <div className="lg:col-span-4 lg:border-l lg:border-slate-100 flex flex-col items-center justify-center p-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 mb-4 shadow-sm group">
                      <img
                        src={
                          user.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                        }
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Tính năng tải ảnh avatar từ thiết bị sẽ sớm ra mắt')}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-[13px] text-slate-700 rounded-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Chọn Ảnh
                    </button>
                    <div className="text-[12px] text-slate-400 text-center mt-3 leading-relaxed space-y-0.5">
                      <p>Dung lượng file tối đa 1 MB</p>
                      <p>Định dạng: .JPEG, .PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 2: ĐƠN MUA (PURCHASE ORDERS) ----------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Order Sub-Tabs */}
                <div className="flex items-center border-b border-slate-200 text-[14px] overflow-x-auto scrollbar-none bg-white -mx-6 -mt-6 px-6 pt-2 sticky top-0 z-10">
                  {[
                    { key: 'ALL', label: 'Tất cả' },
                    { key: 'PENDING', label: 'Chờ xác nhận' },
                    { key: 'CONFIRMED', label: 'Chờ lấy hàng' },
                    { key: 'SHIPPING', label: 'Đang giao' },
                    { key: 'DELIVERED', label: 'Hoàn thành' },
                    { key: 'CANCELLED', label: 'Đã hủy' },
                    { key: 'REFUNDED', label: 'Trả hàng' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveOrderSubTab(tab.key)}
                      className={`px-4 py-3 border-b-2 font-medium transition-all shrink-0 cursor-pointer ${
                        activeOrderSubTab === tab.key
                          ? 'border-[#ee4d2d] text-[#ee4d2d]'
                          : 'border-transparent text-slate-600 hover:text-[#ee4d2d]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Order Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchKeyword}
                    onChange={(e) => setOrderSearchKeyword(e.target.value)}
                    placeholder="Bạn có thể tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xs text-[13px] focus:outline-none focus:border-[#ee4d2d] focus:bg-white transition-all"
                  />
                </div>

                {/* Orders List */}
                {isLoadingOrders ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#ee4d2d]" />
                    <p className="text-[13px]">Đang tải danh sách đơn mua...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#ee4d2d]">
                      <Package className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-[15px] font-medium text-slate-700">Chưa có đơn hàng nào</p>
                    <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
                      Hãy khám phá hàng triệu sản phẩm chất lượng với ưu đãi hấp dẫn trên ZoraShop ngay hôm nay.
                    </p>
                    <Link
                      to="/"
                      className="inline-block mt-2 px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors"
                    >
                      Mua Sắm Ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.orderId}
                        className="border border-slate-200 rounded-xs bg-white shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        {/* Order Header: Shop Name & Status */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Store className="w-4 h-4 text-slate-600 shrink-0" />
                            <span className="font-semibold text-[13px] text-slate-900 truncate">
                              {order.shopName}
                            </span>
                            <button
                              onClick={() => navigate(`/shop/${order.shopId}`)}
                              className="text-[11px] px-2 py-0.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xs cursor-pointer transition-colors"
                            >
                              Xem Shop
                            </button>
                            <span className="text-slate-300">|</span>
                            <span className="text-[12px] text-slate-400 font-mono">
                              #{order.orderNumber}
                            </span>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => navigate(`/orders/${order.orderId}`)}
                              className="text-[12px] text-[#ee4d2d] hover:underline font-medium cursor-pointer flex items-center gap-1"
                            >
                              Chi tiết đơn hàng
                            </button>
                          </div>

                          <div className="shrink-0">{getStatusBadge(order.status)}</div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <div
                              key={item.orderItemId}
                              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                  src={
                                    item.productPictureUrl ||
                                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'
                                  }
                                  alt={item.productName}
                                  className="w-16 h-16 rounded-xs object-cover border border-slate-200 shrink-0 bg-slate-50"
                                />
                                <div className="min-w-0 space-y-1">
                                  <p className="text-[14px] font-medium text-slate-900 line-clamp-2 leading-snug">
                                    {item.productName}
                                  </p>
                                  {item.variantName && (
                                    <p className="text-[12px] text-slate-500">
                                      Phân loại hàng: {item.variantName}
                                    </p>
                                  )}
                                  <p className="text-[12px] text-slate-500">x{item.quantity}</p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[14px] font-semibold text-[#ee4d2d]">
                                  ₫{Number(item.price).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer: Total Amount & Action Buttons */}
                        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
                          <div className="text-[12px] text-slate-400">
                            Ngày đặt: {order.createDate}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[12px] text-slate-500 mr-2">Thành tiền:</span>
                              <span className="text-[16px] font-bold text-[#ee4d2d]">
                                ₫{Number(order.totalAmount).toLocaleString('vi-VN')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/orders/${order.orderId}`)}
                                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-[12px] font-medium rounded-xs cursor-pointer transition-colors"
                              >
                                Xem Chi Tiết
                              </button>
                              {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                                <>
                                  <button
                                    onClick={() => alert('Chức năng đánh giá sản phẩm đang mở')}
                                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-[12px] font-medium rounded-xs cursor-pointer transition-colors"
                                  >
                                    Đánh Giá
                                  </button>
                                  <button
                                    onClick={() => navigate(`/product/${order.items[0]?.productId || 1}`)}
                                    className="px-4 py-1.5 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[12px] font-medium rounded-xs cursor-pointer shadow-2xs transition-colors"
                                  >
                                    Mua Lại
                                  </button>
                                </>
                              ) : order.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleCancelOrder(order.orderId)}
                                  disabled={cancellingOrderId === order.orderId}
                                  className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-[12px] font-medium rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  {cancellingOrderId === order.orderId ? 'Đang hủy...' : 'Hủy Đơn Hàng'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/shop/${order.shopId}`)}
                                  className="px-4 py-1.5 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[12px] font-medium rounded-xs cursor-pointer shadow-2xs transition-colors"
                                >
                                  Liên Hệ Người Bán
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB 3: ĐỊA CHỈ (ADDRESSES) ----------------- */}
            {activeTab === 'address' && (
              <div>
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-[18px] font-medium text-slate-900">Địa Chỉ Của Tôi</h1>
                    <p className="text-[13px] text-slate-500 mt-1">
                      Địa chỉ nhận hàng mặc định khi thanh toán
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddAddressModalOpen(true)}
                    className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[13px] font-medium rounded-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Địa Chỉ Mới</span>
                  </button>
                </div>

                <div className="pt-6 divide-y divide-slate-100">
                  {addresses.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[13px]">
                      Bạn chưa có địa chỉ nhận hàng nào. Hãy bấm "Thêm Địa Chỉ Mới" để tạo.
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[14px] text-slate-900">
                              {addr.recipientName}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[13px] text-slate-600 font-mono">
                              {addr.phone}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[11px] font-medium text-[#ee4d2d] border border-[#ee4d2d] px-1.5 py-0.5 rounded-xs">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-slate-600">
                            {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] shrink-0">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-slate-600 hover:text-[#ee4d2d] border border-slate-300 hover:border-[#ee4d2d] px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-xs"
                            >
                              Thiết lập mặc định
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-rose-500 hover:underline cursor-pointer text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Thêm Địa Chỉ Mới */}
                {isAddAddressModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">Địa chỉ mới</h3>
                        <button
                          onClick={() => setIsAddAddressModalOpen(false)}
                          className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddAddressSubmit} className="p-4 space-y-3 text-[13px]">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-slate-600 mb-1 text-xs">Họ và tên</label>
                            <input
                              type="text"
                              required
                              placeholder="Họ và tên người nhận"
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 text-xs">Số điện thoại</label>
                            <input
                              type="text"
                              required
                              placeholder="Số điện thoại"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-slate-600 mb-1 text-xs">Tỉnh / Thành phố</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: TP. Hồ Chí Minh"
                              value={newAddress.province}
                              onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 text-xs">Quận / Huyện</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Quận 1"
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">Phường / Xã</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: Phường Bến Nghé"
                            value={newAddress.ward}
                            onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: 123 Đường Lê Lợi"
                            value={newAddress.streetAddress}
                            onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="isDefaultAddr"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            className="accent-[#ee4d2d] cursor-pointer"
                          />
                          <label htmlFor="isDefaultAddr" className="text-slate-700 text-xs cursor-pointer">
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddAddressModalOpen(false)}
                            className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xs transition-colors cursor-pointer text-xs"
                          >
                            Trở Lại
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white rounded-xs transition-colors cursor-pointer text-xs font-medium"
                          >
                            Hoàn Thành
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB 4: ĐỔI MẬT KHẨU ----------------- */}
            {activeTab === 'password' && (
              <div>
                <div className="border-b border-slate-100 pb-4">
                  <h1 className="text-[18px] font-medium text-slate-900">Đổi Mật Khẩu</h1>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                  </p>
                </div>

                {passwordMsg && (
                  <div
                    className={`mt-4 p-3 rounded-xs text-xs border ${
                      passwordMsg.type === 'success'
                        ? 'bg-slate-900 text-white'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="max-w-md pt-6 space-y-4 text-[13px]">
                  <div>
                    <label className="block text-slate-600 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-[#ee4d2d]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d93c1d] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPassword ? 'Đang xử lý...' : 'Xác Nhận'}
                  </button>
                </form>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Shopee Style Simple Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 ZoraShop Mini Shopee E-Commerce Platform. Tất cả các quyền được bảo lưu.</p>
          <p>Quốc gia & Khu vực: Việt Nam | Singapore | Thái Lan | Indonesia | Malaysia | Philippines</p>
        </div>
      </footer>
    </div>
  )
}
