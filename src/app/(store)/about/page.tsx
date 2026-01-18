import { cookies } from 'next/headers';
import { Leaf, Heart, Recycle, Globe, Award, Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish 
      ? 'Our Story - Grohn Fabrics'
      : 'Hikayemiz - Grohn Fabrics',
    description: isEnglish
      ? 'Discover the story behind Grohn Fabrics. Premium natural textiles, sustainable production, handcrafted with love in Turkey.'
      : 'Grohn Fabrics\'in hikayesini keşfedin. Premium doğal tekstil, sürdürülebilir üretim, Türkiye\'de sevgiyle el işçiliği.',
    openGraph: {
      title: isEnglish ? 'Our Story - Grohn Fabrics' : 'Hikayemiz - Grohn Fabrics',
      description: isEnglish
        ? 'Premium natural textiles, handcrafted in Turkey'
        : 'Premium doğal tekstil, Türkiye\'de el işçiliği',
    },
  };
}

export default async function AboutPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
  const isEnglish = locale === 'en';

  const t = (tr: string, en: string) => isEnglish ? en : tr;

  const values = [
    {
      icon: Leaf,
      title: t('Doğal Materyaller', 'Natural Materials'),
      description: t(
        'Sadece %100 doğal lifler kullanıyoruz. Keten, pamuk, yün ve ipek gibi nefes alan, cilde dost malzemeler tercih ediyoruz.',
        'We only use 100% natural fibers. We prefer breathable, skin-friendly materials like linen, cotton, wool and silk.'
      ),
    },
    {
      icon: Recycle,
      title: t('Sürdürülebilir Üretim', 'Sustainable Production'),
      description: t(
        'Çevreye duyarlı üretim süreçleri, minimum atık politikası ve geri dönüştürülebilir ambalaj kullanıyoruz.',
        'We use environmentally conscious production processes, minimum waste policy and recyclable packaging.'
      ),
    },
    {
      icon: Heart,
      title: t('Usta İşçiliği', 'Master Craftsmanship'),
      description: t(
        'Nesillerdir aktarılan zanaat bilgisiyle, her ürünümüz deneyimli ustaların elinden çıkıyor.',
        'With craft knowledge passed down through generations, every product comes from the hands of experienced artisans.'
      ),
    },
    {
      icon: Globe,
      title: t('Küresel Standartlar', 'Global Standards'),
      description: t(
        'Uluslararası kalite standartlarına uygun üretim yapıyor, dünya genelinde müşterilerimize ulaşıyoruz.',
        'We produce according to international quality standards and reach our customers worldwide.'
      ),
    },
  ];

  const milestones = [
    { year: '2018', title: t('Kuruluş', 'Foundation'), description: t('Çorlu\'da küçük bir atölyede başladık', 'We started in a small workshop in Çorlu') },
    { year: '2020', title: t('Online Mağaza', 'Online Store'), description: t('E-ticaret platformumuzu başlattık', 'We launched our e-commerce platform') },
    { year: '2022', title: t('Global Pazar', 'Global Market'), description: t('ABD ve Avrupa\'ya ihracata başladık', 'We started exporting to US and Europe') },
    { year: '2024', title: t('Sürdürülebilirlik Sertifikası', 'Sustainability Certificate'), description: t('OEKO-TEX sertifikası aldık', 'We received OEKO-TEX certification') },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F5F0] via-[#F2EFE8] to-[#E8E4DB]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--brand-primary)]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary-dark)] rounded-full border border-[var(--brand-primary)]/20">
              <Sparkles className="w-4 h-4" />
              {t('2018\'den Beri', 'Since 2018')}
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight">
              {t('Doğanın Güzelliğini', 'Weaving the Beauty')}
              <span className="block font-medium text-[var(--brand-primary)]">
                {t('Dokuyoruz', 'of Nature')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed max-w-2xl mx-auto">
              {t(
                'Grohn Fabrics olarak, doğal liflerin eşsiz dokusunu evinize taşıyoruz. Sürdürülebilir üretim anlayışımızla, hem çevreye hem de yaşam alanlarınıza değer katıyoruz.',
                'At Grohn Fabrics, we bring the unique texture of natural fibers to your home. With our sustainable production approach, we add value to both the environment and your living spaces.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent-dark)] rounded-full">
                {t('Hikayemiz', 'Our Story')}
              </span>
              
              <h2 className="text-3xl md:text-4xl font-light mb-6">
                {t('Bir Tutku ile', 'Started with')}
                <span className="font-medium text-[var(--brand-primary)]"> {t('Başladı', 'a Passion')}</span>
              </h2>
              
              <div className="space-y-4 text-[var(--foreground-muted)] leading-relaxed">
                <p>
                  {t(
                    'Grohn Fabrics, 2018 yılında Trakya\'nın verimli topraklarında, küçük bir atölyede doğdu. Kurucumuz, nesillerdir tekstil sektöründe çalışan bir aileden geliyordu ve doğal kumaşların insanların yaşamlarına kattığı değeri yakından biliyordu.',
                    'Grohn Fabrics was born in 2018 in the fertile lands of Thrace, in a small workshop. Our founder came from a family that had been working in the textile industry for generations and knew firsthand the value that natural fabrics add to people\'s lives.'
                  )}
                </p>
                <p>
                  {t(
                    'Amacımız basitti: En kaliteli doğal lifleri kullanarak, hem modern tasarımı hem de geleneksel zanaatı bir araya getiren tekstil ürünleri üretmek. Bugün, Türkiye\'den dünyaya uzanan bir marka haline geldik.',
                    'Our goal was simple: to produce textile products that combine both modern design and traditional craftsmanship using the highest quality natural fibers. Today, we have become a brand that extends from Turkey to the world.'
                  )}
                </p>
                <p>
                  {t(
                    'Her ürünümüz, ustalarımızın yılların deneyimiyle harmanlanmış ellerinden çıkıyor. Doğaya saygılı üretim anlayışımızla, geleceğe iz bırakmadan güzellik sunuyoruz.',
                    'Every product comes from the hands of our artisans, blended with years of experience. With our nature-respecting production approach, we offer beauty without leaving a trace on the future.'
                  )}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] p-1">
                <div className="w-full h-full rounded-[1.4rem] bg-[var(--background-secondary)] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Leaf className="w-20 h-20 mx-auto mb-6 text-[var(--brand-primary)]" />
                    <p className="text-2xl font-light text-[var(--foreground)]">
                      {t('"Doğadan ilham,', '"Inspired by nature,')}
                    </p>
                    <p className="text-2xl font-medium text-[var(--brand-primary)]">
                      {t('doğaya saygı"', 'respect for nature"')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <Award className="w-7 h-7 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--foreground)]">6+</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{t('Yıllık Deneyim', 'Years Experience')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[var(--background-secondary)]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full">
              {t('Değerlerimiz', 'Our Values')}
            </span>
            <h2 className="text-3xl md:text-4xl font-light">
              {t('Bizi Biz', 'What Makes Us')}
              <span className="font-medium text-[var(--brand-primary)]"> {t('Yapan', 'Us')}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mb-6 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg font-medium mb-3">{value.title}</h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent-dark)] rounded-full">
              {t('Yolculuğumuz', 'Our Journey')}
            </span>
            <h2 className="text-3xl md:text-4xl font-light">
              {t('Kilometre', 'Mile')}
              <span className="font-medium text-[var(--brand-primary)]"> {t('Taşları', 'stones')}</span>
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
              
              {milestones.map((milestone, index) => (
                <div key={index} className="relative pl-20 pb-12 last:pb-0">
                  {/* Year badge */}
                  <div className="absolute left-0 w-16 h-16 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-semibold">
                    {milestone.year}
                  </div>
                  
                  <div className="bg-[var(--background-secondary)] rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-2">{milestone.title}</h3>
                    <p className="text-[var(--foreground-muted)]">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team/Stats Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-primary-dark)] to-[#4A6346] text-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light">
              {t('Rakamlarla', 'Grohn in')}
              <span className="font-medium"> {t('Grohn', 'Numbers')}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light mb-2">50+</p>
              <p className="text-white/70">{t('Ürün Çeşidi', 'Product Types')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light mb-2">20+</p>
              <p className="text-white/70">{t('Ülkeye Teslimat', 'Countries Shipped')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light mb-2">5000+</p>
              <p className="text-white/70">{t('Mutlu Müşteri', 'Happy Customers')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light mb-2">100%</p>
              <p className="text-white/70">{t('Doğal Lifler', 'Natural Fibers')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-[var(--brand-primary)]" />
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              {t('Bizimle Çalışın', 'Work With Us')}
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
              {t(
                'Toptan satış, iş ortaklığı veya özel projeler için bizimle iletişime geçin. Birlikte güzel şeyler yaratalım.',
                'Contact us for wholesale, partnership or custom projects. Let\'s create beautiful things together.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact?subject=partnership" className="btn btn-primary btn-lg group">
                {t('İletişime Geçin', 'Get in Touch')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="btn btn-outline btn-lg">
                {t('Koleksiyonu Keşfet', 'Explore Collection')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
