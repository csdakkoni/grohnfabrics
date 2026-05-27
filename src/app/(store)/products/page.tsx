import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Collection' : 'Koleksiyon',
    description: isEnglish
      ? 'Browse our premium collection of fabrics, curtains, and home textiles. Natural materials, sustainable production.'
      : 'Premium kumaş, perde ve ev tekstili koleksiyonumuzu keşfedin. Doğal materyaller, sürdürülebilir üretim.',
    openGraph: {
      title: isEnglish ? 'Collection | Grohn Fabrics' : 'Koleksiyon | Grohn Fabrics',
      description: isEnglish
        ? 'Premium fabrics and home textiles from Turkey'
        : 'Türkiye\'den premium kumaş ve ev tekstili',
      type: 'website',
      locale: isEnglish ? 'en_US' : 'tr_TR',
    },
  };
}

interface SearchParams {
  type?: string;
  category?: string;
}

async function getProducts(searchParams: SearchParams, region: string) {
  let query = supabaseAdmin
    .from('products')
    .select(`
      id,
      slug,
      name_tr,
      name_en,
      product_type,
      sales_model,
      thumbnail_url,
      images,
      prices:product_prices(price, currency, market_id)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Filter by region visibility
  if (region === 'TR') {
    query = query.eq('show_in_tr', true);
  } else {
    query = query.eq('show_in_global', true);
  }

  if (searchParams.type) {
    query = query.eq('product_type', searchParams.type);
  }

  if (searchParams.category) {
    const { data: categoryData } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .maybeSingle();

    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    } else {
      return [];
    }
  }

  const { data } = await query;
  return data || [];
}

async function getCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name_tr, name_en')
    .eq('is_active', true)
    .order('sort_order');
  return data || [];
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Get region and locale from cookies
  // Admin can override via admin_region_override cookie
  const cookieStore = await cookies();
  const adminOverride = cookieStore.get('admin_region_override')?.value;
  const region = adminOverride || cookieStore.get('region')?.value || 'TR';
  const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
  const isEnglish = locale === 'en';
  
  const [products, categories] = await Promise.all([
    getProducts(params, region),
    getCategories(),
  ]);

  // Helper for localized text
  const t = (tr: string, en: string) => isEnglish ? en : tr;

  const typeLabels: Record<string, { tr: string; en: string }> = {
    fabric: { tr: 'Kumaşlar', en: 'Fabrics' },
    pillow: { tr: 'Yastık Kılıfları', en: 'Pillow Covers' },
    curtain: { tr: 'Perdeler', en: 'Curtains' },
    tablecloth: { tr: 'Masa Örtüleri', en: 'Tablecloths' },
    runner: { tr: 'Runner', en: 'Runners' },
  };

  const getTypeLabel = (type: string) => {
    const label = typeLabels[type];
    return label ? (isEnglish ? label.en : label.tr) : type;
  };

  const activeCategory = categories.find((c) => c.slug === params.category);

  const getDynamicTitle = () => {
    if (activeCategory) {
      return isEnglish ? activeCategory.name_en : activeCategory.name_tr;
    }
    if (params.type) {
      return getTypeLabel(params.type);
    }
    return t('Tüm Ürünler', 'All Products');
  };

  const currentType = getDynamicTitle();

  // Get currency symbol based on region
  const currencySymbol = region === 'TR' ? '₺' : '$';

  return (
    <div>
      {/* Hero */}
      <div className="bg-[var(--background-secondary)] py-12">
        <div className="container">
          <h1 className="text-3xl font-light">{currentType}</h1>
          <p className="text-[var(--foreground-muted)] mt-2">
            {products.length} {t('ürün bulundu', 'products found')}
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex gap-12">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-4">{t('Kategoriler', 'Categories')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/products"
                    className={`text-sm ${(!params.type && !params.category) ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                  >
                    {t('Tüm Ürünler', 'All Products')}
                  </Link>
                </li>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <li key={key}>
                    <Link 
                      href={`/products?type=${key}`}
                      className={`text-sm ${params.type === key ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                      {isEnglish ? label.en : label.tr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-4">{t('Koleksiyonlar', 'Collections')}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/products"
                      className={`text-sm ${!params.category ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                      {t('Tüm Koleksiyonlar', 'All Collections')}
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link 
                        href={`/products?category=${cat.slug}`}
                        className={`text-sm ${params.category === cat.slug ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                      >
                        {isEnglish ? cat.name_en : cat.name_tr}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const prices = product.prices || [];
                  // Get price for current REGION
                  const regionPrice = prices.find((p: { market_id: string }) => p.market_id === region);
                  const imageUrl = product.thumbnail_url || product.images?.[0];
                  const productName = isEnglish ? product.name_en : product.name_tr;
                  
                  return (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.slug}`}
                      className="group"
                    >
                      <div className="product-card">
                        <div className="product-card-image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="w-full h-full object-cover"
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
                          <div className="flex items-baseline gap-2">
                            {regionPrice && (
                              <span className="product-card-price">
                                {currencySymbol}{regionPrice.price.toLocaleString()}
                                {product.sales_model === 'meter' && (
                                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                                    /{t('m', 'm')}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-[var(--foreground-light)] mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('Ürün bulunamadı', 'No products found')}</h3>
                <p className="text-[var(--foreground-muted)]">
                  {t('Bu kategoride henüz ürün bulunmuyor.', 'No products in this category yet.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
