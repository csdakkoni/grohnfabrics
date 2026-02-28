'use client';

import Link from 'next/link';
import { useMarket } from '@/lib/market/context';

export default function StoreFooter() {
  const { t } = useMarket();

  return (
    <footer className="bg-gradient-to-br from-[#2C3830] via-[#253028] to-[#1E2820] text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide">GROHN FABRICS</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {t(
                "Doğanın dokusu, evinizde. Sürdürülebilir ve doğal tekstil ürünleri.",
                "Nature's texture in your home. Sustainable and natural textile products."
              )}
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com/grohnfabrics" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="https://instagram.com/grohnfabrics" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://www.etsy.com/shop/AgoraLoom" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.56 5.45c-.4 0-.75.06-1.04.18-.28.12-.5.3-.65.53-.16.23-.26.51-.32.84-.06.33-.09.7-.09 1.12v1.88H9.5c.08 0 .15.03.2.08.06.06.09.12.09.2v1.43c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H6.46v8.45c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H4.15c-.08 0-.14-.03-.2-.09-.05-.05-.09-.12-.09-.2V12h-1.5c-.08 0-.15-.03-.2-.09-.06-.05-.09-.12-.09-.2V10.28c0-.08.03-.14.09-.2.05-.05.12-.08.2-.08h1.5V8c0-.7.09-1.32.26-1.87.17-.55.44-1.02.8-1.4.36-.38.82-.67 1.37-.87.55-.2 1.2-.3 1.95-.3h1.5c.08 0 .15.03.2.09.06.05.09.12.09.2v1.51c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H8.56z" /></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">
              {t('Koleksiyon', 'Collection')}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/products" className="text-sm text-white/60 hover:text-white transition-colors">{t('Tüm Ürünler', 'All Products')}</Link></li>
              <li><Link href="/products?type=fabric" className="text-sm text-white/60 hover:text-white transition-colors">{t('Kumaşlar', 'Fabrics')}</Link></li>
              <li><Link href="/products?type=curtain" className="text-sm text-white/60 hover:text-white transition-colors">{t('Perdeler', 'Curtains')}</Link></li>
              <li><Link href="/products?type=pillow" className="text-sm text-white/60 hover:text-white transition-colors">{t('Ev Tekstili', 'Home Textiles')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">
              {t('Kurumsal', 'Company')}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">{t('Hikayemiz', 'Our Story')}</Link></li>
              <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">{t('İletişim', 'Contact')}</Link></li>
              <li><Link href="/contact?subject=wholesale" className="text-sm text-white/60 hover:text-white transition-colors">{t('B2B & Toptan', 'B2B & Wholesale')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">
              {t('Yardım & Araçlar', 'Help & Tools')}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/measurement-tool" className="text-sm text-white/60 hover:text-white transition-colors">{t('Ölçü Hesaplayıcı', 'Measurement Tool')}</Link></li>
              <li><Link href="/design-service" className="text-sm text-white/60 hover:text-white transition-colors">{t('Ücretsiz Tasarım', 'Free Design')}</Link></li>
              <li><Link href="/gallery" className="text-sm text-white/60 hover:text-white transition-colors">{t('İlham Galerisi', 'Gallery')}</Link></li>
              <li><Link href="/shipping" className="text-sm text-white/60 hover:text-white transition-colors">{t('Kargo & Teslimat', 'Shipping & Delivery')}</Link></li>
              <li><Link href="/returns" className="text-sm text-white/60 hover:text-white transition-colors">{t('İade & Değişim', 'Returns & Exchange')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            © 2026 Grohn Fabrics. {t('Doğadan ilham, sizin için tasarım.', 'Inspired by nature, designed for you.')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">{t('Gizlilik', 'Privacy')}</Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">{t('Koşullar', 'Terms')}</Link>
            <Link href="/distance-sales" className="text-sm text-white/40 hover:text-white/60 transition-colors">{t('Mesafeli Satış', 'Distance Sales')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
