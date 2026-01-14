'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Package, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  slug: string;
  name_tr: string;
  name_en?: string;
  description_tr?: string;
  images: string[];
  product_type: string;
  prices?: Array<{ market_id: string; price: number; currency: string }>;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('grohn_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search function with debounce
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          id,
          slug,
          name_tr,
          name_en,
          description_tr,
          images,
          product_type,
          prices:product_prices(market_id, price, currency)
        `)
        .eq('is_active', true)
        .or(`name_tr.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,description_tr.ilike.%${searchQuery}%`)
        .order('name_tr')
        .limit(8);

      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Save to recent searches
  const saveToRecent = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('grohn_recent_searches', JSON.stringify(updated));
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleResultClick = () => {
    if (query.length >= 2) {
      saveToRecent(query);
    }
    onClose();
  };

  const typeLabels: Record<string, string> = {
    fabric: 'Kumaş',
    curtain: 'Perde',
    pillow: 'Ev Tekstili',
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
            <Search className="w-5 h-5 text-[var(--foreground-muted)] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara... (örn: kadife, perde, keten)"
              className="flex-1 text-lg outline-none placeholder:text-[var(--foreground-light)]"
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-[var(--foreground-muted)]" />}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[var(--background-secondary)] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results / Recent Searches */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Loading State */}
            {loading && query.length >= 2 && (
              <div className="p-8 text-center text-[var(--foreground-muted)]">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-3" />
                <p>Aranıyor...</p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  Sonuçlar ({results.length})
                </p>
                {results.map((product) => {
                  const price = product.prices?.find(p => p.market_id === 'TR');
                  
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors group"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name_tr}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-[var(--foreground-light)]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--foreground)] group-hover:text-[var(--brand-primary)] transition-colors">
                          {product.name_tr}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 bg-[var(--background-secondary)] rounded">
                            {typeLabels[product.product_type] || product.product_type}
                          </span>
                          {price && (
                            <span className="text-sm text-[var(--brand-primary)] font-medium">
                              ₺{price.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-5 h-5 text-[var(--foreground-light)] group-hover:text-[var(--brand-primary)] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-[var(--foreground-light)] mb-3" />
                <p className="font-medium">Sonuç bulunamadı</p>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  &quot;{query}&quot; için ürün bulunamadı
                </p>
              </div>
            )}

            {/* Recent Searches (when empty) */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-4">
                <p className="px-1 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  Son Aramalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 text-sm bg-[var(--background-secondary)] hover:bg-[var(--brand-primary-light)] rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hint (when completely empty) */}
            {query.length < 2 && recentSearches.length === 0 && (
              <div className="p-8 text-center text-[var(--foreground-muted)]">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aramak için en az 2 karakter yazın</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--background-secondary)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[var(--border)] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[var(--border)] font-mono">↓</kbd>
                Gezin
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[var(--border)] font-mono">↵</kbd>
                Seç
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-[var(--border)] font-mono">esc</kbd>
              Kapat
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
