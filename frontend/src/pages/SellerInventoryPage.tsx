import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ExternalLink,
  Package,
  Layers,
  Clock,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { shopApi } from '../api/shopApi';
import {
  ProductSummaryResponse,
  ProductResponse,
  ProductVariantResponse,
  InventoryLogResponse,
} from '../types/product';
import { formatVND } from '../utils/format';
import { useToast } from '../context/ToastContext';

interface FlattenedInventoryItem {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: number;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
}

export const SellerInventoryPage: React.FC = () => {
  const { success, error } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<FlattenedInventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Inline stock adjustment states
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Inventory Logs modal states
  const [selectedItemForLogs, setSelectedItemForLogs] = useState<FlattenedInventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryLogResponse[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Load all products and their variants
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get all seller products via GET /api/v1/seller/products
      const prodRes = await shopApi.getMyProducts(0, 100);
      const productSummaries: ProductSummaryResponse[] = prodRes?.body?.items || [];

      // 2. Fetch full detail for each product to extract variants via GET /api/v1/products/{slug}
      const details = await Promise.all(
        productSummaries.map(async (p) => {
          try {
            const res = await productApi.getProduct(p.slug);
            return res?.body || null;
          } catch {
            return null;
          }
        })
      );

      // 3. Flatten into inventory item rows
      const flattened: FlattenedInventoryItem[] = [];
      details.forEach((det, idx) => {
        const fallback = productSummaries[idx];
        if (det && det.variants && det.variants.length > 0) {
          det.variants.forEach((v) => {
            flattened.push({
              productId: det.id,
              productName: det.name,
              productSlug: det.slug,
              productImage: det.images?.[0]?.imageUrl || fallback?.primaryImageUrl || '',
              variantId: v.id,
              variantName: v.variantName,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
            });
          });
        } else if (fallback) {
          // If no explicit variant array
          flattened.push({
            productId: fallback.id,
            productName: fallback.name,
            productSlug: fallback.slug,
            productImage: fallback.primaryImageUrl,
            variantId: fallback.id,
            variantName: 'Mặc định',
            sku: `SKU-${fallback.id}`,
            price: fallback.price,
            stock: 0,
          });
        }
      });

      setItems(flattened);

      // Initialize stock inputs
      const initialInputs: Record<number, number> = {};
      flattened.forEach((it) => {
        initialInputs[it.variantId] = it.stock;
      });
      setStockInputs(initialInputs);
    } catch (err: any) {
      console.error(err);
      error('Lỗi tải dữ liệu', 'Không thể tải danh sách tồn kho.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle stock update via PUT /api/v1/seller/inventory/{variantId}?quantity={quantity}
  const handleUpdateStock = async (variantId: number) => {
    const newQty = stockInputs[variantId];
    if (newQty === undefined || isNaN(newQty) || newQty < 0) {
      error('Số lượng không hợp lệ', 'Số lượng tồn kho phải là số không âm.');
      return;
    }

    try {
      setUpdatingId(variantId);
      await productApi.updateStock(variantId, Number(newQty));
      success('Cập nhật kho thành công!', `Tồn kho mới: ${newQty} sản phẩm.`);

      // Update local item stock
      setItems((prev) =>
        prev.map((it) => (it.variantId === variantId ? { ...it, stock: Number(newQty) } : it))
      );

      // If viewing logs for this variant, refresh logs immediately
      if (selectedItemForLogs?.variantId === variantId) {
        handleViewLogs({ ...selectedItemForLogs, stock: Number(newQty) });
      }
    } catch (err: any) {
      error('Lỗi cập nhật kho', err.message || 'Không thể cập nhật số lượng tồn kho.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle viewing inventory logs via GET /api/v1/seller/inventory/{variantId}/logs
  const handleViewLogs = async (item: FlattenedInventoryItem) => {
    setSelectedItemForLogs(item);
    setLoadingLogs(true);
    try {
      const res = await productApi.getInventoryLogs(item.variantId, 0, 50);
      if (res?.body?.items) {
        setLogs(res.body.items);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      error('Lỗi tải lịch sử kho', err.message || 'Không thể lấy lịch sử biến động kho.');
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Computed KPI Metrics
  const totalProducts = new Set(items.map((i) => i.productId)).size;
  const totalSkus = items.length;
  const totalInStockQty = items.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 5).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;

  // Filtered List
  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === 'IN_STOCK') return it.stock > 5;
    if (statusFilter === 'LOW_STOCK') return it.stock > 0 && it.stock <= 5;
    if (statusFilter === 'OUT_OF_STOCK') return it.stock === 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Kho Hàng & Tồn Kho
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              Seller
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tồn kho theo phân loại biến thể SKU và kiểm tra toàn bộ lịch sử xuất / nhập kho.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchInventory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách tồn kho"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Đồng bộ kho</span>
          </button>

          <Link
            to="/seller/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Xem sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng sản phẩm
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalProducts}</span>
            <span className="text-xs text-slate-500">mặt hàng</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng mã SKU
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{totalSkus}</span>
            <span className="text-xs text-slate-500">phân loại</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng tồn trong kho
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalInStockQty}</span>
            <span className="text-xs text-slate-500">đơn vị</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Sắp hết hàng
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{lowStockCount}</span>
            <span className="text-xs text-amber-600 font-medium">(≤ 5 món)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Đã hết hàng
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{outOfStockCount}</span>
            <span className="text-xs text-rose-600 font-medium">(0 món)</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, phân loại, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Còn hàng ({items.filter((i) => i.stock > 5).length})
          </button>
          <button
            onClick={() => setStatusFilter('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Sắp hết ({lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'OUT_OF_STOCK'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Hết hàng ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* ── Inventory Variants Table ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
            <span>Đang tải thông tin tồn kho biến thể...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Boxes className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy phân loại biến thể nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi từ khóa tìm kiếm hoặc chuyển bộ lọc trạng thái.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sản Phẩm</th>
                  <th className="py-3.5 px-4">Biến Thể & SKU</th>
                  <th className="py-3.5 px-4">Đơn Giá</th>
                  <th className="py-3.5 px-4">Tồn Kho Hiện Tại</th>
                  <th className="py-3.5 px-4">Điều Chỉnh Tồn Kho (PUT)</th>
                  <th className="py-3.5 px-5 text-right">Lịch Sử (GET)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isLow = item.stock > 0 && item.stock <= 5;
                  const isOut = item.stock === 0;
                  const isUpdating = updatingId === item.variantId;

                  return (
                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImage || 'https://picsum.photos/seed/inv/100/100'}
                            alt={item.productName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                              {item.productName}
                            </h4>
                            <Link
                              to={`/products/${item.productSlug || item.productId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5"
                            >
                              <span>Xem trên sàn</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Variant & SKU */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 text-xs block">
                          {item.variantName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {item.sku}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{formatVND(item.price)}</span>
                      </td>

                      {/* Stock & Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black font-mono ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                            }`}
                          >
                            {item.stock}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isOut ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Hết hàng</span>
                              </>
                            ) : isLow ? (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                <span>Sắp hết ({item.stock})</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Còn hàng</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Inline Stock Adjustment (PUT /api/v1/seller/inventory/{variantId}?quantity=X) */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                          <input
                            type="number"
                            min="0"
                            value={stockInputs[item.variantId] ?? item.stock}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStockInputs((prev) => ({ ...prev, [item.variantId]: val }));
                            }}
                            className="w-20 px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:border-slate-900"
                          />
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStock(item.variantId)}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Lưu...</span>
                              </>
                            ) : (
                              <span>Lưu kho</span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* View Logs Button (GET /api/v1/seller/inventory/{variantId}/logs) */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewLogs(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                          title="Xem lịch sử xuất / nhập kho"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>Lịch sử</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inventory Logs Modal (GET /api/v1/seller/inventory/{variantId}/logs) ── */}
      {selectedItemForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Lịch Sử Biến Động Kho</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono">
                      {selectedItemForLogs.sku}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {selectedItemForLogs.productName} • <strong>{selectedItemForLogs.variantName}</strong> (Tồn hiện tại: {selectedItemForLogs.stock})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemForLogs(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logs Content */}
            {loadingLogs ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                Đang tải lịch sử kho từ server...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có giao dịch biến động kho nào cho biến thể này.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                  <span>Tổng số bản ghi: <strong>{logs.length}</strong></span>
                  <button
                    onClick={() => handleViewLogs(selectedItemForLogs)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Làm mới</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3.5">Loại</th>
                        <th className="py-2.5 px-3">Biến Động</th>
                        <th className="py-2.5 px-3">Tồn Sau</th>
                        <th className="py-2.5 px-4">Lý Do</th>
                        <th className="py-2.5 px-4 text-right">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => {
                        const isPositive =
                          log.type === 'IN' || log.type === 'CANCEL_RESERVED';
                        const isNegative =
                          log.type === 'OUT' || log.type === 'RESERVED';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.type === 'IN'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : log.type === 'OUT'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                ) : isNegative ? (
                                  <ArrowDownRight className="w-3 h-3 text-rose-600" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-600" />
                                )}
                                <span>{log.type}</span>
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`font-mono font-bold ${
                                  isPositive
                                    ? 'text-emerald-600'
                                    : isNegative
                                    ? 'text-rose-600'
                                    : 'text-slate-700'
                                }`}
                              >
                                {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-slate-900">
                                {log.quantityAfter}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-700 text-[11px]">
                              {log.reason || '—'}
                            </td>

                            <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemForLogs(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInventoryPage;
