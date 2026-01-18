'use client';

import { useWishlist } from '@/components/store/WishlistProvider';
import { useMarket } from '@/lib/market/context';
import Link from 'next/link';
import { Heart, Package, ArrowRight, X, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/components/store/CartProvider';

export default function FavoritesPage() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { t, region, locale } = useMarket();
  const { addToCart } = useCart();
  const isEnglish = locale === 'en';
  const currencySymbol = region === 'TR' ? '₺' : '$';

  const typeLabels: Record<string, { tr: string; en: string }> = {
    fabric: { tr: 'Kumaş', en: 'Fabric' },
    curtain: { tr: 'Perde', en: 'Curtain' },
    pillow: { tr: 'Ev Tekstili', en: 'Home Textile' },
  };

  const getTypeLabel = (type: string) => {
    const label = typeLabels[type];
    return label ? (isEnglish ? label.en : label.tr) : type;
  };

  const handleAddToCart = (item: typeof items[0]) => {
    const product = item.product;
    const price = product.prices?.find(p => p.market_id === region);
    
    if (!price) return;

    addToCart({
      productId: product.id,
      name: isEnglish ? (product.name_en || product.name_tr) : product.name_tr,
      price: price.price,
      quantity: product.sales_model === 'meter' ? 1 : 1,
      image: product.thumbnail_url || product.images?.[0],
      salesModel: product.sales_model,
    });
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-6 h-6 text-[var(--error)]" fill="currentColor" />
          <h1 className="text-2xl md:text-3xl font-light">
            {t('Favorilerim', 'My Favorites')}
          </h1>
        </div>
        <p className="text-[var(--foreground-muted)]">
          {items.length > 0 
            ? t(`${items.length} ürün favorilerde`, `${items.length} items in favorites`)
            : t('Henüz favori ürününüz yok', 'You have no favorites yet')
          }
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            const price = product.prices?.find(p => p.market_id === region);
            const imageUrl = product.thumbnail_url || product.images?.[0];
            const productName = isEnglish ? (product.name_en || product.name_tr) : product.name_tr;

            return (
              <div 
                key={item.id}
                className="product-card group relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error-light)]"
                  title={t('Favorilerden çıkar', 'Remove from favorites')}
                >
                  <X className="w-4 h-4 text-[var(--foreground-muted)] hover:text-[var(--error)]" />
                </button>

                <Link href={`/products/${product.slug}`}>
                  <div className="product-card-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)]">
                        <Package className="w-12 h-12 text-[var(--foreground-light)]" />
                      </div>
                    )}
                  </div>
                  <div className="product-card-body">
                    <p className="product-card-category">
                      {getTypeLabel(product.product_type)}
                    </p>
                    <h3 className="product-card-title">{productName}</h3>
                    {price && (
                      <span className="product-card-price">
                        {currencySymbol}{price.price.toLocaleString()}
                        {product.sales_model === 'meter' && (
                          <span className="text-sm font-normal text-[var(--foreground-muted)]">/{t('m', 'm')}</span>
                        )}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Add to cart button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!price}
                    className="btn btn-primary btn-sm w-full"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t('Sepete Ekle', 'Add to Cart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">
              {t('Favorileriniz boş', 'Your favorites are empty')}
            </h3>
            <p className="empty-state-description">
              {t(
                'Beğendiğiniz ürünleri favorilere ekleyerek kolayca takip edebilirsiniz.',
                'Add products you like to favorites to easily track them.'
              )}
            </p>
            <Link href="/products" className="btn btn-primary mt-6">
              {t('Ürünleri Keşfet', 'Explore Products')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
