'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Search, Menu, X } from 'lucide-react';
import CartButton from './CartButton';
import SearchModal from './SearchModal';

export default function StoreHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--brand-primary)]/10">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--brand-primary)]/5 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--brand-primary)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--brand-primary)]" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-wide text-[var(--foreground)]">
              <span className="text-[var(--brand-primary)]">GROHN</span>
              <span className="font-light">FABRICS</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/products" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Koleksiyon
              </Link>
              <Link 
                href="/products?type=fabric" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Kumaşlar
              </Link>
              <Link 
                href="/products?type=curtain" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Perdeler
              </Link>
              <Link 
                href="/products?type=pillow" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Ev Tekstili
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Hikayemiz
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 p-2 hover:bg-[var(--brand-primary)]/5 rounded-lg transition-colors group"
              >
                <Search className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[var(--brand-primary)]" />
                <span className="hidden lg:flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]">
                  Ara
                  <kbd className="px-1.5 py-0.5 bg-[var(--brand-primary)]/5 rounded text-xs font-mono text-[var(--brand-primary)]">⌘K</kbd>
                </span>
              </button>
              
              {/* Account */}
              <Link 
                href="/account" 
                className="p-2 hover:bg-[var(--brand-primary)]/5 rounded-lg transition-colors group"
              >
                <User className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[var(--brand-primary)]" />
              </Link>
              
              {/* Cart */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--brand-primary)]/10 bg-[var(--background)]">
            <nav className="container py-4 space-y-1">
              <Link 
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                Koleksiyon
              </Link>
              <Link 
                href="/products?type=fabric"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                Kumaşlar
              </Link>
              <Link 
                href="/products?type=curtain"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                Perdeler
              </Link>
              <Link 
                href="/products?type=pillow"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                Ev Tekstili
              </Link>
              <hr className="border-[var(--brand-primary)]/10 my-2" />
              <Link 
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                Hikayemiz
              </Link>
              <Link 
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] transition-colors"
              >
                İletişim
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
