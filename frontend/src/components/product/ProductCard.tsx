import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Check, ShieldCheck, Truck } from 'lucide-react';
import { ProductSummaryResponse } from '../../types/product';
import { formatVND } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { getWishlist, toggleWishlist } from '../../utils/wishlist';

interface ProductCardProps {
  product: ProductSummaryResponse;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => getWishlist().includes(product.id));

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    await addToCart(product.slug || String(product.id), 1);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    setIsFavorite(added);
  };

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className="product-card-elite group flex flex-col h-full no-underline bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-300"
    >
      {/* ── Image Stage ─────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100">
        <img
          src={product.primaryImageUrl || `https://picsum.photos/seed/product-${product.id}/500/500`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {discountPercent !== null && discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
              -{discountPercent}%
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide bg-slate-900 text-white shadow-2xs flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span>CHÍNH HÃNG</span>
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          title={isFavorite ? 'Bỏ thích' : 'Yêu thích'}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 shadow-xs flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer z-10"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Quick Add Overlay Button */}
        <button
          onClick={handleQuickAdd}
          title="Thêm nhanh vào giỏ"
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-300 shadow-xs cursor-pointer z-10 ${
            isAdded
              ? 'bg-emerald-600 scale-105'
              : 'bg-slate-900 hover:bg-slate-800 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0'
          }`}
        >
          {isAdded ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <ShoppingCart className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Content Stage ───────────────────────────────────────────── */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Shop label */}
          <p className="text-[10px] font-medium text-slate-400 truncate mb-0.5">
            {product.shopName}
          </p>

          {/* Product Title */}
          <h3 className="text-xs sm:text-[13px] font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-slate-700 transition-colors h-8 sm:h-9 flex items-start">
            {product.name}
          </h3>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100/90">
          {/* Freeship tag */}
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-emerald-600 mb-1 truncate">
            <Truck className="w-2.5 h-2.5 shrink-0" />
            <span>Freeship Xtra • Giao 2H</span>
          </div>

          {/* Price & Rating */}
          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {formatVND(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through font-normal">
                  {formatVND(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Rating and Sold */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
              <div className="flex items-center text-amber-400">
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
              <span className="font-semibold text-slate-700">
                {(product.ratingAvg ?? 5.0).toFixed(1)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">
                Đã bán{' '}
                {(product.soldCount ?? 0) > 1000
                  ? `${((product.soldCount ?? 0) / 1000).toFixed(1)}k`
                  : product.soldCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
