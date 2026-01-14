import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, Shield, Package } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';
import ProductPrice from '@/components/store/ProductPrice';

export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  const { data } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(name_tr, name_en, slug),
      prices:product_prices(id, price, currency, market_id),
      option_groups:option_groups(
        id, name_tr, name_en, option_type, is_required,
        values:option_values(id, value_tr, value_en, hex_color, price_modifier, is_available)
      ),
      material:materials(name, composition, width_cm, care_instructions_tr)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  return data;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Get region and locale from cookies
  const cookieStore = await cookies();
  
  // Region = IP based, determines price/shipping/payment
  const region = cookieStore.get('region')?.value || 'TR';
  const isGlobal = region === 'GLOBAL';
  
  // Locale = user preference, determines UI language
  const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';

  const prices = product.prices || [];
  
  // Get price for current REGION
  let currentPrice;
  if (region === 'TR') {
    currentPrice = prices.find((p: { market_id: string; currency: string }) => p.market_id === 'TR');
  } else {
    currentPrice = prices.find((p: { market_id: string }) => p.market_id === 'GLOBAL');
  }
  const basePrice = currentPrice?.price || prices[0]?.price || 0;
  
  const category = Array.isArray(product.category) ? product.category[0] : product.category;
  const material = Array.isArray(product.material) ? product.material[0] : product.material;
  const optionGroups = product.option_groups || [];

  // Localized labels
  const typeLabels: Record<string, Record<string, string>> = {
    fabric: { tr: 'Kumaş', en: 'Fabric' },
    pillow: { tr: 'Yastık Kılıfı', en: 'Pillow Cover' },
    curtain: { tr: 'Perde', en: 'Curtain' },
    tablecloth: { tr: 'Masa Örtüsü', en: 'Tablecloth' },
    runner: { tr: 'Runner', en: 'Runner' },
  };

  const salesModelLabels: Record<string, Record<string, string>> = {
    meter: { tr: 'Metre ile satılır', en: 'Sold by meter' },
    unit: { tr: 'Adet ile satılır', en: 'Sold by unit' },
    preset_sizes: { tr: 'Hazır ölçülerde satılır', en: 'Sold in preset sizes' },
  };

  // Helper for localized text - based on LOCALE not region
  const isEnglish = locale === 'en';
  const t = (tr: string, en: string) => isEnglish ? en : tr;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[var(--background-secondary)] py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              {t('Ana Sayfa', 'Home')}
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
            <Link href="/products" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              {t('Ürünler', 'Products')}
            </Link>
            {category && (
              <>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
                <Link 
                  href={`/products?category=${category.slug}`} 
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  {isEnglish ? category.name_en : category.name_tr}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
            <span className="text-[var(--foreground)]">{isEnglish ? product.name_en : product.name_tr}</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--background-secondary)]">
                  <img
                    src={product.images[0]}
                    alt={product.name_tr}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.slice(1, 5).map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[var(--background-secondary)]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center">
                <Package className="w-24 h-24 text-[var(--foreground-light)]" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Type Badge */}
            <span className="inline-block px-3 py-1 text-xs font-medium bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded-full mb-4">
              {typeLabels[product.product_type]?.[locale] || product.product_type}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-light mb-2">
              {isEnglish ? product.name_en : product.name_tr}
            </h1>
            {/* Show alternate language name as subtitle */}
            {!isEnglish && product.name_en && (
              <p className="text-lg text-[var(--foreground-muted)] mb-6">{product.name_en}</p>
            )}
            {isEnglish && product.name_tr && (
              <p className="text-lg text-[var(--foreground-muted)] mb-6">{product.name_tr}</p>
            )}

            {/* Price - Market-specific */}
            <div className="mb-8">
              <ProductPrice 
                prices={prices} 
                salesModel={product.sales_model}
                size="lg"
              />
            </div>

            {/* Options & Add to Cart - Client Component */}
            <ProductDetailClient 
              product={product}
              optionGroups={optionGroups}
              basePrice={basePrice}
              locale={locale}
            />

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('Hızlı Kargo', 'Fast Shipping')}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('2-4 iş günü', '2-4 business days')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('Güvenli Ödeme', 'Secure Payment')}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">256-bit SSL</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {(isEnglish ? product.description_en : product.description_tr) && (
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold mb-4">{t('Ürün Açıklaması', 'Product Description')}</h3>
                <div className="prose prose-sm text-[var(--foreground-muted)]">
                  <p>{isEnglish ? product.description_en : product.description_tr}</p>
                </div>
              </div>
            )}

            {/* Material Info */}
            {material && (
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold mb-4">{t('Materyal Bilgisi', 'Material Info')}</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[var(--foreground-muted)]">{t('Materyal', 'Material')}</dt>
                    <dd className="font-medium">{material.name}</dd>
                  </div>
                  {material.composition && (
                    <div>
                      <dt className="text-[var(--foreground-muted)]">{t('Kompozisyon', 'Composition')}</dt>
                      <dd className="font-medium">{material.composition}</dd>
                    </div>
                  )}
                  {material.width_cm && (
                    <div>
                      <dt className="text-[var(--foreground-muted)]">{t('En', 'Width')}</dt>
                      <dd className="font-medium">{material.width_cm} cm</dd>
                    </div>
                  )}
                </dl>
                {(isEnglish ? material.care_instructions_en : material.care_instructions_tr) && (
                  <div className="mt-4">
                    <dt className="text-[var(--foreground-muted)] text-sm">{t('Bakım Talimatları', 'Care Instructions')}</dt>
                    <dd className="text-sm mt-1">{isEnglish ? material.care_instructions_en : material.care_instructions_tr}</dd>
                  </div>
                )}
              </div>
            )}

            {/* Sales Model Info */}
            <div className="mt-8 p-4 bg-[var(--background-secondary)] rounded-xl">
              <p className="text-sm text-[var(--foreground-muted)]">
                <strong>{t('Not', 'Note')}:</strong> {salesModelLabels[product.sales_model]?.[locale]}
                {product.sales_model === 'meter' && product.min_order_quantity > 1 && (
                  <span> • {t('Minimum sipariş', 'Minimum order')}: {product.min_order_quantity} {t('metre', 'meters')}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
