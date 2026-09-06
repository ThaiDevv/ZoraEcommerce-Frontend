import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  ArrowLeft,
  Heart,
  Share2,
  Check,
  MessageCircle,
  Clock,
  Ticket,
  ShieldAlert,
  ChevronRight,
  Home,
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { ProductResponse, ProductVariantResponse } from '../types/product';
import { getWishlist, toggleWishlist as toggleWishlistUtil } from '../utils/wishlist';
import { formatVND } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isFavorite, setIsFavorite] = useState(false);
  const [categoryPath, setCategoryPath] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const loadCategoryPath = async (targetCategoryId: number) => {
    try {
      const res = await categoryApi.getCategoryTree();
      if (Array.isArray(res?.body)) {
        const findPath = (tree: any[], targetId: number): any[] => {
          for (const c1 of tree) {
            if (c1.id === targetId) return [c1];
            if (c1.children) {
              for (const c2 of c1.children) {
                if (c2.id === targetId) return [c1, c2];
                if (c2.children) {
                  for (const c3 of c2.children) {
                    if (c3.id === targetId) return [c1, c2, c3];
                  }
                }
              }
            }
          }
          return [];
        };
        const path = findPath(res.body, targetCategoryId);
        setCategoryPath(path.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
      }
    } catch (err) {
      console.warn('Could not load category tree for breadcrumbs', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!id) return;

    productApi
      .getProductDetail(id)
      .then((res) => {
        if (res?.body) {
          applyProduct(res.body);
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load product detail', err);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const applyProduct = (p: ProductResponse) => {
    setProduct(p);
    if (p.variants && p.variants.length > 0) {
      setSelectedVariant(p.variants[0]);
    }
    if (p.images && p.images.length > 0) {
      setActiveImage(p.images[0].imageUrl);
    }
    setIsFavorite(getWishlist().includes(p.id));
    if (p.category?.id) {
      loadCategoryPath(p.category.id);
    }
  };

  const handleVariantChange = (variant: ProductVariantResponse) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) {
      setActiveImage(variant.imageUrl);
    }
    if (quantity > variant.stock) {
      setQuantity(Math.max(1, variant.stock));
    }
  };

  const handleAddToCart = async () => {
    if (isAdmin) {
      error('Tài khoản Quản trị viên (Admin) không thể mua hàng');
      return;
    }
    if (!selectedVariant || !product) return;
    await addToCart(selectedVariant.sku || selectedVariant.id, quantity, product);
  };

  const handleBuyNow = async () => {
    if (isAdmin) {
      error('Tài khoản Quản trị viên (Admin) không thể mua hàng');
      return;
    }
    if (!selectedVariant || !product) return;
    const ok = await addToCart(selectedVariant.sku || selectedVariant.id, quantity, product);
    if (ok) navigate('/cart');
  };

  const toggleWishlist = () => {
    if (!product) return;
    const res = toggleWishlistUtil(product.id);
    setIsFavorite(res);
    success(res ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi yêu thích');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 h-96 shimmer-card rounded-3xl" />
          <div className="lg:col-span-6 h-96 shimmer-card rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4 text-xs py-2 px-4">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = product.originalPrice;
  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  return (
    <div className="page-enter min-h-screen bg-[#fafafa] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {categoryPath.length > 0 ? (
            categoryPath.map((cat) => (
              <React.Fragment key={cat.id}>
                <Link
                  to={`/?category=${cat.id}`}
                  className="hover:text-blue-600 transition-colors font-medium text-slate-600 hover:underline"
                  title={`Xem tất cả sản phẩm thuộc ${cat.name}`}
                >
                  {cat.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </React.Fragment>
            ))
          ) : product.category ? (
            <>
              <Link
                to={`/?category=${product.category.id}`}
                className="hover:text-blue-600 transition-colors font-medium text-slate-600 hover:underline"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </>
          ) : null}
          <span className="text-slate-800 font-semibold truncate max-w-sm" title={product.name}>
            {product.name}
          </span>
        </nav>

        {/* ── Main Stage (2 Columns 50/50) ───────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Col: Media Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Viewport */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                <img
                  src={activeImage || product.images[0]?.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-900 text-white shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CHÍNH HÃNG ZORA
                  </span>
                  {discountPercent && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                      GIẢM {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Wishlist Floating Button */}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-slate-200 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails Carousel */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                  {product.images.map((img) => {
                    const isSelected = activeImage === img.imageUrl;
                    return (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(img.imageUrl)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/10 scale-102'
                            : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Value propositions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Truck className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Giao nhanh 2h toàn quốc</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <RotateCcw className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>15 ngày miễn phí đổi trả</span>
                </div>
              </div>
            </div>

            {/* Right Col: Purchasing Console */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & Social Proof */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{(product.ratingAvg ?? 5.0).toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800">{product.ratingCount}</strong> Đánh giá
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800">{product.soldCount}</strong> Đã bán
                  </span>
                </div>

                {/* Price Display Box */}
                <div className="my-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {formatVND(currentPrice)}
                    </span>
                    {originalPrice && (
                      <span className="text-sm sm:text-base text-slate-400 line-through">
                        {formatVND(originalPrice)}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-2 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-slate-500" />
                    <span>Áp dụng mã FREESHIP50K để được giảm thêm 50.000₫</span>
                  </p>
                </div>

                {/* Variants Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Phiên bản / Phân loại:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleVariantChange(v)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{v.variantName}</span>
                            <span className="opacity-80 ml-1.5 font-normal">
                              ({formatVND(v.price)})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                    Số lượng mua:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-slate-800 font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            selectedVariant ? Math.min(selectedVariant.stock, quantity + 1) : quantity + 1
                          )
                        }
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Còn {selectedVariant ? selectedVariant.stock : 50} sản phẩm có sẵn
                    </span>
                  </div>
                </div>
              </div>

              {/* Action CTA Buttons */}
              {isAdmin ? (
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold block">Tài khoản Quản trị viên (Admin)</span>
                    <span className="text-amber-700">Admin không thể mua hàng hay đặt hàng. Vui lòng sử dụng tài khoản người mua (BUYER).</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className="py-3 px-6 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-700" />
                    <span>{!selectedVariant || selectedVariant.stock <= 0 ? 'Hết hàng' : 'Thêm Vào Giỏ Hàng'}</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className="py-3 px-6 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Mua Ngay</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Shop Info Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={product.shop.logoUrl || 'https://picsum.photos/seed/shop/100/100'}
              alt={product.shop.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{product.shop.name}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  CHÍNH HÃNG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Đánh giá: <strong>{product.shop.rating?.toFixed(1) || '4.9'} / 5.0</strong></span>
                <span>•</span>
                <span>Phản hồi: <strong>98%</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => success('Đang mở hội thoại với người bán...')}
              className="flex-1 sm:flex-initial text-xs py-2 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Chat Với Shop</span>
            </button>
            <Link
              to={`/shops/${product.shop?.id || 1}`}
              className="flex-1 sm:flex-initial text-xs py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-slate-200" />
              <span>Xem Shop</span>
            </Link>
          </div>
        </div>

        {/* ── Tabbed Section: Description & Reviews ───────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-8 border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`text-sm font-semibold pb-2 -mb-4 transition-colors cursor-pointer ${
                activeTab === 'desc'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Mô tả chi tiết
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-semibold pb-2 -mb-4 transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Đánh giá từ khách hàng ({product.ratingCount})
            </button>
          </div>

          {activeTab === 'desc' ? (
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sample reviews */}
              {[
                {
                  name: 'Nguyễn Hoàng Long',
                  time: '2 ngày trước',
                  variant: 'Phiên bản Tiêu Chuẩn',
                  rating: 5,
                  comment:
                    'Hàng chính hãng đóng gói rất kỹ, giao nhanh trong 2 giờ nội thành. Sản phẩm nguyên seal đẹp hoàn hảo!',
                },
                {
                  name: 'Trần Thị Mai Phương',
                  time: '5 ngày trước',
                  variant: 'Phiên bản Cao Cấp (Pro)',
                  rating: 5,
                  comment:
                    'Chất lượng vượt xa tầm giá, shop tư vấn nhiệt tình. Sẽ tiếp tục ủng hộ ZoraEcommerce!',
                },
              ].map((rev, idx) => (
                <div key={idx} className="pb-6 border-b border-slate-100 last:border-none">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                        {rev.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">Phân loại: {rev.variant}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
