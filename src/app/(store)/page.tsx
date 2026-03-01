import Link from 'next/link';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArrowRight, Truck, Shield, Leaf, Sparkles, Package, Recycle, Heart } from 'lucide-react';
import NewsletterForm from '@/components/store/NewsletterForm';
import CustomerReviews from '@/components/store/CustomerReviews';
import BeforeAfterSlider from '@/components/store/BeforeAfterSlider';
import WhyChooseUs from '@/components/store/WhyChooseUs';
import SupportHub from '@/components/store/SupportHub';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Generate metadata based on locale
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish
      ? 'Grohn Fabrics - Premium Textiles & Home Decor'
      : 'Grohn Fabrics - Premium Kumaş & Ev Tekstili',
    description: isEnglish
      ? 'Shop premium quality fabrics, curtains, and home textiles. Natural fibers, sustainable production, handcrafted in Turkey. Free worldwide shipping.'
      : 'Premium kalite kumaş, perde ve ev tekstili. Doğal lifler, sürdürülebilir üretim, Türkiye\'den el işçiliği. Dünya genelinde ücretsiz kargo.',
    openGraph: {
      title: isEnglish
        ? 'Grohn Fabrics - Premium Textiles & Home Decor'
        : 'Grohn Fabrics - Premium Kumaş & Ev Tekstili',
      description: isEnglish
        ? 'Shop premium quality fabrics, curtains, and home textiles from Turkey.'
        : 'Premium kalite kumaş, perde ve ev tekstili. Türkiye\'den.',
      images: [{ url: 'https://grohnfabrics.com/og-image.jpg', width: 1200, height: 630 }],
      type: 'website',
      locale: isEnglish ? 'en_US' : 'tr_TR',
      siteName: 'Grohn Fabrics',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Grohn Fabrics',
      description: isEnglish
        ? 'Premium textiles from Turkey'
        : 'Türkiye\'den premium tekstil',
    },
    alternates: {
      canonical: 'https://grohnfabrics.com',
    },
  };
}

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

  const [featuredProducts, categories, homepageImagesRes] = await Promise.all([
    getFeaturedProducts(region),
    getCategories(),
    supabaseAdmin.from('site_settings').select('value').eq('key', 'homepage_images').single(),
  ]);

  const homepageImages = homepageImagesRes.data?.value as { before_after_before?: string; before_after_after?: string } | null;

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
      {/* Hero Section - Full Bleed Cinematic */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Full-bleed background image */}
        <img
          src="/images/hero-main.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay: strong on left where text sits over bright windows */}
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full container flex flex-col justify-end pb-16 md:pb-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-white/20 text-white rounded-full border border-white/25 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              {t('Doğal & Premium Tekstil', 'Natural & Premium Textiles')}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-6 tracking-tight text-white drop-shadow-lg">
              {t('Doğanın Dokusu', "Nature's Texture")}
              <span className="block font-bold">{t('Evinizde', 'In Your Home')}</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-lg leading-relaxed font-light drop-shadow-md">
              {t(
                '%100 organik pamuk ve keten liflerden, OEKO-TEX® sertifikalı perdeler. El yapımı, özel ölçü.',
                '100% organic cotton & linen curtains, OEKO-TEX® certified. Handcrafted, custom sizes.'
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium bg-white text-[#2B2B2B] rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
                {t('Koleksiyonu Keşfet', 'Explore Collection')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/measurement-tool" className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium bg-white/90 text-[#2B2B2B] rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {t('Ölçü Hesapla', 'Calculate Size')}
              </Link>
            </div>
          </div>

          {/* Trust strip at bottom */}
          <div className="mt-12 flex flex-wrap gap-6 md:gap-10">
            {[
              { icon: <Leaf className="w-4 h-4" />, text: t('%100 Doğal Lifler', '100% Natural Fibers') },
              { icon: <Shield className="w-4 h-4" />, text: t('OEKO-TEX® Sertifikalı', 'OEKO-TEX® Certified') },
              { icon: <Truck className="w-4 h-4" />, text: t('Ücretsiz Kargo', 'Free Shipping') },
              { icon: <Recycle className="w-4 h-4" />, text: t('Sürdürülebilir Üretim', 'Sustainable Production') },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
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
              { name: t('Pamuk-Keten Perdeler', 'Cotton Linen Curtains'), slug: 'pamuk-keten-perde', description: t('%70 Pamuk, %30 Keten · 145 GSM', '70% Cotton, 30% Linen · 145 GSM'), image: '/images/products/category-cotton-linen.png' },
              { name: t('Müslin Perdeler', 'Muslin Curtains'), slug: 'muslin-perde', description: t('%100 Organik Pamuk · 120 GSM', '100% Organic Cotton · 120 GSM'), image: '/images/products/category-muslin.png' },
              { name: t('Masa Örtüleri', 'Tablecloths'), slug: 'masa-ortusu', description: t('Dikdörtgen, Kare & Yuvarlak', 'Rectangular, Square & Round'), image: '/images/products/category-tablecloth.png' },
            ].map((category) => (
              <Link
                href={`/products?category=${category.slug}`}
                key={category.slug}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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

      {/* Before / After Slider */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full">
              {t('Dönüşüm', 'Transformation')}
            </span>
            <h2 className="text-3xl font-light mb-4">{t('Perdeyi Çek, Odayı Dönüştür', 'Pull the Drapes, Transform the Room')}</h2>
            <p className="text-[var(--foreground-muted)] max-w-lg mx-auto">
              {t(
                'Bir perdenin farkını kendiniz görün. Sürükleyerek karşılaştırın.',
                'See the difference a curtain makes. Drag to compare.'
              )}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <BeforeAfterSlider
              beforeLabel={t('ÖNCE', 'BEFORE')}
              afterLabel={t('SONRA', 'AFTER')}
              beforeImage={homepageImages?.before_after_before || null}
              afterImage={homepageImages?.before_after_after || null}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us - Comparison Table */}
      <WhyChooseUs locale={locale} />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* All-in-One Support Hub */}
      <SupportHub locale={locale} />

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
