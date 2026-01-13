'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Cart, CartItem, getCart, saveCart, addToCart as addToCartUtil, updateCartItem, removeFromCart, clearCart, getCartTotal, getCartItemCount } from '@/lib/cart';

interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], market: 'TR', currency: 'TRY' });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCart(getCart());

    const handleCartUpdate = (e: CustomEvent<Cart>) => {
      setCart(e.detail);
    };

    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    const updated = addToCartUtil(item);
    setCart(updated);
    setIsOpen(true); // Open cart drawer when item added
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const updated = updateCartItem(productId, quantity, variantId);
    setCart(updated);
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const updated = removeFromCart(productId, variantId);
    setCart(updated);
  }, []);

  const clear = useCallback(() => {
    clearCart();
    setCart({ items: [], market: 'TR', currency: 'TRY' });
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeItem,
      clear,
      total: getCartTotal(cart),
      itemCount: getCartItemCount(cart),
      isOpen,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
