import { ProductSummaryResponse, ProductResponse, CategoryResponse } from '../types/product';
import { CartResponse } from '../types/cart';
import { HistoryOrderResponse, DetailOrderResponse, StatusType } from '../types/order';
import { PaymentMethod } from '../types/payment';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_PRODUCT_DETAIL_1, MOCK_CART, MOCK_BUYER_ORDERS, MOCK_SELLER_ORDERS } from './mockData';

const CART_STORAGE_KEY = 'zorashop_cart_v2';
const ORDERS_STORAGE_KEY = 'zorashop_orders_v2';
const WISHLIST_STORAGE_KEY = 'zorashop_wishlist_v2';

// ── Initial Mock Details Generator ────────────────────────────────
function generateDetailFromSummary(p: ProductSummaryResponse): ProductResponse {
  if (p.id === 1) return MOCK_PRODUCT_DETAIL_1;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: `### Thông tin chi tiết: ${p.name}\n\n- **Thương hiệu:** ${p.shopName}\n- **Xuất xứ:** Chính hãng phân phối độc quyền tại Việt Nam\n- **Bảo hành:** 12 tháng 1 đổi 1 trong 30 ngày đầu\n- **Tình trạng:** Hàng mới nguyên seal 100%\n- **Giao hàng:** Giao hỏa tốc 2 giờ nội thành, toàn quốc 2-3 ngày.`,
    price: p.price,
    originalPrice: p.originalPrice,
    soldCount: p.soldCount,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    viewCount: 12500 + p.id * 123,
    status: 'ACTIVE',
    createdDate: '2026-08-20T10:00:00',
    shop: {
      id: 100 + p.id,
      name: p.shopName,
      logoUrl: `https://picsum.photos/seed/shop-${p.id}/100/100`,
      rating: p.ratingAvg,
    },
    category: {
      id: 1,
      name: 'Thiết bị & Đời sống',
    },
    images: [
      { id: p.id * 10 + 1, imageUrl: p.primaryImageUrl, isPrimary: true },
      { id: p.id * 10 + 2, imageUrl: `https://picsum.photos/seed/view2-${p.id}/800/800`, isPrimary: false },
      { id: p.id * 10 + 3, imageUrl: `https://picsum.photos/seed/view3-${p.id}/800/800`, isPrimary: false },
    ],
    variants: [
      {
        id: p.id * 100 + 1,
        variantName: 'Phiên bản Tiêu Chuẩn',
        sku: `ZR-${p.id}-STD`,
        price: p.price,
        stock: 35,
        imageUrl: p.primaryImageUrl,
      },
      {
        id: p.id * 100 + 2,
        variantName: 'Phiên bản Cao Cấp (Pro)',
        sku: `ZR-${p.id}-PRO`,
        price: Math.round(p.price * 1.15),
        stock: 15,
        imageUrl: `https://picsum.photos/seed/view2-${p.id}/800/800`,
      },
    ],
  };
}

class MockStore {
  private categories: CategoryResponse[] = MOCK_CATEGORIES;
  private products: ProductSummaryResponse[] = MOCK_PRODUCTS;
  private productDetails: Map<number, ProductResponse> = new Map();

  constructor() {
    this.productDetails.set(1, MOCK_PRODUCT_DETAIL_1);
    this.products.forEach((p) => {
      if (!this.productDetails.has(p.id)) {
        this.productDetails.set(p.id, generateDetailFromSummary(p));
      }
    });
  }

  // ── Categories & Products ──────────────────────────────────────────
  getCategories(): CategoryResponse[] {
    return this.categories;
  }

  getProducts(filter?: { keyword?: string; categoryId?: number; sort?: string }): ProductSummaryResponse[] {
    let list = [...this.products];
    if (filter?.keyword) {
      const q = filter.keyword.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q));
    }
    if (filter?.categoryId) {
      // Simulate category match
      const cat = this.categories.find((c) => c.id === filter.categoryId);
      if (cat) {
        list = list.filter((_, idx) => (idx + 1) % this.categories.length === (filter.categoryId! % this.categories.length) || true);
      }
    }
    if (filter?.sort) {
      switch (filter.sort) {
        case 'sold':
          list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
          break;
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'latest':
          list.sort((a, b) => b.id - a.id);
          break;
        default:
          list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
      }
    }
    return list;
  }

  getProductById(id: number): ProductResponse | undefined {
    let p = this.productDetails.get(id);
    if (!p) {
      const summary = this.products.find((item) => item.id === id);
      if (summary) {
        p = generateDetailFromSummary(summary);
        this.productDetails.set(id, p);
      }
    }
    return p;
  }

  // ── Wishlist ───────────────────────────────────────────────────────
  getWishlist(): number[] {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [2, 4];
    } catch {
      return [2, 4];
    }
  }

  toggleWishlist(productId: number): boolean {
    const list = this.getWishlist();
    const idx = list.indexOf(productId);
    let isAdded = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      isAdded = true;
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    return isAdded;
  }

  // ── Cart ───────────────────────────────────────────────────────────
  getCart(): CartResponse {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    this.saveCart(MOCK_CART);
    return MOCK_CART;
  }

  private saveCart(cart: CartResponse): void {
    let totalAmount = 0;
    let totalItem = 0;
    cart.shopGroups.forEach((sg) => {
      sg.cartItems.forEach((ci) => {
        totalAmount += ci.price * ci.quantity;
        totalItem += ci.quantity;
      });
    });
    cart.totalAmount = totalAmount;
    cart.totalItem = totalItem;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  addToCart(variantId: number, quantity = 1, product?: ProductResponse): CartResponse {
    const cart = this.getCart();
    let found = false;

    // Search existing
    for (const group of cart.shopGroups) {
      for (const item of group.cartItems) {
        if (item.variantId === variantId) {
          item.quantity += quantity;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      // Resolve variant info
      let variantName = 'Bản Tiêu Chuẩn';
      let price = 1490000;
      let sku = `ZR-${variantId}`;
      let productName = 'Sản phẩm ZoraEcommerce';
      let imageUrl = 'https://picsum.photos/seed/item/300/300';
      let shopId = 101;
      let shopName = 'Apple Flagship Store';

      if (product) {
        const v = product.variants.find((item) => item.id === variantId);
        if (v) {
          variantName = v.variantName;
          price = v.price;
          sku = v.sku;
          imageUrl = v.imageUrl || product.images[0]?.imageUrl || imageUrl;
        }
        productName = product.name;
        shopId = product.shop.id;
        shopName = product.shop.name;
      }

      let group = cart.shopGroups.find((g) => g.shopId === shopId);
      if (!group) {
        group = {
          shopId,
          shopName,
          shopLogo: `https://picsum.photos/seed/shop-${shopId}/100/100`,
          cartItems: [],
        };
        cart.shopGroups.push(group);
      }

      group.cartItems.push({
        id: Date.now(),
        variantId,
        sku,
        productName,
        variantName,
        price,
        originalPrice: Math.round(price * 1.2),
        quantity,
        stock: 50,
        imageUrl,
      });
    }

    this.saveCart(cart);
    return cart;
  }

  updateCartItemQuantity(cartItemId: number, quantity: number): CartResponse {
    const cart = this.getCart();
    cart.shopGroups.forEach((g) => {
      if (quantity <= 0) {
        g.cartItems = g.cartItems.filter((item) => item.id !== cartItemId);
      } else {
        const item = g.cartItems.find((ci) => ci.id === cartItemId);
        if (item) item.quantity = quantity;
      }
    });
    cart.shopGroups = cart.shopGroups.filter((g) => g.cartItems.length > 0);
    this.saveCart(cart);
    return cart;
  }

  removeCartItem(cartItemId: number): CartResponse {
    return this.updateCartItemQuantity(cartItemId, 0);
  }

  clearCart(): CartResponse {
    const emptyCart: CartResponse = {
      cartId: 1,
      totalAmount: 0,
      totalItem: 0,
      shopGroups: [],
    };
    this.saveCart(emptyCart);
    return emptyCart;
  }

  // ── Orders (Synchronized between Buyer & Seller) ───────────────────
  getOrders(): HistoryOrderResponse[] {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    const initial: HistoryOrderResponse[] = [
      ...MOCK_BUYER_ORDERS,
      ...MOCK_SELLER_ORDERS.map((so) => ({
        orderId: so.orderId,
        orderNumber: so.orderNumber,
        shopId: 101,
        shopName: 'Apple Flagship Store',
        shopAvatarUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=80',
        totalAmount: so.totalAmount,
        subTotal: so.totalAmount,
        status: so.status as StatusType,
        createDate: so.createdDate,
        items: [
          {
            orderItemId: so.orderId * 10,
            productId: 1,
            productName: 'Apple iPhone 16 Pro Max 256GB Titan Tự Nhiên',
            productPictureUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
            price: so.totalAmount,
            quantity: so.totalItems,
            subTotal: so.totalAmount,
          },
        ],
      })),
    ];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  private saveOrders(orders: HistoryOrderResponse[]): void {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  getBuyerOrders(status?: StatusType): HistoryOrderResponse[] {
    const all = this.getOrders();
    if (!status) return all;
    return all.filter((o) => o.status === status);
  }

  getOrderDetail(orderId: number): DetailOrderResponse | undefined {
    const order = this.getOrders().find((o) => o.orderId === orderId);
    if (!order) return undefined;
    return {
      orderId: order.orderId,
      shopId: order.shopId,
      orderNumber: order.orderNumber,
      method: 'COD',
      shopName: order.shopName,
      logoUrl: order.shopAvatarUrl,
      nameReceive: 'Trần Văn Thái',
      phoneReceive: '0912345678',
      address: 'Tòa S2.05 Vinhome Smart City, Tây Mỗ, Nam Từ Liêm, Hà Nội',
      subtotal: order.subTotal,
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: order.totalAmount,
      statusType: order.status,
      createdDate: order.createDate,
      orderItemResponses: order.items.map((item) => ({
        id: item.orderItemId,
        variantId: 11,
        productName: item.productName,
        productId: item.productId,
        productPictureUrl: item.productPictureUrl,
        variantName: item.variantName || 'Mặc định',
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subTotal,
      })),
    };
  }

  createOrder(payload: {
    items: { variantId: number; quantity: number; price: number; productName: string; imageUrl?: string; shopId: number; shopName: string }[];
    paymentMethod: PaymentMethod;
    shippingAddress: string;
    recipientName: string;
    recipientPhone: string;
    shippingFee?: number;
    discount?: number;
  }): HistoryOrderResponse {
    const orders = this.getOrders();
    const orderId = Date.now();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const firstItem = payload.items[0];
    const subTotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = payload.shippingFee ?? 30000;
    const discount = payload.discount ?? 0;
    const totalAmount = Math.max(0, subTotal + shipping - discount);

    const newOrder: HistoryOrderResponse = {
      orderId,
      orderNumber,
      shopId: firstItem?.shopId || 101,
      shopName: firstItem?.shopName || 'ZoraEcommerce Official Store',
      shopAvatarUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=80',
      totalAmount,
      subTotal,
      status: 'PENDING',
      createDate: new Date().toISOString(),
      items: payload.items.map((item, idx) => ({
        orderItemId: orderId + idx,
        productId: item.variantId,
        productName: item.productName,
        productPictureUrl: item.imageUrl || 'https://picsum.photos/seed/order-item/300/300',
        variantName: 'Bản Chuẩn',
        price: item.price,
        quantity: item.quantity,
        subTotal: item.price * item.quantity,
      })),
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  updateOrderStatus(orderId: number, nextStatus: StatusType): boolean {
    const orders = this.getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (target) {
      target.status = nextStatus;
      this.saveOrders(orders);
      return true;
    }
    return false;
  }
}

export const mockStore = new MockStore();
