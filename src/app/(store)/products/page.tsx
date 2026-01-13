import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  type?: string;
  category?: string;
}

async function getProducts(searchParams: SearchParams) {
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
    .eq('show_in_tr', true)
    .order('created_at', { ascending: false });

  if (searchParams.type) {
    query = query.eq('product_type', searchParams.type);
  }

  const { data } = await query;
  return data || [];
}

async function getCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name_tr')
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
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const typeLabels: Record<string, string> = {
    fabric: 'Kumaşlar',
    pillow: 'Yastık Kılıfları',
    curtain: 'Perdeler',
    tablecloth: 'Masa Örtüleri',
    runner: 'Runner',
  };

  const currentType = params.type ? typeLabels[params.type] : 'Tüm Ürünler';

  return (
    <div>
      {/* Hero */}
      <div className="bg-[var(--background-secondary)] py-12">
        <div className="container">
          <h1 className="text-3xl font-light">{currentType}</h1>
          <p className="text-[var(--foreground-muted)] mt-2">
            {products.length} ürün bulundu
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex gap-12">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-4">Kategoriler</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/products"
                    className={`text-sm ${!params.type ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                  >
                    Tüm Ürünler
                  </Link>
                </li>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <li key={key}>
                    <Link 
                      href={`/products?type=${key}`}
                      className={`text-sm ${params.type === key ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-4">Koleksiyonlar</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link 
                        href={`/products?category=${cat.slug}`}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      >
                        {cat.name_tr}
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
                  const trPrice = prices.find((p: { market_id: string }) => p.market_id === 'TR');
                  const imageUrl = product.thumbnail_url || product.images?.[0];
                  
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
                              alt={product.name_tr}
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
                            {typeLabels[product.product_type]}
                          </p>
                          <h3 className="product-card-title">{product.name_tr}</h3>
                          <div className="flex items-baseline gap-2">
                            {trPrice && (
                              <span className="product-card-price">
                                ₺{trPrice.price}
                                {product.sales_model === 'meter' && <span className="text-sm font-normal text-[var(--foreground-muted)]">/m</span>}
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
                <h3 className="text-lg font-medium mb-2">Ürün bulunamadı</h3>
                <p className="text-[var(--foreground-muted)]">
                  Bu kategoride henüz ürün bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
