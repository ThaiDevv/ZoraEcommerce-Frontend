# ZoraShop — UI Specification cho Frontend

> Tài liệu này mô tả **chi tiết từng trang, từng component, từng field dữ liệu** cần render trên frontend. Frontend sử dụng **React + TypeScript + Vite + Tailwind CSS v4**. Backend là **Spring Boot 3** với JWT authentication.

---

## 1. KIẾN TRÚC TỔNG QUAN

### 1.1 Tech Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios + JWT interceptor
- **State:** React Context (Auth, Cart) + local useState
- **Icons:** Lucide React (đã có trong dự án)
- **Fonts:** Plus Jakarta Sans (headings) + Outfit (body)

### 1.2 API Base URL
```
/api/v1/...
```
Proxy qua Vite config → `http://localhost:8080`

### 1.3 API Response Wrapper — MỌI response đều bọc trong:
```typescript
interface ApiResponse<T> {
  message: string;
  success: boolean;
  body: T;
  timestamp: string; // ISO datetime
}
```

### 1.4 Pagination Wrapper — dùng cho danh sách có phân trang:
```typescript
interface PageResponse<T> {
  items: T[];
  pageNo: number;    // bắt đầu từ 1
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

### 1.5 Roles
```typescript
type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
```
- **BUYER:** Mua hàng, xem đơn, quản lý địa chỉ
- **SELLER:** Tất cả quyền BUYER + quản lý shop, sản phẩm, đơn hàng (phía người bán)
- **ADMIN:** Quản lý user, danh mục

### 1.6 Route Map
```
/                         → HomePage (public)
/login                    → LoginPage (guest only)
/register                 → RegisterPage (guest only)
/products/:idOrSlug       → ProductDetailPage (public)
/cart                     → CartPage (auth required)
/checkout                 → CheckoutPage (auth required)
/orders                   → OrdersPage (auth — buyer)
/orders/:orderId          → OrderDetailPage (auth — buyer)
/profile                  → ProfilePage (auth)
/profile/addresses        → AddressPage (auth)
/profile/password         → ChangePasswordPage (auth)
/seller/dashboard         → SellerDashboardPage (SELLER)
/seller/products          → SellerProductsPage (SELLER)
/seller/products/new      → SellerProductFormPage (SELLER)
/seller/products/:slug/edit → SellerProductFormPage (SELLER)
/seller/orders            → SellerOrdersPage (SELLER)
/seller/orders/:orderId   → SellerOrderDetailPage (SELLER)
/seller/inventory         → SellerInventoryPage (SELLER)
/seller/shop              → SellerShopSettingsPage (SELLER)
/admin/users              → AdminUsersPage (ADMIN)
/admin/categories         → AdminCategoriesPage (ADMIN)
```

---

## 2. LAYOUTS

### 2.1 MainLayout (Buyer)
Sử dụng cho tất cả trang public + buyer.

```
┌──────────────────────────────────────────┐
│  Top Micro Bar (dark, xs)                │
│  ┌─ Logo ─ Search Bar ─ Actions ──────┐  │
│  │         Main Header               │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│                                          │
│           Page Content                   │
│                                          │
├──────────────────────────────────────────┤
│  USP Bar → Footer Links → Copyright     │
└──────────────────────────────────────────┘
```

#### Header Components:
- **Top Micro Bar** (ẩn trên mobile):
  - Trái: "Kênh Người Bán" (link `/seller/orders`), "Tải ứng dụng"
  - Phải: "Thông báo", nếu logged in → `{user.fullName}` + Logout button, nếu chưa → "Đăng nhập | Đăng ký"

- **Main Header**:
  - Logo ZoraShop (link → `/`)
  - Search bar: input text → submit gửi `GET /?keyword=...`
  - Icon "Đơn Mua" → `/orders`
  - Icon "Giỏ Hàng" → `/cart` + badge số lượng `totalItemCount`

#### Footer Components:
- **USP Bar** (4 cột trên desktop, 2 cột mobile):
  - Miễn phí vận chuyển (Truck icon)
  - 100% Chính hãng (ShieldCheck icon)
  - Đổi trả 15 ngày (RotateCcw icon)
  - Hỗ trợ 24/7 (Headphones icon)
- **Footer Links** (4 cột): Logo+mô tả, CSKH links, Về ZoraShop links, Phương thức thanh toán (COD, MoMo, VNPAY, Visa)
- **Copyright**: © 2026 ZoraShop

### 2.2 SellerLayout
Dùng cho tất cả trang `/seller/*`.

```
┌──────────────────────────────────────────┐
│  Seller Header (brand color)             │
├────────┬─────────────────────────────────┤
│        │                                 │
│ Sidebar│       Page Content              │
│ (nav)  │                                 │
│        │                                 │
└────────┴─────────────────────────────────┘
```

#### Seller Sidebar Navigation:
- Dashboard (icon: LayoutDashboard) → `/seller/dashboard`
- Sản phẩm (icon: Package) → `/seller/products`
- Đơn hàng (icon: ShoppingCart) → `/seller/orders`
- Kho hàng (icon: Warehouse) → `/seller/inventory`
- Cài đặt Shop (icon: Settings) → `/seller/shop`
- ← Quay lại Mua Sắm (icon: ArrowLeft) → `/`

### 2.3 AdminLayout
Tương tự SellerLayout nhưng sidebar khác:
- Quản lý User → `/admin/users`
- Quản lý Danh Mục → `/admin/categories`

---

## 3. TRANG BUYER — CHI TIẾT

---

### 3.1 HomePage (`/`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| Lấy danh mục | GET | `/api/v1/categories` | `ApiResponse<List<CategoryResponse>>` |
| Lấy sản phẩm | GET | `/api/v1/products?keyword=...&categoryId=...&sortBy=...&sortDir=...&page=0&size=20` | `ApiResponse<PageResponse<ProductSummaryResponse>>` |

**Data types cần render:**
```typescript
interface CategoryResponse {
  id: number;
  name: string;
  imageUrl: string;
  slug: string;
}

interface ProductSummaryResponse {
  id: number;
  name: string;
  slug: string;
  price: number;          // BigDecimal → number
  originalPrice: number;  // nullable
  primaryImageUrl: string;
  ratingAvg: number;      // nullable, default 5.0
  ratingCount: number;
  soldCount: number;
  shopName: string;
}
```

**Sections từ trên xuống:**

#### Section 1: Hero Banner
- Ảnh banner full-width với overlay gradient
- Headline: "Khám Phá Hàng Triệu Ưu Đãi Trên ZoraShop"
- Subtext: cam kết chính hãng, freeship, hoàn tiền
- CTA button "Mua sắm ngay"
- Flash Sale card (góc phải desktop): countdown timer `HH:MM:SS`, badge "GIẢM 50%"

#### Section 2: Category Strip
- Nằm trong 1 card nổi, overlap hero `-mt-5`
- Nút "Tất cả" (active mặc định)
- Danh sách horizontal scroll các category pills
- Mỗi pill: icon/image + tên danh mục
- Click pill → filter sản phẩm theo `categoryId`
- Nếu đang filter → hiện link "Xem tất cả"

#### Section 3: Sort Bar
- Sort options dạng pill buttons: Phổ biến, Mới nhất, Bán chạy, Giá thấp, Giá cao
- Map sang `sortBy`: `SOLD_COUNT`, `CREATED_DATE`, `PRICE` và `sortDir`: `ASC`/`DESC`
- Hiển thị "Tìm thấy {n} sản phẩm"

#### Section 4: Product Grid
- Grid: `2 cols mobile / 3 cols tablet / 4 cols desktop / 5 cols large`
- Mỗi ô là **ProductCard** component
- Loading state: skeleton shimmer cards (giống hình dạng card thật)
- Empty state: icon + "Không tìm thấy sản phẩm" + nút "Xem tất cả"
- **Pagination** (nếu `totalPages > 1`): nút Previous/Next + page numbers

**ProductCard component:**
- Ảnh sản phẩm (aspect 1:1, lazy load, hover scale 1.07)
- Badge giảm giá: `-{discount}%` (khi `originalPrice > price`)
- Badge HOT: khi `soldCount > 100`
- Quick-add button: hiện khi hover, call `POST /api/v1/cart` (addToCart)
- Tên shop (11px, muted)
- Tên sản phẩm (2 dòng max, line-clamp-2)
- Giá hiện tại (brand color, bold) + giá gốc (gạch ngang)
- Rating star + `{ratingAvg}` + "Đã bán {soldCount}"
- Click card → navigate `/products/{id}`

---

### 3.2 ProductDetailPage (`/products/:id`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| Chi tiết SP | GET | `/api/v1/products/{id}` | `ApiResponse<ProductResponse>` |
| Thêm giỏ | POST | `/api/v1/cart` | body: `{ productId, variantId, quantity }` |

**Data type:**
```typescript
interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;   // rich text / markdown
  price: number;
  originalPrice: number;
  soldCount: number;
  ratingAvg: number;
  ratingCount: number;
  viewCount: number;
  status: string;         // ACTIVE, INACTIVE, OUT_OF_STOCK
  createdDate: string;
  shop: ShopSummaryResponse;
  category: CategorySummaryResponse;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
}

interface ShopSummaryResponse {
  id: number;
  name: string;
  logoUrl: string;
}

interface CategorySummaryResponse {
  id: number;
  name: string;
  slug: string;
}

interface ProductImageResponse {
  id: number;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductVariantResponse {
  id: number;
  variantName: string;   // "Đỏ - Size L", "256GB"...
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;      // nullable
}
```

**Layout: Split 2 cột trên desktop (6/6 hoặc 5/7)**

#### Cột trái: Image Gallery
- Ảnh chính lớn (aspect 1:1, rounded)
- Thumbnails nhỏ bên dưới (4-5 cái, horizontal scroll)
- Ảnh sắp xếp theo `sortOrder`, `isPrimary=true` là ảnh đầu tiên
- Click thumbnail → đổi ảnh chính
- Ảnh có thể zoom hover hoặc lightbox

#### Cột phải: Product Info
- **Breadcrumb**: Trang chủ / {category.name} / {product.name}
- **Tên sản phẩm**: font display, text-2xl, font-bold
- **Rating row**: ★ {ratingAvg} ({ratingCount} đánh giá) · Đã bán {soldCount} · {viewCount} lượt xem
- **Price block**:
  - Nếu có `originalPrice > price`: hiện giá gốc gạch ngang + phần trăm giảm
  - Giá bán: text-3xl, brand color, font-bold
- **Variant selector**:
  - Nếu `variants.length > 0`: hiển thị nhóm buttons chọn variant
  - Mỗi variant button: `{variantName}` + `{formatVND(variant.price)}`
  - Nếu variant có `imageUrl` → đổi ảnh chính khi chọn
  - Variant hết hàng (`stock === 0`) → disabled, gạch chéo
  - Giá cập nhật theo variant đang chọn
- **Quantity selector**:
  - Nút -/+ với input số giữa
  - Min: 1, Max: variant.stock (hoặc 99 nếu không có variant)
  - Hiện text "{stock} sản phẩm có sẵn"
- **Action buttons**:
  - "Thêm vào giỏ hàng" (btn-ghost, POST `/api/v1/cart` body `{ productId, variantId, quantity }`)
  - "Mua ngay" (btn-primary, thêm vào giỏ rồi navigate `/cart`)
- **Shop info card** (dưới actions):
  - Avatar shop (logoUrl), tên shop
  - "Xem Shop" button → `/shops/{shop.id}` (nếu có page) hoặc filter `/?shopId=...`
- **Product description** (tab hoặc accordion):
  - Tab "Mô tả sản phẩm": render `description` (hỗ trợ HTML/markdown)
  - Tab "Đánh giá" (placeholder future feature)

**UI States:**
- Loading: skeleton cho ảnh + text blocks
- Error: "Sản phẩm không tồn tại hoặc đã bị xoá" + nút "Về trang chủ"
- Out of stock: disable nút mua, hiện badge "Hết hàng"

---

### 3.3 CartPage (`/cart`)

**API calls:**
| API | Method | Endpoint | Body / Params | Response |
|-----|--------|----------|---------------|----------|
| Lấy giỏ hàng | GET | `/api/v1/cart` | - | `ApiResponse<CartResponse>` |
| Cập nhật SL | PUT | `/api/v1/cart/{cartItemId}` | `?quantity=N` | `ApiResponse<CartItemResponse>` |
| Xóa item | DELETE | `/api/v1/cart/{cartItemId}` | - | `ApiResponse<Void>` |

**Data types:**
```typescript
interface CartResponse {
  cartId: number;
  totalPrice: number;
  totalItems: number;
  shopGroups: CartShopGroupResponse[];
}

interface CartShopGroupResponse {
  shopId: number;
  shopName: string;
  shopLogoUrl: string;
  items: CartItemResponse[];
}

interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  variantId: number;       // nullable
  variantName: string;     // nullable
  price: number;
  quantity: number;
  stock: number;
  subtotal: number;
}
```

**Layout:**
- Giỏ hàng nhóm theo Shop (`shopGroups`)
- Mỗi shop group:
  - Header: logo shop + tên shop
  - Danh sách items:
    - Checkbox chọn item (cho checkout chọn lọc)
    - Ảnh sản phẩm (64×64, rounded)
    - Tên sản phẩm (link → `/products/{productId}`)
    - Tên variant (nếu có)
    - Đơn giá
    - Quantity selector (nút -/+, min 1, max stock)
      - Thay đổi → PUT `/api/v1/cart/{cartItemId}?quantity=N`
    - Tổng tiền dòng (price × quantity)
    - Nút xoá (icon Trash) → DELETE + confirm dialog
- **Footer bar** (sticky bottom):
  - "Chọn tất cả" checkbox
  - Tổng tiền: "{totalPrice}" (brand color, text-xl)
  - "Mua Hàng ({selectedCount})" button → navigate `/checkout`

**UI States:**
- Empty cart: illustration + "Giỏ hàng trống" + nút "Tiếp tục mua sắm"
- Loading: skeleton cards
- Item hết hàng (stock=0): disable quantity controls, highlight warning

---

### 3.4 CheckoutPage (`/checkout`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| Lấy địa chỉ | GET | `/api/v1/users/me/addresses` | - | `ApiResponse<List<AddressResponse>>` |
| Tạo đơn | POST | `/api/v1/orders/checkout` | `CheckoutCartRequest` | `ApiResponse<CheckoutResponse>` |

**Data types:**
```typescript
interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

interface CheckoutCartRequest {
  addressId: number;
  note: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD';
}

interface CheckoutResponse {
  grandTotal: number;
  totalOrders: number;
  orders: OrderResponse[];
}
```

**Layout: Stacked sections**

#### Section 1: Địa chỉ nhận hàng
- Hiển thị địa chỉ mặc định (`isDefault=true`):
  - `{fullName}` | `{phone}`
  - `{street}, {ward}, {district}, {city}`
- Nút "Thay đổi" → modal chọn từ list hoặc thêm mới
- Modal thêm địa chỉ (form):
  - Họ tên, Số điện thoại, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
  - Checkbox "Đặt làm mặc định"

#### Section 2: Sản phẩm đặt mua
- List items từ cart (grouped by shop)
- Mỗi item: ảnh + tên + variant + đơn giá × SL = thành tiền
- Không cho sửa số lượng (đã fix từ cart)

#### Section 3: Phương thức thanh toán
- Radio buttons:
  - COD (Thanh toán khi nhận hàng)
  - VNPAY (Ví VNPAY)
  - MOMO (Ví MoMo)
  - BANK_TRANSFER (Chuyển khoản ngân hàng)
  - CREDIT_CARD (Thẻ tín dụng)

#### Section 4: Ghi chú
- Textarea: placeholder "Lưu ý cho người bán..."

#### Section 5: Order Summary (sticky sidebar trên desktop)
- Tổng tiền hàng
- Phí vận chuyển (hiện "Miễn phí" nếu = 0)
- Giảm giá (nếu có)
- **Tổng thanh toán** (text-2xl, brand color)
- Nút "Đặt Hàng" → POST `/api/v1/orders/checkout`
- Sau thành công → navigate `/orders` hoặc hiện success modal

---

### 3.5 OrdersPage (`/orders`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| Lấy đơn hàng | GET | `/api/v1/orders?status=...&page=0&size=10` | `ApiResponse<PageResponse<HistoryOrderResponse>>` |
| Hủy đơn | PUT | `/api/v1/orders/{orderId}/cancel?reason=...` | `ApiResponse<CancelOrderResponse>` |

**Data types:**
```typescript
interface HistoryOrderResponse {
  orderId: number;
  orderNumber: string;
  shopId: number;
  shopAvatarUrl: string;
  shopName: string;
  totalAmount: number;
  subTotal: number;
  status: StatusType;
  createDate: string;
  items: HistoryOrderItemResponse[];
}

interface HistoryOrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  productPictureUrl: string;
  variantName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

type StatusType = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
```

**Layout:**

#### Tab Bar (top)
- Tabs: Tất cả, Chờ xác nhận (PENDING), Đã xác nhận (CONFIRMED), Đang giao (SHIPPING), Đã giao (DELIVERED), Đã hủy (CANCELLED), Hoàn tiền (REFUNDED)
- Tab active có underline brand color
- Click tab → filter theo `status` query param

#### Order Cards (list)
Mỗi đơn hàng là 1 card:
- **Header**: logo shop + tên shop + status badge (color-coded)
  - PENDING → yellow
  - CONFIRMED → blue
  - SHIPPING → indigo
  - DELIVERED → green
  - CANCELLED → red
  - REFUNDED → gray
- **Items list** (max 2 hiển thị, thêm "+N sản phẩm khác"):
  - Ảnh 64×64 + tên + variant + giá × SL
- **Footer**: Tổng đơn hàng `{totalAmount}` + actions:
  - PENDING → nút "Hủy đơn" (confirm dialog, nhập lý do)
  - DELIVERED → nút "Đánh giá" (placeholder)
  - Tất cả → nút "Xem chi tiết" → `/orders/{orderId}`

#### Empty state
- "Bạn chưa có đơn hàng nào"

---

### 3.6 OrderDetailPage (`/orders/:orderId`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| Chi tiết đơn | GET | `/api/v1/orders/{orderId}` | `ApiResponse<DetailOrderResponse>` |
| Thanh toán | POST | `/api/v1/orders/{orderId}/payment` | `ApiResponse<PaymentResponse>` |
| Trạng thái TT | GET | `/api/v1/orders/{orderId}/payment` | `ApiResponse<PaymentResponse>` |

**Data types:**
```typescript
interface DetailOrderResponse {
  orderId: number;
  shopId: number;
  paymentId: number;
  orderNumber: string;
  method: PaymentMethod;
  transactionId: string;
  shopName: string;
  logoUrl: string;
  nameReceive: string;
  phoneReceive: string;
  address: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  statusType: StatusType;
  createdDate: string;
  orderItemResponses: OrderItemResponse[];
}

interface OrderItemResponse {
  id: number;
  variantId: number;
  productName: string;
  productId: number;
  productPictureUrl: string;
  variantName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD';

interface PaymentResponse {
  transactionId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  provider: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paidAt: string;
}
```

**Layout: Stacked sections**

#### Section 1: Order Progress Stepper
- Steps: Đặt hàng → Xác nhận → Đang giao → Đã giao
- Step hiện tại highlighted dựa trên `statusType`
- Nếu CANCELLED: stepper đỏ, hiện lý do hủy

#### Section 2: Thông tin nhận hàng
- Icon MapPin
- `{nameReceive}` | `{phoneReceive}`
- `{address}`

#### Section 3: Thông tin Shop
- Logo + tên shop + link "Xem Shop"

#### Section 4: Danh sách sản phẩm
- Mỗi item: ảnh + tên + variant + giá × SL = thành tiền
- Click tên SP → `/products/{productId}`

#### Section 5: Thông tin thanh toán
- Phương thức: `{method}` (icon tương ứng)
- Transaction ID (nếu có)
- Trạng thái thanh toán: badge color-coded

#### Section 6: Tổng kết đơn hàng
- Tổng tiền hàng: `{subtotal}`
- Phí vận chuyển: `{shippingFee}`
- Giảm giá: `-{discountAmount}`
- **Tổng thanh toán: `{totalAmount}`** (text-xl, brand color)

#### Actions (bottom)
- PENDING: "Hủy đơn" button
- status != CANCELLED và paymentMethod != COD: "Thanh toán" button

---

### 3.7 ProfilePage (`/profile`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| Lấy profile | GET | `/api/v1/users/me` | - | `ApiResponse<UserResponse>` |
| Cập nhật | PUT | `/api/v1/users/me` | `UpdateProfileRequest` | `ApiResponse<UserResponse>` |
| Đổi avatar | POST | `/api/v1/users/me/avatar?url=...` | - | `ApiResponse<string>` |

**Data types:**
```typescript
interface UserResponse {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  role: UserRole;
}

interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}
```

**Layout: Sidebar + Content**

#### Sidebar (Profile Navigation)
- Avatar (round, 80×80) + tên + role badge
- Links: Hồ sơ, Địa chỉ, Đổi mật khẩu
- Link: Kênh Người Bán (nếu role === SELLER)

#### Content: Edit Profile Form
- Avatar preview (round, 100×100) + nút "Đổi avatar" (upload URL)
- Form fields (label trên, input dưới):
  - Họ và tên (text, required)
  - Email (text, readonly hoặc editable)
  - Số điện thoại (text)
- "Lưu thay đổi" button → PUT `/api/v1/users/me`
- Success toast notification

---

### 3.8 AddressPage (`/profile/addresses`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| Danh sách | GET | `/api/v1/users/me/addresses` | - | `ApiResponse<List<AddressResponse>>` |
| Thêm mới | POST | `/api/v1/users/me/addresses` | `CreateAddressRequest` | `ApiResponse<AddressResponse>` |
| Cập nhật | PUT | `/api/v1/users/me/addresses/{id}` | `CreateAddressRequest` | `ApiResponse<AddressResponse>` |
| Xóa | DELETE | `/api/v1/users/me/addresses/{id}` | - | `ApiResponse<Void>` |
| Đặt mặc định | PUT | `/api/v1/users/me/addresses/{id}/default` | - | `ApiResponse<AddressResponse>` |

**Data type:**
```typescript
interface CreateAddressRequest {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}
```

**Layout:**
- Header: "Địa chỉ của tôi" + nút "Thêm địa chỉ mới"
- List addresses (cards):
  - `{fullName}` | `{phone}`
  - `{street}, {ward}, {district}, {city}`
  - Badge "Mặc định" (nếu `isDefault`)
  - Actions: "Sửa" (mở modal/form) | "Xóa" (confirm) | "Đặt mặc định" (nếu chưa default)

- **Add/Edit Modal** (hoặc inline form):
  - Họ tên nhận hàng (required)
  - Số điện thoại (required)
  - Tỉnh/Thành phố (select/input)
  - Quận/Huyện (select/input)
  - Phường/Xã (select/input)
  - Địa chỉ cụ thể (textarea)
  - Checkbox "Đặt làm địa chỉ mặc định"

---

### 3.9 ChangePasswordPage (`/profile/password`)

**API call:**
```
PUT /api/v1/users/me/password
Body: { oldPassword: string, newPassword: string }
Response: ApiResponse<boolean>
```

**Form:**
- Mật khẩu hiện tại (password input)
- Mật khẩu mới (password input)
- Xác nhận mật khẩu mới (password input, client-side validate match)
- "Đổi mật khẩu" button
- Validation: min 6 chars, new !== old, confirm === new

---

### 3.10 LoginPage (`/login`)

**API call:**
```
POST /api/v1/auth/login
Body: { email: string, password: string }
Response: ApiResponse<LoginResponse>
```

```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
}
```

**Layout:**
- Card centered, max-width 420px
- Logo ZoraShop
- Heading "Đăng Nhập"
- Form: Email input (icon Mail), Password input (icon Lock)
- "Đăng Nhập" button (full-width, btn-primary)
- Demo login buttons (2 cột): "Người Mua" + "Người Bán"
- Link "Chưa có tài khoản? Đăng ký ngay"

**After login:**
- Lưu `accessToken` vào localStorage
- Lưu `refreshToken` vào localStorage
- Fetch profile `GET /api/v1/users/me` → lưu user info vào AuthContext
- Navigate → `/` (hoặc returnUrl)

---

### 3.11 RegisterPage (`/register`)

**API call:**
```
POST /api/v1/auth/register
Body: { email, password, fullname, phone }
Response: ApiResponse<RegisterResponse>
```

```typescript
interface RegisterResponse {
  fullName: string;
  email: string;
  phone: string;
}
```

**Form:**
- Họ và tên (text, required)
- Email (email, required)
- Số điện thoại (tel)
- Mật khẩu (password, required, min 6)
- Xác nhận mật khẩu (password, client-only validation)
- "Đăng Ký" button
- Link "Đã có tài khoản? Đăng nhập"

---

## 4. TRANG SELLER — CHI TIẾT

---

### 4.1 SellerDashboardPage (`/seller/dashboard`)

Trang tổng quan cơ bản. Không có API riêng — aggregate từ các API khác.

**Sections:**
- **Quick Stats** (4 cards grid):
  - Tổng sản phẩm (lấy từ `GET /api/v1/seller/products?size=1` → `totalElements`)
  - Đơn chờ xác nhận (lấy từ `GET /api/v1/seller/orders?status=PENDING&size=1` → `totalElements`)
  - Đơn đang giao (lấy từ `GET /api/v1/seller/orders?status=SHIPPING&size=1` → `totalElements`)
  - Tổng doanh thu (aggregate hoặc placeholder)
- **Đơn hàng gần đây** (table 5 rows) → link "Xem tất cả"
- **Sản phẩm bán chạy** (list top 5 by soldCount)

---

### 4.2 SellerProductsPage (`/seller/products`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| DS sản phẩm | GET | `/api/v1/seller/products?page=0&size=20` | `ApiResponse<PageResponse<ProductSummaryResponse>>` |
| Xóa SP | DELETE | `/api/v1/seller/products/{slug}` | `ApiResponse<Void>` |

**Layout:**
- Header: "Sản phẩm của tôi" + nút "Thêm sản phẩm mới" (→ `/seller/products/new`)
- Table/Grid sản phẩm:
  - Columns: Ảnh | Tên SP | Giá | Tồn kho | Đã bán | Trạng thái | Actions
  - Actions: Sửa (→ `/seller/products/{slug}/edit`) | Xóa (confirm dialog)
- Pagination
- Empty state: "Bạn chưa có sản phẩm nào"

---

### 4.3 SellerProductFormPage (`/seller/products/new` hoặc `/seller/products/:slug/edit`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| Lấy SP (edit) | GET | `/api/v1/products/{slug}` | - | `ApiResponse<ProductResponse>` |
| Tạo mới | POST | `/api/v1/seller/products` | `CreateProductRequest` | `ApiResponse<ProductResponse>` |
| Cập nhật | PUT | `/api/v1/seller/products/{slug}` | `UpdateProductRequest` | `ApiResponse<ProductResponse>` |
| Lấy danh mục | GET | `/api/v1/categories` | - | danh sách cho select |

**Data types:**
```typescript
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: number;
  images: CreateProductImageRequest[];
  variants: CreateProductVariantRequest[];
}

interface CreateProductImageRequest {
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface CreateProductVariantRequest {
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  status: string;        // ACTIVE, INACTIVE
  categoryId: number;
  images: UpdateProductImageRequest[];
  variants: UpdateProductVariantRequest[];
}

interface UpdateProductImageRequest {
  id: number;            // nullable for new images
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface UpdateProductVariantRequest {
  id: number;            // nullable for new variants
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;
}
```

**Form layout (multi-section):**

#### Section: Thông tin cơ bản
- Tên sản phẩm (text, required)
- Danh mục (select dropdown từ API categories)
- Mô tả (textarea hoặc rich editor)

#### Section: Giá bán
- Giá bán (number input, required, format VND)
- Giá gốc (number input, optional — nếu > giá bán thì tạo discount badge)

#### Section: Hình ảnh sản phẩm
- Upload area (drag & drop hoặc input URL)
- Grid preview thumbnails (sortable)
- Mỗi ảnh: preview + nút "Đặt làm ảnh chính" + nút xoá
- Ảnh chính có border highlight

#### Section: Phân loại hàng (Variants)
- Nút "Thêm phân loại"
- Mỗi variant row:
  - Tên phân loại (text, vd: "Đỏ - XL")
  - SKU (text)
  - Giá (number)
  - Số lượng tồn kho (number)
  - Ảnh variant (URL input)
  - Nút xoá variant
- Nếu không có variant → sản phẩm dùng price + stock chính

#### Section: Trạng thái (chỉ khi edit)
- Toggle/Select: ACTIVE / INACTIVE

#### Actions
- "Lưu sản phẩm" (POST hoặc PUT)
- "Hủy" → navigate back

---

### 4.4 SellerOrdersPage (`/seller/orders`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| DS đơn hàng | GET | `/api/v1/seller/orders?status=...&page=0&size=20` | `ApiResponse<PageResponse<OrderSummaryResponse>>` |
| Xác nhận | PUT | `/api/v1/seller/orders/{orderId}/confirm` | `ApiResponse<Void>` |
| Giao hàng | PUT | `/api/v1/seller/orders/{orderId}/ship` | `ApiResponse<Void>` |
| Đã giao | PUT | `/api/v1/seller/orders/{orderId}/delivered` | `ApiResponse<Void>` |

**Data type:**
```typescript
interface OrderSummaryResponse {
  orderId: number;
  orderNumber: string;
  buyerName: string;
  totalAmount: number;
  status: StatusType;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  totalItems: number;
  createdDate: string;
}
```

**Layout:**
- **Tab bar**: Tất cả | Mới (PENDING) | Đã xác nhận (CONFIRMED) | Đang giao (SHIPPING) | Hoàn thành (DELIVERED) | Đã hủy (CANCELLED)
- **Table** (desktop) hoặc **Card list** (mobile):
  - Columns: Mã đơn | Khách hàng | Tổng tiền | Thanh toán | Trạng thái | Ngày tạo | Actions
  - Status badge (color-coded)
  - Payment badge: COD/VNPAY + PENDING/COMPLETED
  - Actions dựa trên status:
    - PENDING → "Xác nhận" (PUT .../confirm)
    - CONFIRMED → "Giao hàng" (PUT .../ship)
    - SHIPPING → "Đã giao" (PUT .../delivered)
    - Mọi status → "Xem chi tiết" → `/seller/orders/{orderId}`
- **Pagination**

---

### 4.5 SellerOrderDetailPage (`/seller/orders/:orderId`)

**API call:**
```
GET /api/v1/seller/orders/{orderId}
Response: ApiResponse<SellerOrderDetailResponse>
```

```typescript
interface SellerOrderDetailResponse {
  orderId: number;
  orderNumber: string;
  status: StatusType;
  note: string;
  // Receiver info
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  // Money
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paidAt: string;
  // Items for packing
  items: OrderItemResponse[];
  createdDate: string;
}
```

**Layout: Stacked sections (focus on packing/shipping)**

#### Section 1: Order Header
- Mã đơn: `{orderNumber}`
- Trạng thái: badge color-coded
- Ngày tạo: formatted datetime

#### Section 2: Thông tin người nhận (card)
- `{receiverName}` | `{receiverPhone}`
- `{shippingAddress}`
- Ghi chú: `{note}` (highlighted nếu có)

#### Section 3: Danh sách sản phẩm đóng gói
- **Table** (quan trọng cho seller đóng hàng):
  - Ảnh | Tên SP | Phân loại | SKU | Đơn giá | SL | Thành tiền
  - Tổng items: `{items.length}`

#### Section 4: Thông tin thanh toán
- Phương thức: `{paymentMethod}`
- Trạng thái TT: badge `{paymentStatus}`
- Mã giao dịch: `{transactionId}`
- Thời gian TT: `{paidAt}`

#### Section 5: Tổng kết
- Tiền hàng, phí ship, giảm giá, **tổng thanh toán**

#### Actions
- PENDING → "Xác nhận đơn hàng" button
- CONFIRMED → "Giao cho vận chuyển" button
- SHIPPING → "Đã giao thành công" button

---

### 4.6 SellerInventoryPage (`/seller/inventory`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| DS sản phẩm | GET | `/api/v1/seller/products?page=0&size=50` | Danh sách SP + variant |
| Cập nhật tồn | PUT | `/api/v1/seller/inventory/{variantId}?quantity=N` | `ApiResponse<Void>` |
| Lịch sử kho | GET | `/api/v1/seller/inventory/{variantId}/logs?page=0&size=20` | `ApiResponse<PageResponse<InventoryLogResponse>>` |

**Data type:**
```typescript
interface InventoryLogResponse {
  id: number;
  inventoryId: number;
  type: 'IN' | 'OUT' | 'RESERVED' | 'RELEASED';
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  referenceId: number;
  createdAt: string;
}
```

**Layout:**
- Table sản phẩm + variants:
  - Ảnh | Tên SP | Variant | SKU | Tồn kho hiện tại | Actions
  - Actions: inline edit stock (number input + save) | "Xem lịch sử"
- Modal "Lịch sử nhập xuất kho" (khi click "Xem lịch sử"):
  - Table: Loại (IN/OUT/RESERVED/RELEASED) | SL thay đổi | SL sau | Lý do | Ngày

---

### 4.7 SellerShopSettingsPage (`/seller/shop`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| Lấy shop | GET | `/api/v1/shops/{id}` | - | `ApiResponse<ShopResponse>` |
| Tạo shop | POST | `/api/v1/shops` | `CreateShopRequest` | `ApiResponse<ShopResponse>` |
| Cập nhật | PUT | `/api/v1/shops/{id}` | `UpdateShopRequire` | `ApiResponse<ShopResponse>` |

**Data types:**
```typescript
interface ShopResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  totalProducts: number;
  totalFollowers: number;
  isActive: boolean;
}

interface CreateShopRequest {
  name: string;
  description: string;
}
```

**Layout:**
- Nếu chưa có shop → form "Tạo Shop":
  - Tên shop (text, required)
  - Mô tả (textarea)
  - "Tạo Shop" button
- Nếu đã có shop → form "Cài đặt Shop":
  - Preview card: banner + logo + tên + rating + stats
  - Form edit:
    - Tên shop (text)
    - Mô tả (textarea)
    - Logo URL (text input + preview)
    - Banner URL (text input + preview)
  - Stats (readonly): rating ★, tổng SP, tổng followers
  - "Lưu thay đổi" button

---

## 5. TRANG ADMIN — CHI TIẾT

---

### 5.1 AdminUsersPage (`/admin/users`)

**API calls:**
| API | Method | Endpoint | Response |
|-----|--------|----------|----------|
| DS users | GET | `/api/v1/admin/users?page=0&size=10` | `ApiResponse<PageResponse<UserResponse>>` |
| Toggle active | PUT | `/api/v1/admin/users/{email}/active` | `ApiResponse<UserResponse>` |

**Layout:**
- **Table**:
  - Columns: Avatar | Họ tên | Email | SĐT | Role | Active | Actions
  - Role badge: BUYER (blue), SELLER (orange), ADMIN (red)
  - Active: toggle switch (green/gray)
  - Actions: "Khóa/Mở khóa" → PUT `/{email}/active`
- Pagination

---

### 5.2 AdminCategoriesPage (`/admin/categories`)

**API calls:**
| API | Method | Endpoint | Body | Response |
|-----|--------|----------|------|----------|
| DS categories | GET | `/api/v1/categories` | - | `ApiResponse<List<CategoryResponse>>` |
| Tạo mới | POST | `/api/v1/admin/categories` | `CreateCategoryRequest` | `ApiResponse<CategoryResponse>` |
| Cập nhật | PUT | `/api/v1/admin/categories/{id}` | `CreateCategoryRequest` | `ApiResponse<CategoryResponse>` |
| Xóa | DELETE | `/api/v1/admin/categories/{id}` | - | `ApiResponse<Void>` |

**Data type:**
```typescript
interface CreateCategoryRequest {
  name: string;
  imageUrl: string;
}
```

**Layout:**
- Header: "Quản lý danh mục" + nút "Thêm danh mục"
- Table/Grid categories:
  - Ảnh | Tên danh mục | Slug | Actions (Sửa | Xóa)
- Add/Edit Modal:
  - Tên danh mục (text, required)
  - Ảnh (URL input + preview)

---

## 6. REUSABLE COMPONENTS

| Component | Dùng ở đâu | Props |
|-----------|-----------|-------|
| `ProductCard` | HomePage, SellerProducts | `product: ProductSummaryResponse` |
| `OrderStatusBadge` | Orders, SellerOrders | `status: StatusType` |
| `PaymentBadge` | OrderDetail, SellerOrderDetail | `method: PaymentMethod, status: PaymentStatus` |
| `AddressCard` | AddressPage, CheckoutPage | `address: AddressResponse, onEdit, onDelete, onSetDefault` |
| `PriceDisplay` | ProductDetail, Cart, Checkout | `price, originalPrice` |
| `QuantitySelector` | ProductDetail, CartPage | `value, min, max, onChange` |
| `SkeletonCard` | mọi loading state | `variant: 'product' \| 'order' \| 'text'` |
| `EmptyState` | mọi empty state | `icon, title, description, action` |
| `ConfirmDialog` | Delete, Cancel actions | `title, message, onConfirm, onCancel` |
| `Toast` | Success/Error notifications | `type, message, duration` |
| `Pagination` | mọi trang có PageResponse | `pageNo, totalPages, onPageChange` |
| `TabBar` | Orders, SellerOrders | `tabs: {id, label}[], activeTab, onChange` |
| `SearchInput` | Header, SellerProducts | `value, onChange, onSubmit, placeholder` |
| `ImageGallery` | ProductDetail | `images: ProductImageResponse[]` |
| `VariantSelector` | ProductDetail | `variants: ProductVariantResponse[], selected, onChange` |
| `OrderStepper` | OrderDetail | `currentStatus: StatusType` |

---

## 7. DESIGN TOKENS

### 7.1 Colors
```css
--color-brand-500: #ff5520;   /* Primary accent */
--color-brand-600: #f03a08;   /* Hover */
--color-brand-700: #c72d06;   /* Active */
--color-brand-50:  #fff5f0;   /* Light background */
```

### 7.2 Typography
- **Display/Headings:** `Plus Jakarta Sans`, weight 700-800, tracking -0.02em
- **Body:** `Outfit`, weight 400-500
- **Monospace:** `JetBrains Mono` (for prices, order numbers, codes)

### 7.3 Radius (all-soft system)
- Buttons: `9999px` (pill)
- Cards: `16px`
- Inputs: `12px`
- Thumbnails: `8px`

### 7.4 Shadows
- Card rest: `0 1px 3px rgba(13,17,23,0.06)`
- Card hover: `0 10px 30px rgba(255,85,32,0.12)`
- Button primary: `0 2px 8px rgba(255,85,32,0.35)`

### 7.5 Responsive Breakpoints
- Mobile: < 640px (1-2 cols)
- Tablet: 640-1024px (2-3 cols)
- Desktop: 1024-1280px (3-4 cols)
- Large: > 1280px (4-5 cols)

---

## 8. TRẠNG THÁI UI TOÀN CỤC

### 8.1 Authentication Flow
```
App Load → check localStorage accessToken
  → có → GET /api/v1/users/me → thành công → AuthContext.user = data
  → có → GET /api/v1/users/me → 401 → thử refreshToken
    → refresh thành công → retry
    → refresh thất bại → clear token, redirect /login
  → không có → guest mode
```

### 8.2 Cart State (CartContext)
```
- totalItemCount: number (badge trên header)
- addToCart(productId, variantId?, quantity): call POST /api/v1/cart
- updateQuantity(cartItemId, quantity): call PUT /api/v1/cart/{id}?quantity=N
- removeItem(cartItemId): call DELETE /api/v1/cart/{id}
- fetchCart(): call GET /api/v1/cart → update state
```

### 8.3 Route Guard
```
- /login, /register: guest only → logged in thì redirect /
- /cart, /checkout, /orders/*, /profile/*: auth required → chưa login redirect /login
- /seller/*: require role SELLER
- /admin/*: require role ADMIN
```

---

## 9. FORMAT HELPERS

```typescript
// Format VND currency
formatVND(amount: number): string → "đ 1.200.000"

// Format datetime
formatDate(iso: string): string → "04/09/2026 20:30"
formatRelative(iso: string): string → "2 giờ trước"

// Status label tiếng Việt
statusLabel(status: StatusType): string
  PENDING → "Chờ xác nhận"
  CONFIRMED → "Đã xác nhận"
  SHIPPING → "Đang giao hàng"
  DELIVERED → "Đã giao"
  CANCELLED → "Đã hủy"
  REFUNDED → "Hoàn tiền"

// Payment method label
paymentLabel(method: PaymentMethod): string
  COD → "Thanh toán khi nhận hàng"
  VNPAY → "Ví VNPAY"
  MOMO → "Ví MoMo"
  BANK_TRANSFER → "Chuyển khoản"
  CREDIT_CARD → "Thẻ tín dụng"
```

---

## 10. ORDER STATUS FLOW (State Machine)

```
PENDING ──→ CONFIRMED ──→ SHIPPING ──→ DELIVERED ──→ REFUNDED
   │              │
   └── CANCELLED ←┘
```

- **Buyer actions**: Hủy đơn (PENDING → CANCELLED)
- **Seller actions**:
  - Xác nhận (PENDING → CONFIRMED)
  - Hủy (PENDING/CONFIRMED → CANCELLED)
  - Giao hàng (CONFIRMED → SHIPPING)
  - Đã giao (SHIPPING → DELIVERED)
