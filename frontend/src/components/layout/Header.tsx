import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Store,
  LogOut,
  Bell,
  Heart,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/format';
import { getWishlist } from '../../utils/wishlist';

const POPULAR_SEARCHES = [
  'iPhone 16 Pro Max',
  'Sony WH-1000XM5',
  'NuPhy Air75',
  'Nike Air Force 1',
  'Áo thun cotton',
  'Apple Watch 9',
];

export const Header: React.FC = () => {
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const { cart, totalItemCount } = useCart();
  const [keyword, setKeyword] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(() => getWishlist().length);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update wishlist count on storage changes
  useEffect(() => {
    const handleStorage = () => setWishlistCount(getWishlist().length);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('wishlist_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('wishlist_updated', handleStorage);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/');
    }
    setIsSearchFocused(false);
  };

  const handleSelectPopularSearch = (term: string) => {
    setKeyword(term);
    navigate(`/?keyword=${encodeURIComponent(term)}`);
    setIsSearchFocused(false);
  };

  // Extract preview items for mini-cart
  const cartItemsPreview = cart?.shopGroups.flatMap((g) => g.cartItems) || [];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* ── Top Micro Announcement & Role Switcher Bar ───────────────── */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left links */}
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Trang Quản Trị (Admin Console)</span>
              </Link>
            ) : (
              <Link
                to="/seller"
                className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Kênh Người Bán</span>
              </Link>
            )}
            <span className="text-slate-700 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cam kết 100% hàng chính hãng & đổi trả 15 ngày</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isLoggedIn && user ? (
              <div className="flex items-center gap-2 relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 text-slate-200 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                    alt={user.fullName || user.username}
                    className="w-5 h-5 rounded-full object-cover border border-slate-700"
                  />
                  <span className="max-w-[120px] truncate">{user.fullName || user.username}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-700 text-sm">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.fullName || user.username}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-600" />
                        <span>Bảng Quản Trị Admin</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-slate-500" />
                          <span>Đơn mua của tôi</span>
                        </Link>
                        <Link
                          to="/seller"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          <Store className="w-4 h-4 text-slate-500" />
                          <span>Quản lý bán hàng</span>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                  Đăng nhập
                </Link>
                <span className="text-slate-700">|</span>
                <Link to="/register" className="text-white hover:text-slate-200 font-semibold transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group no-underline">
            <img
              src="/logo-icon.png"
              alt="ZoraEcommerce"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  <span>Zora</span>
                  <span className="text-slate-500 font-normal">Ecommerce</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded">
                  MALL
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Thương mại thế hệ mới</span>
            </div>
          </Link>

          {/* Smart Search Bar */}
          <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Tìm kiếm điện thoại, tai nghe, laptop, giày thể thao..."
                className="w-full pl-10 pr-24 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-slate-100"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Search Suggestions Popover */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>Từ khóa tìm kiếm phổ biến</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectPopularSearch(term)}
                      className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Gợi ý dựa trên xu hướng mua sắm hôm nay</span>
                  <button
                    type="button"
                    onClick={() => setIsSearchFocused(false)}
                    className="hover:text-slate-600 cursor-pointer font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons: Wishlist & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Wishlist button */}
            <button
              onClick={() => {
                navigate('/');
              }}
              title="Danh sách yêu thích"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Interactive Cart Popover Button */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-semibold text-slate-800 hidden md:inline">Giỏ hàng</span>
                {totalItemCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItemCount > 99 ? '99+' : totalItemCount}
                  </span>
                )}
              </button>

              {/* Cart Preview Drawer/Popover */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">
                      Sản phẩm trong giỏ ({totalItemCount})
                    </span>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {cartItemsPreview.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-xs font-semibold text-slate-700">Giỏ hàng của bạn đang trống</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Khám phá các ưu đãi hấp dẫn ngay!</p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/');
                        }}
                        className="mt-3 text-xs py-1.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Khám phá sản phẩm
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                        {cartItemsPreview.slice(0, 4).map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-semibold text-slate-900 truncate">
                                {item.productName}
                              </h5>
                              <p className="text-[11px] text-slate-400 truncate">{item.variantName}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-bold text-slate-900">
                                  {formatVND(item.price)}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">x{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {cartItemsPreview.length > 4 && (
                          <div className="py-2 text-center text-xs text-slate-400 font-medium">
                            +{cartItemsPreview.length - 4} sản phẩm khác trong giỏ
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-2">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-slate-500 font-medium">Tổng tạm tính:</span>
                          <span className="text-base font-bold text-slate-900">
                            {formatVND(cart?.totalAmount || 0)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to="/cart"
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs py-2 text-center font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            Xem giỏ hàng
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs py-2 text-center font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            Thanh toán <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
