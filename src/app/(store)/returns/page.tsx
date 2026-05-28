import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Returns & Refunds' : 'İade ve Değişim',
    description: isEnglish 
      ? 'Grohn Fabrics return and refund policy - hassle-free returns within 14 days.'
      : 'Grohn Fabrics iade ve değişim politikası - 14 gün içinde sorunsuz iade.',
  };
}

export default async function ReturnsPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>{isEnglish ? 'Returns & Refunds' : 'İade ve Değişim Politikası'}</h1>
        <p className="text-[var(--foreground-muted)]">
          {isEnglish ? 'Last updated: January 2026' : 'Son güncelleme: Ocak 2026'}
        </p>

        {isEnglish ? (
          <>
            <h2>Return Policy</h2>
            <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you may return it within <strong>14 days</strong> of delivery for a full refund or exchange.</p>

            <h2>Conditions for Returns</h2>
            <ul>
              <li>Items must be unused, unwashed, and in original condition</li>
              <li>Items must be in their original packaging</li>
              <li>Custom-made items (custom sizes, special orders) cannot be returned unless defective</li>
              <li>Sale items are final sale and cannot be returned</li>
            </ul>

            <h2>How to Return</h2>
            <ol>
              <li>Contact us at <a href="mailto:grohn@grohn.com.tr">grohn@grohn.com.tr</a> with your order number</li>
              <li>We will provide you with a return authorization and shipping instructions</li>
              <li>Ship the item back to us (return shipping costs are the customer's responsibility unless the item is defective)</li>
              <li>Once we receive and inspect the item, we will process your refund within 5-7 business days</li>
            </ol>

            <h2>Refunds</h2>
            <p>Refunds will be issued to your original payment method. Please allow 5-10 business days for the refund to appear in your account, depending on your bank.</p>

            <h2>Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us immediately at <a href="mailto:grohn@grohn.com.tr">grohn@grohn.com.tr</a> with photos of the damage. We will arrange a free return and send a replacement or issue a full refund.</p>

            <h2>Contact Us</h2>
            <p>For any questions about returns, please contact us at:</p>
            <p>Email: grohn@grohn.com.tr</p>
          </>
        ) : (
          <>
            <h2>İade Politikası</h2>
            <p>Satın aldığınız üründen tamamen memnun kalmanızı istiyoruz. Siparişinizden memnun kalmazsanız, teslimat tarihinden itibaren <strong>14 gün</strong> içinde tam iade veya değişim için ürünü iade edebilirsiniz.</p>

            <h2>İade Koşulları</h2>
            <ul>
              <li>Ürünler kullanılmamış, yıkanmamış ve orijinal durumunda olmalıdır</li>
              <li>Ürünler orijinal ambalajında olmalıdır</li>
              <li>Özel yapım ürünler (özel boyutlar, özel siparişler) kusurlu olmadıkça iade edilemez</li>
              <li>İndirimli ürünler son satıştır ve iade edilemez</li>
            </ul>

            <h2>İade Nasıl Yapılır?</h2>
            <ol>
              <li>Sipariş numaranızla birlikte <a href="mailto:grohn@grohn.com.tr">grohn@grohn.com.tr</a> adresine e-posta gönderin</li>
              <li>Size iade onayı ve kargo talimatları sağlayacağız</li>
              <li>Ürünü bize geri gönderin (ürün kusurlu olmadıkça iade kargo ücreti müşteriye aittir)</li>
              <li>Ürünü aldıktan ve inceledikten sonra iadenizi 5-7 iş günü içinde işleme alacağız</li>
            </ol>

            <h2>İade Ödemeleri</h2>
            <p>İadeler orijinal ödeme yönteminize yapılacaktır. Bankanıza bağlı olarak iadenin hesabınızda görünmesi için 5-10 iş günü bekleyin.</p>

            <h2>Hasarlı veya Kusurlu Ürünler</h2>
            <p>Hasarlı veya kusurlu bir ürün aldıysanız, lütfen hasarın fotoğraflarıyla birlikte hemen <a href="mailto:grohn@grohn.com.tr">grohn@grohn.com.tr</a> adresinden bize ulaşın. Ücretsiz iade ayarlayacak ve değişim ürün göndereceğiz veya tam iade yapacağız.</p>

            <h2>Bize Ulaşın</h2>
            <p>İadeler hakkında sorularınız için bize ulaşın:</p>
            <p>E-posta: grohn@grohn.com.tr</p>
          </>
        )}
      </div>
    </div>
  );
}
