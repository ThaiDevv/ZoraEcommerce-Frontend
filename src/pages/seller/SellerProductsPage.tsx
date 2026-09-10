import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SellerLayout from '../../components/seller/SellerLayout'
import { 
  sellerApi, 
  type CreateProductPayload, 
  type CreateProductVariantPayload 
} from '../../api/sellerApi'
import type { ProductSummaryResponse, CategoryResponse } from '../../types/product'
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  Warehouse,
  Star,
  CheckCircle,
  X,
  Package,
  Layers,
} from 'lucide-react'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  // Delete Product State
  const [productToDelete, setProductToDelete] = useState<ProductSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Form State
  const [formCategoryId, setFormCategoryId] = useState<number | ''>('')
  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formPrice, setFormPrice] = useState<string>('')
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('')
  const [formImageUrl, setFormImageUrl] = useState<string>('')
  const [formVariants, setFormVariants] = useState<CreateProductVariantPayload[]>([
    { variantName: 'Tiêu chuẩn', sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000), price: 0, stock: 50 }
  ])

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await sellerApi.getSellerProducts({ page: 0, size: 50 })
      setProducts(res.items || res.content || [])
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err)
      showToast('error', err.response?.data?.message || 'Không thể tải danh sách sản phẩm của shop.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const cats = await sellerApi.getCategories()
      setCategories(cats || [])
      if (cats && cats.length > 0 && formCategoryId === '') {
        setFormCategoryId(cats[0].id)
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh mục:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts])

  // Synchronize base price into default variant if only 1 variant exists
  const handlePriceChange = (val: string) => {
    setFormPrice(val)
    const num = parseFloat(val) || 0
    if (formVariants.length === 1 && (formVariants[0].price === 0 || formVariants[0].price === parseFloat(formPrice))) {
      setFormVariants([{ ...formVariants[0], price: num }])
    }
  }

  const handleAddVariant = () => {
    const basePrice = parseFloat(formPrice) || 100000
    setFormVariants([
      ...formVariants,
      {
        variantName: `Phân loại ${formVariants.length + 1}`,
        sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
        price: basePrice,
        stock: 30
      }
    ])
  }

  const handleRemoveVariant = (index: number) => {
    if (formVariants.length <= 1) {
      showToast('error', 'Sản phẩm cần ít nhất 1 phân loại hàng.')
      return
    }
    setFormVariants(formVariants.filter((_, idx) => idx !== index))
  }

  const handleVariantChange = (index: number, field: keyof CreateProductVariantPayload, value: any) => {
    const updated = [...formVariants]
    updated[index] = { ...updated[index], [field]: value }
    setFormVariants(updated)
  }

  const handleOpenAddModal = () => {
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormOriginalPrice('')
    setFormImageUrl('')
    setFormVariants([
      { variantName: 'Tiêu chuẩn', sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000), price: 0, stock: 50 }
    ])
    if (categories.length > 0) {
      setFormCategoryId(categories[0].id)
    }
    setIsAddModalOpen(true)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      showToast('error', 'Vui lòng nhập tên sản phẩm.')
      return
    }
    if (!formCategoryId) {
      showToast('error', 'Vui lòng chọn danh mục sản phẩm.')
      return
    }
    const priceNum = parseFloat(formPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('error', 'Vui lòng nhập giá bán hợp lệ.')
      return
    }

    const origPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined
    const imageUrl = formImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

    const payload: CreateProductPayload = {
      categoryId: Number(formCategoryId),
      name: formName.trim(),
      description: formDescription.trim() || 'Sản phẩm chất lượng cao từ shop đối tác ZoraShop.',
      price: priceNum,
      originalPrice: origPriceNum,
      images: [
        {
          imageUrl: imageUrl,
          isPrimary: true,
          sortOrder: 0
        }
      ],
      variants: formVariants.map(v => ({
        variantName: v.variantName.trim() || 'Mặc định',
        sku: v.sku.trim() || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
        price: v.price > 0 ? v.price : priceNum,
        stock: Number(v.stock) >= 0 ? Number(v.stock) : 10,
        imageUrl: imageUrl
      }))
    }

    setIsSubmitting(true)
    try {
      await sellerApi.createProduct(payload)
      showToast('success', `Đã thêm sản phẩm "${formName}" thành công!`)
      setIsAddModalOpen(false)
      fetchProducts()
    } catch (err: any) {
      console.error('Lỗi tạo sản phẩm:', err)
      showToast('error', err.response?.data?.message || 'Thêm sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await sellerApi.deleteProduct(productToDelete.slug)
      showToast('success', `Đã xóa sản phẩm "${productToDelete.name}" thành công!`)
      setProductToDelete(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Lỗi xóa sản phẩm:', err)
      showToast('error', err.response?.data?.message || 'Không thể xóa sản phẩm.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatPrice = (amount?: number) => {
    if (typeof amount !== 'number') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      p.id.toString().includes(q)
    )
  })

  return (
    <SellerLayout 
      title="Quản Lý Sản Phẩm" 
      subtitle="Danh sách sản phẩm của shop, niêm yết sản phẩm mới và điều chỉnh giá bán"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xs shadow-md border text-xs font-normal transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-neutral-800 text-neutral-100 border-neutral-700' 
            : 'bg-neutral-800 text-rose-300 border-neutral-700'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Action & Filter Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên hoặc Mã sản phẩm..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm mới</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tất cả sản phẩm ({filteredProducts.length})
          </div>
          <span className="text-[11px] text-slate-500">
            Hiển thị sản phẩm đang bán trên sàn
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có sản phẩm nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery 
                ? `Không tìm thấy sản phẩm khớp với "${searchQuery}".` 
                : 'Gian hàng của bạn hiện chưa có sản phẩm nào. Hãy bấm "Thêm sản phẩm mới" để bắt đầu bán hàng!'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm ngay</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Sản phẩm</th>
                  <th className="p-3.5 text-right">Giá bán</th>
                  <th className="p-3.5 text-right">Giá niêm yết</th>
                  <th className="p-3.5 text-center">Đã bán</th>
                  <th className="p-3.5 text-center">Đánh giá</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name and Image */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60'
                            }}
                            className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link 
                            to={`/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-slate-800 hover:text-[#ee4d2d] transition-colors line-clamp-1 flex items-center gap-1 group"
                          >
                            <span>{product.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            slug: {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-3.5 text-right font-black text-[#ee4d2d] text-sm">
                      {formatPrice(product.price)}
                    </td>

                    {/* Original Price */}
                    <td className="p-3.5 text-right text-slate-400 line-through">
                      {product.originalPrice ? formatPrice(product.originalPrice) : '-'}
                    </td>

                    {/* Sold Count */}
                    <td className="p-3.5 text-center font-bold text-slate-700">
                      {product.soldCount || 0}
                    </td>

                    {/* Rating */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.ratingAvg ? product.ratingAvg.toFixed(1) : '5.0'}</span>
                        <span className="text-slate-400 text-[10px]">({product.ratingCount || 0})</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Xem trên sàn"
                          className="p-1.5 text-slate-500 hover:text-[#ee4d2d] rounded-md hover:bg-orange-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          to="/seller/inventory"
                          title="Quản lý kho"
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Warehouse className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setProductToDelete(product)}
                          title="Xóa sản phẩm"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#ee4d2d]" />
                <h3 className="text-base font-bold text-slate-900">Thêm Sản Phẩm Mới</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Tai Nghe Bluetooth Chống Ồn Cao Cấp Zora SoundMax"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
                />
              </div>

              {/* Category & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giá bán (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={formPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="199000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giá gốc / Niêm yết
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="299000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường dẫn ảnh chính (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d]"
                  />
                  {formImageUrl && (
                    <img 
                      src={formImageUrl} 
                      alt="Preview" 
                      className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Nếu để trống, hệ thống sẽ sử dụng ảnh minh họa sản phẩm điện tử chất lượng cao mặc định.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả các tính năng nổi bật, thông số kỹ thuật và chính sách bảo hành..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              {/* Variants Section */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#ee4d2d]" />
                    <span>Phân Loại Hàng (Biến Thể & Kho)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-semibold text-[#ee4d2d] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm phân loại</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formVariants.map((variant, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Tên phân loại</span>
                        <input
                          type="text"
                          required
                          value={variant.variantName}
                          onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)}
                          placeholder="Màu Đen / 128GB"
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Mã SKU</span>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          placeholder="SKU-001"
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Giá bán (VND)</span>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="199000"
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-medium">Số lượng kho</span>
                          <input
                            type="number"
                            required
                            min="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="50"
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                          />
                        </div>

                        {formVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded mt-4"
                            title="Xóa phân loại này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-md transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Lưu & Niêm Yết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Xác nhận xóa sản phẩm</h3>
            <p className="text-xs text-slate-500 mb-4">
              Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-slate-800">"{productToDelete.name}"</strong>? Hành động này sẽ gỡ sản phẩm khỏi sàn ZoraShop.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  )
}
