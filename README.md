# ZoraEcommerce - Frontend

Nền tảng thương mại điện tử hiện đại xây dựng bằng **React 19**, **TypeScript**, **Vite**, và **Tailwind CSS v4**.

## 🚀 Khởi chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy server phát triển (cổng 3000)
npm run dev

# Build kiểm tra sản phẩm
npm run build
```

## 📂 Cấu trúc thư mục

- `src/api/`: Các hàm gọi API kết nối Spring Boot Backend.
- `src/types/`: Khai báo kiểu dữ liệu TypeScript (Auth, Product, Cart, Order, v.v.).
- `src/utils/`: Hàm tiện ích (format tiền tệ, ngày tháng).
- `src/components/`: Các UI component tái sử dụng.
- `src/pages/`: Các trang giao diện chính.
- `src/layouts/`: Khung layout trang.
- `src/context/`: Quản lý state toàn cục.
