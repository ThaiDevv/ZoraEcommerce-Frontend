import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  Star,
  Package,
  Users,
  MessageCircle,
  UserPlus,
  UserCheck,
  Share2,
  ShieldCheck,
  Truck,
  Clock,
  Search,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { shopApi } from '../api/shopApi';
import { productApi } from '../api/productApi';
import { ShopResponse } from '../types/shop';
import { ProductSummaryResponse } from '../types/product';
import { ProductCard } from '../components/product/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const shopId = Number(id) || 1;
  const { user } = useAuth();
  const { success, info } = useToast();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>('POPULAR');
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ABOUT'>('PRODUCTS');

  // Check if the current logged-in user is the owner of this shop
  const isOwner = (() => {
    try {
      const saved = localStorage.getItem('seller_shop');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.id === shopId) return true;
      }
    } catch {}
    return false;
  })();

  // 1. Fetch Shop Details from Backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    shopApi
      .getShop(shopId)
      .then((res) => {
        if (isMounted && res?.body) {
          setShop(res.body);
          setFollowersCount(res.body.totalFollowers || 0);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch shop from API:', err);
        if (isMounted) {
          // Check if it's the current user's locally registered shop
          const saved = localStorage.getItem('seller_shop');
          if (saved) {
            try {
              const s = JSON.parse(saved);
              if (s.id === shopId || !shopId) {
                const realUserShop: ShopResponse = {
                  id: s.id,
                  name: s.name,
                  description: s.description || '',
                  logoUrl: s.logoUrl || '',
                  bannerUrl: s.bannerUrl || '',
                  rating: s.rating || 0,
                  totalProducts: s.totalProducts || 0,
                  totalFollowers: s.totalFollowers || 0,
                  isActive: true,
                };
                setShop(realUserShop);
                setFollowersCount(realUserShop.totalFollowers || 0);
                return;
              }
            } catch {}
          }
          // If shop doesn't exist in backend or local, display Not Found
          setShop(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  // 2. Fetch Shop Products (Strictly filter products belonging to this shop only)
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    if (!shop?.name) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    productApi
      .getProducts()
      .then((res) => {
        if (isMounted && res?.body?.items) {
          const allItems = res.body.items;
          // Filter ONLY products whose shopName matches this shop's name exactly
          const matching = allItems.filter(
            (p) =>
              p.shopName &&
              p.shopName.trim().toLowerCase() === shop.name.trim().toLowerCase()
          );

          setProducts(matching); // Real products only, empty array [] if brand new shop
        } else if (isMounted) {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.warn('Error loading products for shop:', err);
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId, shop?.name]);

  // Handle follow / unfollow
  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
      info('Đã hủy theo dõi', `Bạn đã bỏ theo dõi ${shop?.name || 'Shop'}.`);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      success('Đã theo dõi Shop!', `Bạn sẽ nhận được thông báo khi ${shop?.name || 'Shop'} có ưu đãi mới.`);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Đã sao chép liên kết!', 'Đã copy đường dẫn gian hàng vào bộ nhớ tạm.');
    } else {
      info('Chia sẻ gian hàng', window.location.href);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((p) => {
      if (!searchKeyword.trim()) return true;
      return p.name.toLowerCase().includes(searchKeyword.toLowerCase().trim());
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'NEWEST') return b.id - a.id;
      return (b.soldCount || 0) - (a.soldCount || 0); // POPULAR
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang tải thông tin gian hàng...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy gian hàng</h2>
          <p className="text-xs text-slate-500 mb-6">
            Gian hàng này không tồn tại hoặc đã tạm dừng hoạt động trên hệ thống.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[#fafafa] pb-24">
      {/* ── Owner Notice Bar (Only shown if logged in user owns this shop) ── */}
      {isOwner && (
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-white/20">
                <Store className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Chế độ xem Người mua:</strong> Bạn đang xem trang giới thiệu công khai của gian hàng mình.
              </span>
            </div>
            <Link
              to="/seller/shop"
              className="px-3 py-1 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors shrink-0"
            >
              Chỉnh sửa thông tin tại Kênh Người Bán →
            </Link>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200/80 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">Gian hàng</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-800 truncate max-w-[200px]">{shop.name}</span>
        </div>
      </div>

      {/* ── Hero Banner & Storefront Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Banner Container */}
          <div className="relative h-44 sm:h-64 w-full bg-slate-900 overflow-hidden">
            <img
              src={
                shop.bannerUrl ||
                'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80'
              }
              alt={shop.name}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition-all cursor-pointer"
                title="Chia sẻ gian hàng"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop Identity & Stats Bar */}
          <div className="p-6 sm:p-8 -mt-14 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              {/* Left Identity: Avatar & Titles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="relative shrink-0">
                  <img
                    src={
                      shop.logoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={shop.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-white p-1 shadow-md border-2 border-white ring-1 ring-slate-100"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20" title="Đang trực tuyến" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {shop.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-900 text-white shadow-xs">
                      SHOP CHÍNH HÃNG
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đang hoạt động
                    </span>
                    <span>•</span>
                    <span>Phản hồi chat trong vài phút</span>
                  </p>
                </div>
              </div>

              {/* Right: Actions (Theo dõi, Chat) - NO EDIT PERMISSION FOR BUYERS */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isFollowing
                      ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-[0.98]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>+ Theo dõi Shop</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => success('Khởi tạo cuộc trò chuyện', `Đang kết nối với nhân viên chăm sóc khách hàng của ${shop.name}...`)}
                  className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-slate-700" />
                  <span>Chat Với Shop</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar (Read Only) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Đánh giá Shop</span>
                  <span className="text-sm font-bold text-slate-800">
                    {shop.rating && shop.rating > 0 ? `${shop.rating.toFixed(1)} / 5.0` : 'Chưa có đánh giá'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Tổng sản phẩm</span>
                  <span className="text-sm font-bold text-slate-800">
                    {products.length} sản phẩm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Người theo dõi</span>
                  <span className="text-sm font-bold text-slate-800">{followersCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Cam kết</span>
                  <span className="text-sm font-bold text-emerald-600">100% Chính hãng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Catalog & Content Tabs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`pb-3.5 text-sm font-semibold relative transition-colors cursor-pointer ${
                activeTab === 'PRODUCTS'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất Cả Sản Phẩm ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('ABOUT')}
              className={`pb-3.5 text-sm font-semibold relative transition-colors cursor-pointer ${
                activeTab === 'ABOUT'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hồ Sơ & Giới Thiệu Shop
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-6">
            {/* Filter and Sort Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Internal Shop Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={`Tìm sản phẩm trong gian hàng ${shop.name}...`}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
                  Sắp xếp:
                </span>
                <button
                  onClick={() => setSortBy('POPULAR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    sortBy === 'POPULAR'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Phổ biến
                </button>
                <button
                  onClick={() => setSortBy('NEWEST')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    sortBy === 'NEWEST'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortBy('PRICE_ASC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    sortBy === 'PRICE_ASC'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Giá thấp → cao
                </button>
                <button
                  onClick={() => setSortBy('PRICE_DESC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    sortBy === 'PRICE_DESC'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Giá cao → thấp
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Đang tải sản phẩm của gian hàng...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchKeyword
                    ? `Không có sản phẩm nào phù hợp với từ khóa "${searchKeyword}". Thử tìm kiếm với từ khóa khác.`
                    : 'Gian hàng hiện tại chưa có sản phẩm nào được đăng bán.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ABOUT / PROFILE (READ ONLY) */}
        {activeTab === 'ABOUT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description & Store Policies */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-slate-900" />
                  <span>Giới thiệu gian hàng</span>
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {shop.description ||
                    'Gian hàng cam kết mang đến những sản phẩm chất lượng cao nhất, trải nghiệm mua sắm tuyệt vời và dịch vụ hậu mãi chu đáo đến mọi khách hàng.'}
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Cam kết từ nhà bán hàng</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">100% Hàng chính hãng</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái kém chất lượng.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Đổi trả 15 ngày miễn phí</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ đổi mới nhanh chóng nếu phát sinh lỗi từ nhà sản xuất.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Giao hàng hỏa tốc</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Đóng gói chuẩn quy cách, bàn giao đơn vị vận chuyển ngay trong ngày.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Hỗ trợ tư vấn tận tâm</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Đội ngũ kỹ thuật viên và CSKH hỗ trợ giải đáp 24/7.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Security & Read Only Notice */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-3">
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>Xác thực bởi ZoraMall</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gian hàng này đã được xác thực thông tin đăng ký kinh doanh và bảo chứng chất lượng bởi nền tảng thương mại điện tử ZoraEcommerce.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="flex justify-between">
                    <span>Mã gian hàng:</span>
                    <strong className="text-slate-800">SHOP-{shop.id.toString().padStart(5, '0')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <strong className="text-emerald-600">Đã kích hoạt</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Chế độ hiển thị:</span>
                    <strong className="text-slate-700">Công khai (Chỉ đọc)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetailPage;
