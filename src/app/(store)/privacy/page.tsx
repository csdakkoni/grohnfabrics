import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası',
    description: isEnglish 
      ? 'Grohn Fabrics privacy policy - how we collect, use, and protect your data.'
      : 'Grohn Fabrics gizlilik politikası - verilerinizi nasıl toplar, kullanır ve koruruz.',
  };
}

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>{isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}</h1>
        <p className="text-[var(--foreground-muted)]">
          {isEnglish ? 'Last updated: January 2026' : 'Son güncelleme: Ocak 2026'}
        </p>

        {isEnglish ? (
          <>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing address</li>
              <li>Payment information (processed securely by Stripe/iyzico)</li>
              <li>Order history and preferences</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our services and website</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul>
              <li>Payment processors (Stripe, iyzico) to process transactions</li>
              <li>Shipping carriers (UPS) to deliver your orders</li>
              <li>Service providers who help us operate our business</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. All payment information is encrypted and processed through secure payment gateways.</p>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@grohnfabrics.com</p>
          </>
        ) : (
          <>
            <h2>1. Topladığımız Bilgiler</h2>
            <p>Hesap oluştururken, alışveriş yaparken veya bizimle iletişime geçerken doğrudan sağladığınız bilgileri topluyoruz. Bunlar şunları içerebilir:</p>
            <ul>
              <li>Ad, e-posta adresi ve telefon numarası</li>
              <li>Teslimat ve fatura adresi</li>
              <li>Ödeme bilgileri (Stripe/iyzico tarafından güvenli şekilde işlenir)</li>
              <li>Sipariş geçmişi ve tercihler</li>
            </ul>

            <h2>2. Bilgilerinizi Nasıl Kullanıyoruz</h2>
            <p>Topladığımız bilgileri şu amaçlarla kullanıyoruz:</p>
            <ul>
              <li>Siparişlerinizi işlemek ve tamamlamak</li>
              <li>Siparişleriniz hakkında sizinle iletişim kurmak</li>
              <li>Promosyon e-postaları göndermek (izninizle)</li>
              <li>Hizmetlerimizi ve web sitemizi iyileştirmek</li>
            </ul>

            <h2>3. Bilgi Paylaşımı</h2>
            <p>Kişisel bilgilerinizi satmıyoruz. Bilgilerinizi şu taraflarla paylaşabiliriz:</p>
            <ul>
              <li>İşlemleri gerçekleştirmek için ödeme işlemcileri (Stripe, iyzico)</li>
              <li>Siparişlerinizi teslim etmek için kargo şirketleri (UPS)</li>
              <li>İşletmemizi yönetmemize yardımcı olan hizmet sağlayıcıları</li>
            </ul>

            <h2>4. Veri Güvenliği</h2>
            <p>Kişisel bilgilerinizi korumak için uygun güvenlik önlemlerini uyguluyoruz. Tüm ödeme bilgileri şifrelenir ve güvenli ödeme ağ geçitleri üzerinden işlenir.</p>

            <h2>5. Haklarınız</h2>
            <p>Aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinize erişim</li>
              <li>Yanlış verileri düzeltme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Pazarlama iletişimlerinden çıkma</li>
            </ul>

            <h2>6. Bize Ulaşın</h2>
            <p>Bu Gizlilik Politikası hakkında sorularınız varsa, lütfen bizimle iletişime geçin:</p>
            <p>E-posta: privacy@grohnfabrics.com</p>
          </>
        )}
      </div>
    </div>
  );
}
