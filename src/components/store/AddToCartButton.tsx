'use client';

import { useState } from 'react';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from './CartProvider';

interface Product {
  id: string;
  name_tr: string;
  name_en?: string;
  sales_model: string;
  min_order_quantity: number;
  order_step: number;
  thumbnail_url?: string;
  images?: string[];
}

interface AddToCartButtonProps {
  product: Product;
  price: number;
  selectedOptions?: Record<string, string>;
  variantId?: string;
}

export default function AddToCartButton({ 
  product, 
  price, 
  selectedOptions,
  variantId 
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  
  const isMeter = product.sales_model === 'meter';
  const minQty = product.min_order_quantity || 1;
  const step = product.order_step || (isMeter ? 0.5 : 1);
  
  const [quantity, setQuantity] = useState(minQty);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const decreaseQty = () => {
    if (quantity > minQty) {
      setQuantity(q => Math.max(minQty, q - step));
    }
  };

  const increaseQty = () => {
    setQuantity(q => q + step);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addToCart({
      productId: product.id,
      variantId,
      name: product.name_tr,
      nameEn: product.name_en,
      image: product.thumbnail_url || product.images?.[0],
      quantity,
      price,
      currency: 'TRY',
      salesModel: product.sales_model as 'meter' | 'unit' | 'preset_sizes',
      options: selectedOptions,
    });
    
    setAdding(false);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(minQty); // Reset quantity
    }, 2000);
  };

  const total = price * quantity;

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Miktar {isMeter ? '(metre)' : '(adet)'}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-[var(--border)] rounded-lg">
            <button
              onClick={decreaseQty}
              disabled={quantity <= minQty}
              className="p-3 hover:bg-[var(--background-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-16 text-center font-medium">
              {isMeter ? quantity.toFixed(1) : quantity}
            </span>
            <button
              onClick={increaseQty}
              className="p-3 hover:bg-[var(--background-secondary)] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Total */}
          <div className="text-lg">
            <span className="text-[var(--foreground-muted)]">=</span>
            <span className="ml-2 font-semibold">₺{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={adding}
        className={`
          w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
          ${added 
            ? 'bg-[var(--success)] text-white' 
            : 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]'
          }
        `}
      >
        {adding ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Ekleniyor...
          </>
        ) : added ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Sepete Eklendi!
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            Sepete Ekle
          </>
        )}
      </button>
    </div>
  );
}
