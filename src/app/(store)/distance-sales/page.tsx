import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? 'Distance Sales Agreement' : 'Mesafeli Satış Sözleşmesi',
    description: isEnglish 
      ? 'Grohn Fabrics distance sales agreement - terms and conditions for online purchases.'
      : 'Grohn Fabrics mesafeli satış sözleşmesi - online alışveriş şart ve koşulları.',
  };
}

export default async function DistanceSalesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'tr';
  const isEnglish = locale === 'en';

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>{isEnglish ? 'Distance Sales Agreement' : 'Mesafeli Satış Sözleşmesi'}</h1>
        <p className="text-[var(--foreground-muted)]">
          {isEnglish ? 'Last updated: January 2026' : 'Son güncelleme: Ocak 2026'}
        </p>

        {isEnglish ? (
          <>
            <h2>1. Parties</h2>
            <p><strong>Seller:</strong></p>
            <ul>
              <li>Company: Grohn Fabrics</li>
              <li>Address: [Your Business Address]</li>
              <li>Email: grohn@grohn.com.tr</li>
              <li>Phone: [Your Phone Number]</li>
            </ul>
            <p><strong>Buyer:</strong> The customer who places an order through grohnfabrics.com</p>

            <h2>2. Subject of the Agreement</h2>
            <p>This agreement governs the sale and delivery of textile products (fabrics, curtains, home textiles) ordered through grohnfabrics.com, in accordance with applicable consumer protection laws.</p>

            <h2>3. Product Information</h2>
            <p>Product details, prices, and specifications are displayed on our website. Colors may vary slightly due to screen settings. All prices include applicable taxes unless otherwise stated.</p>

            <h2>4. Payment</h2>
            <p>We accept credit/debit cards through secure payment processors (Stripe for international orders, iyzico for Turkey). Payment is collected at the time of order.</p>

            <h2>5. Delivery</h2>
            <ul>
              <li>Standard delivery: 5-10 business days (domestic), 7-21 business days (international)</li>
              <li>Shipping carrier: UPS</li>
              <li>Delivery address cannot be changed after order confirmation</li>
            </ul>

            <h2>6. Right of Withdrawal</h2>
            <p>You have the right to withdraw from this contract within 14 days without giving any reason. The withdrawal period expires 14 days from the day you acquire physical possession of the goods.</p>
            <p><strong>Exceptions:</strong> Custom-made products cannot be returned unless defective.</p>

            <h2>7. Contact</h2>
            <p>For any questions regarding this agreement, please contact: grohn@grohn.com.tr</p>
          </>
        ) : (
          <>
            <h2>1. Taraflar</h2>
            <p><strong>Satıcı:</strong></p>
            <ul>
              <li>Şirket: Grohn Fabrics</li>
              <li>Adres: [İşletme Adresi]</li>
              <li>E-posta: grohn@grohn.com.tr</li>
              <li>Telefon: [Telefon Numarası]</li>
            </ul>
            <p><strong>Alıcı:</strong> grohnfabrics.com üzerinden sipariş veren müşteri</p>

            <h2>2. Sözleşmenin Konusu</h2>
            <p>Bu sözleşme, grohnfabrics.com üzerinden sipariş edilen tekstil ürünlerinin (kumaş, perde, ev tekstili) satış ve teslimatını, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenler.</p>

            <h2>3. Ürün Bilgileri</h2>
            <p>Ürün detayları, fiyatları ve özellikleri web sitemizde gösterilmektedir. Ekran ayarlarına bağlı olarak renklerde küçük farklılıklar olabilir. Aksi belirtilmedikçe tüm fiyatlara KDV dahildir.</p>

            <h2>4. Ödeme</h2>
            <p>Güvenli ödeme işlemcileri aracılığıyla kredi/banka kartı kabul ediyoruz (Türkiye siparişleri için iyzico, uluslararası siparişler için Stripe). Ödeme sipariş sırasında alınır.</p>

            <h2>5. Teslimat</h2>
            <ul>
              <li>Standart teslimat: 3-7 iş günü (yurtiçi), 7-21 iş günü (yurtdışı)</li>
              <li>Kargo şirketi: UPS</li>
              <li>Sipariş onayından sonra teslimat adresi değiştirilemez</li>
            </ul>

            <h2>6. Cayma Hakkı</h2>
            <p>Herhangi bir gerekçe göstermeksizin 14 gün içinde sözleşmeden cayma hakkına sahipsiniz. Cayma süresi, ürünün fiziki olarak teslim alındığı günden itibaren 14 gün sonra sona erer.</p>
            <p><strong>İstisnalar:</strong> Özel yapım ürünler, kusurlu olmadıkça iade edilemez.</p>

            <h2>7. Uyuşmazlık Çözümü</h2>
            <p>Bu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıklarda tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.</p>

            <h2>8. İletişim</h2>
            <p>Bu sözleşme hakkında sorularınız için: grohn@grohn.com.tr</p>
          </>
        )}
      </div>
    </div>
  );
}
