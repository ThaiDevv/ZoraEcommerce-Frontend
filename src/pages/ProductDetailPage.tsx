import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Store,
  MessageSquare,
  ChevronRight,
  Check,
  AlertCircle,
  CheckCircle2,
  Copy,
  ThumbsUp,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import MainHeader from '../components/MainHeader'
import AuthFooter from '../components/AuthFooter'
import { productApi } from '../api/productApi'
import { cartApi } from '../api/cartApi'
import { SHOPS_DATABASE, isProductFromShop, type ShopProfile } from '../api/shopApi'
import type { Product, ProductVariant, ProductSummaryResponse } from '../types/product'

// Fallback catalog for mock/demo products if backend does not have specific slug/id
const FALLBACK_PRODUCT_CATALOG: Record<string, Product> = {
  '1': {
    id: 1,
    name: 'Áo Thun Nam Cổ Tròn Cotton 100% Co Giãn 4 Chiều Basic Form Rộng',
    slug: 'ao-thun-nam-cotton-100',
    description: `### Áo Thun Nam Cotton 100% Cao Cấp Zora Fashion
- Chất liệu: 100% sợi bông Cotton tự nhiên, xử lý chải kỹ bề mặt mềm mịn, thoáng khí tối đa.
- Co giãn 4 chiều linh hoạt, không bai nhão, không xù lông sau nhiều lần giặt.
- Đường may viền cổ đôi chắc chắn, form suông thời trang chuẩn phong cách Hàn Quốc.
- Phù hợp mặc đi chơi, đi làm, tập thể thao hoặc làm áo lót trong.`,
    price: 159000,
    originalPrice: 250000,
    soldCount: 15200,
    ratingAvg: 4.8,
    ratingCount: 4500,
    viewCount: 68200,
    status: 'ACTIVE',
    shop: { id: 2, name: 'Shopee Fashion World', logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100' },
    category: { id: 1, name: 'Thời Trang Nam', slug: 'thoi-trang-nam' },
    images: [
      { id: 1, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', sortOrder: 0, isPrimary: true },
      { id: 2, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', sortOrder: 1, isPrimary: false },
      { id: 3, imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 101, variantName: 'Trắng Basic - Size M', sku: 'AT-WHT-M', price: 159000, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
      { id: 102, variantName: 'Trắng Basic - Size L', sku: 'AT-WHT-L', price: 159000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
      { id: 103, variantName: 'Đen Huyền Bí - Size M', sku: 'AT-BLK-M', price: 169000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400' },
      { id: 104, variantName: 'Xám Tiêu - Size L', sku: 'AT-GRY-L', price: 169000, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400' },
    ],
  },
  '2': {
    id: 2,
    name: 'Tai Nghe Không Dây Bluetooth 5.3 Chống Ồn ENC Pro Âm Bass Sâu',
    slug: 'tai-nghe-bluetooth-enc-pro',
    description: `### Tai Nghe Bluetooth Chống Ồn Thế Hệ Mới
- Chuẩn kết nối Bluetooth 5.3 tốc độ cao, độ trễ cực thấp 40ms chơi game không giật lag.
- Công nghệ khử ồn đàm thoại ENC 4 micro lọc tạp âm thông minh.
- Thời lượng pin khủng: 8 giờ sử dụng liên tục, hộp sạc hỗ trợ thêm 32 giờ.
- Chuẩn chống nước IPX5 an tâm tập luyện thể thao dưới mưa phùn.`,
    price: 389000,
    originalPrice: 650000,
    soldCount: 45100,
    ratingAvg: 4.9,
    ratingCount: 3890,
    viewCount: 92100,
    status: 'ACTIVE',
    shop: { id: 1, name: 'Electro Mini Superstore', logoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100' },
    category: { id: 2, name: 'Thiết Bị Âm Thanh', slug: 'thiet-bi-am-thanh' },
    images: [
      { id: 201, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', sortOrder: 0, isPrimary: true },
      { id: 202, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', sortOrder: 1, isPrimary: false },
    ],
    variants: [
      { id: 201, variantName: 'Trắng Ngọc Trai (Pro Case)', sku: 'TN-WHT-PRO', price: 389000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
      { id: 202, variantName: 'Đen Nhám (Matte Black)', sku: 'TN-BLK-PRO', price: 399000, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    ],
  },
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Active gallery image
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // Quantity
  const [quantity, setQuantity] = useState(1)

  // Social & Favorite states
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(328)
  const [isCopied, setIsCopied] = useState(false)

  // Description expand/collapse
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  // Add to cart state
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Review filter tab
  const [reviewFilter, setReviewFilter] = useState('all')

  // Related products & Same shop products
  const [relatedProducts, setRelatedProducts] = useState<ProductSummaryResponse[]>([])
  const [sameShopProducts, setSameShopProducts] = useState<ProductSummaryResponse[]>([])
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null)

  // Fetch product detail by slug
  useEffect(() => {
    if (!slug) return

    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await productApi.getProductBySlug(slug)
        if (data) {
          setProduct(data)
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0])
          } else {
            setSelectedVariant(null)
          }
          setActiveImageIndex(0)
          setQuantity(1)

          // Determine shop profile & load products from same shop
          const sId = data.shop?.id || 1
          const sProfile = SHOPS_DATABASE[sId] || SHOPS_DATABASE[1]
          setShopProfile(sProfile)

          try {
            const allRes = await productApi.getProducts({ size: 50 })
            if (allRes?.items) {
              const shopItems = allRes.items.filter(
                (item) => item.slug !== slug && (
                  (item.shopId && item.shopId === sId) ||
                  isProductFromShop(item.shopName, sProfile)
                )
              )
              setSameShopProducts(shopItems)
            }
          } catch (err) {
            console.error('Error fetching same shop products:', err)
          }

          // Load related products from same category
          try {
            const relatedRes = await productApi.getProducts({
              categoryId: data.category?.id,
              size: 6,
            })
            if (relatedRes?.items) {
              setRelatedProducts(relatedRes.items.filter((item) => item.slug !== slug))
            }
          } catch {
            // Ignore related products error
          }
        } else {
          throw new Error('Không tìm thấy')
        }
      } catch {
        // Check if fallback catalog has this slug or id
        if (FALLBACK_PRODUCT_CATALOG[slug]) {
          const fallbackData = FALLBACK_PRODUCT_CATALOG[slug]
          setProduct(fallbackData)
          if (fallbackData.variants && fallbackData.variants.length > 0) {
            setSelectedVariant(fallbackData.variants[0])
          }
          setActiveImageIndex(0)
          setQuantity(1)
        } else {
          setError('Sản phẩm này hiện không khả dụng hoặc đã bị gỡ khỏi sàn.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  // Aggregate all gallery images
  const galleryImages = useMemo(() => {
    if (!product) return []
    const imgs: string[] = []

    if (product.images && product.images.length > 0) {
      product.images
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .forEach((img) => {
          if (img.imageUrl && !imgs.includes(img.imageUrl)) {
            imgs.push(img.imageUrl)
          }
        })
    }

    if (product.primaryImageUrl && !imgs.includes(product.primaryImageUrl)) {
      imgs.unshift(product.primaryImageUrl)
    } else if (product.imageUrl && !imgs.includes(product.imageUrl)) {
      imgs.unshift(product.imageUrl)
    }

    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !imgs.includes(v.imageUrl)) {
          imgs.push(v.imageUrl)
        }
      })
    }

    // Fallback placeholder if no images
    if (imgs.length === 0) {
      imgs.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800')
    }

    return imgs
  }, [product])

  // Calculate current price and stock
  const currentPrice = selectedVariant ? selectedVariant.price : product?.price || 0
  const originalPrice = product?.originalPrice || (currentPrice > 0 ? currentPrice * 1.2 : 0)
  const currentStock = selectedVariant ? selectedVariant.stock : 99
  const discountPercent =
    originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

  // Handle variant selection
  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setQuantity(1)
    if (variant.imageUrl) {
      const idx = galleryImages.indexOf(variant.imageUrl)
      if (idx !== -1) {
        setActiveImageIndex(idx)
      }
    }
  }

  // Handle quantity adjustment
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (next > currentStock) return currentStock
      return next
    })
  }

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!product) return

    // Ensure variant is selected if variants exist
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setToastMessage({ type: 'error', text: 'Vui lòng chọn phân loại hàng trước khi thêm vào giỏ' })
      return
    }

    const sku = selectedVariant?.sku || `SKU-${product.id}`
    setIsAddingToCart(true)

    try {
      await cartApi.addToCart(sku, quantity)
      setToastMessage({
        type: 'success',
        text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`,
      })
      // Dispatch custom event to notify MainHeader to refresh cart count
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err: any) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) {
        // Save to guest cart in localStorage
        try {
          const guestItem = {
            id: Date.now(),
            variantId: selectedVariant?.id || product.id,
            sku,
            productName: product.name,
            variantName: selectedVariant?.variantName || 'Mặc định',
            price: selectedVariant?.price || product.price,
            originalPrice: product.originalPrice,
            quantity,
            stock: selectedVariant?.stock || 50,
            imageUrl: selectedVariant?.imageUrl || product.primaryImageUrl,
            shopId: product.shop?.id || 1,
            shopName: product.shop?.name || product.shopName || 'Shop Official Vietnam',
            shopLogo: product.shop?.logoUrl,
          }
          const existing = JSON.parse(localStorage.getItem('zora_guest_cart') || '[]')
          const foundIdx = existing.findIndex((it: any) => it.sku === sku)
          if (foundIdx > -1) {
            existing[foundIdx].quantity += quantity
          } else {
            existing.push(guestItem)
          }
          localStorage.setItem('zora_guest_cart', JSON.stringify(existing))

          setToastMessage({
            type: 'success',
            text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`,
          })
          window.dispatchEvent(new Event('cartUpdated'))
        } catch {
          setToastMessage({
            type: 'error',
            text: 'Không thể thêm vào giỏ hàng',
          })
        }
      } else {
        setToastMessage({
          type: 'error',
          text: err?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.',
        })
      }
    } finally {
      setIsAddingToCart(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Buy Now
  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Handle toggle like
  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased relative selection:bg-orange-100 selection:text-[#ee4d2d]">

      {/* Header */}
      <div className="relative z-50">
        <MainHeader />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#ee4d2d] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-[#ee4d2d] transition-colors">
            Zora
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {product?.category ? (
            <>
              <Link
                to={`/category/${product.category.slug || product.category.id}`}
                className="hover:text-[#ee4d2d] transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          ) : (
            <>
              <span>Danh mục sản phẩm</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
          <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
            {product?.name || 'Chi tiết sản phẩm'}
          </span>
        </nav>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-md p-6 shadow-xs border border-slate-200/80 animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="w-full aspect-square bg-slate-200 rounded-xs" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-16 h-16 bg-slate-200 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-16 bg-slate-200 rounded-xl w-full" />
              <div className="h-20 bg-slate-200 rounded-xl w-full" />
              <div className="h-12 bg-slate-200 rounded-xl w-1/2" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && (error || !product) && (
          <div className="bg-white rounded-md p-12 text-center space-y-4 shadow-xs border border-slate-200/80">
            <div className="w-16 h-16 bg-orange-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {error || 'Sản phẩm này không tồn tại hoặc đã bị gỡ khỏi sàn.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ee4d2d] text-white rounded-xl text-sm font-medium hover:bg-[#d73211] transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về trang chủ Zora</span>
            </Link>
          </div>
        )}

        {/* Product Showcase Section */}
        {!isLoading && product && (
          <div className="bg-white rounded-md shadow-xs border border-slate-200/80 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* ================= 1. LEFT COLUMN: IMAGE GALLERY & SOCIAL ================= */}
              <div className="lg:col-span-5 space-y-4">
                {/* Main Large Image Preview */}
                <div className="relative w-full aspect-square bg-slate-50 rounded-md overflow-hidden border border-slate-200/70 group">
                  <img
                    src={galleryImages[activeImageIndex] || product.primaryImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    <span className="bg-[#d0011b] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                      Zora Mall
                    </span>
                    <span className="bg-[#ee4d2d] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Freeship Xtra
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-[#ee4d2d] text-xs font-black px-2.5 py-1 rounded-bl-xl shadow-xs">
                      -{discountPercent}%
                    </div>
                  )}
                </div>

                {/* Thumbnails Row */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        onMouseEnter={() => setActiveImageIndex(idx)}
                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#ee4d2d] shadow-xs scale-95'
                            : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Social Share & Favorite */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-700">Chia sẻ:</span>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 hover:text-[#ee4d2d] transition-colors cursor-pointer"
                      title="Sao chép liên kết"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#ee4d2d]" />
                          <span className="text-[#ee4d2d]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép link</span>
                        </>
                      )}
                    </button>
                    <button className="hover:text-blue-600 transition-colors cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleToggleLike}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-[#ee4d2d] transition-colors group"
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        isLiked
                          ? 'fill-[#ee4d2d] text-[#ee4d2d] scale-110'
                          : 'text-slate-400 group-hover:text-[#ee4d2d]'
                      }`}
                    />
                    <span>Đã thích ({likeCount})</span>
                  </button>
                </div>
              </div>

              {/* ================= 2. RIGHT COLUMN: PRODUCT INFO & PURCHASE ================= */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Title & Badge */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      <span className="inline-block bg-[#ee4d2d] text-white text-xs font-semibold px-2 py-0.5 rounded mr-2 align-middle uppercase tracking-wide">
                        Yêu Thích+
                      </span>
                      {product.name}
                    </h1>
                  </div>

                  {/* Rating & Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[#ee4d2d]">
                      <span className="font-bold underline text-base">
                        {product.ratingAvg ? product.ratingAvg.toFixed(1) : '4.9'}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-[#ee4d2d] text-[#ee4d2d]" />
                        ))}
                      </div>
                    </div>

                    <div className="h-4 w-px bg-slate-200" />

                    <div>
                      <span className="font-bold text-slate-800 text-base">
                        {product.ratingCount || 680}
                      </span>{' '}
                      Đánh Giá
                    </div>

                    <div className="h-4 w-px bg-slate-200" />

                    <div>
                      <span className="font-bold text-slate-800 text-base">
                        {product.soldCount ? `${(product.soldCount / 1000).toFixed(1)}k` : '1.2k'}
                      </span>{' '}
                      Đã Bán
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-gradient-to-r from-orange-50/70 via-rose-50/50 to-amber-50/60 p-4 sm:p-5 rounded-2xl border border-orange-100 flex flex-col gap-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#ee4d2d]">
                        {formatCurrency(currentPrice)}
                      </span>

                      {originalPrice > currentPrice && (
                        <span className="text-sm sm:text-base text-slate-400 line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                      )}

                      {discountPercent > 0 && (
                        <span className="bg-[#ee4d2d] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                          GIẢM {discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-orange-700 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Gì Cũng Rẻ - Cam kết giá tốt nhất trên sàn thương mại Zora</span>
                    </div>
                  </div>

                  {/* Vouchers & Perks */}
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                      <span className="w-24 font-medium text-slate-500 shrink-0">Mã Giảm Giá:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Giảm 50k', 'Giảm 10%', 'Freeship 0đ'].map((v, i) => (
                          <span
                            key={i}
                            className="bg-orange-50 text-[#ee4d2d] border border-orange-200 px-2 py-0.5 rounded font-medium text-[11px]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-24 font-medium text-slate-500 shrink-0 pt-0.5">Vận Chuyển:</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Truck className="w-4 h-4 text-[#ee4d2d]" />
                          <span>Miễn phí vận chuyển cho đơn hàng từ 0đ</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">Nhận hàng dự kiến trong 2 - 3 ngày làm việc</p>
                      </div>
                    </div>
                  </div>

                  {/* Variant Selection */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Phân loại hàng:</span>
                        {selectedVariant && (
                          <span className="text-xs text-slate-600">
                            Đang chọn: <strong className="text-slate-900">{selectedVariant.variantName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                          const isSelected = selectedVariant?.id === v.id
                          return (
                            <button
                              key={v.id}
                              onClick={() => handleSelectVariant(v)}
                              className={`relative px-3.5 py-2 rounded-md text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'border-[#ee4d2d] bg-orange-50/60 text-[#ee4d2d] shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              {v.imageUrl && (
                                <img src={v.imageUrl} alt={v.variantName} className="w-5 h-5 rounded object-cover" />
                              )}
                              <span>{v.variantName}</span>
                              {isSelected && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#ee4d2d] text-white rounded-tl-md flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
                    <span className="w-24 text-xs font-medium text-slate-500 shrink-0">Số lượng:</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            if (val >= 1 && val <= currentStock) setQuantity(val)
                          }}
                          className="w-12 h-9 text-center text-sm font-semibold border-x border-slate-200 focus:outline-none text-slate-800"
                        />
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= currentStock}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs text-slate-400">
                        {currentStock > 0 ? `${currentStock} sản phẩm có sẵn` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call-To-Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || currentStock <= 0}
                    className="w-full sm:w-1/2 h-12 rounded-md bg-orange-50/80 hover:bg-orange-100 border border-[#ee4d2d] text-[#ee4d2d] font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    <span>Thêm Vào Giỏ Hàng</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
                    className="w-full sm:w-1/2 h-12 rounded-md bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Mua Ngay</span>
                  </button>
                </div>

                {/* Guarantees */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
                  <div className="flex items-center justify-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-[#ee4d2d]" />
                    <span>7 ngày trả hàng miễn phí</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ee4d2d]" />
                    <span>Hàng chính hãng 100%</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#ee4d2d]" />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ================= 3. SHOP PROFILE MINI-CARD ================= */}
        {!isLoading && product && (
          <div className="bg-white rounded-md p-4 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link
                to={`/shop/${product.shop?.id || shopProfile?.id || 1}`}
                className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200 p-0.5 shrink-0 group hover:opacity-90 transition-opacity"
              >
                <img
                  src={shopProfile?.logoUrl || product.shop?.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120'}
                  alt={product.shop?.name || product.shopName || 'Shop'}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              </Link>

              <div className="space-y-1">
                <Link
                  to={`/shop/${product.shop?.id || shopProfile?.id || 1}`}
                  className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 hover:text-[#ee4d2d] transition-colors"
                >
                  <span>{product.shop?.name || product.shopName || shopProfile?.name || 'Shop Official Vietnam'}</span>
                  {(shopProfile?.isMall ?? true) && (
                    <span className="bg-[#d0011b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      MALL
                    </span>
                  )}
                </Link>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ee4d2d] inline-block" />
                  <span>Online {shopProfile?.responseTime ? 'vài phút trước' : '5 phút trước'}</span>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setToastMessage({
                        type: 'success',
                        text: `Đang kết nối chat với cửa hàng ${product.shop?.name || shopProfile?.name || 'Shop'}...`,
                      })
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-[#ee4d2d] border border-orange-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat Ngay</span>
                  </button>
                  <Link
                    to={`/shop/${product.shop?.id || shopProfile?.id || 1}`}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                  >
                    <Store className="w-3 h-3" />
                    <span>Xem Shop</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Shop Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto text-xs text-slate-500 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
              <div>
                <div className="text-slate-400">Đánh Giá:</div>
                <div className="text-[#ee4d2d] font-bold text-sm">
                  {shopProfile?.rating?.toFixed(1) || '4.9'} / 5.0
                </div>
              </div>
              <div>
                <div className="text-slate-400">Sản Phẩm:</div>
                <div className="text-slate-800 font-bold text-sm">
                  {(sameShopProducts.length > 0 ? sameShopProducts.length + 1 : shopProfile?.totalProducts) || 1}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Tỉ Lệ Phản Hồi:</div>
                <div className="text-slate-800 font-bold text-sm">
                  {shopProfile?.responseRate || '99%'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Tham Gia:</div>
                <div className="text-slate-800 font-bold text-sm">
                  {shopProfile?.joinedTime || '1 năm trước'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. SPECIFICATIONS & DESCRIPTION ================= */}
        {!isLoading && product && (
          <div className="bg-white rounded-md p-6 shadow-xs border border-slate-200/80 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
                Chi Tiết Sản Phẩm
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                <div className="flex">
                  <span className="w-32 text-slate-400 shrink-0">Danh Mục:</span>
                  <span className="text-slate-800 font-medium">
                    {product.category?.name || 'Thiết bị thông minh & Điện tử'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-400 shrink-0">Thương hiệu:</span>
                  <span className="text-slate-800 font-medium">Zora Official</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-400 shrink-0">Xuất xứ:</span>
                  <span className="text-slate-800 font-medium">Chính Hãng Phân Phối</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-400 shrink-0">Kho hàng:</span>
                  <span className="text-slate-800 font-medium">{currentStock}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-400 shrink-0">Gửi từ:</span>
                  <span className="text-slate-800 font-medium">TP. Hồ Chí Minh</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
                Mô Tả Sản Phẩm
              </h2>

              <div
                className={`mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 relative overflow-hidden transition-all duration-300 ${
                  isDescExpanded ? 'max-h-none' : 'max-h-60'
                }`}
              >
                {product.description ? (
                  product.description.split('\n').map((para, idx) => (
                    <p key={idx} className="whitespace-pre-wrap">
                      {para}
                    </p>
                  ))
                ) : (
                  <p>
                    Sản phẩm cao cấp được cung cấp chính hãng tại hệ thống Zora Mall. Đảm bảo 100% chất lượng và bảo hành toàn quốc.
                  </p>
                )}

                {!isDescExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-semibold text-[#ee4d2d] hover:text-[#d73211] transition-colors cursor-pointer"
                >
                  {isDescExpanded ? 'Thu gọn nội dung' : 'Xem thêm thông số chi tiết ▼'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. CUSTOMER REVIEWS & RATINGS ================= */}
        {!isLoading && product && (
          <div className="bg-white rounded-md p-6 shadow-xs border border-slate-200/80 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              Đánh Giá Sản Phẩm
            </h2>

            {/* Score Overview */}
            <div className="bg-orange-50/40 border border-orange-100 p-5 rounded-md flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left shrink-0">
                <div className="text-3xl font-extrabold text-[#ee4d2d]">
                  {product.ratingAvg ? product.ratingAvg.toFixed(1) : '4.9'}{' '}
                  <span className="text-base font-normal text-slate-400">trên 5</span>
                </div>
                <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-[#ee4d2d] text-[#ee4d2d]" />
                  ))}
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'all', label: 'Tất Cả (680)' },
                  { id: '5star', label: '5 Sao (620)' },
                  { id: '4star', label: '4 Sao (45)' },
                  { id: 'with_image', label: 'Có Bình luận & Hình ảnh (210)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReviewFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                      reviewFilter === tab.id
                        ? 'bg-[#ee4d2d] text-white border-[#ee4d2d] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Reviews List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {[
                {
                  user: 'n*****g',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                  stars: 5,
                  date: '2026-09-02 14:32',
                  variant: selectedVariant?.variantName || 'Mặc định',
                  comment:
                    'Hàng đóng gói cẩn thận, giao nhanh chỉ sau 1 ngày đặt. Sản phẩm nguyên seal chính hãng, dùng rất mượt mà và sang trọng!',
                  likes: 12,
                },
                {
                  user: 't*****a',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                  stars: 5,
                  date: '2026-08-28 09:15',
                  variant: selectedVariant?.variantName || 'Mặc định',
                  comment:
                    'Giá tốt hơn các sàn khác mà chất lượng tuyệt vời, hỗ trợ nhiệt tình. Sẽ ủng hộ shop tiếp những đơn sau!',
                  likes: 8,
                },
              ].map((rev, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex gap-3 text-xs">
                  <img src={rev.avatar} alt={rev.user} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{rev.user}</span>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#ee4d2d] text-[#ee4d2d]" />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-400">Phân loại hàng: {rev.variant}</div>
                    <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                      <ThumbsUp className="w-3 h-3 cursor-pointer hover:text-[#ee4d2d]" />
                      <span>{rev.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 5.5 MORE PRODUCTS FROM SAME SHOP ================= */}
        {sameShopProducts.length > 0 && (
          <div className="bg-white rounded-md p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#ee4d2d]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                  CÁC SẢN PHẨM KHÁC TỪ SHOP
                </h2>
              </div>
              <Link
                to={`/shop/${product?.shop?.id || shopProfile?.id || 1}`}
                className="text-xs font-semibold text-[#ee4d2d] hover:text-[#d73211] flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả ({sameShopProducts.length + 1} sản phẩm)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {sameShopProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug || item.id}`}
                  className="group bg-white rounded-md overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-md shadow-xs">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    )}
                    <img
                      src={item.primaryImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed group-hover:text-[#ee4d2d] transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-[#ee4d2d]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.soldCount ? (
                        <span className="text-[10px] text-slate-400">Đã bán {item.soldCount}</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================= 6. RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
              Sản Phẩm Tương Tự
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug || item.id}`}
                  className="group bg-white rounded-md overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                    <img
                      src={item.primaryImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed group-hover:text-[#ee4d2d] transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-[#ee4d2d]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.soldCount ? (
                        <span className="text-[10px] text-slate-400">Đã bán {item.soldCount}</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="relative z-10 pt-8">
        <AuthFooter />
      </div>
    </div>
  )
}
