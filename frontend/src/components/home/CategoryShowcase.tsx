import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CategoryResponse } from '../../types/product';

interface CategoryShowcaseProps {
  categories: CategoryResponse[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll positions
  const checkScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollButtons, { passive: true });
    window.addEventListener('resize', checkScrollButtons);
    return () => {
      el.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Divide into 2 rows just like Shopee (first half in Row 1, second half in Row 2)
  const half = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, half);
  const row2 = categories.slice(half);

  // Currently selected category object
  const activeCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-4">
      {/* ── "DANH MỤC" Showcase Box (Shopee 2-Row Style) ──────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wider uppercase">
              DANH MỤC
            </h2>
            {activeCat && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-900 border border-slate-200">
                <span>Đang lọc: {activeCat.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory(null)}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                  title="Bỏ lọc"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>

          {activeCat && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
          )}
        </div>

        {/* Categories 2-Row Slider Container */}
        <div className="relative group/slider">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-700 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-700 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Container (Shopee columns × 2 rows) */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-none scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex flex-col min-w-max">
              {/* Row 1 */}
              <div className="flex">
                {row1.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(isActive ? null : cat.id)}
                      className={`w-[110px] sm:w-[124px] h-[136px] sm:h-[148px] flex flex-col items-center justify-center p-2 border-r border-b border-slate-100 transition-all duration-200 cursor-pointer text-center group shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-white hover:bg-slate-50/80 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {/* Circle Image Wrapper */}
                      <div
                        className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-1 mb-2 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-108 border ${
                          isActive
                            ? 'bg-white/10 border-white/20'
                            : 'bg-slate-50/80 border-slate-200/80 group-hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={cat.imageUrl || `https://picsum.photos/seed/cat-${cat.id}/150/150`}
                          alt={cat.name}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                          }}
                        />
                      </div>
                      {/* Category Label */}
                      <span
                        className={`text-xs sm:text-[13px] font-medium leading-snug line-clamp-2 h-8 flex items-center justify-center px-1 ${
                          isActive ? 'text-white font-bold' : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2 */}
              <div className="flex">
                {row2.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(isActive ? null : cat.id)}
                      className={`w-[110px] sm:w-[124px] h-[136px] sm:h-[148px] flex flex-col items-center justify-center p-2 border-r border-slate-100 transition-all duration-200 cursor-pointer text-center group shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-white hover:bg-slate-50/80 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {/* Circle Image Wrapper */}
                      <div
                        className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-1 mb-2 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-108 border ${
                          isActive
                            ? 'bg-white/10 border-white/20'
                            : 'bg-slate-50/80 border-slate-200/80 group-hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={cat.imageUrl || `https://picsum.photos/seed/cat-${cat.id}/150/150`}
                          alt={cat.name}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                          }}
                        />
                      </div>
                      {/* Category Label */}
                      <span
                        className={`text-xs sm:text-[13px] font-medium leading-snug line-clamp-2 h-8 flex items-center justify-center px-1 ${
                          isActive ? 'text-white font-bold' : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
