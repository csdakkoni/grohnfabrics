'use client';

import { useCart } from './CartProvider';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMarket } from '@/lib/market/context';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, total, itemCount } = useCart();
  const { t } = useMarket();

  // Currency symbol based on cart currency
  const currencySymbol = cart.currency === 'TRY' ? '₺' : cart.currency === 'EUR' ? '€' : '$';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{t('Sepet', 'Cart')}</h2>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--brand-primary)] text-white rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-[var(--background-secondary)] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[var(--foreground-light)] mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('Sepetiniz boş', 'Your cart is empty')}</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-6">
                {t('Alışverişe başlamak için ürünlere göz atın.', 'Browse products to start shopping.')}
              </p>
              <button onClick={closeCart} className="btn btn-primary">
                {t('Alışverişe Başla', 'Start Shopping')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.variantId || ''}`} className="flex gap-4 p-4 bg-[var(--background-secondary)] rounded-xl">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-white overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-[var(--foreground-light)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                        {Object.values(item.options).join(' / ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[var(--brand-primary)] mt-1">
                      {currencySymbol}{item.price}
                      {item.salesModel === 'meter' && <span className="font-normal text-[var(--foreground-muted)]">/m</span>}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-[var(--border)] rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - (item.salesModel === 'meter' ? 0.5 : 1), item.variantId)}
                          className="p-1.5 hover:bg-[var(--background-secondary)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm">
                          {item.salesModel === 'meter' ? item.quantity.toFixed(1) : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + (item.salesModel === 'meter' ? 0.5 : 1), item.variantId)}
                          className="p-1.5 hover:bg-[var(--background-secondary)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1.5 text-[var(--error)] hover:bg-[var(--error-light)] rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-[var(--border)] p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-lg">
              <span className="text-[var(--foreground-muted)]">{t('Ara Toplam', 'Subtotal')}</span>
              <span className="font-semibold">{currencySymbol}{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              {t('Kargo ücreti checkout\'ta hesaplanacaktır.', 'Shipping will be calculated at checkout.')}
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Link 
                href="/checkout"
                onClick={closeCart}
                className="btn btn-primary w-full"
              >
                {t('Ödemeye Geç', 'Proceed to Checkout')}
              </Link>
              <button
                onClick={closeCart}
                className="btn btn-secondary w-full"
              >
                {t('Alışverişe Devam Et', 'Continue Shopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
