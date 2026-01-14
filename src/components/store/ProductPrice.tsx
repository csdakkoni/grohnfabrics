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
  showBothPrices?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductPrice({ 
  prices, 
  salesModel = 'unit',
  showBothPrices = false,
  size = 'md' 
}: ProductPriceProps) {
  const { market } = useMarket();
  
  // Find price for current market
  const currentPrice = prices.find(p => p.market_id === market.id);
  const altPrice = prices.find(p => p.market_id !== market.id);
  
  if (!currentPrice && !altPrice) {
    return <span className="text-[var(--foreground-muted)]">Fiyat bilgisi yok</span>;
  }

  const displayPrice = currentPrice || altPrice;
  const currencySymbol = displayPrice?.currency === 'TRY' ? '₺' : 
                         displayPrice?.currency === 'USD' ? '$' : '€';
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const unitLabel = market.locale === 'tr' 
    ? (salesModel === 'meter' ? '/ metre' : '')
    : (salesModel === 'meter' ? '/ meter' : '');

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`font-semibold text-[var(--brand-primary)] ${sizeClasses[size]}`}>
          {currencySymbol}{displayPrice?.price.toLocaleString()}
        </span>
        {salesModel === 'meter' && (
          <span className="text-[var(--foreground-muted)]">{unitLabel}</span>
        )}
      </div>
      
      {showBothPrices && altPrice && currentPrice && (
        <p className="text-sm text-[var(--foreground-light)] mt-1">
          {altPrice.market_id === 'TR' ? 'Türkiye' : 'Global'}: 
          {altPrice.currency === 'TRY' ? ' ₺' : altPrice.currency === 'USD' ? ' $' : ' €'}
          {altPrice.price.toLocaleString()}
          {salesModel === 'meter' && (altPrice.market_id === 'TR' ? ' / metre' : ' / meter')}
        </p>
      )}
    </div>
  );
}
