'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

export default function CartButton() {
  const { openCart, itemCount } = useCart();

  return (
    <button 
      onClick={openCart}
      className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary-dark)] transition-colors relative"
    >
      <ShoppingBag className="w-4 h-4" />
      <span className="text-sm font-medium">Sepet</span>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
