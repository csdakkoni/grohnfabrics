'use client';

import { useMarket } from '@/lib/market/context';

interface Price {
  price: number;
  currency: string;
  market_id: string;
}

interface ProductPriceProps {
  prices: Price[];
  salesModel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductPrice({ 
  prices, 
  salesModel = 'unit',
  size = 'md' 
}: ProductPriceProps) {
  const { region, locale, currency, t } = useMarket();
  
  // Find price for current REGION (not changeable by user)
  // For TR region: show TRY price
  // For GLOBAL region: show USD or EUR based on user's currency preference
  let displayPrice: Price | undefined;
  
  if (region.id === 'TR') {
    displayPrice = prices.find(p => p.market_id === 'TR' && p.currency === 'TRY');
  } else {
    // GLOBAL - find price in user's selected currency
    displayPrice = prices.find(p => p.market_id === 'GLOBAL' && p.currency === currency);
    // Fallback to USD if preferred currency not found
    if (!displayPrice) {
      displayPrice = prices.find(p => p.market_id === 'GLOBAL' && p.currency === 'USD');
    }
    // Fallback to any GLOBAL price
    if (!displayPrice) {
      displayPrice = prices.find(p => p.market_id === 'GLOBAL');
    }
  }
  
  if (!displayPrice) {
    return <span className="text-[var(--foreground-muted)]">{t('Fiyat bilgisi yok', 'Price not available')}</span>;
  }

  const currencySymbol = region.currencySymbols[displayPrice.currency as keyof typeof region.currencySymbols] || '$';
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const unitLabel = locale === 'tr' 
    ? (salesModel === 'meter' ? '/ metre' : '')
    : (salesModel === 'meter' ? '/ meter' : '');

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`font-semibold text-[var(--brand-primary)] ${sizeClasses[size]}`}>
          {currencySymbol}{displayPrice.price.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2 })}
        </span>
        {salesModel === 'meter' && (
          <span className="text-[var(--foreground-muted)]">{unitLabel}</span>
        )}
      </div>
    </div>
  );
}
