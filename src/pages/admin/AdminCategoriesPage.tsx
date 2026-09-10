import React, { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Sparkles,
  Columns3,
  FolderTree
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import ZoraLogo from '../../components/ZoraLogo'
import adminApi, { type CreateCategoryPayload } from '../../api/adminApi'
import type { CategoryResponse } from '../../types/product'

// Helper tạo slug từ tiếng Việt
function generateSlug(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Helper lấy logo của danh mục (Ưu tiên iconUrl của backend, nếu chưa có thì fallback theo ngành hàng)
function getCategoryLogo(cat: CategoryResponse): string {
  if (cat.iconUrl && cat.iconUrl.trim()) {
    return cat.iconUrl.trim()
  }

  const nameLower = cat.name.toLowerCase()
  if (nameLower.includes('điện thoại') || nameLower.includes('smartphone') || nameLower.includes('phone')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'
  }
  if (nameLower.includes('máy tính') || nameLower.includes('laptop') || nameLower.includes('pc')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100'
  }
  if (nameLower.includes('thời trang') || nameLower.includes('áo') || nameLower.includes('quần')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'
  }
  if (nameLower.includes('giày') || nameLower.includes('dép') || nameLower.includes('sneaker')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
  }
  if (nameLower.includes('điện tử') || nameLower.includes('thiết bị')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100'
  }
  if (nameLower.includes('sách') || nameLower.includes('văn phòng phẩm')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100'
  }
  if (nameLower.includes('nhà cửa') || nameLower.includes('đời sống') || nameLower.includes('bếp')) {
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100'
  }
  if (nameLower.includes('tai nghe') || nameLower.includes('âm thanh')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
  }
  if (nameLower.includes('đồng hồ')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
  }

  // Fallback logo chuẩn vector theo seed tên danh mục
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.slug || cat.name)}`
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Chế độ xem: mặc định là 'TREE' (Sơ đồ cây theo Hình 9) hoặc 'COLUMNS' (3 cột chi tiết)
  const [viewMode, setViewMode] = useState<'TREE' | 'COLUMNS'>('TREE')

  // Trạng thái mở rộng các node trong cây danh mục
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(new Set())

  // 3-Column Drilldown Selection
  const [selectedL1Id, setSelectedL1Id] = useState<number | null>(null)
  const [selectedL2Id, setSelectedL2Id] = useState<number | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalTargetLevel, setModalTargetLevel] = useState<1 | 2 | 3>(1)

  // Form State
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    slug: string
    parentId: number | null
    iconUrl: string
    sortOrder: number
  }>({
    name: '',
    slug: '',
    parentId: null,
    iconUrl: '',
    sortOrder: 1,
  })

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Hàm lấy tất cả ID của cây để mở rộng toàn bộ
  const collectAllIds = (list: CategoryResponse[]): Set<number> => {
    const ids = new Set<number>()
    const traverse = (items: CategoryResponse[]) => {
      for (const item of items) {
        ids.add(item.id)
        if (item.children && item.children.length > 0) {
          traverse(item.children)
        }
      }
    }
    traverse(list)
    return ids
  }

  const fetchCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getCategoryTree()
      if (Array.isArray(data)) {
        setCategories(data)
        if (data.length > 0) {
          setSelectedL1Id((prev) => {
            const exists = data.some((c) => c.id === prev)
            return exists ? prev : data[0].id
          })
          // Mặc định thu gọn tất cả theo yêu cầu
          setExpandedNodeIds(new Set())
        }
      }
    } catch (err: any) {
      console.error('Lỗi lấy cây danh mục:', err)
      setError(
        err.response?.data?.message || 
        'Không thể tải danh sách danh mục. Vui lòng kiểm tra quyền ADMIN!'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleToggleExpand = (id: number) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExpandAll = () => {
    setExpandedNodeIds(collectAllIds(categories))
  }

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set())
  }

  // Danh mục Cấp 1 đang chọn
  const selectedL1 = useMemo(() => {
    return categories.find((c) => c.id === selectedL1Id) || null
  }, [categories, selectedL1Id])

  // Danh sách Cấp 2 của Cấp 1 đang chọn
  const l2List = useMemo(() => {
    return selectedL1?.children || []
  }, [selectedL1])

  useEffect(() => {
    if (l2List.length > 0) {
      setSelectedL2Id((prev) => {
        const exists = l2List.some((c) => c.id === prev)
        return exists ? prev : l2List[0].id
      })
    } else {
      setSelectedL2Id(null)
    }
  }, [l2List])

  // Danh mục Cấp 2 đang chọn
  const selectedL2 = useMemo(() => {
    return l2List.find((c) => c.id === selectedL2Id) || null
  }, [l2List, selectedL2Id])

  // Danh sách Cấp 3 của Cấp 2 đang chọn
  const l3List = useMemo(() => {
    return selectedL2?.children || []
  }, [selectedL2])

  // Danh sách gợi ý cha cho modal
  const availableParents = useMemo(() => {
    const list: { id: number; name: string; level: number }[] = []
    const traverse = (cats: CategoryResponse[]) => {
      for (const cat of cats) {
        if (cat.level < 3 && cat.id !== editingCategory?.id) {
          list.push({
            id: cat.id,
            name: `${'—'.repeat(cat.level - 1)} ${cat.name} (Cấp ${cat.level})`,
            level: cat.level,
          })
        }
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children)
        }
      }
    }
    traverse(categories)
    return list
  }, [categories, editingCategory])

  const handleOpenCreateAtLevel = (level: 1 | 2 | 3, explicitParentId?: number | null) => {
    setModalMode('CREATE')
    setEditingCategory(null)
    setModalTargetLevel(level)

    let parentId: number | null = null
    if (explicitParentId !== undefined) {
      parentId = explicitParentId
    } else if (level === 2 && selectedL1) {
      parentId = selectedL1.id
    } else if (level === 3 && selectedL2) {
      parentId = selectedL2.id
    }

    setFormData({
      name: '',
      slug: '',
      parentId,
      iconUrl: '',
      sortOrder: 1,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: CategoryResponse, parentId: number | null) => {
    setModalMode('EDIT')
    setEditingCategory(cat)
    setModalTargetLevel(cat.level as 1 | 2 | 3)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId,
      iconUrl: cat.iconUrl || '',
      sortOrder: cat.sortOrder || 1,
    })
    setIsModalOpen(true)
  }

  const handleNameChange = (val: string) => {
    setFormData((prev) => {
      const isSlugAutoGenerated = prev.slug === '' || prev.slug === generateSlug(prev.name)
      return {
        ...prev,
        name: val,
        slug: isSlugAutoGenerated ? generateSlug(val) : prev.slug,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên danh mục!')
      return
    }
    if (!formData.slug.trim()) {
      setError('Vui lòng nhập đường dẫn slug!')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const payload: CreateCategoryPayload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parentId: formData.parentId ? Number(formData.parentId) : null,
        iconUrl: formData.iconUrl.trim() || null,
        sortOrder: Number(formData.sortOrder) || 0,
      }

      if (modalMode === 'CREATE') {
        const created = await adminApi.createCategory(payload)
        setSuccessToast(`Đã thêm mới danh mục "${payload.name}".`)
        if (created.level === 1) setSelectedL1Id(created.id)
        if (created.level === 2) setSelectedL2Id(created.id)
      } else if (modalMode === 'EDIT' && editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload)
        setSuccessToast(`Đã cập nhật danh mục "${payload.name}".`)
      }

      setIsModalOpen(false)
      await fetchCategories()
      setTimeout(() => setSuccessToast(null), 3500)
    } catch (err: any) {
      console.error('Lỗi khi lưu danh mục:', err)
      setError(err.response?.data?.message || 'Có lỗi khi lưu danh mục.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)
    try {
      await adminApi.deleteCategory(deleteTarget.id)
      setSuccessToast(`Đã xóa danh mục "${deleteTarget.name}".`)
      setDeleteTarget(null)
      await fetchCategories()
      setTimeout(() => setSuccessToast(null), 3500)
    } catch (err: any) {
      console.error('Lỗi xóa danh mục:', err)
      setError(
        err.response?.data?.message || 
        'Không thể xóa danh mục này vì đang chứa danh mục con!'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // Kết quả tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchKeyword.trim()) return []
    const q = searchKeyword.toLowerCase().trim()
    const results: { cat: CategoryResponse; parentId: number | null; parentName?: string }[] = []

    const traverse = (list: CategoryResponse[], parentId: number | null = null, parentName?: string) => {
      for (const item of list) {
        if (item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)) {
          results.push({ cat: item, parentId, parentName })
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children, item.id, item.name)
        }
      }
    }

    traverse(categories)
    return results
  }, [categories, searchKeyword])

  // Hàm đệ quy render từng nhánh của Sơ đồ cây theo đúng Hình 9
  const renderTreeBranch = (
    cat: CategoryResponse,
    parentId: number | null
  ) => {
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedNodeIds.has(cat.id)
    const isMatchedSearch = searchKeyword.trim() && cat.name.toLowerCase().includes(searchKeyword.toLowerCase().trim())

    return (
      <li key={cat.id} className="category-tree-li">
        {/* Khối hộp tên danh mục (Chuẩn như hình 9: LOGO của danh mục + TÊN DANH MỤC) */}
        <div 
          onClick={() => {
            if (hasChildren) handleToggleExpand(cat.id)
          }}
          className={`node-box group ${hasChildren ? 'cursor-pointer' : ''} ${isMatchedSearch ? 'node-box-matched' : ''}`}
        >
          {/* Nút đóng mở nhỏ gọn nếu có danh mục con */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => handleToggleExpand(cat.id)}
              className="p-0.5 text-slate-400 hover:text-[#ee4d2d] cursor-pointer -ml-1 shrink-0 transition-colors"
              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* LOGO CỦA DANH MỤC (Thay thế hoàn toàn cho folder) */}
          <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 border border-slate-200">
            <img
              src={getCategoryLogo(cat)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.slug || cat.name)}`
              }}
            />
          </div>

          {/* CHỈ GHI TÊN DANH MỤC THEO ĐÚNG YÊU CẦU */}
          <span className="node-text">
            {cat.name}
          </span>

          {/* Các nút thao tác tinh gọn xuất hiện khi rê chuột */}
          <div className="node-actions" onClick={(e) => e.stopPropagation()}>
            {cat.level < 3 && (
              <button
                type="button"
                onClick={() => handleOpenCreateAtLevel((cat.level + 1) as 2 | 3, cat.id)}
                className="p-1 text-slate-400 hover:text-[#ee4d2d] rounded hover:bg-slate-100 cursor-pointer"
                title={`Thêm danh mục con cấp ${cat.level + 1}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleOpenEdit(cat, parentId)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
              title="Sửa tên danh mục"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(cat)}
              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
              title="Xóa danh mục"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Các nhánh con (nếu có và đang mở) */}
        {hasChildren && isExpanded && (
          <ul className="category-tree-ul">
            {cat.children!.map((child) =>
              renderTreeBranch(child, cat.id)
            )}
          </ul>
        )}
      </li>
    )
  }

  return (
    <AdminLayout
      title="Cây Danh Mục Hàng Hóa"
      subtitle="Sơ đồ cây phân cấp danh mục trực quan với logo thương hiệu từng ngành hàng."
    >
      {/* Scoped CSS cho sơ đồ đường kẻ nhánh cây chuẩn như Hình 9 */}
      <style>{`
        .category-tree-wrapper {
          overflow-x: auto;
          overflow-y: auto;
          padding: 24px 20px;
          min-width: 100%;
        }
        .category-tree-root, .category-tree-ul {
          list-style: none;
          margin: 0;
          padding: 0;
          position: relative;
        }
        .category-tree-ul {
          margin-left: 24px;
          position: relative;
        }
        .category-tree-li {
          position: relative;
          padding: 6px 0 6px 26px;
        }
        /* Đường kẻ dọc kết nối */
        .category-tree-li::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 1.5px;
          background-color: #94a3b8;
        }
        /* Đường kẻ ngang nhánh con */
        .category-tree-li::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          width: 26px;
          height: 1.5px;
          background-color: #94a3b8;
        }
        /* Nhánh cuối cùng dừng đường kẻ dọc đúng điểm rẽ ngang */
        .category-tree-li:last-child::before {
          height: 20px;
          bottom: auto;
        }
        /* Khối hộp tên danh mục theo Hình 9 */
        .node-box {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #94a3b8;
          border-radius: 4px;
          padding: 4.5px 12px;
          font-size: 12.5px;
          color: #0f172a;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
          transition: all 0.15s ease;
          user-select: none;
        }
        .node-box:hover {
          border-color: #ee4d2d;
          box-shadow: 0 2px 4px rgba(238, 77, 45, 0.1);
        }
        .node-box-matched {
          border-color: #ee4d2d !important;
          background-color: #fff7ed !important;
          font-weight: 600;
        }
        .node-box-root {
          background-color: #f8fafc;
          border: 1.5px solid #64748b;
          font-weight: 700;
          padding: 6px 14px;
          font-size: 13px;
        }
        .node-text {
          white-space: nowrap;
          color: #1e293b;
          font-size: 12.5px;
        }
        .node-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: 6px;
          padding-left: 6px;
          border-left: 1px solid #e2e8f0;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .node-box:hover .node-actions {
          opacity: 1;
        }
      `}</style>

      {/* Toast & Error Notifications */}
      {successToast && (
        <div className="mb-4 p-3 bg-slate-900 text-white rounded-md text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#ee4d2d] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-[#ee4d2d] rounded-md text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#ee4d2d] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Switcher + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('TREE')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'TREE'
                  ? 'bg-white text-[#ee4d2d] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Sơ Đồ Cây Danh Mục</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('COLUMNS')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'COLUMNS'
                  ? 'bg-white text-[#ee4d2d] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Phân Cột 3 Cấp</span>
            </button>
          </div>

          {viewMode === 'TREE' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors cursor-pointer"
              >
                Mở rộng tất cả
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors cursor-pointer"
              >
                Thu gọn tất cả
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreateAtLevel(1)}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#ee4d2d] hover:bg-[#d73211] rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm Cấp 1</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên danh mục..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white w-full sm:w-52 transition-colors"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={fetchCategories}
            disabled={isLoading}
            className="h-8 px-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm nếu có từ khóa */}
      {searchKeyword.trim() && searchResults.length > 0 && (
        <div className="bg-orange-50/70 border border-orange-200/80 p-3 rounded-lg text-xs text-slate-700 mb-4 flex items-center justify-between">
          <span>Tìm thấy <strong>{searchResults.length}</strong> danh mục khớp với từ khóa "{searchKeyword}". Các danh mục này được đánh dấu viền cam trên sơ đồ.</span>
          <button
            onClick={() => setSearchKeyword('')}
            className="text-[#ee4d2d] font-semibold hover:underline cursor-pointer ml-2 shrink-0"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* CHẾ ĐỘ 1: SƠ ĐỒ CÂY DANH MỤC (CHUẨN HÌNH 9: LOGO + TÊN DANH MỤC) */}
      {viewMode === 'TREE' ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs category-tree-wrapper">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#ee4d2d] mx-auto mb-2" />
              <span className="text-xs">Đang tải sơ đồ cây danh mục...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-xs font-medium text-slate-600">Chưa có danh mục nào trong hệ thống.</p>
              <button
                type="button"
                onClick={() => handleOpenCreateAtLevel(1)}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-[#ee4d2d] hover:bg-[#d73211] rounded shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Danh Mục Gốc Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <ul className="category-tree-root">
              {/* Node Gốc Tổng (Tương ứng với node G: trong Hình 9, mang logo ZoraShop) */}
              <li style={{ padding: '0 0 6px 0' }}>
                <div className="node-box node-box-root">
                  <div className="w-4.5 h-4.5 shrink-0">
                    <ZoraLogo />
                  </div>
                  <span>G: ZoraShop</span>
                </div>

                {/* Danh sách các Cấp 1 kết nối xuống dưới */}
                <ul className="category-tree-ul">
                  {categories.map((cat1) =>
                    renderTreeBranch(cat1, null)
                  )}
                </ul>
              </li>
            </ul>
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: PHÂN CỘT 3 CẤP (MILLER COLUMNS) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ================= CỘT 1: CẤP 1 (GỐC) ================= */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[560px]">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                  <span>1. Danh Mục Gốc (Cấp 1)</span>
                </h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{categories.length} danh mục</span>
              </div>
              <button
                onClick={() => handleOpenCreateAtLevel(1)}
                className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Thêm danh mục gốc"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">Chưa có danh mục cấp 1.</p>
              ) : (
                categories.map((cat) => {
                  const isSelected = cat.id === selectedL1Id
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedL1Id(cat.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-[#ee4d2d] font-bold border border-orange-200/80 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-5 h-5 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getCategoryLogo(cat)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.slug || cat.name)}`
                            }}
                          />
                        </div>
                        <span className="text-xs truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className={`text-[10.5px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-white border border-orange-200 text-[#ee4d2d]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {cat.children?.length || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(cat, null)
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                          title="Sửa"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(cat)
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ee4d2d]' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ================= CỘT 2: CẤP 2 (NHÁNH CON) ================= */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[560px]">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                  <span>2. Nhánh Con (Cấp 2)</span>
                </h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate max-w-[170px]">
                  {selectedL1 ? `Con của: ${selectedL1.name}` : 'Chọn cấp 1 bên trái'}
                </span>
              </div>
              {selectedL1 && (
                <button
                  onClick={() => handleOpenCreateAtLevel(2)}
                  className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Thêm Cấp 2 vào "${selectedL1.name}"`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {!selectedL1 ? (
                <p className="text-xs text-slate-400 p-4 text-center">Vui lòng chọn 1 danh mục cấp 1 bên trái.</p>
              ) : l2List.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-600">Chưa có danh mục cấp 2</p>
                  <p className="text-[11px] mt-1">Bấm nút "Thêm" ở trên để tạo nhánh con cho <strong>{selectedL1.name}</strong></p>
                </div>
              ) : (
                l2List.map((cat) => {
                  const isSelected = cat.id === selectedL2Id
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedL2Id(cat.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-[#ee4d2d] font-bold border border-orange-200/80 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-5 h-5 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getCategoryLogo(cat)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.slug || cat.name)}`
                            }}
                          />
                        </div>
                        <span className="text-xs truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className={`text-[10.5px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-white border border-orange-200 text-[#ee4d2d]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {cat.children?.length || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(cat, selectedL1Id)
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                          title="Sửa"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(cat)
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ee4d2d]' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ================= CỘT 3: CẤP 3 (CHI TIẾT) ================= */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[560px]">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                  <span>3. Danh Mục Chi Tiết (Cấp 3)</span>
                </h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate max-w-[170px]">
                  {selectedL2 ? `Con của: ${selectedL2.name}` : 'Chọn cấp 2 ở giữa'}
                </span>
              </div>
              {selectedL2 && (
                <button
                  onClick={() => handleOpenCreateAtLevel(3)}
                  className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ee4d2d] border border-slate-200 hover:border-orange-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Thêm Cấp 3 vào "${selectedL2.name}"`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {!selectedL2 ? (
                <p className="text-xs text-slate-400 p-4 text-center">Vui lòng chọn 1 nhánh cấp 2 ở giữa.</p>
              ) : l3List.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-600">Chưa có danh mục cấp 3</p>
                  <p className="text-[11px] mt-1">Bấm nút "Thêm" ở trên để tạo danh mục chi tiết cho <strong>{selectedL2.name}</strong></p>
                </div>
              ) : (
                l3List.map((cat) => {
                  return (
                    <div
                      key={cat.id}
                      className="group flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-slate-700"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-5 h-5 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getCategoryLogo(cat)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.slug || cat.name)}`
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-800 truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={() => handleOpenEdit(cat, selectedL2Id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                          title="Sửa"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Danh Mục */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-orange-50 text-[#ee4d2d] flex items-center justify-center font-bold text-xs">
                  {modalTargetLevel}
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {modalMode === 'CREATE' ? `Thêm Danh Mục (Cấp ${modalTargetLevel})` : `Chỉnh Sửa Danh Mục`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên danh mục <span className="text-[#ee4d2d]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết Bị Đeo Thông Minh"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Đường dẫn Slug <span className="text-[#ee4d2d]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }))}
                    className="text-[10.5px] text-[#ee4d2d] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tự động tạo</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="thiet-bi-deo-thong-minh"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh mục cha
                </label>
                <select
                  value={formData.parentId === null ? '' : formData.parentId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 outline-none focus:border-[#ee4d2d] cursor-pointer"
                >
                  <option value="">[ Danh mục gốc (Cấp 1) ]</option>
                  {availableParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đường dẫn Logo / Ảnh
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.iconUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, iconUrl: e.target.value }))}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#ee4d2d] focus:bg-white font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'CREATE' ? 'Tạo Danh Mục' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xóa Danh Mục</h3>
                <p className="text-xs text-slate-500 mt-0.5">"{deleteTarget.name}" (ID: {deleteTarget.id})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục này?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
