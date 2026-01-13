import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, Shield, Package } from 'lucide-react';
import AddToCartButton from '@/components/store/AddToCartButton';

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

  const prices = product.prices || [];
  const trPrice = prices.find((p: { market_id: string }) => p.market_id === 'TR');
  const usdPrice = prices.find((p: { market_id: string; currency: string }) => p.market_id === 'GLOBAL' && p.currency === 'USD');
  
  const category = Array.isArray(product.category) ? product.category[0] : product.category;
  const material = Array.isArray(product.material) ? product.material[0] : product.material;
  const optionGroups = product.option_groups || [];

  const typeLabels: Record<string, string> = {
    fabric: 'Kumaş',
    pillow: 'Yastık Kılıfı',
    curtain: 'Perde',
    tablecloth: 'Masa Örtüsü',
    runner: 'Runner',
  };

  const salesModelLabels: Record<string, string> = {
    meter: 'Metre ile satılır',
    unit: 'Adet ile satılır',
    preset_sizes: 'Hazır ölçülerde satılır',
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[var(--background-secondary)] py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
            <Link href="/products" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              Ürünler
            </Link>
            {category && (
              <>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
                <Link 
                  href={`/products?category=${category.slug}`} 
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  {category.name_tr}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-[var(--foreground-light)]" />
            <span className="text-[var(--foreground)]">{product.name_tr}</span>
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
              {typeLabels[product.product_type]}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-light mb-2">{product.name_tr}</h1>
            <p className="text-lg text-[var(--foreground-muted)] mb-6">{product.name_en}</p>

            {/* Price */}
            <div className="mb-8">
              {trPrice && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-[var(--brand-primary)]">
                    ₺{trPrice.price}
                  </span>
                  {product.sales_model === 'meter' && (
                    <span className="text-lg text-[var(--foreground-muted)]">/ metre</span>
                  )}
                </div>
              )}
              {usdPrice && (
                <p className="text-sm text-[var(--foreground-light)] mt-1">
                  Global: ${usdPrice.price} {product.sales_model === 'meter' ? '/ meter' : ''}
                </p>
              )}
            </div>

            {/* Options */}
            {optionGroups.length > 0 && (
              <div className="space-y-6 mb-8">
                {optionGroups.map((group: {
                  id: string;
                  name_tr: string;
                  option_type: string;
                  values?: Array<{
                    id: string;
                    value_tr: string;
                    hex_color?: string;
                    is_available: boolean;
                  }>;
                }) => (
                  <div key={group.id}>
                    <label className="block text-sm font-medium mb-3">{group.name_tr}</label>
                    <div className="flex flex-wrap gap-2">
                      {group.values?.map((value) => (
                        <button
                          key={value.id}
                          disabled={!value.is_available}
                          className={`
                            px-4 py-2 rounded-lg border text-sm transition-colors
                            ${value.is_available 
                              ? 'border-[var(--border)] hover:border-[var(--brand-primary)]' 
                              : 'opacity-50 cursor-not-allowed'
                            }
                          `}
                          style={group.option_type === 'color' && value.hex_color ? {
                            backgroundColor: value.hex_color,
                            width: '2.5rem',
                            height: '2.5rem',
                            padding: 0,
                          } : undefined}
                        >
                          {group.option_type !== 'color' && value.value_tr}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <AddToCartButton 
              product={product}
              price={trPrice?.price || 0}
            />

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Hızlı Kargo</p>
                  <p className="text-xs text-[var(--foreground-muted)]">2-4 iş günü</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Güvenli Ödeme</p>
                  <p className="text-xs text-[var(--foreground-muted)]">256-bit SSL</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description_tr && (
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold mb-4">Ürün Açıklaması</h3>
                <div className="prose prose-sm text-[var(--foreground-muted)]">
                  <p>{product.description_tr}</p>
                </div>
              </div>
            )}

            {/* Material Info */}
            {material && (
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold mb-4">Materyal Bilgisi</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[var(--foreground-muted)]">Materyal</dt>
                    <dd className="font-medium">{material.name}</dd>
                  </div>
                  {material.composition && (
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Kompozisyon</dt>
                      <dd className="font-medium">{material.composition}</dd>
                    </div>
                  )}
                  {material.width_cm && (
                    <div>
                      <dt className="text-[var(--foreground-muted)]">En</dt>
                      <dd className="font-medium">{material.width_cm} cm</dd>
                    </div>
                  )}
                </dl>
                {material.care_instructions_tr && (
                  <div className="mt-4">
                    <dt className="text-[var(--foreground-muted)] text-sm">Bakım Talimatları</dt>
                    <dd className="text-sm mt-1">{material.care_instructions_tr}</dd>
                  </div>
                )}
              </div>
            )}

            {/* Sales Model Info */}
            <div className="mt-8 p-4 bg-[var(--background-secondary)] rounded-xl">
              <p className="text-sm text-[var(--foreground-muted)]">
                <strong>Not:</strong> {salesModelLabels[product.sales_model]}
                {product.sales_model === 'meter' && product.min_order_quantity > 1 && (
                  <span> • Minimum sipariş: {product.min_order_quantity} metre</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
