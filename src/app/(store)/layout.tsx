import Link from 'next/link';
import { cookies } from 'next/headers';
import { CartProvider } from '@/components/store/CartProvider';
import CartDrawer from '@/components/store/CartDrawer';
import StoreHeader from '@/components/store/StoreHeader';
import { MarketProvider, RegionId, Locale } from '@/lib/market/context';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Region is fixed by IP (determines price, shipping, payment)
  const regionCookie = cookieStore.get('region')?.value as RegionId | undefined;
  const initialRegion: RegionId = regionCookie === 'GLOBAL' ? 'GLOBAL' : 'TR';
  
  // Locale can be changed by user (determines UI language only)
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;
  const initialLocale: Locale = localeCookie === 'en' ? 'en' : 'tr';

  return (
    <MarketProvider initialRegion={initialRegion} initialLocale={initialLocale}>
    <CartProvider>
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <StoreHeader />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#2C3830] via-[#253028] to-[#1E2820] text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-semibold mb-4 tracking-wide">GROHN FABRICS</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Doğanın dokusu, evinizde. Sürdürülebilir ve doğal tekstil ürünleri.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">Koleksiyon</h4>
              <ul className="space-y-2.5">
                <li><Link href="/products" className="text-sm text-white/60 hover:text-white transition-colors">Tüm Ürünler</Link></li>
                <li><Link href="/products?type=fabric" className="text-sm text-white/60 hover:text-white transition-colors">Kumaşlar</Link></li>
                <li><Link href="/products?type=curtain" className="text-sm text-white/60 hover:text-white transition-colors">Perdeler</Link></li>
                <li><Link href="/products?type=pillow" className="text-sm text-white/60 hover:text-white transition-colors">Ev Tekstili</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">Kurumsal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">Hikayemiz</Link></li>
                <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">İletişim</Link></li>
                <li><Link href="/wholesale" className="text-sm text-white/60 hover:text-white transition-colors">B2B & Toptan</Link></li>
                <li><Link href="/sustainability" className="text-sm text-white/60 hover:text-white transition-colors">Sürdürülebilirlik</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--brand-primary-light)]">Yardım</h4>
              <ul className="space-y-2.5">
                <li><Link href="/shipping" className="text-sm text-white/60 hover:text-white transition-colors">Kargo & Teslimat</Link></li>
                <li><Link href="/returns" className="text-sm text-white/60 hover:text-white transition-colors">İade & Değişim</Link></li>
                <li><Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors">Sık Sorulan Sorular</Link></li>
                <li><Link href="/care" className="text-sm text-white/60 hover:text-white transition-colors">Bakım Önerileri</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © 2026 Grohn Fabrics. Doğadan ilham, sizin için tasarım.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">Koşullar</Link>
              <Link href="/cookies" className="text-sm text-white/40 hover:text-white/60 transition-colors">Çerezler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </CartProvider>
    </MarketProvider>
  );
}
