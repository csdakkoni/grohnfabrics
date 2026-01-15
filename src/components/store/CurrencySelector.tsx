'use client';

import { useMarket, Currency } from '@/lib/market/context';
import { DollarSign } from 'lucide-react';

export default function CurrencySelector() {
  const { region, currency, setCurrency } = useMarket();
  
  // Only show for GLOBAL region with multiple currencies
  if (region.id === 'TR' || region.currencies.length <= 1) {
    return null;
  }

  const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
  ];

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none bg-transparent text-sm font-medium cursor-pointer 
                   pl-6 pr-2 py-1 rounded border border-transparent 
                   hover:border-[var(--border)] transition-colors focus:outline-none"
      >
        {currencyOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.symbol} {opt.label}
          </option>
        ))}
      </select>
      <DollarSign className="w-4 h-4 absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
}
