// Cart management utilities

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  nameEn?: string;
  image?: string;
  quantity: number;
  price: number;
  currency: string;
  salesModel: 'meter' | 'unit' | 'preset_sizes';
  options?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  market: 'TR' | 'GLOBAL';
  currency: string;
}

const CART_KEY = 'grohn_cart';

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], market: 'TR', currency: 'TRY' };
  }
  
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const cart = JSON.parse(stored) as Cart;
      // Sanitize quantities to fix any legacy floating point issues
      cart.items = cart.items.map(item => {
        let sanitizedQty = item.quantity;
        if (item.salesModel === 'meter') {
          sanitizedQty = Math.round(item.quantity * 10) / 10;
        } else {
          sanitizedQty = Math.max(1, Math.round(item.quantity));
        }
        return { ...item, quantity: sanitizedQty };
      });
      return cart;
    }
  } catch (e) {
    console.error('Failed to parse cart:', e);
  }
  
  return { items: [], market: 'TR', currency: 'TRY' };
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  // Sanitize quantities to prevent floating point precision issues on saving
  cart.items = cart.items.map(item => {
    let sanitizedQty = item.quantity;
    if (item.salesModel === 'meter') {
      sanitizedQty = Math.round(item.quantity * 10) / 10;
    } else {
      sanitizedQty = Math.max(1, Math.round(item.quantity));
    }
    return { ...item, quantity: sanitizedQty };
  });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  
  // Dispatch custom event for cart updates
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
}

export function addToCart(item: CartItem): Cart {
  const cart = getCart();
  
  const existingIndex = cart.items.findIndex(
    i => i.productId === item.productId && i.variantId === item.variantId
  );
  
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  
  saveCart(cart);
  return cart;
}

export function updateCartItem(productId: string, quantity: number, variantId?: string): Cart {
  const cart = getCart();
  
  const index = cart.items.findIndex(
    i => i.productId === productId && i.variantId === variantId
  );
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string, variantId?: string): Cart {
  const cart = getCart();
  
  cart.items = cart.items.filter(
    i => !(i.productId === productId && i.variantId === variantId)
  );
  
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  // Mevcut market bilgisini koru, sadece ürünleri temizle
  const currentCart = getCart();
  saveCart({ 
    items: [], 
    market: currentCart.market, 
    currency: currentCart.currency 
  });
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + (item.salesModel === 'meter' ? 1 : item.quantity), 0);
}

export function setCartMarket(market: 'TR' | 'GLOBAL', currency: string): Cart {
  const cart = getCart();
  cart.market = market;
  cart.currency = currency;
  saveCart(cart);
  return cart;
}
