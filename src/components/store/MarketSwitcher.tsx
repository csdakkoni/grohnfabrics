'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useMarket, MarketId, MARKETS } from '@/lib/market/context';

export default function MarketSwitcher() {
  const { market, setMarket } = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (marketId: MarketId) => {
    setMarket(marketId);
    setIsOpen(false);
    // Reload page to get new content
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--brand-primary)]/5 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
        <span className="hidden sm:inline text-[var(--foreground-muted)]">
          {market.locale === 'tr' ? 'TR' : 'EN'} / {market.currencySymbol}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden z-50">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase">
              Bölge / Region
            </p>
            
            {(Object.keys(MARKETS) as MarketId[]).map((marketId) => {
              const m = MARKETS[marketId];
              const isSelected = market.id === marketId;
              
              return (
                <button
                  key={marketId}
                  onClick={() => handleSelect(marketId)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors
                    ${isSelected 
                      ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' 
                      : 'hover:bg-[var(--background-secondary)]'
                    }
                  `}
                >
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {m.locale === 'tr' ? 'Türkçe' : 'English'} • {m.currency}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
