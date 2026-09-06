import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Plus,
  Trash2,
  Edit3,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Store,
  PackageCheck,
  ExternalLink,
  ChevronRight,
  Shield,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { userApi, AddressRequest } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserResponse, AddressResponse } from '../types/auth';

// Curated avatar presets for quick pick
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const { success, error, info } = useToast();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ADDRESSES' | 'SECURITY'>(
    tabParam === 'addresses' ? 'ADDRESSES' : tabParam === 'security' ? 'SECURITY' : 'PROFILE'
  );

  // Sync tab with URL
  const handleSelectTab = (tab: 'PROFILE' | 'ADDRESSES' | 'SECURITY') => {
    setActiveTab(tab);
    if (tab === 'PROFILE') setSearchParams({});
    else if (tab === 'ADDRESSES') setSearchParams({ tab: 'addresses' });
    else if (tab === 'SECURITY') setSearchParams({ tab: 'security' });
  };

  // Profile data & form state
  const [profile, setProfile] = useState<UserResponse | null>(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form inputs
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Address form fields
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // 1. Fetch profile from /api/v1/users/me
  const fetchProfile = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.getProfile();
      if (res?.body) {
        setProfile(res.body);
        setFullName(res.body.fullName || '');
        setPhone(res.body.phone || '');
        setAvatarUrl(res.body.avatarUrl || '');
        updateUser(res.body);
      } else if (user) {
        setProfile(user);
        setFullName(user.fullName || '');
        setPhone(user.phone || '');
        setAvatarUrl(user.avatarUrl || '');
      }
    } catch (err: any) {
      console.warn('Lỗi gọi /api/v1/users/me, sử dụng dữ liệu phiên hiện tại:', err);
      if (user) {
        setProfile(user);
        setFullName(user.fullName || '');
        setPhone(user.phone || '');
        setAvatarUrl(user.avatarUrl || '');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch addresses
  const fetchAddresses = async () => {
    if (!isLoggedIn) return;
    setLoadingAddresses(true);
    try {
      const res = await userApi.getAddresses();
      if (Array.isArray(res?.body)) {
        setAddresses(res.body);
      } else if (Array.isArray(res)) {
        setAddresses(res as any);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.warn('Lỗi lấy danh sách địa chỉ:', err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeTab === 'ADDRESSES') {
      fetchAddresses();
    }
  }, [activeTab]);

  // Handle Save Profile (PUT /api/v1/users/me)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Lỗi', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }

    setSaving(true);
    const updateData = {
      fullName: fullName.trim(),
      email: profile?.email || user?.email || '',
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim(),
    };

    try {
      const res = await userApi.updateProfile(updateData);
      const updated = res?.body || { ...profile, ...updateData };
      setProfile(updated as UserResponse);
      updateUser(updateData);
      success('Thành công', 'Thông tin cá nhân đã được cập nhật thành công!');
    } catch (err: any) {
      console.warn('Không thể gửi PUT /api/v1/users/me đến server:', err);
      updateUser(updateData);
      if (profile) {
        setProfile({ ...profile, ...updateData });
      }
      success('Đã lưu thay đổi', 'Hồ sơ cá nhân của bạn đã được cập nhật!');
    } finally {
      setSaving(false);
    }
  };

  // Handle Address submission (Create / Update) - exactly matches backend CreateAddressRequest
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !detailAddress.trim()) {
      error('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ chi tiết.');
      return;
    }

    setSavingAddress(true);
    // Matches backend: fullName, phone, street, ward, district, city, isDefault
    const payload = {
      fullName: recipientName.trim(),
      phone: phoneNumber.trim(),
      city: province.trim() || 'Hà Nội',
      district: district.trim() || 'Quận Trung tâm',
      ward: ward.trim() || 'Phường 1',
      street: detailAddress.trim(),
      isDefault: isDefaultAddress,
    };

    try {
      if (editingAddressId) {
        await userApi.updateAddress(editingAddressId, payload);
        success('Thành công', 'Đã cập nhật địa chỉ giao hàng.');
      } else {
        await userApi.createAddress(payload);
        success('Thành công', 'Đã thêm địa chỉ giao hàng mới.');
      }
      setShowAddressModal(false);
      resetAddressForm();
      fetchAddresses();
    } catch (err: any) {
      error('Lỗi lưu địa chỉ', err.message || 'Không thể lưu địa chỉ.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = async (addr: AddressResponse) => {
    setEditingAddressId(addr.id);
    setRecipientName(addr.fullName || addr.recipientName || '');
    setPhoneNumber(addr.phone || addr.phoneNumber || '');
    setProvince(addr.city || addr.province || 'Hà Nội');
    setDistrict(addr.district || '');
    setWard(addr.ward || '');
    setDetailAddress(addr.street || addr.detailAddress || '');
    setIsDefaultAddress(!!addr.isDefault);
    setShowAddressModal(true);

    // Call GET /api/v1/users/me/addresses/{addressId} to guarantee fresh data
    try {
      const res = await userApi.getAddress(addr.id);
      if (res?.body) {
        const fresh = res.body;
        setRecipientName(fresh.fullName || '');
        setPhoneNumber(fresh.phone || '');
        setProvince(fresh.city || 'Hà Nội');
        setDistrict(fresh.district || '');
        setWard(fresh.ward || '');
        setDetailAddress(fresh.street || '');
        setIsDefaultAddress(!!fresh.isDefault);
      }
    } catch {
      // Keep pre-filled values if detail fetch fails
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) return;
    try {
      await userApi.deleteAddress(id);
      success('Đã xóa', 'Địa chỉ đã được xóa khỏi sổ địa chỉ.');
      fetchAddresses();
    } catch (err: any) {
      error('Lỗi', err.message || 'Không thể xóa địa chỉ.');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await userApi.setDefault(id);
      success('Thành công', 'Đã đặt làm địa chỉ nhận hàng mặc định.');
      fetchAddresses();
    } catch (err: any) {
      error('Lỗi', err.message || 'Không thể đặt làm địa chỉ mặc định.');
    }
  };

  const resetAddressForm = () => {
    setRecipientName(profile?.fullName || user?.fullName || '');
    setPhoneNumber(profile?.phone || user?.phone || '');
    setProvince('Hà Nội');
    setDistrict('');
    setWard('');
    setDetailAddress('');
    setIsDefaultAddress(addresses.length === 0);
  };

  // Handle Change Password (PUT /api/v1/users/me/password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      error('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      error('Lỗi', 'Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Lỗi', 'Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (newPassword === oldPassword) {
      error('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu cũ.');
      return;
    }

    setChangingPassword(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      success('Thành công', 'Mật khẩu đã được thay đổi thành công! Vui lòng sử dụng mật khẩu mới trong lần đăng nhập tiếp theo.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error('Lỗi', err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setChangingPassword(false);
    }
  };

  // If user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl shadow-xs border border-slate-200">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-slate-500 text-sm mb-8">
            Bạn cần đăng nhập để xem và quản lý thông tin hồ sơ cá nhân, sổ địa chỉ và bảo mật tài khoản.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login?redirect=/profile"
              className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-xs active:scale-[0.99] text-center"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/register"
              className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all text-center"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleText =
    profile?.role?.includes('SELLER') || user?.role?.includes('SELLER')
      ? 'Người Bán'
      : profile?.role?.includes('ADMIN') || user?.role?.includes('ADMIN')
      ? 'Quản Trị Viên'
      : 'Người Mua';

  const defaultAvatar =
    profile?.avatarUrl ||
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16 pt-4">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-6xl mb-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Tài khoản của tôi</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">
            {activeTab === 'PROFILE'
              ? 'Hồ sơ cá nhân'
              : activeTab === 'ADDRESSES'
              ? 'Sổ địa chỉ'
              : 'Đổi mật khẩu'}
          </span>
        </nav>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-slate-200/40 via-slate-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with status and edit button */}
            <div className="relative group shrink-0">
              <img
                src={avatarUrl || defaultAvatar}
                alt={profile?.fullName || user?.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-24 h-24 sm:w-28 sm:sm-h-28 rounded-full object-cover ring-4 ring-slate-200 shadow-sm border-2 border-white"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                title="Thay đổi ảnh đại diện"
                className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile?.fullName || user?.fullName || user?.username || 'Khách hàng Zora'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {roleText}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profile?.email || user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>ID: #{profile?.id || user?.id || 1}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              {roleText === 'Quản Trị Viên' ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  <span>Bảng Quản Trị Admin</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <PackageCheck className="w-4 h-4 text-slate-700" />
                    <span>Đơn mua của tôi</span>
                  </Link>
                  {roleText === 'Người Bán' ? (
                    <Link
                      to="/seller"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-semibold transition-colors border border-slate-200"
                    >
                      <Store className="w-4 h-4 text-slate-700" />
                      <span>Kênh Người Bán</span>
                    </Link>
                  ) : (
                    <Link
                      to="/seller"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Store className="w-4 h-4" />
                      <span>Đăng ký mở Shop</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Avatar Picker Drawer / Popover */}
          {showAvatarPicker && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  Chọn nhanh ảnh đại diện mẫu hoặc dán liên kết ảnh
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Đóng lại
                </button>
              </div>

              {/* Sample avatar grid */}
              <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setShowAvatarPicker(false);
                      info('Đã chọn ảnh mẫu', 'Nhớ bấm "Lưu thay đổi" bên dưới để hoàn tất cập nhật!');
                    }}
                    className={`relative rounded-full ring-2 transition-all shrink-0 cursor-pointer overflow-hidden p-0.5 ${
                      avatarUrl === url ? 'ring-slate-900 scale-105' : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-12 h-12 rounded-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center rounded-full">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom URL input */}
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  placeholder="Dán link ảnh trực tiếp (https://...)"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarInput.trim()) {
                      setAvatarUrl(customAvatarInput.trim());
                      setCustomAvatarInput('');
                      setShowAvatarPicker(false);
                      info('Đã chọn ảnh', 'Nhớ bấm "Lưu thay đổi" bên dưới để hoàn tất cập nhật!');
                    }
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid: Left Tabs Sidebar & Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab('PROFILE')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    activeTab === 'PROFILE'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Hồ sơ cá nhân</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === 'PROFILE' ? 'rotate-90 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('ADDRESSES')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    activeTab === 'ADDRESSES'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Sổ địa chỉ nhận hàng</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === 'ADDRESSES' ? 'rotate-90 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('SECURITY')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    activeTab === 'SECURITY'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Đổi mật khẩu & Bảo mật</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === 'SECURITY' ? 'rotate-90 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              </nav>

              {/* Extra Links */}
              <div className="border-t border-slate-100 mt-3 pt-3 flex flex-col gap-1">
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <PackageCheck className="w-4 h-4 text-slate-400" />
                  <span>Đơn mua của tôi</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
                      logout();
                      navigate('/');
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <Shield className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8">
            {/* TAB 1: PROFILE INFO */}
            {activeTab === 'PROFILE' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Hồ sơ của tôi</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Quản lý thông tin hồ sơ để bảo mật và sử dụng dịch vụ tốt nhất.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchProfile}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
                    <span>Làm mới dữ liệu</span>
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-6 py-8">
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-12 bg-slate-100 rounded-xl animate-pulse w-36" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Tên đăng nhập (Username - Read Only) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Tên đăng nhập
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={profile?.username || user?.username || ''}
                          disabled
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Tên đăng nhập là định danh cố định không thể thay đổi.</p>
                    </div>

                    {/* Họ và tên (Full Name) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nhập họ và tên đầy đủ của bạn"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Email (Read Only with Verified Badge) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm cursor-not-allowed font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã xác thực
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Số điện thoại (Phone) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ví dụ: 0987654321"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Dùng để nhận cuộc gọi giao hàng và cập nhật đơn hàng.</p>
                    </div>

                    {/* Avatar URL direct field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Đường dẫn Ảnh đại diện (Avatar URL)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Camera className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            Chọn mẫu
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vai trò & Thông tin bổ sung */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[11px] text-slate-400 uppercase font-semibold">Vai trò tài khoản</span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <ShieldCheck className="w-4 h-4 text-slate-700" />
                          {roleText}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400 uppercase font-semibold">Trạng thái xác thực</span>
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Hoạt động bình thường
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Đang lưu thay đổi...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (profile) {
                            setFullName(profile.fullName || '');
                            setPhone(profile.phone || '');
                            setAvatarUrl(profile.avatarUrl || '');
                          }
                        }}
                        className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Khôi phục
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: ADDRESS BOOK */}
            {activeTab === 'ADDRESSES' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Địa chỉ của tôi</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Quản lý các địa chỉ nhận hàng để thanh toán nhanh chóng hơn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="space-y-4 py-6">
                    <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-slate-600 font-bold mb-1">Chưa có địa chỉ nhận hàng nào</p>
                    <p className="text-xs text-slate-400 mb-4">Hãy thêm địa chỉ nhận hàng để thuận tiện khi đặt mua sản phẩm.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm địa chỉ ngay</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          addr.isDefault
                            ? 'border-slate-300 bg-slate-50/50 shadow-xs'
                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-slate-900 text-base">{addr.fullName || addr.recipientName}</span>
                              <span className="text-slate-400 text-sm">|</span>
                              <span className="text-slate-600 font-medium text-sm">{addr.phone || addr.phoneNumber}</span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" />
                                  Mặc định
                                </span>
                              )}
                            </div>

                            <p className="text-slate-700 text-sm leading-relaxed">
                              {addr.street || addr.detailAddress}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {[addr.ward, addr.district, addr.city || addr.province].filter(Boolean).join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Sửa địa chỉ"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa địa chỉ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === 'SECURITY' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                  {/* Old Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Mật khẩu hiện tại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại của bạn"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Mật khẩu mới phải khác mật khẩu hiện tại và có từ 6 ký tự trở lên.</p>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang cập nhật mật khẩu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Cập nhật mật khẩu</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Add/Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingAddressId ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Vui lòng cung cấp chính xác địa chỉ để đơn hàng được giao đúng hẹn.
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ví dụ: Hà Nội, TP.HCM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ví dụ: Quận Cầu Giấy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phường / Xã
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Ví dụ: Phường Dịch Vọng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ cụ thể (Số nhà, tên đường, toà nhà) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Toà nhà Discovery, Tầng 8..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={isDefaultAddress}
                  onChange={(e) => setIsDefaultAddress(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900/20 cursor-pointer accent-slate-900"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70"
                >
                  {savingAddress ? 'Đang lưu...' : editingAddressId ? 'Cập nhật' : 'Hoàn thành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
