import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  Tag,
  X,
  ShieldAlert,
  Columns3,
  ListTree,
  Layers,
  Info,
} from 'lucide-react';
import { categoryApi } from '../api/categoryApi';
import { CategoryResponse, CreateCategoryRequest } from '../types/category';
import { useToast } from '../context/ToastContext';

// Helper to convert Vietnamese string to SEO-friendly slug
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Sample icon presets for quick selection
const ICON_PRESETS = [
  { label: 'Điện tử', url: 'https://api.dicebear.com/7.x/icons/svg?seed=electronics' },
  { label: 'Thời trang', url: 'https://api.dicebear.com/7.x/icons/svg?seed=fashion' },
  { label: 'Nhà cửa', url: 'https://api.dicebear.com/7.x/icons/svg?seed=home' },
  { label: 'Sách', url: 'https://api.dicebear.com/7.x/icons/svg?seed=books' },
  { label: 'Làm đẹp', url: 'https://api.dicebear.com/7.x/icons/svg?seed=beauty' },
  { label: 'Thể thao', url: 'https://api.dicebear.com/7.x/icons/svg?seed=sport' },
];

export const AdminCategoriesPage: React.FC = () => {
  const { success, error } = useToast();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'COLUMNS' | 'TREE'>('COLUMNS');

  // Selected nodes for 3-Column Drilldown
  const [selectedC1Id, setSelectedC1Id] = useState<number | null>(null);
  const [selectedC2Id, setSelectedC2Id] = useState<number | null>(null);

  // Column search filters
  const [searchC1, setSearchC1] = useState('');
  const [searchC2, setSearchC2] = useState('');
  const [searchC3, setSearchC3] = useState('');

  // Tree View State
  const [treeExpanded, setTreeExpanded] = useState<Record<number, boolean>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formParentId, setFormParentId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  // Delete Confirmation Modal State
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Category Tree: GET /api/v1/categories
  const fetchCategoryTree = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategoryTree();
      if (Array.isArray(res?.body)) {
        setCategories(res.body);

        // Auto select first Level 1 if not set or invalid
        if (res.body.length > 0) {
          const currentC1Exists = res.body.some((c) => c.id === selectedC1Id);
          const activeC1 = currentC1Exists
            ? res.body.find((c) => c.id === selectedC1Id)!
            : res.body[0];

          setSelectedC1Id(activeC1.id);

          if (activeC1.children && activeC1.children.length > 0) {
            const currentC2Exists = activeC1.children.some((c) => c.id === selectedC2Id);
            setSelectedC2Id(currentC2Exists ? selectedC2Id : activeC1.children[0].id);
          } else {
            setSelectedC2Id(null);
          }
        }

        // Expand Level 1 by default for Tree view
        const initialTreeExp: Record<number, boolean> = {};
        res.body.forEach((c) => {
          initialTreeExp[c.id] = true;
          c.children?.forEach((sub) => {
            initialTreeExp[sub.id] = true;
          });
        });
        setTreeExpanded(initialTreeExp);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      error('Lỗi tải danh mục', err.message || 'Không thể tải cây danh mục từ máy chủ.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  // Compute stats across all levels
  const stats = useMemo(() => {
    let l1 = 0;
    let l2 = 0;
    let l3 = 0;
    const countNodes = (list: CategoryResponse[]) => {
      for (const node of list) {
        if (node.level === 1) l1++;
        else if (node.level === 2) l2++;
        else if (node.level === 3) l3++;
        if (node.children && node.children.length > 0) {
          countNodes(node.children);
        }
      }
    };
    countNodes(categories);
    return { l1, l2, l3, total: l1 + l2 + l3 };
  }, [categories]);

  // Active Category Objects for 3-Column Drilldown
  const activeC1 = useMemo(() => {
    return categories.find((c) => c.id === selectedC1Id) || null;
  }, [categories, selectedC1Id]);

  const activeC2 = useMemo(() => {
    if (!activeC1 || !activeC1.children) return null;
    return activeC1.children.find((c) => c.id === selectedC2Id) || null;
  }, [activeC1, selectedC2Id]);

  // Column Lists with Search Filtering
  const column1List = useMemo(() => {
    if (!searchC1.trim()) return categories;
    const q = searchC1.toLowerCase().trim();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchC1]);

  const column2List = useMemo(() => {
    if (!activeC1 || !activeC1.children) return [];
    if (!searchC2.trim()) return activeC1.children;
    const q = searchC2.toLowerCase().trim();
    return activeC1.children.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [activeC1, searchC2]);

  const column3List = useMemo(() => {
    if (!activeC2 || !activeC2.children) return [];
    if (!searchC3.trim()) return activeC2.children;
    const q = searchC3.toLowerCase().trim();
    return activeC2.children.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [activeC2, searchC3]);

  // Flatten available parent candidates for the dropdown (Levels 1 and 2 only)
  const availableParents = useMemo(() => {
    const list: Array<{ id: number; name: string; level: number }> = [];
    categories.forEach((cat) => {
      list.push({ id: cat.id, name: `[Cấp 1] ${cat.name}`, level: 1 });
      cat.children?.forEach((sub) => {
        list.push({ id: sub.id, name: `── [Cấp 2] ${sub.name} (thuộc ${cat.name})`, level: 2 });
      });
    });
    return list;
  }, [categories]);

  // Target level based on selected parentId
  const targetLevel = useMemo(() => {
    if (!formParentId) return 1;
    const parent = availableParents.find((p) => p.id === formParentId);
    if (!parent) return 1;
    return parent.level + 1;
  }, [formParentId, availableParents]);

  // Open Create Modal with designated parent
  const handleOpenCreateModal = (parent?: CategoryResponse | null) => {
    setEditingCategory(null);
    setFormParentId(parent ? parent.id : null);
    setFormName('');
    setFormSlug('');
    setFormIconUrl('');
    setFormSortOrder(1);
    setIsAutoSlug(true);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat: CategoryResponse, parentId: number | null = null) => {
    setEditingCategory(cat);
    setFormParentId(parentId);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIconUrl(cat.iconUrl || '');
    setFormSortOrder(cat.sortOrder || 1);
    setIsAutoSlug(false);
    setShowModal(true);
  };

  // Handle Name Change with Auto Slug
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (isAutoSlug) {
      setFormSlug(generateSlug(val));
    }
  };

  // Handle Save (Create or Update Category)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập tên danh mục.');
      return;
    }
    const slug = formSlug.trim() || generateSlug(formName);
    if (!slug) {
      error('Thiếu thông tin', 'Vui lòng nhập đường dẫn Slug cho danh mục.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCategoryRequest = {
        parentId: formParentId || null,
        name: formName.trim(),
        slug: slug,
        iconUrl: formIconUrl.trim() || null,
        sortOrder: Number(formSortOrder) || 1,
      };

      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, payload);
        success('Thành công', `Đã cập nhật danh mục "${payload.name}".`);
      } else {
        await categoryApi.createCategory(payload);
        success('Thành công', `Đã tạo danh mục mới "${payload.name}" thành công!`);
      }

      setShowModal(false);
      await fetchCategoryTree();
    } catch (err: any) {
      error('Lỗi lưu danh mục', err.message || 'Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Category
  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await categoryApi.deleteCategory(deletingCategory.id);
      success('Đã xóa', `Danh mục "${deletingCategory.name}" đã được gỡ khỏi hệ thống.`);
      setDeletingCategory(null);
      await fetchCategoryTree();
    } catch (err: any) {
      error('Không thể xóa', err.message || 'Danh mục có thể đang chứa danh mục con hoặc có ràng buộc dữ liệu.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered tree for Tree View
  const filteredTree = useMemo(() => {
    if (!globalSearch.trim()) return categories;
    const q = globalSearch.toLowerCase().trim();

    const filterNodes = (nodes: CategoryResponse[]): CategoryResponse[] => {
      const result: CategoryResponse[] = [];
      for (const node of nodes) {
        const matches = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
        const children = node.children ? filterNodes(node.children) : [];
        if (matches || children.length > 0) {
          result.push({ ...node, children });
        }
      }
      return result;
    };
    return filterNodes(categories);
  }, [categories, globalSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* ── 1. Page Header (Clean, Light, Refined) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
              Quản Trị Hệ Thống
            </span>
            <span className="text-xs text-slate-400 font-mono">/admin/categories</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <span>Quản Lý Cây Danh Mục Sản Phẩm</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2.5 sm:mt-3 leading-relaxed">
            Cấu trúc 3 tầng: <span className="font-medium text-slate-700">Cấp 1 (Gốc)</span> →{' '}
            <span className="font-medium text-slate-700">Cấp 2 (Nhánh)</span> →{' '}
            <span className="font-semibold text-emerald-700">Cấp 3 (Đăng bán sản phẩm)</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchCategoryTree}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('COLUMNS')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'COLUMNS'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem dạng 3 cột phân tầng rõ ràng"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>3 Cột Phân Tầng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TREE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'TREE'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem dạng cây thư mục phẳng"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Cây Tối Giản</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Cấp 1</span>
          </button>
        </div>
      </div>

      {/* ── 2. Compact Stats Strip (Light & Subtle) ───────────────────── */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-6 flex-wrap text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Tổng số:</span>
            <span className="font-bold text-slate-800">{stats.total} danh mục</span>
          </div>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Cấp 1 (Gốc):</span>
            <span className="font-bold text-slate-800">{stats.l1}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Cấp 2 (Nhánh):</span>
            <span className="font-bold text-slate-800">{stats.l2}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cấp 3 (Đăng bán):</span>
            <span className="font-bold text-emerald-700">{stats.l3}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Sản phẩm chỉ gán vào Cấp 3</span>
        </div>
      </div>

      {/* ── 3. Main Views: 3-Column Miller Drilldown vs Minimal Tree ──── */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <RefreshCw className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">Đang tải cấu trúc danh mục...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-slate-800">Hệ thống chưa có danh mục nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Bắt đầu xây dựng bằng cách tạo danh mục Cấp 1 đầu tiên.
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Cấp 1 ngay</span>
          </button>
        </div>
      ) : viewMode === 'COLUMNS' ? (
        /* ═══════════════════════════════════════════════════════════════
           CHẾ ĐỘ 1: 3 CỘT PHÂN TẦNG (MÀU SẮC NHẸ NHÀNG, DỄ NHÌN, DỄ DÙNG)
           ═══════════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Active Hierarchy Breadcrumb Bar (Simple & Clean) */}
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-2 text-xs font-medium text-slate-600 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Đang chọn:</span>
            {activeC1 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs">
                <Folder className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeC1.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">#{activeC1.id}</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Chưa chọn Cấp 1</span>
            )}

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {activeC2 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs">
                <FolderPlus className="w-3.5 h-3.5 text-sky-600" />
                <span>{activeC2.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">#{activeC2.id}</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Chưa chọn Cấp 2</span>
            )}

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <span className="text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              {column3List.length} danh mục Cấp 3 sẵn sàng bán
            </span>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 min-h-[500px]">
            {/* ── CỘT 1: CẤP 1 (GỐC) ─────────────────────────────────── */}
            <div className="flex flex-col bg-white">
              {/* Col 1 Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cấp 1 • Gốc
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                    {column1List.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Thêm danh mục gốc Cấp 1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Cấp 1</span>
                </button>
              </div>

              {/* Col 1 Search */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Lọc Cấp 1..."
                    value={searchC1}
                    onChange={(e) => setSearchC1(e.target.value)}
                    className="w-full pl-8 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  {searchC1 && (
                    <button
                      onClick={() => setSearchC1('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Col 1 List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[560px]">
                {column1List.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Không tìm thấy danh mục Cấp 1
                  </div>
                ) : (
                  column1List.map((c1) => {
                    const isSelected = c1.id === selectedC1Id;
                    const childCount = c1.children?.length || 0;

                    return (
                      <div
                        key={c1.id}
                        onClick={() => {
                          setSelectedC1Id(c1.id);
                          if (c1.children && c1.children.length > 0) {
                            setSelectedC2Id(c1.children[0].id);
                          } else {
                            setSelectedC2Id(null);
                          }
                        }}
                        className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-blue-50/80 text-blue-900 border-blue-200/90 shadow-2xs font-semibold'
                            : 'hover:bg-slate-50 text-slate-700 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-blue-100/90 border-blue-200 text-blue-700'
                                : 'bg-slate-100 border-slate-200/80 text-slate-500'
                            }`}
                          >
                            {c1.iconUrl ? (
                              <img
                                src={c1.iconUrl}
                                alt={c1.name}
                                className="w-4 h-4 object-contain"
                                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                              />
                            ) : (
                              <Folder className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs truncate">{c1.name}</p>
                            <span className="text-[10px] block font-mono text-slate-400 truncate">
                              /{c1.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                              isSelected
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}
                            title={`${childCount} danh mục Cấp 2`}
                          >
                            {childCount}
                          </span>

                          <div
                            className={`flex items-center ${
                              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c1, null)}
                              className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-100/60 transition-colors"
                              title="Sửa"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(c1)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <ChevronRight
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-blue-600' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── CỘT 2: CẤP 2 (NHÁNH) ─────────────────────────────────── */}
            <div className="flex flex-col bg-white">
              {/* Col 2 Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cấp 2 • Phân Loại
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                    {column2List.length}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!activeC1}
                  onClick={() => handleOpenCreateModal(activeC1)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40"
                  title="Thêm danh mục con Cấp 2 vào Cấp 1 đang chọn"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Cấp 2</span>
                </button>
              </div>

              {/* Col 2 Search */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={activeC1 ? `Lọc Cấp 2 trong "${activeC1.name}"...` : 'Lọc Cấp 2...'}
                    disabled={!activeC1}
                    value={searchC2}
                    onChange={(e) => setSearchC2(e.target.value)}
                    className="w-full pl-8 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                  {searchC2 && (
                    <button
                      onClick={() => setSearchC2('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Col 2 List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[560px]">
                {!activeC1 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    ← Chọn một danh mục Cấp 1 để xem các nhánh Cấp 2
                  </div>
                ) : column2List.length === 0 ? (
                  <div className="py-14 text-center px-4">
                    <FolderPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Chưa có danh mục Cấp 2</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Thuộc nhóm "{activeC1.name}"
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(activeC1)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo Cấp 2 đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  column2List.map((c2) => {
                    const isSelected = c2.id === selectedC2Id;
                    const childCount = c2.children?.length || 0;

                    return (
                      <div
                        key={c2.id}
                        onClick={() => setSelectedC2Id(c2.id)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-blue-50/80 text-blue-900 border-blue-200/90 shadow-2xs font-semibold'
                            : 'hover:bg-slate-50 text-slate-700 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-blue-100/90 border-blue-200 text-blue-700'
                                : 'bg-sky-50 border-sky-100 text-sky-600'
                            }`}
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs truncate">{c2.name}</p>
                            <span className="text-[10px] block font-mono text-slate-400 truncate">
                              /{c2.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                              isSelected
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}
                            title={`${childCount} danh mục con Cấp 3`}
                          >
                            {childCount}
                          </span>

                          <div
                            className={`flex items-center ${
                              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c2, activeC1.id)}
                              className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-100/60 transition-colors"
                              title="Sửa"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(c2)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <ChevronRight
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-blue-600' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── CỘT 3: CẤP 3 (ĐĂNG BÁN SẢN PHẨM) ────────────────────── */}
            <div className="flex flex-col bg-white">
              {/* Col 3 Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cấp 3 • Đăng Bán
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {column3List.length}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!activeC2}
                  onClick={() => handleOpenCreateModal(activeC2)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40"
                  title="Thêm danh mục Cấp 3 để người bán gán sản phẩm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Cấp 3</span>
                </button>
              </div>

              {/* Col 3 Search */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={activeC2 ? `Lọc Cấp 3 trong "${activeC2.name}"...` : 'Lọc Cấp 3...'}
                    disabled={!activeC2}
                    value={searchC3}
                    onChange={(e) => setSearchC3(e.target.value)}
                    className="w-full pl-8 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                  {searchC3 && (
                    <button
                      onClick={() => setSearchC3('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Col 3 List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[560px]">
                {!activeC2 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    ← Chọn một danh mục Cấp 2 để xem các danh mục con Cấp 3
                  </div>
                ) : column3List.length === 0 ? (
                  <div className="py-14 text-center px-4">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Chưa có danh mục Cấp 3</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Thuộc nhóm "{activeC2.name}". Người bán cần Cấp 3 để đăng sản phẩm!
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(activeC2)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Cấp 3 ngay</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {column3List.map((c3) => (
                      <div
                        key={c3.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {c3.name}
                              </p>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                                Bán được
                              </span>
                            </div>
                            <span className="text-[10px] block font-mono text-slate-400 truncate">
                              /{c3.slug} • #{c3.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c3, activeC2.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Sửa"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(c3)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quick Add Button at bottom */}
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(activeC2)}
                      className="w-full py-2.5 border border-dashed border-slate-200 hover:border-emerald-300 bg-slate-50/40 hover:bg-emerald-50/20 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm danh mục Cấp 3 khác</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           CHẾ ĐỘ 2: CÂY TỐI GIẢN (EXPLORER TREE - KHÔNG LỒNG HỘP RỐI MẮT)
           ═══════════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Tree View Toolbar */}
          <div className="p-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục bất kỳ..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const all: Record<number, boolean> = {};
                  const expand = (list: CategoryResponse[]) => {
                    list.forEach((n) => {
                      all[n.id] = true;
                      if (n.children) expand(n.children);
                    });
                  };
                  expand(categories);
                  setTreeExpanded(all);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Mở rộng hết
              </button>
              <button
                type="button"
                onClick={() => setTreeExpanded({})}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Thu gọn hết
              </button>
            </div>
          </div>

          {/* Tree View Content */}
          <div className="p-3 divide-y divide-slate-100">
            {filteredTree.map((c1) => {
              const isExp1 = treeExpanded[c1.id] ?? true;
              return (
                <div key={c1.id} className="py-2 space-y-1">
                  {/* Level 1 Item */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => setTreeExpanded((prev) => ({ ...prev, [c1.id]: !isExp1 }))}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {c1.children?.length ? (
                          isExp1 ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </button>
                      <Folder className="w-4 h-4 text-slate-600 shrink-0" />
                      <span className="font-semibold text-slate-800 text-xs">{c1.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                        Cấp 1
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">/{c1.slug}</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(c1)}
                        className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        + Cấp 2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c1, null)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                        title="Sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(c1)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level 2 Sub-items */}
                  {isExp1 && c1.children && (
                    <div className="ml-6 pl-3 border-l border-slate-200 space-y-1">
                      {c1.children.map((c2) => {
                        const isExp2 = treeExpanded[c2.id] ?? true;
                        return (
                          <div key={c2.id} className="space-y-1">
                            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTreeExpanded((prev) => ({ ...prev, [c2.id]: !isExp2 }))
                                  }
                                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {c2.children?.length ? (
                                    isExp2 ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )
                                  ) : (
                                    <div className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <FolderPlus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="font-medium text-slate-700 text-xs">{c2.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-700">
                                  Cấp 2
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">/{c2.slug}</span>
                              </div>

                              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreateModal(c2)}
                                  className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-semibold transition-colors cursor-pointer"
                                >
                                  + Cấp 3
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(c2, c1.id)}
                                  className="p-1 text-slate-400 hover:text-slate-800 rounded"
                                  title="Sửa"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingCategory(c2)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Level 3 Leaf Items */}
                            {isExp2 && c2.children && (
                              <div className="ml-6 pl-3 border-l border-slate-200 space-y-0.5">
                                {c2.children.map((c3) => (
                                  <div
                                    key={c3.id}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="text-slate-700 font-medium text-xs">
                                        {c3.name}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[8px] font-semibold bg-emerald-50 text-emerald-700">
                                        Cấp 3
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        /{c3.slug} • #{c3.id}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(c3, c2.id)}
                                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                                        title="Sửa"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCategory(c3)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                        title="Xóa"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Create / Edit Category Modal (Clean & Light) ──────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase mt-0.5 bg-slate-100 text-slate-600">
                    Cấp {targetLevel} {targetLevel === 1 ? '• Gốc' : targetLevel === 2 ? '• Nhánh' : '• Đăng bán'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              {/* Parent Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Danh mục cha (Trực thuộc)
                </label>
                <select
                  value={formParentId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFormParentId(val);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                >
                  <option value="">(Không có) — Tạo danh mục Gốc (Cấp 1)</option>
                  {availableParents
                    .filter((p) => !editingCategory || p.id !== editingCategory.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 mt-2 text-xs">
                  {formParentId === null ? (
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-blue-600" />
                      <span>Danh mục Cấp 1 (Gốc) — Nhóm lớn nhất của sàn</span>
                    </span>
                  ) : targetLevel === 3 ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Danh mục Cấp 3 (Lá) — <strong>Dùng để người bán chọn khi đăng sản phẩm</strong>
                      </span>
                    </span>
                  ) : (
                    <span className="text-sky-700 font-medium flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-sky-600" />
                      <span>Danh mục Cấp 2 (Nhánh phân loại con)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết Bị Điện Tử, Smartphone..."
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Đường dẫn Slug <span className="text-rose-500">*</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAutoSlug}
                      onChange={(e) => setIsAutoSlug(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tự tạo từ tên</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  placeholder="thiet-bi-dien-tu"
                  value={formSlug}
                  onChange={(e) => {
                    setIsAutoSlug(false);
                    setFormSlug(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Icon / Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Icon / Ảnh đại diện (Tùy chọn)
                </label>
                <input
                  type="url"
                  placeholder="https://api.dicebear.com/... hoặc link ảnh"
                  value={formIconUrl}
                  onChange={(e) => setFormIconUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />

                {/* Quick Icon Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-400">Gợi ý:</span>
                  {ICON_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormIconUrl(preset.url)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {formIconUrl && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={formIconUrl}
                      alt="Icon preview"
                      className="w-7 h-7 rounded object-contain border border-slate-200 bg-white p-0.5"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                    <span className="text-[11px] text-slate-500">Xem trước icon đại diện</span>
                  </div>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  min="0"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                >
                  {saving ? 'Đang lưu...' : editingCategory ? 'Lưu cập nhật' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Delete Confirmation Modal ────────────────────────────── */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl border border-slate-100 text-center">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5">
              Xác nhận xóa danh mục?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <strong className="text-slate-800 font-semibold">"{deletingCategory.name}"</strong>?
              <br />
              <span className="text-rose-600 font-medium block mt-1">
                Lưu ý: Không thể xóa nếu danh mục này đang chứa các danh mục con!
              </span>
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteCategory}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
