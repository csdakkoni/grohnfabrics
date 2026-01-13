import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold text-[var(--foreground)]">
            GROHN FABRICS
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              Products
            </Link>
            <Link href="/about" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              About
            </Link>
            <Link href="/contact" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link href="/cart" className="btn btn-primary btn-sm">
              Cart (0)
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3F0] to-[#E8E4E0]" />
        <div className="container relative">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[var(--accent-light)] text-[var(--accent-dark)] rounded-full">
              Premium Quality Textiles
            </span>
            <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
              Beautiful Fabrics for
              <span className="block font-normal text-[var(--brand-primary)]">Beautiful Spaces</span>
            </h1>
            <p className="text-lg text-[var(--foreground-muted)] mb-8 max-w-lg">
              Discover our curated collection of premium fabrics, curtains, and home textiles. 
              Quality craftsmanship from Turkey to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop Collection
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Premium Quality</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Carefully sourced materials with exceptional quality standards
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Worldwide Shipping</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Fast and reliable delivery to Turkey and worldwide
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Shopping</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Safe payment options and buyer protection guaranteed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">Our Collections</h2>
            <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
              Explore our range of premium fabrics and home textiles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Fabrics', 'Curtains', 'Home Textile'].map((category) => (
              <Link 
                href={`/products?category=${category.toLowerCase()}`} 
                key={category}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--background-secondary)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-medium text-white mb-1">{category}</h3>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Banner */}
      <section className="py-16 bg-[var(--brand-primary)]">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Looking for Wholesale?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            We offer competitive wholesale prices for businesses. 
            Contact us for bulk orders and special pricing.
          </p>
          <Link href="/contact?subject=wholesale" className="btn bg-white text-[var(--brand-primary)] hover:bg-white/90">
            Contact for Wholesale
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[var(--foreground)]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">GROHN FABRICS</h4>
              <p className="text-sm text-white/60">
                Premium quality textiles and home decor from Turkey.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Shop</h5>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-sm text-white/60 hover:text-white">All Products</Link></li>
                <li><Link href="/products?type=fabric" className="text-sm text-white/60 hover:text-white">Fabrics</Link></li>
                <li><Link href="/products?type=curtain" className="text-sm text-white/60 hover:text-white">Curtains</Link></li>
                <li><Link href="/products?type=pillow" className="text-sm text-white/60 hover:text-white">Pillows</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-white/60 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-white/60 hover:text-white">Contact</Link></li>
                <li><Link href="/shipping" className="text-sm text-white/60 hover:text-white">Shipping</Link></li>
                <li><Link href="/faq" className="text-sm text-white/60 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Connect</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-white/60 hover:text-white">Instagram</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white">Pinterest</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © 2026 Grohn Fabrics. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-white/40 hover:text-white/60">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
