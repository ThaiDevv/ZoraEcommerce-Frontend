import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCw,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  Boxes,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { shopApi } from '../api/shopApi';
import {
  ProductSummaryResponse,
  CategoryResponse,
  ProductResponse,
  ProductVariantResponse,
  InventoryLogResponse,
} from '../types/product';
import { CreateProductRequest, UpdateProductRequest } from '../types/shop';
import { formatVND } from '../utils/format';
import { useToast } from '../context/ToastContext';

export const SellerProductsPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSummaryResponse | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formPrice, setFormPrice] = useState<number>(100000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(120000);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Variants state
  const [variants, setVariants] = useState<Array<{ variantName: string; sku: string; price: number; stock: number }>>([
    { variantName: 'Tiêu chuẩn', sku: 'SKU-01', price: 100000, stock: 50 },
  ]);

  // Inventory Modal states
  const [inventoryProduct, setInventoryProduct] = useState<ProductSummaryResponse | null>(null);
  const [inventoryDetail, setInventoryDetail] = useState<ProductResponse | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({});
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null);

  // Inventory Logs State
  const [selectedVariantForLogs, setSelectedVariantForLogs] = useState<ProductVariantResponse | null>(null);
  const [logs, setLogs] = useState<InventoryLogResponse[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await shopApi.getMyProducts(0, 50);
      if (res?.body?.items) {
        setProducts(res.body.items);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.warn('Lỗi lấy danh sách sản phẩm của người bán:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      if (Array.isArray(res?.body)) {
        // Flatten 3-level categories tree, prioritizing level 3 leaf categories
        const flatList: any[] = [];
        const traverse = (list: any[], parentNames: string[] = []) => {
          for (const item of list) {
            const currentPath = [...parentNames, item.name];
            if (item.children && item.children.length > 0) {
              traverse(item.children, currentPath);
            } else {
              // Leaf node (Level 3 required by backend)
              flatList.push({
                id: item.id,
                name: currentPath.join(' → '),
                level: item.level || 3,
              });
            }
          }
        };
        traverse(res.body);
        setCategories(flatList);
        if (flatList.length > 0) setFormCategoryId(flatList[0].id);
      }
    } catch (err) {
      console.warn('Lỗi lấy danh mục:', err);
      setCategories([
        { id: 9, name: 'Thiết Bị Điện Tử → Smartphone / Điện thoại', level: 3 },
        { id: 11, name: 'Thiết Bị Điện Tử → Laptop Gaming', level: 3 },
        { id: 12, name: 'Thời Trang Nam → Áo Thun / T-Shirt', level: 3 },
        { id: 19, name: 'Nhà Cửa & Đời Sống → Thiết Bị Pha Chế & Cà Phê', level: 3 },
      ]);
      setFormCategoryId(9);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice(150000);
    setFormOriginalPrice(200000);
    setFormImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500');
    setVariants([
      { variantName: 'Mặc định', sku: `SKU-${Date.now().toString().slice(-4)}`, price: 150000, stock: 100 },
    ]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = async (prod: ProductSummaryResponse) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDescription('');
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice || prod.price);
    setFormImageUrl(prod.primaryImageUrl);
    setShowAddModal(true);

    try {
      const res = await productApi.getProduct(prod.slug);
      if (res?.body) {
        setFormDescription(res.body.description || '');
        if (res.body.category?.id) {
          setFormCategoryId(res.body.category.id);
        }
        if (res.body.variants?.length) {
          setVariants(
            res.body.variants.map((v) => ({
              variantName: v.variantName,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
            }))
          );
        }
      }
    } catch {
      // Keep basic info from summary
    }
  };

  // ── Inventory Handlers (SellerInventoryController) ─────────────────
  const handleOpenInventoryModal = async (prod: ProductSummaryResponse) => {
    setInventoryProduct(prod);
    setSelectedVariantForLogs(null);
    setLogs([]);
    setLoadingInventory(true);
    try {
      const res = await productApi.getProduct(prod.slug);
      if (res?.body) {
        setInventoryDetail(res.body);
        const initialStocks: Record<number, number> = {};
        res.body.variants?.forEach((v) => {
          initialStocks[v.id] = v.stock;
        });
        setStockInputs(initialStocks);
      }
    } catch (err: any) {
      error('Lỗi', 'Không thể lấy thông tin biến thể và tồn kho của sản phẩm.');
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleUpdateStock = async (variantId: number) => {
    const newQty = stockInputs[variantId];
    if (newQty === undefined || isNaN(newQty) || newQty < 0) {
      error('Lỗi số lượng', 'Số lượng tồn kho phải là số không âm.');
      return;
    }
    setUpdatingStockId(variantId);
    try {
      await productApi.updateStock(variantId, Number(newQty));
      success('Thành công', `Đã cập nhật số lượng tồn kho thành ${newQty}!`);

      // Refresh detail to get updated numbers
      if (inventoryProduct) {
        const res = await productApi.getProduct(inventoryProduct.slug);
        if (res?.body) {
          setInventoryDetail(res.body);
        }
      }
      fetchProducts();

      // If currently viewing logs for this variant, refresh logs
      if (selectedVariantForLogs?.id === variantId) {
        handleViewLogs(selectedVariantForLogs);
      }
    } catch (err: any) {
      error('Lỗi cập nhật kho', err.message || 'Không thể cập nhật tồn kho biến thể.');
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleViewLogs = async (variant: ProductVariantResponse) => {
    setSelectedVariantForLogs(variant);
    setLoadingLogs(true);
    try {
      const res = await productApi.getInventoryLogs(variant.id, 0, 20);
      if (res?.body?.items) {
        setLogs(res.body.items);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      error('Lỗi', 'Không thể tải lịch sử biến động kho.');
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variantName: `Phân loại ${prev.length + 1}`,
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        price: formPrice,
        stock: 50,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      error('Cảnh báo', 'Sản phẩm phải có ít nhất 1 biến thể.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (formPrice <= 0) {
      error('Lỗi giá bán', 'Giá bán sản phẩm phải lớn hơn 0.');
      return;
    }

    setSavingProduct(true);

    try {
      if (editingProduct) {
        // Update product via PUT /api/v1/seller/products/{slug}
        const updateData: UpdateProductRequest = {
          name: formName.trim(),
          description: formDescription.trim(),
          price: formPrice,
          originalPrice: formOriginalPrice,
          categoryId: formCategoryId,
        };
        await shopApi.updateProduct(editingProduct.slug, updateData);
        success('Thành công', 'Đã cập nhật thông tin sản phẩm.');
      } else {
        // Create product via POST /api/v1/seller/products
        const createData: CreateProductRequest = {
          name: formName.trim(),
          description: formDescription.trim() || formName.trim(),
          price: formPrice,
          originalPrice: formOriginalPrice,
          categoryId: formCategoryId,
          images: [
            {
              imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
              isPrimary: true,
              sortOrder: 1,
            },
          ],
          variants: variants.map((v) => ({
            variantName: v.variantName.trim(),
            sku: v.sku.trim() || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
            price: Number(v.price) || formPrice,
            stock: Number(v.stock) || 10,
          })),
        };
        await shopApi.createProduct(createData);
        success('Thành công', 'Đã tạo sản phẩm mới thành công!');
      }

      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      error('Lỗi lưu sản phẩm', err.message || 'Không thể lưu sản phẩm. Vui lòng kiểm tra lại.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (slug: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi gian hàng?')) return;
    try {
      await shopApi.deleteProduct(slug);
      success('Đã xóa', 'Sản phẩm đã được gỡ khỏi danh sách bán.');
      fetchProducts();
    } catch (err: any) {
      error('Lỗi', err.message || 'Không thể xóa sản phẩm.');
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const ratedProducts = products.filter((p) => p.ratingAvg && p.ratingAvg > 0);
  const avgRating =
    ratedProducts.length > 0
      ? (ratedProducts.reduce((acc, curr) => acc + (curr.ratingAvg || 0), 0) / ratedProducts.length).toFixed(1)
      : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-slate-900" />
            <span>Quản Lý Sản Phẩm</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, cập nhật thông tin và quản lý danh sách sản phẩm đăng bán trên sàn.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm mới</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tổng sản phẩm</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 uppercase">Đang đăng bán</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Đã bán được</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {products.reduce((acc, curr) => acc + (curr.soldCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Đánh giá trung bình</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{avgRating} ★</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        {categories.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
            >
              <option value="ALL">Tất cả ngành hàng</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-slate-900" />
            <p className="text-sm">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-900 mx-auto flex items-center justify-center mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có sản phẩm nào</h3>
            <p className="text-xs text-slate-500 mb-6">Hãy đăng sản phẩm đầu tiên để bắt đầu đón nhận đơn hàng.</p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
            >
              + Đăng sản phẩm mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Sản phẩm</th>
                  <th className="py-3.5 px-4">Giá bán</th>
                  <th className="py-3.5 px-4">Đã bán</th>
                  <th className="py-3.5 px-4">Đánh giá</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prod.primaryImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={prod.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                          }}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-md">
                          <p className="font-bold text-slate-900 line-clamp-1 hover:text-slate-700 transition-colors">
                            {prod.name}
                          </p>
                          <span className="text-xs text-slate-400 font-mono">Slug: {prod.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-slate-900">{formatVND(prod.price)}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="block text-xs text-slate-400 line-through">
                            {formatVND(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {prod.soldCount || 0}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        ★ {prod.ratingAvg || '5.0'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${prod.slug || prod.id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Xem trên sàn"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenInventoryModal(prod)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Quản lý tồn kho & lịch sử"
                        >
                          <Boxes className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.slug)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
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

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-900" />
                <span>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Đăng bán sản phẩm mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: iPhone 16 Pro Max 256GB Titan Tự Nhiên"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ngành hàng / Danh mục <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Giá bán (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Giá gốc niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={formPrice}
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium text-slate-500"
                  />
                </div>
              </div>

              {/* Primary Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Đường dẫn ảnh đại diện (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Thông tin chi tiết, đặc điểm nổi bật của sản phẩm..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
                />
              </div>

              {/* Variants Section (For create new product) */}
              {!editingProduct && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phân loại / Biến thể sản phẩm ({variants.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-xs font-bold text-slate-900 hover:text-slate-700 cursor-pointer"
                    >
                      + Thêm phân loại
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <input
                          type="text"
                          required
                          placeholder="Tên loại (vd: Đen)"
                          value={v.variantName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, variantName: val } : item)));
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          required
                          placeholder="SKU"
                          value={v.sku}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, sku: val } : item)));
                          }}
                          className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Giá"
                          value={v.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, price: val } : item)));
                          }}
                          className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Kho"
                          value={v.stock}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, stock: val } : item)));
                          }}
                          className="w-20 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70"
                >
                  {savingProduct ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Đăng bán ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory & Logs Modal (SellerInventoryController) */}
      {inventoryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Quản Lý Kho Hàng & Tồn Kho
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-lg">
                    {inventoryProduct.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInventoryProduct(null);
                  setSelectedVariantForLogs(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingInventory ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                Đang tải thông tin biến thể & tồn kho...
              </div>
            ) : !inventoryDetail?.variants || inventoryDetail.variants.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Sản phẩm này chưa có thông tin biến thể.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Variant Stock Adjustment Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
                    <span>Danh sách phân loại biến thể</span>
                    <span className="text-[11px] font-normal text-slate-500 lowercase">
                      PUT /api/v1/seller/inventory/{'{variantId}'}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {inventoryDetail.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          selectedVariantForLogs?.id === variant.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{variant.variantName}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              {variant.sku}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span>Giá: <strong className="text-slate-700">{formatVND(variant.price)}</strong></span>
                            <span>•</span>
                            <span>Tồn hiện tại: <strong className="text-slate-900 font-bold">{variant.stock}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                            <span className="text-[11px] text-slate-500 pl-2">Số lượng mới:</span>
                            <input
                              type="number"
                              min="0"
                              value={stockInputs[variant.id] ?? variant.stock}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setStockInputs((prev) => ({ ...prev, [variant.id]: val }));
                              }}
                              className="w-20 px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              disabled={updatingStockId === variant.id}
                              onClick={() => handleUpdateStock(variant.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              {updatingStockId === variant.id ? 'Đang lưu...' : 'Lưu kho'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleViewLogs(variant)}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              selectedVariantForLogs?.id === variant.id
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                            title="Xem lịch sử biến động"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Lịch sử</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Variant Logs Section */}
                {selectedVariantForLogs && (
                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <History className="w-4 h-4 text-indigo-600" />
                          <span>Lịch sử biến động: {selectedVariantForLogs.variantName}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          GET /api/v1/seller/inventory/{selectedVariantForLogs.id}/logs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewLogs(selectedVariantForLogs)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    {loadingLogs ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Đang tải lịch sử kho...
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        Chưa có lịch sử giao dịch/biến động kho cho biến thể này.
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                              <th className="py-2.5 px-3">Loại</th>
                              <th className="py-2.5 px-3">Thay đổi</th>
                              <th className="py-2.5 px-3">Tồn sau</th>
                              <th className="py-2.5 px-3">Lý do</th>
                              <th className="py-2.5 px-3 text-right">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => {
                              const isPositive = log.type === 'IN' || log.type === 'CANCEL_RESERVED';
                              return (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3">
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
                                      ) : (
                                        <ArrowDownRight className="w-3 h-3 text-rose-600" />
                                      )}
                                      <span>{log.type}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold">
                                    <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                                      {isPositive ? `+${log.quantityChange}` : `-${log.quantityChange}`}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                    {log.quantityAfter}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                    {log.reason || '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
