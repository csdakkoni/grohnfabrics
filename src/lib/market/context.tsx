'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Region = IP bazlı, değişmez (fiyat, kargo, ödeme)
export type RegionId = 'TR' | 'GLOBAL';

// Locale = kullanıcı seçimi, sadece UI dili
export type Locale = 'tr' | 'en';

// Currency options for GLOBAL region
export type Currency = 'TRY' | 'USD' | 'EUR';

interface RegionConfig {
  id: RegionId;
  name: string;
  defaultCurrency: Currency;
  currencies: Currency[];  // Available currencies for this region
  currencySymbols: Record<Currency, string>;
  shipping: string[];      // Available shipping providers
  payment: string[];       // Available payment providers
}

const REGIONS: Record<RegionId, RegionConfig> = {
  TR: {
    id: 'TR',
    name: 'Türkiye',
    defaultCurrency: 'TRY',
    currencies: ['TRY'],
    currencySymbols: { TRY: '₺', USD: '$', EUR: '€' },
    shipping: ['yurtici', 'aras', 'mng'],
    payment: ['iyzico'],
  },
  GLOBAL: {
    id: 'GLOBAL',
    name: 'International',
    defaultCurrency: 'USD',
    currencies: ['USD', 'EUR'],
    currencySymbols: { TRY: '₺', USD: '$', EUR: '€' },
    shipping: ['ups', 'dhl', 'fedex'],
    payment: ['stripe'],
  },
};

interface MarketContextType {
  // Region - IP bazlı, değişmez (admin hariç)
  region: RegionConfig;
  
  // Locale - kullanıcı değiştirebilir
  locale: Locale;
  setLocale: (locale: Locale) => void;
  
  // Currency - GLOBAL için kullanıcı değiştirebilir
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  
  // Admin mode
  isAdminMode: boolean;
  setAdminRegionOverride: (region: RegionId) => void;
  
  // Helpers
  t: (tr: string, en: string) => string;
  formatPrice: (price: number, overrideCurrency?: Currency) => string;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ 
  children, 
  initialRegion,
  initialLocale,
}: { 
  children: ReactNode;
  initialRegion?: RegionId;
  initialLocale?: Locale;
}) {
  // Region - can be overridden by admin
  const [regionId, setRegionId] = useState<RegionId>(initialRegion || 'TR');
  const region = REGIONS[regionId];
  
  // Admin mode detection
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Locale can be changed by user
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'tr');
  
  // Currency can be changed by user (only for GLOBAL region)
  const [currency, setCurrencyState] = useState<Currency>(region.defaultCurrency);
  
  useEffect(() => {
    // Check if user is admin (look for isAdmin flag set by admin panel)
    const isAdmin = localStorage.getItem('isAdmin') === 'true' || document.cookie.includes('isAdmin=true');
    setIsAdminMode(isAdmin);
    
    // If admin has a region override, use it
    const adminOverride = localStorage.getItem('admin_region_override') as RegionId;
    if (isAdmin && adminOverride && (adminOverride === 'TR' || adminOverride === 'GLOBAL')) {
      setRegionId(adminOverride);
    }
    
    // Load saved locale preference
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'tr' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
    
    // Load saved currency preference (only matters for GLOBAL)
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && REGIONS[regionId].currencies.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Update currency when region changes
  useEffect(() => {
    setCurrencyState(REGIONS[regionId].defaultCurrency);
  }, [regionId]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // Also set cookie for server-side
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
  };

  const setCurrency = (newCurrency: Currency) => {
    if (region.currencies.includes(newCurrency)) {
      setCurrencyState(newCurrency);
      localStorage.setItem('currency', newCurrency);
    }
  };

  const setAdminRegionOverride = (newRegion: RegionId) => {
    setRegionId(newRegion);
    setIsAdminMode(true);
    localStorage.setItem('admin_region_override', newRegion);
    // Also set cookie for server-side
    document.cookie = `admin_region_override=${newRegion};path=/;max-age=${60 * 60 * 24}`;
    document.cookie = `region=${newRegion};path=/;max-age=${60 * 60 * 24}`;
    // Reload to apply changes on server
    window.location.reload();
  };

  // Translation helper - based on LOCALE not region
  const t = (tr: string, en: string) => {
    return locale === 'tr' ? tr : en;
  };

  // Price formatter - based on REGION's currency
  const formatPrice = (price: number, overrideCurrency?: Currency) => {
    const curr = overrideCurrency || currency;
    const symbol = region.currencySymbols[curr];
    const localeStr = locale === 'tr' ? 'tr-TR' : 'en-US';
    return `${symbol}${price.toLocaleString(localeStr, { minimumFractionDigits: 2 })}`;
  };

  return (
    <MarketContext.Provider value={{ 
      region, 
      locale, 
      setLocale, 
      currency, 
      setCurrency, 
      isAdminMode,
      setAdminRegionOverride,
      t, 
      formatPrice 
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
}

export { REGIONS };
export type { RegionConfig };
