'use client';

import { useState, useMemo } from 'react';
import ProductOptions from '@/components/store/ProductOptions';
import AddToCartButton from '@/components/store/AddToCartButton';
import WishlistButton from '@/components/store/WishlistButton';
import MeasurementTool, { FabricConfig } from '@/components/store/MeasurementTool';
import { Ruler, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/store/CartProvider';
import { setCartMarket } from '@/lib/cart';
import { useMarket } from '@/lib/market/context';

interface OptionValue {
  id: string;
  value_tr: string;
  value_en: string;
  hex_color?: string;
  price_modifier: number;
  is_available: boolean;
  images?: string[];
}

interface OptionGroup {
  id: string;
  name_tr: string;
  name_en: string;
  option_type: 'select' | 'color' | 'size' | 'radio';
  is_required: boolean;
  values: OptionValue[];
}

interface Material {
  id: string;
  name: string;
  width_cm?: number;
}

interface Product {
  id: string;
  name_tr: string;
  name_en?: string;
  product_type?: string;
  sales_model: string;
  min_order_quantity: number;
  order_step: number;
  thumbnail_url?: string;
  images?: string[];
}

interface ProductDetailClientProps {
  product: Product;
  material?: Material | null;
  optionGroups: OptionGroup[];
  basePrice: number;
  baseCurrency: string;
  locale?: 'tr' | 'en';
  onColorImagesChange?: (images: string[]) => void;
}

export default function ProductDetailClient({
  product,
  material,
  optionGroups,
  basePrice,
  baseCurrency,
  locale = 'tr',
  onColorImagesChange
}: ProductDetailClientProps) {
  // Currency comes from server (based on region cookie)
  const currency = baseCurrency;
  const [selections, setSelections] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { addToCart } = useCart();
  const { t } = useMarket();

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

  const isEnglish = locale === 'en';

  const fabricConfig: FabricConfig | undefined = useMemo(() => {
    if (!material?.width_cm) return undefined;
    return {
      id: material.id,
      name: material.name,
      widthCm: material.width_cm,
      pricePerMeter: basePrice, // Assuming basePrice is per linear meter
      currency: baseCurrency,
      image: product.thumbnail_url || product.images?.[0]
    };
  }, [material, basePrice, baseCurrency, product]);

  const handleCustomAddToCart = (results: any, state: any, customCost: number) => {
    const market = currency === 'TRY' ? 'TR' : 'GLOBAL';
    setCartMarket(market, currency);

    // Parse custom configuration into options display
    const customOptions = {
      [t('Genişlik × Yükseklik', 'Width × Height')]: `${results.totalRodWidth}cm × ${results.curtainHeight}cm`,
      [t('Panel', 'Panels')]: state.panelType === 'split' ? t('Çift Panel', 'Split Panel') : t('Tek Panel', 'Single Panel'),
      [t('Pilili', 'Pleat')]: `${state.fullness}x`,
      [t('Başlık Tipi', 'Header Style')]: state.headerStyle
    };

    addToCart({
      productId: product.id,
      variantId: `custom-size-${Date.now()}`,
      name: `${product.name_tr} [Özel Ölçü]`,
      nameEn: `${product.name_en || product.name_tr} [Custom Size]`,
      image: product.thumbnail_url || product.images?.[0],
      quantity: 1, // 1 setup of these panels constitutes 1 quantity
      price: customCost,
      currency: currency,
      salesModel: 'unit', // Once sized, it functions as a distinct unit
      options: { ...selectedOptions, ...customOptions }
    });

    setShowCustomModal(false);
  };

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
          onColorImagesChange={onColorImagesChange}
        />
      )}

      {/* Custom Size Wizard Entry Point */}
      {fabricConfig && (product.product_type === 'curtain' || product.product_type === 'fabric') && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="w-full relative overflow-hidden group rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--brand-primary)]/50 transition-all p-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Ruler className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--foreground)] text-sm">{t('Özel Ölçü Siparişi', 'Order Custom Size')}</h4>
                <p className="text-xs text-[var(--foreground-muted)] block mt-0.5">{t('Pencerenize tam uyacak özel dikim siparişi verin', 'Made to measure specifically for your windows')}</p>
              </div>
              <div className="text-[var(--brand-primary)]">
                <Ruler className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {/* Glossy shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-shine z-10" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <div className="flex-1">
          <AddToCartButton
            product={product}
            price={totalPrice}
            currency={currency}
            selectedOptions={selectedOptions}
            variantId={variantId}
          />
        </div>
        <WishlistButton productId={product.id} size="lg" variant="icon" className="shadow-md" />
      </div>

      {/* Custom Size Configurator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setShowCustomModal(false)}
          />
          <div className="relative bg-[var(--background)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-lg font-medium">{t('Özel Ölçü Yapılandırıcı', 'Custom Size Configurator')}</h3>
                <p className="text-sm text-[var(--foreground-muted)]">{isEnglish ? product.name_en : product.name_tr}</p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MeasurementTool
                locale={locale}
                fabric={fabricConfig}
                onAddToCart={handleCustomAddToCart}
                onCancel={() => setShowCustomModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
