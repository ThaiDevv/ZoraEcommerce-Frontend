import { useState, useEffect, useCallback } from "react"
import { 
  Star, 
  Sparkles, 
  Loader2, 
  MapPin
} from "lucide-react"
import { productApi } from "../api/productApi"

export interface ProductDisplayItem {
  id: number
  name: string
  price: string
  rawPrice: number
  originalPrice: string
  discount: string
  rating: number
  sold: string
  badge: string
  badgeType: "mall" | "favorite"
  tag: string
  location: string
  image: string
  slug?: string
}

// Fallback Initial mock products
const FALLBACK_PRODUCTS: ProductDisplayItem[] = [
  {
    id: 101,
    name: "Áo Thun Nam Cổ Tròn Cotton 100% Co Giãn Thoáng Khí Chống Nhăn",
    price: "129.000₫",
    rawPrice: 129000,
    originalPrice: "210.000₫",
    discount: "-38%",
    rating: 4.9,
    sold: "Đã bán 3.4k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Freeship Xtra",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 102,
    name: "Tai Nghe Chụp Tai Bluetooth Không Dây Khử Ồn Âm Bass Sâu",
    price: "790.000₫",
    rawPrice: 790000,
    originalPrice: "1.250.000₫",
    discount: "-37%",
    rating: 5.0,
    sold: "Đã bán 1.8k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Giảm 50k",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 103,
    name: "Váy Nữ Hoa Nhí Cổ Vuông Dáng Dài Vintage Thanh Lịch Đi Tiệc",
    price: "285.000₫",
    rawPrice: 285000,
    originalPrice: "420.000₫",
    discount: "-32%",
    rating: 4.8,
    sold: "Đã bán 2.1k",
    badge: "Yêu thích+",
    badgeType: "favorite",
    tag: "Voucher 15k",
    location: "Đà Nẵng",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 104,
    name: "Nồi Cơm Điện Cao Tần Dung Tích 1.8L Lòng Nồi Chống Dính 5 Lớp",
    price: "1.290.000₫",
    rawPrice: 1290000,
    originalPrice: "1.990.000₫",
    discount: "-35%",
    rating: 4.9,
    sold: "Đã bán 950",
    badge: "Mall",
    badgeType: "mall",
    tag: "Bảo hành 24T",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 105,
    name: "Giày Thể Thao Sneaker Nam Nữ Độn Đế 4cm Tôn Dáng Cực Đẹp",
    price: "349.000₫",
    rawPrice: 349000,
    originalPrice: "550.000₫",
    discount: "-36%",
    rating: 4.9,
    sold: "Đã bán 5.6k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Freeship Xtra",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 106,
    name: "Bộ Dưỡng Trắng Da Chuyên Sâu Tinh Chất Vitamin C & Serum Phục Hồi",
    price: "499.000₫",
    rawPrice: 499000,
    originalPrice: "850.000₫",
    discount: "-41%",
    rating: 5.0,
    sold: "Đã bán 4.2k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Tặng Quà 200k",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 107,
    name: "Đồng Hồ Nam Dây Da Cao Cấp Chống Nước 5ATM Mặt Kính Sapphire",
    price: "680.000₫",
    rawPrice: 680000,
    originalPrice: "1.100.000₫",
    discount: "-38%",
    rating: 4.8,
    sold: "Đã bán 1.1k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Hộp Fullbox",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 108,
    name: "Balo Laptop Nam Chống Trộm Chống Thấm Nước Cổng Sạc USB Thông Minh",
    price: "299.000₫",
    rawPrice: 299000,
    originalPrice: "480.000₫",
    discount: "-37%",
    rating: 4.9,
    sold: "Đã bán 2.9k",
    badge: "Yêu thích+",
    badgeType: "favorite",
    tag: "Đổi mới 7 ngày",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 109,
    name: "Bàn Phím Cơ Không Dây 3 Mode Bluetooth 2.4G Type-C Led RGB",
    price: "620.000₫",
    rawPrice: 620000,
    originalPrice: "950.000₫",
    discount: "-35%",
    rating: 5.0,
    sold: "Đã bán 1.7k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Hot-swap Switch",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 110,
    name: "Tinh Dầu Thơm Phòng Thảo Mộc Tự Nhiên Que Khuếch Tán Cao Cấp 100ml",
    price: "119.000₫",
    rawPrice: 119000,
    originalPrice: "190.000₫",
    discount: "-37%",
    rating: 4.8,
    sold: "Đã bán 6.8k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Mua 2 Tặng 1",
    location: "Lâm Đồng",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 111,
    name: "Kính Râm Thời Trang Nam Nữ Phân Cực Chống Tia UV400 Gọng Kim Loại",
    price: "175.000₫",
    rawPrice: 175000,
    originalPrice: "290.000₫",
    discount: "-40%",
    rating: 4.7,
    sold: "Đã bán 3.1k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Tặng Khăn Lau",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 112,
    name: "Chuột Máy Tính Không Dây Bluetooth & Wireless 2.4GHz Silent Chống Ồn",
    price: "189.000₫",
    rawPrice: 189000,
    originalPrice: "320.000₫",
    discount: "-41%",
    rating: 4.9,
    sold: "Đã bán 4.8k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Pin Sạc Type-C",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80",
  },
]

export default function DailyDiscover() {
  const [products, setProducts] = useState<ProductDisplayItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Fetch recommended products from backend API (tách riêng với tìm kiếm)
  const loadProducts = useCallback(
    async (pageIndex: number, isAppend: boolean) => {
      try {
        if (!isAppend) setIsLoading(true)
        else setIsLoadingMore(true)

        let sortBy = "CREATED_DATE"
        let sortDir = "DESC"
        if (activeTab === "sale") {
          sortBy = "PRICE"
          sortDir = "ASC"
        }

        const res = await productApi.getProducts({
          page: pageIndex,
          size: 12,
          sortBy,
          sortDir,
        })

        const rawItems = res?.items || res?.content || []
        const isLast = res?.last ?? (rawItems.length < 12)

        if (rawItems.length > 0) {
          const mapped: ProductDisplayItem[] = rawItems.map((item, idx) => {
            const numPrice = Number(item.price) || 0
            const numOrigPrice = Number(item.originalPrice) || numPrice * 1.3
            const discPercent = numOrigPrice > numPrice
              ? `-${Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)}%`
              : "-20%"

            const isMall = idx % 2 === 0
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              rawPrice: numPrice,
              price: numPrice.toLocaleString("vi-VN") + "₫",
              originalPrice: numOrigPrice.toLocaleString("vi-VN") + "₫",
              discount: discPercent,
              rating: item.ratingAvg && item.ratingAvg > 0 ? Number(item.ratingAvg.toFixed(1)) : 5.0,
              sold: item.soldCount ? `Đã bán ${(item.soldCount > 1000 ? (item.soldCount / 1000).toFixed(1) + "k" : item.soldCount)}` : "Đã bán 120",
              badge: isMall ? "Mall" : "Yêu thích",
              badgeType: isMall ? "mall" : "favorite",
              tag: idx % 3 === 0 ? "Freeship Xtra" : idx % 3 === 1 ? "Giảm 15k" : "Chính Hãng",
              location: item.shopName?.includes("Hà Nội") ? "Hà Nội" : "TP. Hồ Chí Minh",
              image: item.primaryImageUrl || FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length].image,
            }
          })

          if (isAppend) {
            setProducts((prev) => [...prev, ...mapped])
          } else {
            setProducts(mapped)
          }
          setHasMore(!isLast)
        } else {
          // If backend has no data, fallback smoothly
          if (!isAppend) setProducts(FALLBACK_PRODUCTS)
          setHasMore(false)
        }
      } catch (err) {
        console.warn("Error fetching products from backend, using fallback:", err)
        if (!isAppend) setProducts(FALLBACK_PRODUCTS)
        setHasMore(false)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [activeTab]
  )

  // Reset & load when activeTab changes
  useEffect(() => {
    setCurrentPage(0)
    loadProducts(0, false)
  }, [loadProducts])

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    loadProducts(nextPage, true)
  }

  return (
    <section id="daily-discover" className="w-full bg-[#f8fafc] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* ================= 1. TAB HEADER: GỢI Ý HÔM NAY ================= */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200/80 sticky top-[72px] z-40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Title: GỢI Ý HÔM NAY (Đơn giản, tách biệt) */}
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-6 bg-[#ee4d2d] rounded-full" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                GỢI Ý HÔM NAY
              </h2>
            </div>

            {/* Sub-filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap text-xs">
              {[
                { id: "all", label: "Tất Cả" },
                { id: "sale", label: "Giá Rẻ Nhất" },
                { id: "mall", label: "Chính Hãng Mall" },
                { id: "freeship", label: "Freeship Xtra" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#ee4d2d] text-white shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ================= 2. PRODUCTS GRID (6 COLS ON DESKTOP) ================= */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 space-y-3 animate-pulse border border-slate-200/60">
                <div className="w-full aspect-square bg-slate-200 rounded-lg" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
              >
                {/* Product Image & Badges */}
                <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                  {/* Mall or Favorite badge */}
                  <span
                    className={`absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide shadow-xs ${
                      item.badgeType === "mall"
                        ? "bg-[#d0011b] text-white"
                        : "bg-[#ee4d2d] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>

                  {/* Discount Tag */}
                  <span className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-xs">
                    {item.discount}
                  </span>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
                    }}
                  />

                  {/* Location indicator */}
                  <div className="absolute bottom-2 left-2 z-10 bg-black/40 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  {/* Title */}
                  <h3 className="text-[12px] font-normal text-slate-800 group-hover:text-[#ee4d2d] line-clamp-2 leading-snug transition-colors">
                    {item.name}
                  </h3>

                  {/* Voucher tag */}
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[9px] font-semibold text-[#ee4d2d] bg-orange-50 border border-orange-200 px-1 py-0.2 rounded">
                      {item.tag}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-[#ee4d2d]">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      {item.originalPrice}
                    </span>
                  </div>

                  {/* Rating & Sold count */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                      <span className="text-slate-600 font-medium">{item.rating}</span>
                    </div>
                    <span>{item.sold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 3. LOAD MORE BUTTON ================= */}
        {products.length > 0 && (
          <div className="pt-4 flex justify-center">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-10 py-2.5 rounded-xl border border-slate-300 hover:border-[#ee4d2d] bg-white hover:bg-orange-50/40 text-slate-700 hover:text-[#ee4d2d] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 group"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#ee4d2d]" />
                    <span>Đang tải thêm sản phẩm...</span>
                  </>
                ) : (
                  <>
                    <span>Xem Thêm Sản Phẩm</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#ee4d2d] group-hover:scale-125 transition-transform" />
                  </>
                )}
              </button>
            ) : (
              <div className="text-center text-xs text-slate-400 py-2 font-medium">
                Bạn đã xem hết các sản phẩm gợi ý hôm nay!
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
