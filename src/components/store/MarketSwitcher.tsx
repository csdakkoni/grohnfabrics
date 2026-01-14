'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Languages, ShieldCheck } from 'lucide-react';
import { useMarket, Locale, Currency, RegionId } from '@/lib/market/context';

export default function MarketSwitcher() {
  const { region, locale, setLocale, currency, setCurrency, t, isAdminMode, setAdminRegionOverride } = useMarket();
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

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  const handleAdminRegionChange = (newRegion: RegionId) => {
    setAdminRegionOverride(newRegion);
  };

  const currencySymbol = region.currencySymbols[currency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--brand-primary)]/5 rounded-lg transition-colors"
      >
        {isAdminMode ? (
          <ShieldCheck className="w-4 h-4 text-orange-500" />
        ) : (
          <Languages className="w-4 h-4 text-[var(--foreground-muted)]" />
        )}
        <span className="hidden sm:inline text-[var(--foreground-muted)]">
          {locale.toUpperCase()} / {currencySymbol}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden z-50">
          <div className="p-3">
            {/* Admin Mode Banner */}
            {isAdminMode && (
              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-orange-700">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="font-medium">Admin Test Modu</span>
                </div>
                <p className="text-[10px] text-orange-600 mt-1">
                  Bölgeyi değiştirebilirsiniz
                </p>
              </div>
            )}
            
            {/* Region Selection - ADMIN ONLY */}
            {isAdminMode ? (
              <div className="mb-3 pb-3 border-b border-[var(--border)]">
                <p className="px-1 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                  🔧 Test Bölgesi
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleAdminRegionChange('TR')}
                    className={`
                      flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                      ${region.id === 'TR' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-[var(--background-secondary)] hover:bg-[var(--border)]'
                      }
                    `}
                  >
                    🇹🇷 TR (₺)
                  </button>
                  <button
                    onClick={() => handleAdminRegionChange('GLOBAL')}
                    className={`
                      flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                      ${region.id === 'GLOBAL' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-[var(--background-secondary)] hover:bg-[var(--border)]'
                      }
                    `}
                  >
                    🌍 Global ($)
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <Globe className="w-3 h-3" />
                  <span>{t('Bölgeniz', 'Your Region')}: <strong>{region.name}</strong></span>
                </div>
                <p className="text-[10px] text-[var(--foreground-light)] mt-1">
                  {t('Fiyatlar ve kargo bölgenize göre belirlenir', 'Prices and shipping based on your region')}
                </p>
              </div>
            )}
            
            {/* Language Selection - CHANGEABLE */}
            <div className="mb-3">
              <p className="px-1 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                {t('Dil', 'Language')}
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleLocaleChange('tr')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${locale === 'tr' 
                      ? 'bg-[var(--brand-primary)] text-white' 
                      : 'bg-[var(--background-secondary)] hover:bg-[var(--border)]'
                    }
                  `}
                >
                  Türkçe
                </button>
                <button
                  onClick={() => handleLocaleChange('en')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${locale === 'en' 
                      ? 'bg-[var(--brand-primary)] text-white' 
                      : 'bg-[var(--background-secondary)] hover:bg-[var(--border)]'
                    }
                  `}
                >
                  English
                </button>
              </div>
            </div>
            
            {/* Currency Selection - ONLY FOR GLOBAL */}
            {region.currencies.length > 1 && (
              <div>
                <p className="px-1 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                  {t('Para Birimi', 'Currency')}
                </p>
                <div className="flex gap-2 mt-1">
                  {region.currencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`
                        flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                        ${currency === curr 
                          ? 'bg-[var(--brand-primary)] text-white' 
                          : 'bg-[var(--background-secondary)] hover:bg-[var(--border)]'
                        }
                      `}
                    >
                      {region.currencySymbols[curr]} {curr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
