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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="text-xl font-semibold tracking-tight">
              GROHN FABRICS
            </Link>

            {/* Navigation - Desktop */}
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
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors group"
              >
                <Search className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]" />
                <span className="hidden lg:flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                  Ara
                  <kbd className="px-1.5 py-0.5 bg-[var(--background-secondary)] rounded text-xs font-mono">⌘K</kbd>
                </span>
              </button>
              
              {/* Account */}
              <Link 
                href="/account" 
                className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-[var(--foreground-muted)]" />
              </Link>
              
              {/* Cart */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white">
            <nav className="container py-4 space-y-2">
              <Link 
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Tüm Ürünler
              </Link>
              <Link 
                href="/products?type=fabric"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Kumaşlar
              </Link>
              <Link 
                href="/products?type=curtain"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Perdeler
              </Link>
              <Link 
                href="/products?type=pillow"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Ev Tekstili
              </Link>
              <hr className="border-[var(--border)]" />
              <Link 
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
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
