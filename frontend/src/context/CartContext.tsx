import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { productApi } from '../api/productApi';
import { CartResponse } from '../types/cart';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartResponse | null;
  totalItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (skuOrVariant: string | number, quantity: number, productDetails?: any) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { success, error } = useToast();
  const { user, token, isAdmin } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!token || !user || isAdmin) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res && res.body) {
        setCart(res.body);
      } else {
        setCart(null);
      }
    } catch {
      // Cart empty or session expired
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [token, user, isAdmin]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (skuOrVariant: string | number, quantity: number, productDetails?: any): Promise<boolean> => {
    if (!token || !user) {
      error('Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng!');
      return false;
    }
    if (isAdmin) {
      error('Tài khoản Quản trị viên (Admin) không được phép mua hàng');
      return false;
    }
    try {
      setLoading(true);
      let targetSku = '';

      // 1. If productDetails with variants are already provided
      if (productDetails?.variants && Array.isArray(productDetails.variants) && productDetails.variants.length > 0) {
        const found = productDetails.variants.find(
          (v: any) => v.sku === skuOrVariant || v.id === skuOrVariant
        );
        if (found?.sku) {
          targetSku = found.sku;
        } else {
          // fallback to first in-stock variant or first variant
          const fallback = productDetails.variants.find((v: any) => (v.stock ?? 1) > 0) || productDetails.variants[0];
          if (fallback?.sku) targetSku = fallback.sku;
        }
      }

      // 2. If targetSku still empty, test if skuOrVariant might be a slug or id
      if (!targetSku) {
        const candidate = String(skuOrVariant).trim();
        // If candidate contains typical SKU uppercase/hyphen pattern, try as SKU first
        try {
          // Fetch product detail by candidate if it might be a product slug or id
          const detailRes = await productApi.getProductDetail(candidate);
          const variants = detailRes?.body?.variants;
          if (variants && variants.length > 0) {
            const found = variants.find((v) => (v.stock ?? 1) > 0) || variants[0];
            if (found?.sku) targetSku = found.sku;
          }
        } catch {
          // Candidate might already be a raw SKU
          targetSku = candidate;
        }
      }

      if (!targetSku) {
        targetSku = String(skuOrVariant);
      }

      await cartApi.addItem({ sku: targetSku, quantity });
      await refreshCart();
      success('Đã thêm vào giỏ hàng!', `Số lượng: +${quantity} sản phẩm.`);
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);
      await cartApi.updateQuantity(cartItemId, quantity);
      await refreshCart();
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật số lượng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await cartApi.removeItem(cartItemId);
      await refreshCart();
      success('Đã xóa sản phẩm khỏi giỏ hàng');
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart(null);
      await refreshCart();
      success('Đã làm trống giỏ hàng', 'Toàn bộ sản phẩm trong giỏ hàng đã được xóa.');
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể xóa giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const totalItemCount =
    cart?.shopGroups?.reduce(
      (sum, group) => sum + group.cartItems.reduce((s, item) => s + item.quantity, 0),
      0
    ) || cart?.totalItem || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItemCount,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
