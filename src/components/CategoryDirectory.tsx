import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { productApi } from "../api/productApi"
import type { CategoryResponse } from "../types/product"

interface CategoryGroup {
  id: number
  name: string
  slug: string
  level: number
  parentName?: string
  items: CategoryResponse[]
}

export default function CategoryDirectory() {
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const tree = await productApi.getCategoryTree()
        if (!isMounted) return

        if (Array.isArray(tree) && tree.length > 0) {
          const extracted: CategoryGroup[] = []

          tree.forEach((level1) => {
            if (level1.children && level1.children.length > 0) {
              level1.children.forEach((level2) => {
                extracted.push({
                  id: level2.id,
                  name: level2.name,
                  slug: level2.slug,
                  level: level2.level,
                  parentName: level1.name,
                  items: level2.children || [],
                })
              })
            } else {
              extracted.push({
                id: level1.id,
                name: level1.name,
                slug: level1.slug,
                level: level1.level,
                items: [],
              })
            }
          })

          setGroups(extracted)
        }
      } catch (err) {
        console.warn("Lỗi tải cây danh mục từ backend:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="full-category-directory" className="w-full bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-10 text-slate-600 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title Header */}
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            Danh Mục
          </h2>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ee4d2d]" />
              <span>Đang tải danh mục từ hệ thống...</span>
            </div>
          )}
        </div>

        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="space-y-2 animate-pulse">
                <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Chưa có danh mục nào trong hệ thống.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 items-start">
            {groups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                
                <Link
                  to={`/search?categoryId=${group.id}`}
                  className="block text-[12px] font-bold text-slate-800 uppercase tracking-tight hover:text-[#ee4d2d] transition-colors"
                  title={group.parentName ? `${group.parentName} > ${group.name}` : group.name}
                >
                  {group.name}
                </Link>

                
                <div className="text-[11.5px] text-slate-500 leading-relaxed font-normal">
                  {group.items.length > 0 ? (
                    group.items.map((child, idx) => (
                      <span key={child.id} className="inline">
                        <Link
                          to={`/search?categoryId=${child.id}`}
                          className="hover:text-[#ee4d2d] transition-colors"
                        >
                          {child.name}
                        </Link>
                        {idx < group.items.length - 1 && (
                          <span className="text-slate-300 mx-1.5 select-none font-light">|</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Đang cập nhật danh mục con</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
