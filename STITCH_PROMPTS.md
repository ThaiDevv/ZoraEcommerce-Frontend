# ZoraShop — Prompts chuẩn cho Google Stitch (labs.google/stitch)

> Bộ prompt này được thiết kế dựa trên cấu trúc **`taste-skill` / `stitch-design-taste`** và bám sát 100% dữ liệu backend của dự án **ZoraShop (Mini-Shopee)**.
> 
> 💡 **Khuyến nghị**: Google Stitch hiểu và sinh layout đẹp nhất bằng **tiếng Anh mô tả trực quan (Visual Descriptions)** kết hợp với các chỉ số Hex, Spacing và Anti-patterns cụ thể.

---

## 0. Master System Prompt / Design Direction (Dán vào đầu tiên)

Nếu Stitch có ô cấu hình Style / System Instructions hoặc khi bạn bắt đầu một project mới trên Stitch, hãy dán prompt này để thiết lập toàn bộ quy chuẩn thẩm mỹ:

```text
You are an elite principal UI/UX designer. Generate mockups for "ZoraShop", a modern high-end multi-vendor e-commerce marketplace (curated lifestyle & tech fashion).

DESIGN SYSTEM SPECIFICATIONS:
- Aesthetic: Confident, editorial yet highly functional marketplace. Atmosphere is clean, airy, premium, and human — strictly NOT generic or bloated.
- Color Palette:
  * Canvas Background: #F8FAFC (Slate-50 warm neutral, never stark hospital blue)
  * Surface/Cards: #FFFFFF with subtle border (1px solid rgba(226, 232, 240, 0.8)) and diffused shadow (0 10px 30px -10px rgba(0,0,0,0.04))
  * Primary Accent: #EA580C (Vibrant Persimmon Orange - energetic marketplace vibe without being oversaturated)
  * Secondary Accent: #0F172A (Deep Slate Navy for primary headers and high-contrast badges)
  * Text Primary: #0F172A (Zinc-900 depth, never pure #000000)
  * Text Secondary: #64748B (Slate-500 for descriptions, reviews, timestamps)
  * Status Colors: Success (#10B981), Warning (#F59E0B), Danger (#EF4444), Info (#3B82F6)
- Typography: Modern geometric grotesque ('Plus Jakarta Sans' or 'Outfit' for display headings, crisp and track-tight -0.02em; monospace for currency '₫' and tracking IDs).
- Hard Anti-Patterns (BANNED):
  * NO "AI Purple" neon gradients, NO glowing borders.
  * NO pure black #000000.
  * NO equal boring 3-card rows (use asymmetric Bento grids or fluid carousels).
  * NO low-contrast or microscopic text (< 12px).
  * NO generic dummy names (use realistic Vietnamese/Global product titles & VND prices like "1.250.000₫").
  * NO overlapping floating text over busy images without solid scrim.
```

---

## 1. Prompt: Trang chủ (Home Marketplace & Discovery)

Dán prompt này vào Stitch để sinh màn hình Trang chủ:

```text
Create a desktop landing and discovery page (1440px wide) for "ZoraShop" e-commerce marketplace.

SECTIONS TO INCLUDE:
1. Top Sticky Header:
   - Left: Minimalist modern logo "ZoraShop" with small flame badge.
   - Center: Spacious, pill-shaped search bar with placeholder "Tìm kiếm sản phẩm, thương hiệu, shop..." with a subtle category dropdown and search button (#EA580C).
   - Right: Notification bell with unread badge '2', Wishlist icon, and Cart icon with badge '3', followed by user avatar with name "Thai Nguyen".

2. Hero Showcase (Asymmetric Split Screen - NOT a generic full-width carousel):
   - Left (60%): Editorial feature banner "Mùa mua sắm mới 2026 — Giảm tới 40% thương hiệu công nghệ & thời trang". Large refined typography, pill tag "CHÍNH HÃNG 100%", primary action button "Khám phá ngay" in #EA580C with tactile arrow.
   - Right (40%): Bento stack with two mini-cards: "Flash Sale chớp nhoáng" featuring countdown timer (02 : 14 : 55) and preview of high-demand headphones with -35% discount pill.

3. Category Quick Bar:
   - A sleek horizontal row of circular/soft-square category icons with subtle hover elevation: "Điện thoại & Phụ kiện", "Thời trang Nam", "Thời trang Nữ", "Thiết bị số", "Nhà cửa & Đời sống", "Sức khỏe & Sắc đẹp".

4. Flash Sale Section:
   - Header with flame icon, "GIỜ VÀNG GIÁ SỐC", dynamic countdown timer pill (hours, minutes, seconds), and "Xem tất cả >" link.
   - 5-column horizontal grid of product cards: each card has a clean product photo on off-white background, discount badge "-28%", product title in 2 lines, price in bold orange (e.g., "450.000₫"), original strikethrough price ("620.000₫"), and a sleek progress bar showing "Đã bán 85%".

5. Personalized Recommendation Bento Grid ("Gợi ý cho bạn"):
   - Asymmetric multi-card layout displaying curated items with shop verification badge ("Shop Mall"), star rating (★ 4.9, 1.2k đánh giá), and "Giao nhanh 2h" pill tag.

6. Modern Footer:
   - Clean 4-column structure (Về ZoraShop, Chăm sóc khách hàng, Chính sách bảo hành, Phương thức thanh toán với logo VNPAY/COD/Visa) on #F8FAFC surface.
```

---

## 2. Prompt: Chi tiết sản phẩm (Product Detail Page - PDP)

Dán prompt này vào Stitch để sinh màn hình Chi tiết sản phẩm:

```text
Design a high-converting, modern Product Detail Page (1440px desktop) for "Bàn Phím Cơ Không Dây Zora Pro Tri-Mode RGB".

PAGE STRUCTURE:
1. Breadcrumb Navigation:
   - "Trang chủ > Thiết bị số & Công nghệ > Bàn phím & Chuột > Zora Pro Tri-Mode"

2. Product Main Stage (2-Column 55/45 Split Layout):
   - Left Column (Media Gallery):
     * Large, crisp primary image viewport with rounded corners (1.5rem) and soft border.
     * Thumbnails carousel underneath (5 thumbnails) with active thumbnail highlighted by an orange border (#EA580C).
     * Action icons below image: "Chia sẻ" and "Thích (Yêu thích: 1.4k)".
   - Right Column (Purchasing & Options Console):
     * Badges: "Chính hãng Mall" (Deep Navy) and "Freeship Xtra" (Emerald Green).
     * Product Title: Bold, clear heading "Bàn Phím Cơ Không Dây Zora Pro Tri-Mode RGB Hotswap Gasket Mount".
     * Rating & Social Proof: Row with "4.9 ★★★★★ (428 Đánh giá) | 1.8k Đã bán | Tố cáo".
     * Price Display Box: Highlighted container with current price "1.490.000₫" in large #EA580C font, original price "1.990.000₫", discount pill "-25%".
     * Shop Vouchers: Row of 3 clickable voucher tickets ("Giảm 50k đơn 1tr", "Giảm 10%").
     * Variant Selectors:
       - Color ("Màu sắc"): Pill options with active state [Trắng Glacier (Selected)], [Đen Obsidian], [Xanh Retro].
       - Switch Type: [Linear Red Switch], [Tactile Brown Switch (Selected)].
     * Quantity Stepper: [-] [ 1 ] [+] with "Còn 42 sản phẩm trong kho" in muted secondary text.
     * Call to Action Buttons:
       - Button 1: "Thêm vào giỏ hàng" (Ghost outline button with cart icon, border #EA580C, text #EA580C).
       - Button 2: "Mua ngay" (High-contrast solid fill #EA580C, white text, bold).

3. Shop Info Banner (Seller Identity):
   - Shop avatar, shop name "Zora Tech Official Store", "Online 5 phút trước", rating (4.9 / 5.0), 24k followers, and 2 quick buttons: "Chat ngay" & "Xem Shop".

4. Tabbed Detail & Review Section:
   - Tab Bar: [Mô tả chi tiết (Active)] | [Thông số kỹ thuật] | [Đánh giá từ người mua (428)].
   - Review Summary: Score breakdown card (5 stars: 85%, 4 stars: 10%, etc.), filter pills ([Tất cả], [Có hình ảnh/video], [5 Sao]).
   - Customer review cards showing buyer avatar, name masked (t***9), star rating, variant purchased, verified purchase badge, review text, and real user photo attachments.
```

---

## 3. Prompt: Giỏ hàng & Thanh toán (Cart & Checkout Flow)

Dán prompt này vào Stitch để sinh màn hình Giỏ hàng và Thanh toán:

```text
Create a clean, frictionless Cart and Checkout screen (1440px desktop) for ZoraShop e-commerce platform.

LAYOUT ARCHITECTURE (2-Column: 68% Left Items / 32% Right Sticky Summary):

Left Column (Cart Items grouped by Vendor/Store):
1. Table Header Bar: Select All Checkbox ("Chọn tất cả (4 sản phẩm)"), "Đơn giá", "Số lượng", "Số tiền", "Thao tác".
2. Store Group 1 ("Zora Tech Store"):
   - Store header with store icon, checkbox, store name, and "Nhận voucher shop >".
   - Item Row:
     * Checkbox (Checked)
     * Thumbnail image (80x80px rounded-lg)
     * Title: "Bàn Phím Cơ Không Dây Zora Pro Tri-Mode (Màu: Trắng Glacier, Switch: Brown)"
     * Unit Price: 1.490.000₫
     * Quantity Stepper: [-] 1 [+]
     * Total line item: 1.490.000₫
     * Delete trash can icon with subtle red hover.
3. Store Group 2 ("Minimalist Fashion"):
   - Store header with checkbox.
   - Item Row: "Áo Thun Cotton Oversized Unisex (Size: L, Màu: Be)" - 250.000₫, Qty: 2, Total: 500.000₫.
4. Delivery Address Section (In-line Checkout option):
   - Shipping address card with "Mặc định" badge, recipient name "Nguyễn Văn Thái - 0987654321", full address: "Tòa S2.05 Vinhome Smart City, Nam Từ Liêm, Hà Nội" with an "Thay đổi" button.
5. Payment Method Selector:
   - Radio cards with icons: [Thanh toán khi nhận hàng (COD) (Selected)], [Ví điện tử VNPAY (QR Code)], [Thẻ ATM nội địa / Napas].

Right Column (Sticky Order Summary Card):
- Card container with crisp border and diffused shadow:
  * Heading: "Tóm tắt đơn hàng"
  * Voucher Box: Input field "Nhập mã giảm giá" + "Áp dụng" button in #0F172A. Pill applied: "FREESHIP50K -50.000₫ [x]".
  * Price Breakdown:
    - Tổng tiền hàng: 1.990.000₫
    - Phí vận chuyển: 35.000₫
    - Giảm giá phí ship: -35.000₫ (Free ship pill)
    - Giảm giá voucher: -50.000₫
    - Divider line (1px dashed #E2E8F0)
    - Tổng thanh toán: 1.940.000₫ (Large 24px bold in #EA580C)
  * Full-width Primary Button: "TIẾN HÀNH ĐẶT HÀNG" (#EA580C background, white text, 52px height, pill-rounded, confident click state).
  * Trust badges below button: "Bảo mật thanh toán 100% SSL" and "Đổi trả miễn phí 7 ngày".
```

---

## 4. Prompt: Quản lý đơn hàng người mua (Order Tracking & History)

Dán prompt này vào Stitch để sinh màn hình Quản lý đơn hàng:

```text
Design the User Account & Order Management screen (1440px desktop) for ZoraShop e-commerce.

LAYOUT (Sidebar Nav + Main Content Area):
- Left Sidebar (250px width):
  * User profile snippet: Avatar, "Nguyễn Văn Thái", role badge "Thành viên Bạc".
  * Navigation items: "Tài khoản của tôi", "Đơn mua (Active - highlighted with orange indicator)", "Thông báo (3)", "Kho Voucher (12)".

- Main Content Area:
  1. Horizontal Order Status Tab Bar:
     - Tabs: [Tất cả (8)], [Chờ xác nhận (1)], [Đang giao (2)], [Hoàn thành (5)], [Đã hủy (0)].
  2. Search Orders Bar: Search input with placeholder "Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm".
  3. Order Card 1 (Status: "Đang vận chuyển" - Shipping):
     - Card Header: Shop icon + "Zora Tech Store", "Chat", "Xem Shop", and right-aligned status badge: [🚚 ĐANG GIAO HÀNG] in #3B82F6 pill.
     - Divider line.
     - Product Row: Thumbnail, product title "Bàn Phím Cơ Không Dây Zora Pro", variant "Trắng, Brown Switch", qty "x1", price "1.490.000₫".
     - Logistics Tracking Snippet: "Đơn hàng đang trên đường giao đến bạn. Dự kiến: Hôm nay 17:00".
     - Card Footer: Total price callout "Thành tiền: 1.490.000₫" and 2 buttons: "Đã nhận được hàng" (Solid #EA580C) and "Theo dõi đơn hàng" (Ghost outline).
  4. Order Card 2 (Status: "Hoàn thành" - Delivered):
     - Status badge: [✓ HOÀN THÀNH] in #10B981 pill.
     - Product: "Tai nghe Bluetooth Chống ồn Active NC", qty "x1", price "890.000₫".
     - Card Footer: "Thành tiền: 890.000₫", buttons: "Đánh giá ngay" (Border #EA580C, text #EA580C) and "Mua lại".
```

---

## 5. Prompt: Kênh người bán / Quản trị (Seller & Admin Dashboard)

Dán prompt này vào Stitch để sinh màn hình Dashboard Kênh người bán:

```text
Design a high-density, professional Seller Center Dashboard (1440px desktop) for "ZoraShop Seller Portal".

DENSITY & ATMOSPHERE:
- Cockpit-dense, data-rich interface (Density Level 8, Variance 4).
- Clean white background (#FFFFFF) with off-white panels (#F8FAFC) and subtle 1px slate borders.
- Accent: #EA580C for active navigation and primary CTAs, with #10B981 for revenue growth indicators.

LAYOUT STRUCTURE:
1. Left Navigation Sidebar (Dark Navy #0F172A):
   - Logo: "ZoraShop Seller"
   - Menu items: [Tổng quan / Dashboard (Active)], [Quản lý đơn hàng (Badge: 14 mới)], [Quản lý sản phẩm], [Tài chính & Doanh thu], [Thiết lập Shop].
   - Bottom: Shop switcher "Zora Tech Store" with avatar.

2. Top Bar:
   - Breadcrumb: "Kênh Người Bán > Bảng điều khiển"
   - Right: Shop Status "Đang mở cửa", Notification bell (5), and button "+ Thêm sản phẩm mới" (Primary #EA580C).

3. Metric KPI Cards (4-Column Grid):
   - Card 1: Doanh thu hôm nay: "24.850.000₫" (+18.4% so với hôm qua, green badge).
   - Card 2: Đơn hàng cần xử lý: "14 đơn" (Pill "8 đơn chờ đóng gói", "6 đơn chờ lấy hàng").
   - Card 3: Sản phẩm sắp hết hàng: "3 sản phẩm" (Warning pill #F59E0B).
   - Card 4: Tỷ lệ đánh giá Shop: "4.92 ★" (Tổng 1.840 lượt đánh giá).

4. Actionable Orders Table ("Danh sách đơn hàng mới nhất"):
   - Modern table with columns: Mã đơn hàng (e.g. #ORD-2026-9812), Khách hàng, Sản phẩm, Tổng tiền, Phương thức thanh toán (COD/VNPAY badge), Trạng thái (Pills: PENDING, CONFIRMED, SHIPPING), Thao tác ("Xác nhận đơn", "In vận đơn").
   - Clean pagination controls at table bottom.
```

---

## Cách dùng với Google Stitch & Taste-Skill:

1. **Bước 1**: Mở [labs.google/stitch](https://labs.google/stitch).
2. **Bước 2**: Nhập **Master System Prompt (#0)** vào thiết lập style chung (nếu có) hoặc gắn kèm ở đầu.
3. **Bước 3**: Copy từng Prompt cho từng trang (1 -> 5) và gửi cho Stitch để sinh ảnh mockup UI.
4. **Bước 4**: Tải ảnh mockup từ Stitch về, lưu vào thư mục dự án và dùng kỹ năng **`image-to-code`** để Antigravity sinh code React/Tailwind chuẩn xác 100% theo giao diện đó!
