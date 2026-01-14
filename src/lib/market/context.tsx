'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MarketId = 'TR' | 'GLOBAL';
export type Locale = 'tr' | 'en';
export type Currency = 'TRY' | 'USD' | 'EUR';

interface MarketConfig {
  id: MarketId;
  locale: Locale;
  currency: Currency;
  currencySymbol: string;
  name: string;
}

const MARKETS: Record<MarketId, MarketConfig> = {
  TR: {
    id: 'TR',
    locale: 'tr',
    currency: 'TRY',
    currencySymbol: '₺',
    name: 'Türkiye',
  },
  GLOBAL: {
    id: 'GLOBAL',
    locale: 'en',
    currency: 'USD',
    currencySymbol: '$',
    name: 'Global',
  },
};

interface MarketContextType {
  market: MarketConfig;
  setMarket: (marketId: MarketId) => void;
  t: (tr: string, en: string) => string;
  formatPrice: (price: number) => string;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ 
  children, 
  initialMarket 
}: { 
  children: ReactNode;
  initialMarket?: MarketId;
}) {
  const [marketId, setMarketId] = useState<MarketId>(initialMarket || 'TR');
  
  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('market') as MarketId;
    if (saved && MARKETS[saved]) {
      setMarketId(saved);
    }
  }, []);

  const setMarket = (id: MarketId) => {
    setMarketId(id);
    localStorage.setItem('market', id);
  };

  const market = MARKETS[marketId];

  // Translation helper
  const t = (tr: string, en: string) => {
    return market.locale === 'tr' ? tr : en;
  };

  // Price formatter
  const formatPrice = (price: number) => {
    return `${market.currencySymbol}${price.toLocaleString(market.locale === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <MarketContext.Provider value={{ market, setMarket, t, formatPrice }}>
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

// Helper to detect market from headers (for server components)
export function detectMarketFromHeaders(headers: Headers): MarketId {
  // Check Accept-Language header
  const acceptLanguage = headers.get('accept-language') || '';
  
  // Turkish language preference
  if (acceptLanguage.toLowerCase().includes('tr')) {
    return 'TR';
  }
  
  // Check for Cloudflare country header (if using Cloudflare)
  const cfCountry = headers.get('cf-ipcountry');
  if (cfCountry === 'TR') {
    return 'TR';
  }
  
  // Check Vercel's geo header
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry === 'TR') {
    return 'TR';
  }
  
  return 'GLOBAL';
}

export { MARKETS };
