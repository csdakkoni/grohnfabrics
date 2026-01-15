'use client';

import { useState, useMemo } from 'react';
import ProductOptions from '@/components/store/ProductOptions';
import AddToCartButton from '@/components/store/AddToCartButton';
import { useMarket } from '@/lib/market/context';

interface OptionValue {
  id: string;
  value_tr: string;
  value_en: string;
  hex_color?: string;
  price_modifier: number;
  is_available: boolean;
}

interface OptionGroup {
  id: string;
  name_tr: string;
  name_en: string;
  option_type: 'select' | 'color' | 'size' | 'radio';
  is_required: boolean;
  values: OptionValue[];
}

interface Product {
  id: string;
  name_tr: string;
  name_en?: string;
  sales_model: string;
  min_order_quantity: number;
  order_step: number;
  thumbnail_url?: string;
  images?: string[];
}

interface ProductDetailClientProps {
  product: Product;
  optionGroups: OptionGroup[];
  basePrice: number;
  locale?: 'tr' | 'en';
}

export default function ProductDetailClient({ 
  product, 
  optionGroups, 
  basePrice,
  locale = 'tr'
}: ProductDetailClientProps) {
  const { region, currency } = useMarket();
  const [selections, setSelections] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({});

  // Calculate total price including option modifiers
  const totalPrice = useMemo(() => {
    const modifierTotal = Object.values(selections).reduce(
      (sum, sel) => sum + (sel.priceModifier || 0), 
      0
    );
    return basePrice + modifierTotal;
  }, [basePrice, selections]);

  // Build selected options for cart
  const selectedOptions = useMemo(() => {
    const options: Record<string, string> = {};
    Object.entries(selections).forEach(([groupId, sel]) => {
      const group = optionGroups.find(g => g.id === groupId);
      if (group) {
        options[group.name_tr] = sel.valueName;
      }
    });
    return options;
  }, [selections, optionGroups]);

  // Get variant ID if all required options are selected
  const variantId = useMemo(() => {
    // For now, we concatenate option value IDs as a pseudo-variant ID
    // In a full implementation, you'd look up the actual variant from product_variants table
    const valueIds = Object.values(selections).map(s => s.valueId).sort();
    return valueIds.length > 0 ? valueIds.join('-') : undefined;
  }, [selections]);

  return (
    <div className="space-y-6">
      {/* Price Display with Modifiers */}
      {Object.values(selections).some(s => s.priceModifier > 0) && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-[var(--brand-primary)]">
            {currency === 'TRY' ? '₺' : '$'}{totalPrice.toFixed(2)}
          </span>
          <span className="text-sm text-[var(--foreground-muted)] line-through">
            {currency === 'TRY' ? '₺' : '$'}{basePrice.toFixed(2)}
          </span>
          {product.sales_model === 'meter' && (
            <span className="text-sm text-[var(--foreground-muted)]">/ metre</span>
          )}
        </div>
      )}

      {/* Options */}
      {optionGroups.length > 0 && (
        <ProductOptions 
          optionGroups={optionGroups}
          onSelectionChange={setSelections}
        />
      )}

      {/* Add to Cart */}
      <AddToCartButton 
        product={product}
        price={totalPrice}
        currency={currency}
        selectedOptions={selectedOptions}
        variantId={variantId}
      />
    </div>
  );
}
