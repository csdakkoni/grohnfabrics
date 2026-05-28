import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Terms of Service' : 'Kullanım Koşulları',
    description: isEnglish 
      ? 'Grohn Fabrics terms of service - rules and guidelines for using our website.'
      : 'Grohn Fabrics kullanım koşulları - web sitemizi kullanma kuralları ve yönergeleri.',
  };
}

export default async function TermsPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>{isEnglish ? 'Terms of Service' : 'Kullanım Koşulları'}</h1>
        <p className="text-[var(--foreground-muted)]">
          {isEnglish ? 'Last updated: January 2026' : 'Son güncelleme: Ocak 2026'}
        </p>

        {isEnglish ? (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using grohnfabrics.com, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>

            <h2>2. Use of Website</h2>
            <p>You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the website.</p>

            <h2>3. Product Information</h2>
            <p>We strive to provide accurate product information. However, we do not warrant that product descriptions, images, or other content is accurate, complete, or error-free. Colors may vary slightly due to screen settings.</p>

            <h2>4. Pricing and Availability</h2>
            <p>All prices are subject to change without notice. We reserve the right to discontinue any product at any time. We are not liable for pricing errors and reserve the right to cancel orders affected by such errors.</p>

            <h2>5. Orders and Payment</h2>
            <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or reject any order. Payment must be received before order processing begins.</p>

            <h2>6. Intellectual Property</h2>
            <p>All content on this website, including text, images, logos, and designs, is the property of Grohn Fabrics and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>

            <h2>7. Limitation of Liability</h2>
            <p>Grohn Fabrics shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.</p>

            <h2>8. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of Turkey/United States, depending on your location.</p>

            <h2>9. Contact</h2>
            <p>For questions about these terms: grohn@grohn.com.tr</p>
          </>
        ) : (
          <>
            <h2>1. Koşulların Kabulü</h2>
            <p>grohnfabrics.com'a erişerek ve kullanarak bu Kullanım Koşullarına bağlı olmayı kabul edersiniz. Kabul etmiyorsanız, lütfen web sitemizi kullanmayın.</p>

            <h2>2. Web Sitesi Kullanımı</h2>
            <p>Web sitemizi yalnızca yasal amaçlarla ve başkalarının haklarını ihlal etmeyecek veya web sitesini kullanmalarını kısıtlamayacak şekilde kullanmayı kabul edersiniz.</p>

            <h2>3. Ürün Bilgileri</h2>
            <p>Doğru ürün bilgileri sağlamaya çalışıyoruz. Ancak ürün açıklamalarının, görsellerinin veya diğer içeriklerin doğru, eksiksiz veya hatasız olduğunu garanti etmiyoruz. Ekran ayarlarına bağlı olarak renklerde küçük farklılıklar olabilir.</p>

            <h2>4. Fiyatlandırma ve Stok</h2>
            <p>Tüm fiyatlar önceden haber verilmeksizin değiştirilebilir. Herhangi bir ürünü istediğimiz zaman satıştan kaldırma hakkını saklı tutarız. Fiyatlandırma hatalarından sorumlu değiliz ve bu tür hatalardan etkilenen siparişleri iptal etme hakkını saklı tutarız.</p>

            <h2>5. Siparişler ve Ödeme</h2>
            <p>Sipariş vermek, satın alma teklifi oluşturur. Herhangi bir siparişi kabul etme veya reddetme hakkını saklı tutarız. Sipariş işleme başlamadan önce ödeme alınmalıdır.</p>

            <h2>6. Fikri Mülkiyet</h2>
            <p>Bu web sitesindeki metin, görsel, logo ve tasarımlar dahil tüm içerik Grohn Fabrics'e aittir ve telif hakkı yasalarıyla korunmaktadır. Yazılı iznimiz olmadan çoğaltamaz, dağıtamaz veya türev eserler oluşturamazsınız.</p>

            <h2>7. Sorumluluk Sınırlaması</h2>
            <p>Grohn Fabrics, web sitemizi veya ürünlerimizi kullanımınızdan kaynaklanan dolaylı, arızi, özel veya sonuçsal zararlardan sorumlu tutulamaz.</p>

            <h2>8. Uygulanacak Hukuk</h2>
            <p>Bu koşullar, bulunduğunuz yere bağlı olarak Türkiye veya Amerika Birleşik Devletleri yasalarına göre yönetilecek ve yorumlanacaktır.</p>

            <h2>9. İletişim</h2>
            <p>Bu koşullar hakkında sorularınız için: grohn@grohn.com.tr</p>
          </>
        )}
      </div>
    </div>
  );
}
