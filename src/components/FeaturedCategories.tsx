import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { productApi } from "../api/productApi"
import type { CategoryResponse } from "../types/product"

interface CategoryItem {
  id: string | number
  name: string
  image: string
  row: number
  backendId?: number
  slug?: string
}

// 20 Standard Shopee Categories as base & fallback
const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Hàng 1 (10 danh mục)
  {
    id: "cat-1",
    name: "Thời Trang Nam",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-2",
    name: "Điện Thoại & Phụ Kiện",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-3",
    name: "Thiết Bị Điện Tử",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-4",
    name: "Máy Tính & Laptop",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-5",
    name: "Máy Ảnh & Máy Quay Phim",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-6",
    name: "Đồng Hồ",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-7",
    name: "Giày Dép Nam",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-8",
    name: "Thiết Bị Điện Gia Dụng",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-9",
    name: "Thể Thao & Du Lịch",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },
  {
    id: "cat-10",
    name: "Ô Tô & Xe Máy & Xe Đạp",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80",
    row: 1,
  },

  // Hàng 2 (10 danh mục)
  {
    id: "cat-11",
    name: "Thời Trang Nữ",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-12",
    name: "Mẹ & Bé",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-13",
    name: "Nhà Cửa & Đời Sống",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-14",
    name: "Sắc Đẹp",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-15",
    name: "Sức Khỏe",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-16",
    name: "Giày Dép Nữ",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-17",
    name: "Túi Ví Nữ",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-18",
    name: "Phụ Kiện & Trang Sức Nữ",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-19",
    name: "Bách Hóa Online",
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
  {
    id: "cat-20",
    name: "Nhà Sách Online",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80",
    row: 2,
  },
]

interface FeaturedCategoriesProps {
  onSelectCategory?: (categoryId: number | null, name: string) => void
}

export default function FeaturedCategories({ onSelectCategory }: FeaturedCategoriesProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Fetch real categories from backend on mount
  useEffect(() => {
    const fetchBackendCategories = async () => {
      try {
        const tree = await productApi.getCategoryTree()
        if (tree && Array.isArray(tree) && tree.length > 0) {
          // Flatten level-1 and level-2/3 categories to enrich items
          const merged = DEFAULT_CATEGORIES.map((defCat) => {
            // Find matched category in backend tree by name or slug
            const match = findCategoryInTree(tree, defCat.name)
            if (match) {
              return {
                ...defCat,
                backendId: match.id,
                slug: match.slug,
                image: match.iconUrl || defCat.image,
              }
            }
            return defCat
          })
          setCategories(merged)
        }
      } catch (err) {
        console.warn("Backend categories unavailable, using default items:", err)
      }
    }

    fetchBackendCategories()
  }, [])

  // Helper to find category in tree
  const findCategoryInTree = (nodes: CategoryResponse[], name: string): CategoryResponse | null => {
    for (const node of nodes) {
      if (node.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(node.name.toLowerCase())) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findCategoryInTree(node.children, name)
        if (found) return found
      }
    }
    return null
  }

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 20)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20)
  }

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" })
    setTimeout(checkScrollButtons, 350)
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" })
    setTimeout(checkScrollButtons, 350)
  }

  const handleCategoryClick = (cat: CategoryItem) => {
    const newId = cat.backendId === activeCategoryId ? null : (cat.backendId || null)
    setActiveCategoryId(newId)
    if (onSelectCategory) {
      onSelectCategory(newId, cat.name)
    }
  }

  const row1 = categories.filter((c) => c.row === 1)
  const row2 = categories.filter((c) => c.row === 2)

  return (
    <section className="w-full py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* White Box Container with Orange Top Border */}
        <div className="relative bg-white shadow-xs border border-slate-200/80 border-t-[3px] border-t-[#ee4d2d] group/container">
          
          {/* Header Title: DANH MỤC */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
              DANH MỤC
            </h2>
            {activeCategoryId && (
              <button
                onClick={() => {
                  setActiveCategoryId(null)
                  if (onSelectCategory) onSelectCategory(null, "")
                }}
                className="text-xs text-[#ee4d2d] hover:underline cursor-pointer font-medium"
              >
                Bỏ chọn lọc danh mục ✕
              </button>
            )}
          </div>

          {/* Categories Grid (2 Rows of 10 items) */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="overflow-x-auto no-scrollbar scroll-smooth"
          >
            <div className="min-w-[1000px] lg:min-w-full">
              
              {/* Row 1 */}
              <div className="grid grid-cols-10 divide-x divide-slate-100 border-b border-slate-100">
                {row1.map((cat) => {
                  const isSelected = activeCategoryId && cat.backendId === activeCategoryId
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`group/item flex flex-col items-center justify-between p-3.5 transition-all duration-150 cursor-pointer text-center h-[145px] ${
                        isSelected 
                          ? "bg-orange-50/70 border-b-2 border-b-[#ee4d2d]" 
                          : "hover:bg-slate-50/80 hover:shadow-xs"
                      }`}
                    >
                      {/* Circle Image Wrapper */}
                      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#f8f8f8] flex items-center justify-center p-2 transition-transform duration-200 group-hover/item:scale-105 shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                          loading="lazy"
                        />
                      </div>

                      {/* Category Label */}
                      <span className={`text-[12px] sm:text-[12.5px] leading-snug line-clamp-2 px-1 transition-colors mt-1.5 ${
                        isSelected ? "font-bold text-[#ee4d2d]" : "font-normal text-slate-700 group-hover/item:text-[#ee4d2d]"
                      }`}>
                        {cat.name}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-10 divide-x divide-slate-100">
                {row2.map((cat) => {
                  const isSelected = activeCategoryId && cat.backendId === activeCategoryId
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`group/item flex flex-col items-center justify-between p-3.5 transition-all duration-150 cursor-pointer text-center h-[145px] ${
                        isSelected 
                          ? "bg-orange-50/70 border-b-2 border-b-[#ee4d2d]" 
                          : "hover:bg-slate-50/80 hover:shadow-xs"
                      }`}
                    >
                      {/* Circle Image Wrapper */}
                      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#f8f8f8] flex items-center justify-center p-2 transition-transform duration-200 group-hover/item:scale-105 shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                          loading="lazy"
                        />
                      </div>

                      {/* Category Label */}
                      <span className={`text-[12px] sm:text-[12.5px] leading-snug line-clamp-2 px-1 transition-colors mt-1.5 ${
                        isSelected ? "font-bold text-[#ee4d2d]" : "font-normal text-slate-700 group-hover/item:text-[#ee4d2d]"
                      }`}>
                        {cat.name}
                      </span>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>

          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-[#ee4d2d] hover:border-orange-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-[#ee4d2d] hover:border-orange-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </section>
  )
}
