import { useState, useEffect, useCallback } from 'react'
import SellerLayout from '../../components/seller/SellerLayout'
import { sellerApi, type InventoryLogResponse } from '../../api/sellerApi'
import { productApi } from '../../api/productApi'
import type { ProductVariant } from '../../types/product'
import {
  Warehouse,
  Search,
  RefreshCw,
  History,
  AlertCircle,
  Package,
  Boxes,
  AlertTriangle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Save
} from 'lucide-react'

interface FlatVariantItem {
  productId: number
  productName: string
  productSlug: string
  productImage?: string
  variantId: number
  variantName: string
  sku: string
  price: number
  currentStock: number
}

export default function SellerInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<FlatVariantItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Stock edit states
  const [editStockMap, setEditStockMap] = useState<Record<number, number>>({})
  const [isUpdatingVariantId, setIsUpdatingVariantId] = useState<number | null>(null)

  // Inventory Log Modal State
  const [selectedVariant, setSelectedVariant] = useState<FlatVariantItem | null>(null)
  const [logs, setLogs] = useState<InventoryLogResponse[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Get seller's products
      const pRes = await sellerApi.getSellerProducts({ page: 0, size: 50 })
      const summaries = pRes.items || pRes.content || []

      // 2. Fetch variants for each product via productApi.getProductBySlug
      const flatList: FlatVariantItem[] = []
      const initialEdits: Record<number, number> = {}

      await Promise.all(
        summaries.map(async (item) => {
          try {
            const detail = await productApi.getProductBySlug(item.slug)
            if (detail.variants && detail.variants.length > 0) {
              detail.variants.forEach((v: ProductVariant) => {
                flatList.push({
                  productId: item.id,
                  productName: item.name,
                  productSlug: item.slug,
                  productImage: item.primaryImageUrl || detail.imageUrl,
                  variantId: v.id,
                  variantName: v.variantName,
                  sku: v.sku,
                  price: v.price,
                  currentStock: v.stock
                })
                initialEdits[v.id] = v.stock
              })
            } else {
              // Fallback if no explicit variants
              flatList.push({
                productId: item.id,
                productName: item.name,
                productSlug: item.slug,
                productImage: item.primaryImageUrl,
                variantId: item.id,
                variantName: 'Mặc định',
                sku: 'SKU-' + item.id,
                price: item.price,
                currentStock: 50
              })
              initialEdits[item.id] = 50
            }
          } catch (e) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', item.slug, e)
          }
        })
      )

      setInventoryItems(flatList)
      setEditStockMap(initialEdits)
    } catch (err: any) {
      console.error('Lỗi tải kho hàng:', err)
      showToast('error', err.response?.data?.message || 'Không thể tải danh sách tồn kho.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Handle stock input change
  const handleStockInputChange = (variantId: number, value: string) => {
    const qty = parseInt(value, 10)
    setEditStockMap((prev) => ({
      ...prev,
      [variantId]: isNaN(qty) ? 0 : Math.max(0, qty)
    }))
  }

  // Update stock API call
  const handleUpdateStock = async (item: FlatVariantItem) => {
    const newQty = editStockMap[item.variantId]
    if (typeof newQty !== 'number' || newQty < 0) {
      showToast('error', 'Số lượng tồn kho không hợp lệ.')
      return
    }

    setIsUpdatingVariantId(item.variantId)
    try {
      await sellerApi.updateStock(item.variantId, newQty)
      showToast('success', `Cập nhật tồn kho cho "${item.productName} - ${item.variantName}" thành ${newQty}!`)
      // Update local state
      setInventoryItems((prev) =>
        prev.map((i) => (i.variantId === item.variantId ? { ...i, currentStock: newQty } : i))
      )
    } catch (err: any) {
      console.error('Lỗi cập nhật kho:', err)
      showToast('error', err.response?.data?.message || 'Cập nhật kho thất bại.')
    } finally {
      setIsUpdatingVariantId(null)
    }
  }

  // Open Log Modal
  const handleOpenLogs = async (item: FlatVariantItem) => {
    setSelectedVariant(item)
    setIsLoadingLogs(true)
    try {
      const res = await sellerApi.getInventoryLogs(item.variantId, { page: 0, size: 30 })
      setLogs(res.items || res.content || [])
    } catch (err: any) {
      console.error('Lỗi lấy lịch sử kho:', err)
      showToast('error', err.response?.data?.message || 'Không thể lấy lịch sử biến động kho.')
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const formatPrice = (amount?: number) => {
    if (typeof amount !== 'number') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const filteredItems = inventoryItems.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.productName.toLowerCase().includes(q) ||
      item.variantName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.variantId.toString().includes(q)
    )
  })

  // Quick KPIs
  const totalVariants = inventoryItems.length
  const totalStockCount = inventoryItems.reduce((acc, item) => acc + (item.currentStock || 0), 0)
  const lowStockCount = inventoryItems.filter((item) => (item.currentStock || 0) < 10 && (item.currentStock || 0) > 0).length
  const outOfStockCount = inventoryItems.filter((item) => (item.currentStock || 0) === 0).length

  return (
    <SellerLayout
      title="Quản Lý Kho Hàng"
      subtitle="Kiểm soát số lượng tồn kho theo từng phân loại hàng và theo dõi lịch sử xuất nhập"
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

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Tổng số phân loại SKU</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-800">{totalVariants}</div>
          <p className="text-[11px] text-slate-400 mt-1">Các mặt hàng đang quản lý</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Tổng tồn kho</span>
            <Warehouse className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-600">{totalStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Đơn vị sản phẩm lưu kho</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Sắp hết hàng</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600">{lowStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tồn kho dưới 10 sản phẩm</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Hết hàng</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-600">{outOfStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Cần bổ sung ngay lập tức</p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên, Phân loại hoặc Mã SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
          />
        </div>

        <button
          onClick={fetchInventory}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ee4d2d]' : ''}`} />
          <span>Làm mới kho</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chi tiết tồn kho biến thể ({filteredItems.length})
          </div>
          <span className="text-[11px] text-slate-500">
            Cập nhật số lượng và lưu ngay lập tức
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Đang kiểm kê số liệu kho...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Boxes className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy phân loại nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? `Không có biến thể khớp với "${searchQuery}".` : 'Gian hàng chưa có sản phẩm để quản lý kho.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Sản phẩm & Phân loại</th>
                  <th className="p-3.5">Mã SKU</th>
                  <th className="p-3.5 text-right">Giá bán</th>
                  <th className="p-3.5 text-center">Trạng thái kho</th>
                  <th className="p-3.5 text-center">Tồn kho hiện tại</th>
                  <th className="p-3.5 text-right">Điều chỉnh & Lưu</th>
                  <th className="p-3.5 text-center">Lịch sử</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const current = item.currentStock || 0
                  const isUpdating = isUpdatingVariantId === item.variantId
                  const editedValue = editStockMap[item.variantId] ?? current
                  const hasChanged = editedValue !== current

                  return (
                    <tr key={item.variantId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Variant */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60'
                              }}
                              className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 line-clamp-1">
                              {item.productName}
                            </div>
                            <div className="text-[11px] text-[#ee4d2d] font-medium mt-0.5">
                              Phân loại: <strong>{item.variantName}</strong>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5 font-mono text-slate-500">
                        {item.sku || 'N/A'}
                      </td>

                      {/* Price */}
                      <td className="p-3.5 text-right font-bold text-slate-700">
                        {formatPrice(item.price)}
                      </td>

                      {/* Status badge */}
                      <td className="p-3.5 text-center">
                        {current === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Hết hàng
                          </span>
                        ) : current < 10 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Sắp hết ({current})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Đủ hàng
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 text-center font-bold text-slate-900 text-sm">
                        {current}
                      </td>

                      {/* Edit Input & Save button */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={editedValue}
                            onChange={(e) => handleStockInputChange(item.variantId, e.target.value)}
                            className={`w-20 px-2 py-1 bg-white border text-center rounded text-xs focus:outline-none ${
                              hasChanged 
                                ? 'border-[#ee4d2d] ring-1 ring-[#ee4d2d] font-bold text-[#ee4d2d]' 
                                : 'border-slate-300 text-slate-800'
                            }`}
                          />
                          <button
                            onClick={() => handleUpdateStock(item)}
                            disabled={isUpdating || !hasChanged}
                            title="Lưu số lượng mới"
                            className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
                              hasChanged
                                ? 'bg-[#ee4d2d] text-white hover:bg-[#d73f1f] shadow-xs cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden md:inline">Lưu</span>
                          </button>
                        </div>
                      </td>

                      {/* Log History button */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenLogs(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center gap-1"
                          title="Xem lịch sử biến động kho"
                        >
                          <History className="w-4 h-4" />
                          <span className="text-[11px] hidden lg:inline">Nhật ký</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Logs Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Lịch Sử Biến Động Kho
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedVariant.productName} ({selectedVariant.variantName} - SKU: {selectedVariant.sku})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedVariant(null)
                  setLogs([])
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {isLoadingLogs ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Đang tải lịch sử nhập xuất kho...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-600">Chưa có bản ghi biến động nào</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Các hoạt động nhập kho, đặt hàng hoặc điều chỉnh số lượng sẽ được lưu vết tại đây.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3">Thời gian</th>
                        <th className="p-3">Loại</th>
                        <th className="p-3 text-center">Biến động</th>
                        <th className="p-3 text-center">Tồn sau</th>
                        <th className="p-3">Lý do & Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {logs.map((log) => {
                        // Backend stores quantityChange as positive absolute value Math.abs(delta).
                        // Type IN & RELEASED are additions (+).
                        // Type OUT & RESERVED are reductions (-).
                        const isIncrease = log.type === 'IN' || log.type === 'RELEASED'
                        const absQty = Math.abs(log.quantityChange)
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-mono text-slate-500 text-[11px]">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.type === 'IN' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : log.type === 'OUT'
                                  ? 'bg-red-100 text-red-800'
                                  : log.type === 'RESERVED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className={`inline-flex items-center gap-0.5 ${
                                isIncrease ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {isIncrease ? `+${absQty}` : `-${absQty}`}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold text-slate-900">
                              {log.quantityAfter}
                            </td>
                            <td className="p-3 text-slate-600">
                              <div>{log.reason || 'Điều chỉnh kho'}</div>
                              {log.referenceId && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Ref: #{log.referenceId}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedVariant(null)
                  setLogs([])
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  )
}
