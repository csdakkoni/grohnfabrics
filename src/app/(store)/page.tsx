import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArrowRight, Truck, Shield, Award, Sparkles, Package } from 'lucide-react';
import NewsletterForm from '@/components/store/NewsletterForm';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  const { data } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      slug,
      name_tr,
      product_type,
      sales_model,
      thumbnail_url,
      images,
      prices:product_prices(price, currency, market_id)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

async function getCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name_tr, image_url')
    .eq('is_active', true)
    .order('sort_order')
    .limit(4);
  return data || [];
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const typeLabels: Record<string, string> = {
    fabric: 'Kumaş',
    curtain: 'Perde',
    pillow: 'Ev Tekstili',
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#F8F6F3] via-[#F5F3F0] to-[#EDE9E3]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[var(--brand-primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-[var(--accent-light)] text-[var(--accent-dark)] rounded-full">
              <Sparkles className="w-4 h-4" />
              Premium Kalite Tekstil
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
              Güzel Mekanlar İçin
              <span className="block font-normal text-[var(--brand-primary)]">Güzel Kumaşlar</span>
            </h1>
            <p className="text-lg text-[var(--foreground-muted)] mb-8 max-w-lg leading-relaxed">
              Premium kumaş, perde ve ev tekstili koleksiyonumuzu keşfedin. 
              Türkiye&apos;den dünyaya kaliteli işçilik.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn btn-primary btn-lg group">
                Koleksiyonu Keşfet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">
                Hikayemiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 bg-white border-b border-[var(--border)]">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground-muted)]">500₺ üzeri ücretsiz kargo</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground-muted)]">Güvenli ödeme</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground-muted)]">Kalite garantisi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-light mb-2">Öne Çıkan Ürünler</h2>
                <p className="text-[var(--foreground-muted)]">En sevilen kumaş ve ev tekstili ürünleri</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-[var(--brand-primary)] hover:underline hidden md:flex items-center gap-1">
                Tümünü Gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
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
                          {typeLabels[product.product_type] || product.product_type}
                        </p>
                        <h3 className="product-card-title">{product.name_tr}</h3>
                        {trPrice && (
                          <span className="product-card-price">
                            ₺{trPrice.price}
                            {product.sales_model === 'meter' && (
                              <span className="text-sm font-normal text-[var(--foreground-muted)]">/m</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/products" className="btn btn-outline">
                Tüm Ürünleri Gör
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-[var(--background-secondary)]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">Kategoriler</h2>
            <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
              Premium kumaş ve ev tekstili koleksiyonlarımızı keşfedin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Kumaşlar', slug: 'fabric', description: 'Premium döşemelik ve dekoratif kumaşlar' },
              { name: 'Perdeler', slug: 'curtain', description: 'Şık ve kaliteli perde koleksiyonu' },
              { name: 'Ev Tekstili', slug: 'pillow', description: 'Yastık kılıfı, runner ve masa örtüleri' },
            ].map((category) => (
              <Link 
                href={`/products?type=${category.slug}`} 
                key={category.slug}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--foreground)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-[var(--brand-primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-medium text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-white/70 mb-3">{category.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-white group-hover:gap-2 transition-all">
                    Keşfet <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--brand-primary-light)] rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3">Premium Kalite</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                Özenle seçilmiş materyaller ve yüksek kalite standartları ile üretim
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--brand-primary-light)] rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3">Dünya Geneli Kargo</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                Türkiye ve tüm dünyaya hızlı ve güvenilir teslimat
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--brand-primary-light)] rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3">Güvenli Alışveriş</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                Güvenli ödeme seçenekleri ve alıcı koruma garantisi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Banner */}
      <section className="py-20 bg-[var(--brand-primary)] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Toptan Satış İçin Bize Ulaşın
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            İşletmeler için rekabetçi toptan fiyatlar sunuyoruz. 
            Toplu siparişler ve özel fiyatlandırma için bizimle iletişime geçin.
          </p>
          <Link href="/contact?subject=wholesale" className="btn bg-white text-[var(--brand-primary)] hover:bg-white/90">
            Toptan Satış İletişim
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[var(--background-secondary)]">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-light mb-3">Bültenimize Katılın</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
              Yeni ürünler, kampanyalar ve özel fırsatlardan haberdar olun.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
