import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  RotateCcw,
  Check,
  ArrowUp,
  X,
} from "lucide-react"
import MainHeader from "../components/MainHeader"
import AuthFooter from "../components/AuthFooter"
import { productApi } from "../api/productApi"
import type { CategoryResponse, ProductSummaryResponse } from "../types/product"

export interface SearchProductItem {
  id: number
  name: string
  slug: string
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
}

const FALLBACK_SEARCH_ITEMS: SearchProductItem[] = [
  {
    id: 1,
    name: "Apple iPhone 16 Pro Max 256GB Titan Tự Nhiên - Chính Hãng VN/A",
    slug: "apple-iphone-16-pro-max-256gb",
    price: "34.990.000₫",
    rawPrice: 34990000,
    originalPrice: "38.990.000₫",
    discount: "-10%",
    rating: 4.9,
    sold: "Đã bán 3.8k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Freeship Xtra",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    name: "Áo Thun Nam Cổ Tròn Cotton 100% Co Giãn 4 Chiều Basic Form Rộng",
    slug: "ao-thun-nam-cotton-100",
    price: "159.000₫",
    rawPrice: 159000,
    originalPrice: "250.000₫",
    discount: "-36%",
    rating: 4.7,
    sold: "Đã bán 15.2k",
    badge: "Yêu thích",
    badgeType: "favorite",
    tag: "Giảm 15k",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Đồng Hồ Thông Minh Apple Watch Series 9 GPS 41mm Viền Nhôm Dây Thể Thao",
    slug: "apple-watch-series-9-41mm",
    price: "8.790.000₫",
    rawPrice: 8790000,
    originalPrice: "10.490.000₫",
    discount: "-16%",
    rating: 4.9,
    sold: "Đã bán 2.1k",
    badge: "Mall",
    badgeType: "mall",
    tag: "Freeship Xtra",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 8,
    name: "Máy Pha Cà Phê Espresso Tự Động DeLonghi Dedica EC685 Thép Không Gỉ",
    slug: "may-pha-cafe-delonghi-ec685",
    price: "4.890.000₫",
    rawPrice: 4890000,
    originalPrice: "6.200.000₫",
    discount: "-21%",
    rating: 4.8,
    sold: "Đã bán 840",
    badge: "Mall",
    badgeType: "mall",
    tag: "Bảo hành 24T",
    location: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    name: "Laptop Gaming ASUS ROG Zephyrus G14 AMD Ryzen 9 8945HS RTX 4070 OLED",
    slug: "asus-rog-zephyrus-g14",
    price: "49.990.000₫",
    rawPrice: 49990000,
    originalPrice: "54.990.000₫",
    discount: "-9%",
    rating: 5.0,
    sold: "Đã bán 280",
    badge: "Mall",
    badgeType: "mall",
    tag: "Freeship Xtra",
    location: "Hà Nội",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
  },
]

const POPULAR_SEARCH_TAGS = [
  "Iphone",
  "Áo thun",
  "Tai nghe bluetooth",
  "Bàn phím cơ",
  "Đồng hồ thông minh",
  "Máy pha cà phê",
  "Giày sneaker",
]

const LOCATIONS = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bình Dương"]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Query parameters from URL
  const keyword = searchParams.get("keyword") || ""
  const categoryIdParam = searchParams.get("categoryId")
  const selectedCategoryId = categoryIdParam ? Number(categoryIdParam) : null
  const sortByParam = searchParams.get("sortBy") || "CREATED_DATE"
  const sortDirParam = searchParams.get("sortDir") || "DESC"
  const minPriceParam = searchParams.get("minPrice") || ""
  const maxPriceParam = searchParams.get("maxPrice") || ""
  const pageParam = parseInt(searchParams.get("page") || "0", 10)

  // Local filter states
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [onlyMall, setOnlyMall] = useState(false)
  const [onlyFreeship, setOnlyFreeship] = useState(false)
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)

  // Data states
  const [products, setProducts] = useState<SearchProductItem[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(pageParam)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Load category tree for sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await productApi.getCategoryTree()
        if (Array.isArray(tree)) {
          setCategories(tree)
        }
      } catch (err) {
        console.warn("Lỗi tải cây danh mục:", err)
      }
    }
    fetchCategories()
  }, [])

  // Sync price inputs when URL param changes
  useEffect(() => {
    setMinPriceInput(minPriceParam)
    setMaxPriceInput(maxPriceParam)
  }, [minPriceParam, maxPriceParam])

  // Sync current page when URL page changes
  useEffect(() => {
    setCurrentPage(pageParam)
  }, [pageParam])

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update URL search params helper
  const updateParams = useCallback(
    (newParams: Record<string, string | null | undefined>) => {
      const current = new URLSearchParams(searchParams)
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === undefined || val === "") {
          current.delete(key)
        } else {
          current.set(key, val)
        }
      })
      setSearchParams(current)
    },
    [searchParams, setSearchParams]
  )

  // Main fetch products from backend API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await productApi.getProducts({
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        sortBy: sortByParam,
        sortDir: sortDirParam,
        page: currentPage,
        size: 20,
      })

      const rawItems: ProductSummaryResponse[] = res?.items || res?.content || []
      const total = res?.totalElements ?? rawItems.length
      const pages = res?.totalPages ?? Math.max(1, Math.ceil(total / 20))

      setTotalElements(total)
      setTotalPages(pages)

      if (rawItems.length > 0) {
        const mapped: SearchProductItem[] = rawItems.map((item, idx) => {
          const numPrice = Number(item.price) || 0
          const numOrigPrice = Number(item.originalPrice) || numPrice * 1.3
          const discPercent =
            numOrigPrice > numPrice
              ? `-${Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)}%`
              : "-15%"

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
            sold: item.soldCount
              ? `Đã bán ${item.soldCount > 1000 ? (item.soldCount / 1000).toFixed(1) + "k" : item.soldCount}`
              : "Đã bán 120",
            badge: isMall ? "Mall" : "Yêu thích",
            badgeType: isMall ? "mall" : "favorite",
            tag: idx % 3 === 0 ? "Freeship Xtra" : idx % 3 === 1 ? "Giảm 15k" : "Chính Hãng",
            location: item.shopName?.includes("Hà Nội") ? "Hà Nội" : "TP. Hồ Chí Minh",
            image: item.primaryImageUrl || FALLBACK_SEARCH_ITEMS[idx % FALLBACK_SEARCH_ITEMS.length].image,
          }
        })
        setProducts(mapped)
      } else {
        if (keyword.trim()) {
          const matchedFallback = FALLBACK_SEARCH_ITEMS.filter((item) =>
            item.name.toLowerCase().includes(keyword.toLowerCase().trim())
          )
          setProducts(matchedFallback)
          setTotalElements(matchedFallback.length)
          setTotalPages(1)
        } else {
          setProducts([])
        }
      }
    } catch (err) {
      console.warn("Lỗi tìm kiếm sản phẩm:", err)
      const filtered = keyword.trim()
        ? FALLBACK_SEARCH_ITEMS.filter((i) => i.name.toLowerCase().includes(keyword.toLowerCase().trim()))
        : FALLBACK_SEARCH_ITEMS
      setProducts(filtered)
      setTotalElements(filtered.length)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [keyword, selectedCategoryId, minPriceParam, maxPriceParam, sortByParam, sortDirParam, currentPage])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter client-side enhancements (location, rating, mall, freeship)
  const displayedProducts = useMemo(() => {
    let result = [...products]
    if (selectedLocations.length > 0) {
      result = result.filter((p) => selectedLocations.includes(p.location))
    }
    if (selectedRating !== null) {
      result = result.filter((p) => p.rating >= selectedRating)
    }
    if (onlyMall) {
      result = result.filter((p) => p.badgeType === "mall")
    }
    if (onlyFreeship) {
      result = result.filter((p) => p.tag.includes("Freeship"))
    }
    return result
  }, [products, selectedLocations, selectedRating, onlyMall, onlyFreeship])

  // Handle price filter submission
  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({
      minPrice: minPriceInput.trim() ? minPriceInput.trim() : null,
      maxPrice: maxPriceInput.trim() ? maxPriceInput.trim() : null,
      page: "0",
    })
    setCurrentPage(0)
  }

  // Clear all filters
  const handleResetFilters = () => {
    setMinPriceInput("")
    setMaxPriceInput("")
    setSelectedLocations([])
    setSelectedRating(null)
    setOnlyDiscount(false)
    setOnlyMall(false)
    setOnlyFreeship(false)
    updateParams({
      categoryId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: "CREATED_DATE",
      sortDir: "DESC",
      page: "0",
    })
    setCurrentPage(0)
  }

  // Handle Sort selection
  const handleSelectSort = (type: "popular" | "latest" | "sales" | "priceAsc" | "priceDesc") => {
    setIsPriceDropdownOpen(false)
    if (type === "popular" || type === "latest") {
      updateParams({ sortBy: "CREATED_DATE", sortDir: "DESC", page: "0" })
    } else if (type === "sales") {
      updateParams({ sortBy: "SOLD_COUNT", sortDir: "DESC", page: "0" })
    } else if (type === "priceAsc") {
      updateParams({ sortBy: "PRICE", sortDir: "ASC", page: "0" })
    } else if (type === "priceDesc") {
      updateParams({ sortBy: "PRICE", sortDir: "DESC", page: "0" })
    }
    setCurrentPage(0)
  }

  const selectedCategoryObj = useMemo(() => {
    if (!selectedCategoryId) return null
    for (const cat of categories) {
      if (cat.id === selectedCategoryId) return cat
      if (cat.children) {
        for (const c2 of cat.children) {
          if (c2.id === selectedCategoryId) return c2
          if (c2.children) {
            for (const c3 of c2.children) {
              if (c3.id === selectedCategoryId) return c3
            }
          }
        }
      }
    }
    return null
  }, [categories, selectedCategoryId])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-slate-800 antialiased relative selection:bg-orange-100 selection:text-[#ee4d2d]">
      {/* 1. Header with Shopee Search Bar and Cart Count */}
      <div className="sticky top-0 z-50 shadow-xs">
        <MainHeader />
      </div>

      {/* 2. Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-[13px] text-slate-600 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#ee4d2d] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Kết quả tìm kiếm cho</span>
          <span className="font-semibold text-[#ee4d2d]">
            "{keyword || selectedCategoryObj?.name || "Tất cả sản phẩm"}"
          </span>
          {totalElements > 0 && (
            <span className="text-slate-400 text-xs ml-auto hidden sm:inline">
              Tìm thấy <strong className="text-slate-700">{totalElements}</strong> sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* 3. Main Search Body: Filter Sidebar + Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          
          <aside className="w-full lg:w-60 xl:w-64 shrink-0 bg-white rounded-md p-4 border border-slate-200/90 shadow-2xs space-y-6">
            
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm tracking-wide uppercase">
                <Filter className="w-4 h-4 text-[#ee4d2d]" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </div>
            </div>

            
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Theo Danh Mục
              </h3>
              <div className="space-y-1.5 text-xs max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    updateParams({ categoryId: null, page: "0" })
                    setCurrentPage(0)
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded transition-all cursor-pointer flex items-center justify-between ${
                    !selectedCategoryId
                      ? "text-[#ee4d2d] font-bold bg-orange-50/70"
                      : "text-slate-600 hover:text-[#ee4d2d] hover:bg-slate-50 font-normal"
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  {!selectedCategoryId && <ChevronRight className="w-3.5 h-3.5 text-[#ee4d2d]" />}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateParams({ categoryId: String(cat.id), page: "0" })
                      setCurrentPage(0)
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded transition-all cursor-pointer flex items-center justify-between ${
                      selectedCategoryId === cat.id
                        ? "text-[#ee4d2d] font-bold bg-orange-50/70"
                        : "text-slate-600 hover:text-[#ee4d2d] hover:bg-slate-50 font-normal"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {selectedCategoryId === cat.id && <ChevronRight className="w-3.5 h-3.5 text-[#ee4d2d]" />}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Nơi Bán
              </h3>
              <div className="space-y-2 text-xs">
                {LOCATIONS.map((loc) => {
                  const checked = selectedLocations.includes(loc)
                  return (
                    <label
                      key={loc}
                      className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedLocations(selectedLocations.filter((l) => l !== loc))
                          } else {
                            setSelectedLocations([...selectedLocations, loc])
                          }
                        }}
                        className="w-3.5 h-3.5 rounded text-[#ee4d2d] accent-[#ee4d2d] cursor-pointer"
                      />
                      <span>{loc}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Khoảng Giá (₫)
              </h3>
              <form onSubmit={handleApplyPrice} className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="₫ TỪ"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#ee4d2d] focus:bg-white"
                  />
                  <span className="text-slate-400 font-light">-</span>
                  <input
                    type="number"
                    placeholder="₫ ĐẾN"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#ee4d2d] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold rounded text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  Áp Dụng
                </button>
              </form>
            </div>

            
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Đánh Giá
              </h3>
              <div className="space-y-1.5 text-xs">
                {[5, 4, 3].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                      selectedRating === stars ? "bg-orange-50/80 font-bold" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < stars
                              ? "fill-amber-400 stroke-none"
                              : "fill-slate-200 stroke-none"
                          }`}
                        />
                      ))}
                      <span className="text-slate-600 ml-1">
                        {stars === 5 ? "5 sao" : `từ ${stars} sao`}
                      </span>
                    </div>
                    {selectedRating === stars && <Check className="w-3.5 h-3.5 text-[#ee4d2d]" />}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Dịch Vụ & Khuyến Mãi
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={onlyFreeship}
                    onChange={(e) => setOnlyFreeship(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#ee4d2d] accent-[#ee4d2d] cursor-pointer"
                  />
                  <span>Freeship Xtra</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={onlyMall}
                    onChange={(e) => setOnlyMall(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#ee4d2d] accent-[#ee4d2d] cursor-pointer"
                  />
                  <span>Chính Hãng (Mall)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={onlyDiscount}
                    onChange={(e) => setOnlyDiscount(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#ee4d2d] accent-[#ee4d2d] cursor-pointer"
                  />
                  <span>Đang Giảm Giá</span>
                </label>
              </div>
            </div>

            
            <button
              onClick={handleResetFilters}
              className="w-full py-2 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 font-semibold rounded text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa Tất Cả</span>
            </button>
          </aside>

          
          <section className="flex-1 min-w-0 space-y-4">
            
            
            <div className="bg-[#ededed] rounded-sm p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-600 font-medium">Sắp xếp theo:</span>

                
                <button
                  onClick={() => handleSelectSort("popular")}
                  className={`px-4 py-2 rounded-xs font-medium transition-all cursor-pointer ${
                    sortByParam === "CREATED_DATE" && sortDirParam === "DESC"
                      ? "bg-[#ee4d2d] text-white shadow-xs"
                      : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  Liên Quan
                </button>

                
                <button
                  onClick={() => handleSelectSort("latest")}
                  className={`px-4 py-2 rounded-xs font-medium transition-all cursor-pointer ${
                    sortByParam === "CREATED_DATE" && sortDirParam === "DESC"
                      ? "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                      : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  Mới Nhất
                </button>

                
                <button
                  onClick={() => handleSelectSort("sales")}
                  className={`px-4 py-2 rounded-xs font-medium transition-all cursor-pointer ${
                    sortByParam === "SOLD_COUNT"
                      ? "bg-[#ee4d2d] text-white shadow-xs"
                      : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  Bán Chạy
                </button>

                
                <div className="relative">
                  <button
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className={`px-4 py-2 bg-white rounded-xs border text-slate-800 flex items-center justify-between gap-2 min-w-[140px] cursor-pointer ${
                      sortByParam === "PRICE" ? "border-[#ee4d2d] text-[#ee4d2d] font-bold" : "border-slate-200"
                    }`}
                  >
                    <span>
                      {sortByParam === "PRICE"
                        ? sortDirParam === "ASC"
                          ? "Giá: Thấp đến Cao"
                          : "Giá: Cao đến Thấp"
                        : "Giá"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isPriceDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-30 py-1 text-xs">
                      <button
                        onClick={() => handleSelectSort("priceAsc")}
                        className="w-full text-left px-3 py-2 hover:bg-orange-50 hover:text-[#ee4d2d] text-slate-700 cursor-pointer"
                      >
                        Giá: Thấp đến Cao
                      </button>
                      <button
                        onClick={() => handleSelectSort("priceDesc")}
                        className="w-full text-left px-3 py-2 hover:bg-orange-50 hover:text-[#ee4d2d] text-slate-700 cursor-pointer"
                      >
                        Giá: Cao đến Thấp
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Pagination (Top Right) */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">
                  <span className="text-[#ee4d2d] font-bold">{currentPage + 1}</span>/{totalPages || 1}
                </span>
                <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => {
                      const prev = Math.max(0, currentPage - 1)
                      setCurrentPage(prev)
                      updateParams({ page: String(prev) })
                    }}
                    className="p-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => {
                      const next = Math.min(totalPages - 1, currentPage + 1)
                      setCurrentPage(next)
                      updateParams({ page: String(next) })
                    }}
                    className="p-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 border-l border-slate-200"
                    aria-label="Trang tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Active Filter Badges */}
            {(selectedCategoryId || minPriceParam || maxPriceParam || selectedLocations.length > 0 || selectedRating) && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Đang lọc:</span>
                {selectedCategoryObj && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">
                    Danh mục: {selectedCategoryObj.name}
                    <button
                      onClick={() => updateParams({ categoryId: null, page: "0" })}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minPriceParam || maxPriceParam) && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">
                    Giá: {minPriceParam ? Number(minPriceParam).toLocaleString() + "₫" : "0₫"} -{" "}
                    {maxPriceParam ? Number(maxPriceParam).toLocaleString() + "₫" : "Tối đa"}
                    <button
                      onClick={() => updateParams({ minPrice: null, maxPrice: null, page: "0" })}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedRating && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">
                    Từ {selectedRating} sao
                    <button
                      onClick={() => setSelectedRating(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-[#ee4d2d] hover:underline font-semibold cursor-pointer ml-1"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* 3. Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 py-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="bg-white rounded p-3 space-y-3 animate-pulse border border-slate-200/60">
                    <div className="w-full aspect-square bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              
              <div className="bg-white rounded-md p-10 text-center border border-slate-200 shadow-2xs space-y-4 my-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Không tìm thấy kết quả nào
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Hãy thử sử dụng từ khóa ngắn hơn, kiểm tra lỗi chính tả hoặc thử các từ khóa phổ biến bên dưới.
                </p>

                
                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        navigate(`/search?keyword=${encodeURIComponent(tag)}`)
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-[#ee4d2d] text-xs transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-semibold rounded shadow-xs cursor-pointer transition-colors"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {displayedProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug || item.id}`}
                    className="group bg-white rounded-md overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 relative"
                  >
                    {/* Product Image & Badges */}
                    <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                      {/* Mall or Favorite badge */}
                      <span
                        className={`absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wide shadow-xs ${
                          item.badgeType === "mall" ? "bg-[#d0011b] text-white" : "bg-[#ee4d2d] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>

                      {/* Discount Tag */}
                      <span className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-md shadow-xs">
                        {item.discount}
                      </span>

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
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
                        <span className="text-[13px] font-bold text-[#ee4d2d]">{item.price}</span>
                        <span className="text-[10px] text-slate-400 line-through">{item.originalPrice}</span>
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
                  </Link>
                ))}
              </div>
            )}

            {/* 4. Full Pagination Bar */}
            {totalPages > 1 && (
              <div className="pt-8 pb-4 flex items-center justify-center gap-1.5">
                <button
                  disabled={currentPage === 0}
                  onClick={() => {
                    const prev = Math.max(0, currentPage - 1)
                    setCurrentPage(prev)
                    updateParams({ page: String(prev) })
                    scrollToTop()
                  }}
                  className="px-3 py-2 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  if (totalPages > 7 && Math.abs(idx - currentPage) > 2 && idx !== 0 && idx !== totalPages - 1) {
                    if (idx === 1 || idx === totalPages - 2) {
                      return <span key={idx} className="px-1 text-slate-400 text-xs">...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage(idx)
                        updateParams({ page: String(idx) })
                        scrollToTop()
                      }}
                      className={`w-9 h-9 rounded text-xs font-bold transition-all cursor-pointer ${
                        currentPage === idx
                          ? "bg-[#ee4d2d] text-white shadow-xs"
                          : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}

                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => {
                    const next = Math.min(totalPages - 1, currentPage + 1)
                    setCurrentPage(next)
                    updateParams({ page: String(next) })
                    scrollToTop()
                  }}
                  className="px-3 py-2 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* 4. Footer */}
      <AuthFooter />

      {/* 5. Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-white hover:bg-[#ee4d2d] text-slate-700 hover:text-white shadow-xl border border-slate-200 hover:border-[#ee4d2d] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 group"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
