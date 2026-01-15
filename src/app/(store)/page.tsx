import Link from 'next/link';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArrowRight, Truck, Shield, Leaf, Sparkles, Package, Recycle, Heart } from 'lucide-react';
import NewsletterForm from '@/components/store/NewsletterForm';
import CustomerReviews from '@/components/store/CustomerReviews';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(region: string) {
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
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Filter by region visibility
  if (region === 'TR') {
    query = query.eq('show_in_tr', true);
  } else {
    query = query.eq('show_in_global', true);
  }

  const { data } = await query;
  return data || [];
}

async function getCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name_tr, name_en, image_url')
    .eq('is_active', true)
    .order('sort_order')
    .limit(4);
  return data || [];
}

export default async function HomePage() {
  // Get region and locale from cookies
  const cookieStore = await cookies();
  const region = cookieStore.get('region')?.value || 'TR';
  const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
  const isEnglish = locale === 'en';

  // Helper for localized text
  const t = (tr: string, en: string) => isEnglish ? en : tr;

  // Currency based on REGION (not locale)
  const currencySymbol = region === 'TR' ? '₺' : '$';

  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(region),
    getCategories(),
  ]);

  const typeLabels: Record<string, { tr: string; en: string }> = {
    fabric: { tr: 'Kumaş', en: 'Fabric' },
    curtain: { tr: 'Perde', en: 'Curtain' },
    pillow: { tr: 'Ev Tekstili', en: 'Home Textile' },
  };

  const getTypeLabel = (type: string) => {
    const label = typeLabels[type];
    return label ? (isEnglish ? label.en : label.tr) : type;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#F7F5F0] via-[#F2EFE8] to-[#E8E4DB]">
        <div className="absolute inset-0 overflow-hidden">
          {/* Botanical decorative elements */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-[var(--brand-primary)]/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[var(--brand-primary-light)]/5 rounded-full blur-[80px]" />
        </div>
        <div className="container relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary-dark)] rounded-full border border-[var(--brand-primary)]/20">
              <Sparkles className="w-4 h-4" />
              {t('Doğal & Premium Tekstil', 'Natural & Premium Textiles')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight">
              {t('Doğanın Dokusu', "Nature's Texture")}
              <span className="block font-medium text-[var(--brand-primary)]">{t('Evinizde', 'In Your Home')}</span>
            </h1>
            <p className="text-lg text-[var(--foreground-muted)] mb-8 max-w-lg leading-relaxed">
              {t(
                'Doğal liflerden üretilen premium kumaş, perde ve ev tekstili koleksiyonumuzu keşfedin. Sürdürülebilir üretim, zamansız tasarım.',
                'Discover our premium fabric, curtain and home textile collection made from natural fibers. Sustainable production, timeless design.'
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn btn-primary btn-lg group">
                {t('Koleksiyonu Keşfet', 'Explore Collection')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">
                {t('Hikayemiz', 'Our Story')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-5 bg-[var(--brand-primary)]/5 border-y border-[var(--brand-primary)]/10">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2.5 text-sm">
              <Leaf className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground)]">{t('Doğal Lifler', 'Natural Fibers')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Recycle className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground)]">{t('Sürdürülebilir Üretim', 'Sustainable Production')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground)]">{t('Hızlı Teslimat', 'Fast Delivery')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Heart className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-[var(--foreground)]">{t('El İşçiliği', 'Handcrafted')}</span>
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
                <h2 className="text-3xl font-light mb-2">{t('Öne Çıkan Ürünler', 'Featured Products')}</h2>
                <p className="text-[var(--foreground-muted)]">{t('En sevilen kumaş ve ev tekstili ürünleri', 'Most loved fabric and home textile products')}</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-[var(--brand-primary)] hover:underline hidden md:flex items-center gap-1">
                {t('Tümünü Gör', 'View All')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                const prices = product.prices || [];
                // Get price for current REGION (not locale)
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
                        {regionPrice && (
                          <span className="product-card-price">
                            {currencySymbol}{regionPrice.price.toLocaleString()}
                            {product.sales_model === 'meter' && (
                              <span className="text-sm font-normal text-[var(--foreground-muted)]">/{t('m', 'm')}</span>
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
                {t('Tüm Ürünleri Gör', 'View All Products')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-[var(--background-secondary)]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full">
              {t('Koleksiyonlar', 'Collections')}
            </span>
            <h2 className="text-3xl font-light mb-4">{t('Doğadan İlham', 'Inspired by Nature')}</h2>
            <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
              {t('Doğal dokular ve organik tasarımlarla evinize huzur katın', 'Bring peace to your home with natural textures and organic designs')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: t('Kumaşlar', 'Fabrics'), slug: 'fabric', description: t('Keten, pamuk ve doğal lifler', 'Linen, cotton and natural fibers'), bg: 'from-[#7A9B76]' },
              { name: t('Perdeler', 'Curtains'), slug: 'curtain', description: t('Işık ve doğa uyumlu tasarımlar', 'Light and nature-friendly designs'), bg: 'from-[#8BA888]' },
              { name: t('Ev Tekstili', 'Home Textiles'), slug: 'pillow', description: t('Organik yastık ve örtüler', 'Organic pillows and covers'), bg: 'from-[#9CB898]' },
            ].map((category) => (
              <Link 
                href={`/products?type=${category.slug}`} 
                key={category.slug}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${category.bg} to-[#2C3830]`} />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-medium text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-white/70 mb-4">{category.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm text-white/90 font-medium group-hover:gap-3 transition-all">
                    {t('Keşfet', 'Explore')} <ArrowRight className="w-4 h-4" />
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light">{t('Neden Grohn?', 'Why Grohn?')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-primary)]/5 transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('Doğal Materyaller', 'Natural Materials')}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                {t('%100 doğal liflerden üretilen, çevre dostu ve sağlıklı kumaşlar', '100% natural fiber fabrics that are eco-friendly and healthy')}
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-primary)]/5 transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center">
                <Recycle className="w-7 h-7 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('Sürdürülebilir Üretim', 'Sustainable Production')}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                {t('Çevreye duyarlı üretim süreçleri ve geri dönüştürülebilir ambalaj', 'Environmentally conscious production processes and recyclable packaging')}
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-primary)]/5 transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('Usta İşçiliği', 'Master Craftsmanship')}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                {t('Yılların deneyimiyle harmanlanmış geleneksel zanaat ve modern tasarım', 'Traditional craftsmanship blended with years of experience and modern design')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* B2B Banner */}
      <section className="py-20 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-primary-dark)] to-[#4A6346] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium bg-white/10 text-white rounded-full border border-white/20">
            {t('B2B Çözümleri', 'B2B Solutions')}
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            {t('Toptan Satış & İş Ortaklığı', 'Wholesale & Partnership')}
          </h2>
          <p className="text-white/75 mb-8 max-w-lg mx-auto leading-relaxed">
            {t(
              'Otel, restoran ve perakende işletmeleri için özel fiyatlandırma. Doğal ve kaliteli kumaşlarla mekanınızı farklılaştırın.',
              'Special pricing for hotels, restaurants and retail businesses. Differentiate your space with natural and quality fabrics.'
            )}
          </p>
          <Link href="/contact?subject=wholesale" className="btn bg-white text-[var(--brand-primary-dark)] hover:bg-white/95 font-medium">
            {t('İş Ortağı Olun', 'Become a Partner')}
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)]">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <Leaf className="w-8 h-8 mx-auto mb-4 text-[var(--brand-primary)]" />
            <h3 className="text-2xl font-light mb-3">{t('Doğadan Haberler', 'News from Nature')}</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
              {t(
                'Yeni koleksiyonlar, mevsimsel trendler ve özel fırsatlardan ilk siz haberdar olun.',
                'Be the first to know about new collections, seasonal trends and special offers.'
              )}
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
