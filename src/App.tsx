import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import UserProfilePage from './pages/UserProfilePage'
import OrderDetailPage from './pages/OrderDetailPage'

// Seller Channel Pages
import SellerRegisterPage from './pages/seller/SellerRegisterPage'
import SellerOrdersPage from './pages/seller/SellerOrdersPage'
import SellerProductsPage from './pages/seller/SellerProductsPage'
import SellerInventoryPage from './pages/seller/SellerInventoryPage'

// Admin Channel Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'

export default function App() {
  return (
    <BrowserRouter>
      
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/:id" element={<ShopPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Order Details Routes */}
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/user/orders/:orderId" element={<OrderDetailPage />} />

        {/* User Account & Orders Routes */}
        <Route path="/user/profile" element={<UserProfilePage defaultTab="profile" />} />
        <Route path="/user/orders" element={<UserProfilePage defaultTab="orders" />} />
        <Route path="/user/address" element={<UserProfilePage defaultTab="address" />} />
        <Route path="/user/password" element={<UserProfilePage defaultTab="password" />} />
        <Route path="/user/account" element={<UserProfilePage defaultTab="profile" />} />

        {/* Seller Channel Routes */}
        <Route path="/seller/register" element={<SellerRegisterPage />} />
        <Route path="/seller" element={<Navigate to="/seller/orders" replace />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/products" element={<SellerProductsPage />} />
        <Route path="/seller/inventory" element={<SellerInventoryPage />} />

        {/* Admin Channel Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
      </Routes>
    </BrowserRouter>
  )
}
