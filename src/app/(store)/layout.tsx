import Link from 'next/link';
import { CartProvider } from '@/components/store/CartProvider';
import CartDrawer from '@/components/store/CartDrawer';
import StoreHeader from '@/components/store/StoreHeader';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      <footer className="bg-[var(--foreground)] text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-semibold mb-4">GROHN FABRICS</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Türkiye&apos;den dünyaya kaliteli kumaş ve ev tekstili ürünleri.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Mağaza</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-sm text-white/60 hover:text-white">Tüm Ürünler</Link></li>
                <li><Link href="/products?type=fabric" className="text-sm text-white/60 hover:text-white">Kumaşlar</Link></li>
                <li><Link href="/products?type=curtain" className="text-sm text-white/60 hover:text-white">Perdeler</Link></li>
                <li><Link href="/products?type=pillow" className="text-sm text-white/60 hover:text-white">Ev Tekstili</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-white/60 hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/contact" className="text-sm text-white/60 hover:text-white">İletişim</Link></li>
                <li><Link href="/wholesale" className="text-sm text-white/60 hover:text-white">Toptan Satış</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Destek</h4>
              <ul className="space-y-2">
                <li><Link href="/shipping" className="text-sm text-white/60 hover:text-white">Kargo Bilgisi</Link></li>
                <li><Link href="/returns" className="text-sm text-white/60 hover:text-white">İade Politikası</Link></li>
                <li><Link href="/faq" className="text-sm text-white/60 hover:text-white">SSS</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © 2026 Grohn Fabrics. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60">Gizlilik Politikası</Link>
              <Link href="/terms" className="text-sm text-white/40 hover:text-white/60">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </CartProvider>
  );
}
