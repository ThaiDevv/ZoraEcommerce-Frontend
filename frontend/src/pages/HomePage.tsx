import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Flame,
  TrendingUp,
  Package,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Layers,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { CategoryResponse, ProductSummaryResponse } from '../types/product';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { MOCK_CATEGORIES } from '../data/mockData';
import { formatVND } from '../utils/format';
import { useCart } from '../context/CartContext';

// ── Countdown Hook ────────────────────────────────────────────────
function useCountdown(targetHours = 3) {
  const [timeLeft, setTimeLeft] = useState({ h: '02', m: '48', s: '35' });

  useEffect(() => {
    const target = Date.now() + targetHours * 3600 * 1000;
    const interval = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft({ h, m, s });
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetHours]);

  return timeLeft;
}

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const countdown = useCountdown(4);
  const flashSaleRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<CategoryResponse[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [sortBy, setSortBy] = useState<string>('popular');
  const [loading, setLoading] = useState<boolean>(false);
  const [spotlightAdded, setSpotlightAdded] = useState<boolean>(false);

  // Sync categories
  useEffect(() => {
    productApi
      .getCategories()
      .then((res) => {
        if (res?.body?.length) {
          setCategories(res.body);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
        setCategories(MOCK_CATEGORIES);
      });
  }, []);

  // Sync products with filter & search
  useEffect(() => {
    setLoading(true);

    let apiSortBy: 'CREATED_DATE' | 'PRICE' | 'SOLD_COUNT' | 'RATING_AVG' | undefined = undefined;
    let apiSortDir: 'ASC' | 'DESC' | undefined = undefined;

    if (sortBy === 'latest') {
      apiSortBy = 'CREATED_DATE';
      apiSortDir = 'DESC';
    } else if (sortBy === 'sold') {
      apiSortBy = 'SOLD_COUNT';
      apiSortDir = 'DESC';
    } else if (sortBy === 'price_asc') {
      apiSortBy = 'PRICE';
      apiSortDir = 'ASC';
    } else if (sortBy === 'price_desc') {
      apiSortBy = 'PRICE';
      apiSortDir = 'DESC';
    } else if (sortBy === 'popular') {
      apiSortBy = 'RATING_AVG';
      apiSortDir = 'DESC';
    }

    productApi
      .getProducts({
        keyword: keywordParam || undefined,
        categoryId: selectedCategory || undefined,
        sortBy: apiSortBy,
        sortDir: apiSortDir,
      })
      .then((res) => {
        if (res?.body?.items) {
          setProducts(res.body.items);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load products', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [keywordParam, selectedCategory, sortBy]);

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    if (id) {
      setSearchParams({ category: id.toString() });
    } else {
      setSearchParams({});
    }
  };

  const scrollToFlashSale = () => {
    flashSaleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSpotlightAddToCart = async (product: ProductSummaryResponse) => {
    setSpotlightAdded(true);
    await addToCart(product.slug || String(product.id), 1);
    setTimeout(() => setSpotlightAdded(false), 1500);
  };

  const flashSaleProducts = products.slice(0, 6);
  const spotlightProduct = products[0] || null;

  return (
    <div className="page-enter min-h-screen bg-[#fafafa] pb-20">
      {/* ── Minimalist Editorial Hero Section ──────────────────────── */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial Message & Metrics */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>HỆ THỐNG MUA SẮM CHÍNH HÃNG • BẢO ĐẢM 100%</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
                Không gian mua sắm <br />
                <span className="text-slate-900 underline decoration-slate-300 underline-offset-8">
                  chuẩn mực & tinh tế
                </span>{' '}
                tại Zora.
              </h1>

              {/* Subtext */}
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
                Khám phá hàng triệu sản phẩm chọn lọc từ các thương hiệu uy tín. Giao hỏa tốc 2 giờ nội thành, miễn phí vận chuyển toàn quốc và cam kết bồi hoàn 200% nếu phát hiện hàng giả.
              </p>

              {/* CTA Row */}
              <div className="flex items-center gap-3 flex-wrap mb-10">
                <button
                  type="button"
                  onClick={scrollToFlashSale}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Săn Giờ Vàng Flash Sale</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Metric Highlights Ribbon (Consistent with Admin Dashboard Style) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 w-full max-w-lg">
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 block leading-tight">25.000+</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Sản phẩm tuyển chọn</p>
                </div>
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 block leading-tight">99.8%</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Đánh giá hài lòng</p>
                </div>
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 block leading-tight">2 Giờ</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Giao hỏa tốc nội thành</p>
                </div>
              </div>
            </div>

            {/* Right Column: Refined Bento Spotlight Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative">
                {/* Spotlight Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Ưu Đãi Chớp Nhoáng
                      </h3>
                      <p className="text-[11px] text-slate-500">Giảm giá có giới hạn thời gian</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>ĐANG DIỄN RA</span>
                  </span>
                </div>

                {/* Countdown display */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thời gian còn lại:</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold">
                    <span className="px-2 py-1 rounded bg-slate-900 text-white">
                      {countdown.h}
                    </span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="px-2 py-1 rounded bg-slate-900 text-white">
                      {countdown.m}
                    </span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="px-2 py-1 rounded bg-slate-900 text-white">
                      {countdown.s}
                    </span>
                  </div>
                </div>

                {/* Spotlight Product Highlight */}
                {spotlightProduct ? (
                  <div className="bg-white rounded-xl border border-slate-200/80 p-4 transition-all">
                    <div className="flex gap-4 items-center">
                      <img
                        src={spotlightProduct.primaryImageUrl || 'https://picsum.photos/seed/spotlight/300/300'}
                        alt={spotlightProduct.name}
                        className="w-20 h-20 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            GIẢM 25%
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 truncate">
                            {spotlightProduct.shopName}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {spotlightProduct.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-bold text-slate-900">
                            {formatVND(spotlightProduct.price)}
                          </span>
                          {spotlightProduct.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatVND(spotlightProduct.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock indicator */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                        <span>Đã bán 86%</span>
                        <span className="text-slate-900 font-semibold">Chỉ còn 14 suất ưu đãi</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full w-[86%]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpotlightAddToCart(spotlightProduct)}
                      className={`w-full mt-3.5 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        spotlightAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      {spotlightAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã thêm vào giỏ hàng!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Mua ngay với giá ưu đãi</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Đang cập nhật sản phẩm nổi bật...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Propositions Ribbon ──────────────────────────────── */}
      <section className="bg-white border-b border-slate-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Giao Hỏa Tốc 2 Giờ</h4>
                <p className="text-[11px] text-slate-500">Nội thành Hà Nội & TP.HCM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">100% Chính Hãng</h4>
                <p className="text-[11px] text-slate-500">Bồi thường 200% nếu phát hiện giả</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">15 Ngày Đổi Trả</h4>
                <p className="text-[11px] text-slate-500">Thủ tục nhanh chóng, miễn phí</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Hỗ Trợ 24/7</h4>
                <p className="text-[11px] text-slate-500">Đội ngũ chuyên viên tận tâm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shopee-Style Category Showcase & Quick Services ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <CategoryShowcase
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </section>

      {/* ── Flash Sale Section (Clean Minimalist White Bento) ───────── */}
      <section ref={flashSaleRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                    Flash Sale Giờ Vàng
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase">
                    Hôm nay
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Sản phẩm giá ưu đãi số lượng có hạn</p>
              </div>
            </div>

            {/* Countdown widget */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              <span className="text-xs font-medium text-slate-600">Kết thúc sau:</span>
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <span className="px-2 py-1 rounded bg-slate-900 text-white">{countdown.h}</span>
                <span className="text-slate-400">:</span>
                <span className="px-2 py-1 rounded bg-slate-900 text-white">{countdown.m}</span>
                <span className="text-slate-400">:</span>
                <span className="px-2 py-1 rounded bg-slate-900 text-white">{countdown.s}</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {flashSaleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Product Catalog / Discovery Section ────────────────── */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Section Header with Segmented Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              {keywordParam ? `Kết quả tìm kiếm cho: "${keywordParam}"` : 'Sản Phẩm Dành Cho Bạn'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Hiển thị {products.length} sản phẩm</span>
              {keywordParam && (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  <span>Xóa từ khóa</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Segmented Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'popular', label: 'Phổ biến', icon: TrendingUp },
              { id: 'latest', label: 'Mới nhất', icon: Package },
              { id: 'sold', label: 'Bán chạy', icon: Flame },
              { id: 'price_asc', label: 'Giá thấp', icon: ArrowDownNarrowWide },
              { id: 'price_desc', label: 'Giá cao', icon: ArrowUpNarrowWide },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSortBy(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 h-64 shimmer-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy sản phẩm nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa các bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
                setSelectedCategory(null);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
