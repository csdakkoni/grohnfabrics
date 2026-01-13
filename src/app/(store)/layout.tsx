import Link from 'next/link';
import { ShoppingBag, User, Search } from 'lucide-react';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-semibold tracking-tight">
              GROHN FABRICS
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/products" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Tüm Ürünler
              </Link>
              <Link 
                href="/products?type=fabric" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Kumaşlar
              </Link>
              <Link 
                href="/products?type=curtain" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Perdeler
              </Link>
              <Link 
                href="/products?type=pillow" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Ev Tekstili
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Hakkımızda
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors">
                <Search className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
              <Link 
                href="/account" 
                className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-[var(--foreground-muted)]" />
              </Link>
              <Link 
                href="/cart" 
                className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary-dark)] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">Sepet</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

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
  );
}
