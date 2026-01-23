import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, Shield, Package, Ruler, Scale, Droplets, Scissors } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';
import ProductPrice from '@/components/store/ProductPrice';
import ProductGallery from '@/components/store/ProductGallery';
import AskQuestionForm from '@/components/store/AskQuestionForm';
import CustomerReviews from '@/components/store/CustomerReviews';
import SwatchRequestForm from '@/components/store/SwatchRequestForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name_tr, name_en, description_tr, description_en, thumbnail_url, images, product_type')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    return {
      title: 'Ürün Bulunamadı',
    };
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  const title = isEnglish ? product.name_en : product.name_tr;
  const description = isEnglish 
    ? (product.description_en || `Shop ${product.name_en} at Grohn Fabrics. Premium quality textiles from Turkey.`)
    : (product.description_tr || `${product.name_tr} - Grohn Fabrics'te premium kalite tekstil ürünleri.`);
  const image = product.thumbnail_url || product.images?.[0] || 'https://grohnfabrics.com/og-image.jpg';

  return {
    title,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description: description.substring(0, 160),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: isEnglish ? 'en_US' : 'tr_TR',
      siteName: 'Grohn Fabrics',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: [image],
    },
    alternates: {
      canonical: `https://grohnfabrics.com/products/${slug}`,
    },
  };
}

async function getProduct(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(name_tr, name_en, slug),
      material:materials(id, name, composition, width_cm, weight_gsm, shrinkage_percent, care_instructions_tr, care_instructions_en),
      prices:product_prices(id, price, currency, market_id),
      option_groups:option_groups(
        id, name_tr, name_en, option_type, is_required,
        values:option_values(id, value_tr, value_en, hex_color, price_modifier, is_available)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Product fetch error:', error);
  }

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
  // Admin can override via admin_region_override cookie
  const adminOverride = cookieStore.get('admin_region_override')?.value;
  const region = adminOverride || cookieStore.get('region')?.value || 'TR';
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
  const baseCurrency = currentPrice?.currency || (region === 'TR' ? 'TRY' : 'USD');
  
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
          {/* Images & Videos Gallery */}
          <ProductGallery 
            images={product.images || []}
            videos={product.videos || []}
            productName={isEnglish ? product.name_en : product.name_tr}
          />

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
              baseCurrency={baseCurrency}
              locale={locale}
            />

            {/* Swatch Request - Only for fabric products */}
            {product.product_type === 'fabric' && (
              <div className="mt-6">
                <SwatchRequestForm 
                  productId={product.id}
                  productName={isEnglish ? (product.name_en || product.name_tr) : product.name_tr}
                  productImage={product.thumbnail_url || product.images?.[0]}
                  colorOptions={
                    optionGroups
                      .filter((g: { option_type: string }) => g.option_type === 'color')
                      .flatMap((g: { values: Array<{ id: string; value_tr: string; value_en: string; hex_color?: string; is_available: boolean }> }) => 
                        g.values
                          .filter((v: { is_available: boolean }) => v.is_available)
                          .map((v: { id: string; value_tr: string; value_en: string; hex_color?: string }) => ({
                            id: v.id,
                            name: isEnglish ? v.value_en : v.value_tr,
                            hex: v.hex_color,
                          }))
                      )
                  }
                />
              </div>
            )}

            {/* Ask a Question */}
            <div className="mt-6">
              <AskQuestionForm 
                productId={product.id} 
                productName={isEnglish ? (product.name_en || product.name_tr) : product.name_tr} 
              />
            </div>

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

            {/* Technical Specifications */}
            {material && (
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold mb-4">{t('Teknik Özellikler', 'Technical Specifications')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {material.composition && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">{t('Kompozisyon', 'Composition')}</p>
                        <p className="text-sm font-medium">{material.composition}</p>
                      </div>
                    </div>
                  )}
                  {material.width_cm && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                        <Ruler className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">{t('Kumaş Eni', 'Fabric Width')}</p>
                        <p className="text-sm font-medium">{material.width_cm} cm</p>
                      </div>
                    </div>
                  )}
                  {material.weight_gsm && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">{t('Gramaj', 'Weight')}</p>
                        <p className="text-sm font-medium">{material.weight_gsm} GSM</p>
                      </div>
                    </div>
                  )}
                  {material.shrinkage_percent && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">{t('Çekme Oranı', 'Shrinkage')}</p>
                        <p className="text-sm font-medium">%{material.shrinkage_percent}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Care Instructions */}
                {(isEnglish ? material.care_instructions_en : material.care_instructions_tr) && (
                  <div className="mt-4 p-4 bg-[var(--background-secondary)] rounded-xl">
                    <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('Bakım Talimatları', 'Care Instructions')}</p>
                    <p className="text-sm">{isEnglish ? material.care_instructions_en : material.care_instructions_tr}</p>
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

      {/* Customer Reviews Section */}
      <CustomerReviews 
        category={product.product_type === 'fabric' ? 'fabric' : 'curtain'}
        showEtsyLink={true}
      />
    </div>
  );
}
