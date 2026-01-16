import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { Truck, Clock, Globe, Package } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Shipping & Delivery' : 'Kargo ve Teslimat',
    description: isEnglish 
      ? 'Grohn Fabrics shipping information - worldwide delivery via UPS.'
      : 'Grohn Fabrics kargo bilgileri - UPS ile dünya genelinde teslimat.',
  };
}

export default async function ShippingPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  const t = (tr: string, en: string) => isEnglish ? en : tr;

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-center mb-4">
          {t('Kargo ve Teslimat', 'Shipping & Delivery')}
        </h1>
        <p className="text-center text-[var(--foreground-muted)] mb-12 max-w-2xl mx-auto">
          {t(
            'Türkiye\'den dünyaya UPS ile güvenli ve hızlı teslimat.',
            'Safe and fast delivery from Turkey to the world via UPS.'
          )}
        </p>

        {/* Shipping Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
            <div className="w-12 h-12 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('Türkiye İçi', 'Domestic (Turkey)')}</h3>
            <p className="text-[var(--foreground-muted)] text-sm mb-4">
              {t('UPS ile 3-5 iş günü teslimat', 'Delivery in 3-5 business days via UPS')}
            </p>
            <p className="text-2xl font-semibold text-[var(--brand-primary)]">
              {t('₺99\'dan başlayan fiyatlarla', 'Starting from ₺99')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
            <div className="w-12 h-12 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('Uluslararası', 'International')}</h3>
            <p className="text-[var(--foreground-muted)] text-sm mb-4">
              {t('UPS Worldwide ile 7-14 iş günü', '7-14 business days via UPS Worldwide')}
            </p>
            <p className="text-2xl font-semibold text-[var(--brand-primary)]">
              {t('$15\'dan başlayan fiyatlarla', 'Starting from $15')}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <Clock className="w-8 h-8 mx-auto text-[var(--brand-primary)] mb-3" />
            <h4 className="font-medium mb-2">{t('Hızlı İşleme', 'Fast Processing')}</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t('Siparişler 1-2 iş günü içinde hazırlanır', 'Orders are prepared within 1-2 business days')}
            </p>
          </div>
          <div className="text-center p-6">
            <Package className="w-8 h-8 mx-auto text-[var(--brand-primary)] mb-3" />
            <h4 className="font-medium mb-2">{t('Takip Numarası', 'Tracking Number')}</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t('Kargo verildikten sonra takip numarası e-posta ile gönderilir', 'Tracking number is sent via email after shipment')}
            </p>
          </div>
          <div className="text-center p-6">
            <Truck className="w-8 h-8 mx-auto text-[var(--brand-primary)] mb-3" />
            <h4 className="font-medium mb-2">{t('Güvenli Paketleme', 'Secure Packaging')}</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t('Ürünler özenle paketlenir ve koruma altında gönderilir', 'Products are carefully packed and sent protected')}
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="prose prose-lg max-w-none">
          <h2>{t('Sık Sorulan Sorular', 'Frequently Asked Questions')}</h2>
          
          <h3>{t('Siparişim ne zaman kargoya verilir?', 'When will my order be shipped?')}</h3>
          <p>
            {t(
              'Siparişler genellikle 1-2 iş günü içinde hazırlanır ve kargoya verilir. Özel üretim ürünler için bu süre 5-7 iş günü olabilir.',
              'Orders are usually prepared and shipped within 1-2 business days. For custom-made products, this may take 5-7 business days.'
            )}
          </p>

          <h3>{t('Kargom nerede? Nasıl takip ederim?', 'Where is my order? How do I track it?')}</h3>
          <p>
            {t(
              'Siparişiniz kargoya verildiğinde size bir takip numarası içeren e-posta gönderilir. Bu numarayla ups.com üzerinden kargonuzu takip edebilirsiniz.',
              'When your order is shipped, you will receive an email with a tracking number. You can track your shipment at ups.com using this number.'
            )}
          </p>

          <h3>{t('Hangi ülkelere gönderim yapıyorsunuz?', 'Which countries do you ship to?')}</h3>
          <p>
            {t(
              'UPS\'in hizmet verdiği tüm ülkelere gönderim yapıyoruz. Başlıca: ABD, Kanada, Almanya, İngiltere, Fransa, Hollanda, Avustralya ve daha fazlası.',
              'We ship to all countries served by UPS. Including: USA, Canada, Germany, UK, France, Netherlands, Australia and more.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
