'use client';

import { useState, useMemo, useCallback } from 'react';
import ProductGallery from '@/components/store/ProductGallery';
import ProductDetailClient from './ProductDetailClient';

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
  option_type: 'color' | 'size' | 'select' | 'radio';
  is_required: boolean;
  values: OptionValue[];
}

interface ProductGalleryWithVariantsProps {
  images: string[];
  videos: string[];
  productName: string;
  product: any;
  material: any;
  optionGroups: OptionGroup[];
  basePrice: number;
  baseCurrency: string;
  locale: 'tr' | 'en';
  children?: React.ReactNode;
}

export default function ProductGalleryWithVariants({
  images,
  videos,
  productName,
  product,
  material,
  optionGroups,
  basePrice,
  baseCurrency,
  locale,
  children,
}: ProductGalleryWithVariantsProps) {
  const [jumpToIndex, setJumpToIndex] = useState<number | undefined>(undefined);

  // Collect ALL variant images from all color option groups
  // Build a map: variantValueId -> starting index in the combined image array
  const { allImages, variantImageStartIndex } = useMemo(() => {
    const colorGroups = optionGroups.filter(g => g.option_type === 'color');
    const variantImages: string[] = [];
    const indexMap: Record<string, number> = {};

    colorGroups.forEach(group => {
      group.values.forEach(value => {
        if (value.images && value.images.length > 0) {
          // Record the starting index for this variant's images
          // (offset by the number of main product images)
          indexMap[value.id] = images.length + variantImages.length;
          variantImages.push(...value.images);
        }
      });
    });

    // Combine: main product images first, then all variant images
    // Deduplicate: remove variant images that are already in main images
    const uniqueVariantImages = variantImages.filter(img => !images.includes(img));
    
    // Recalculate indices after deduplication
    const finalIndexMap: Record<string, number> = {};
    let currentIdx = images.length;
    colorGroups.forEach(group => {
      group.values.forEach(value => {
        if (value.images && value.images.length > 0) {
          const uniqueForThisValue = value.images.filter(img => !images.includes(img));
          if (uniqueForThisValue.length > 0) {
            finalIndexMap[value.id] = currentIdx;
            currentIdx += uniqueForThisValue.length;
          } else if (value.images.length > 0) {
            // All images are in main gallery already, find the first one
            const firstIdx = images.indexOf(value.images[0]);
            if (firstIdx >= 0) {
              finalIndexMap[value.id] = firstIdx;
            }
          }
        }
      });
    });

    return {
      allImages: [...images, ...uniqueVariantImages],
      variantImageStartIndex: finalIndexMap,
    };
  }, [images, optionGroups]);

  // When a color is selected, jump to its first image in the gallery
  const handleColorImagesChange = useCallback((colorValueImages: string[], valueId?: string) => {
    if (valueId && variantImageStartIndex[valueId] !== undefined) {
      setJumpToIndex(variantImageStartIndex[valueId]);
    } else if (colorValueImages.length > 0) {
      // Fallback: find the first color image in allImages
      const idx = allImages.indexOf(colorValueImages[0]);
      if (idx >= 0) {
        setJumpToIndex(idx);
      }
    }
  }, [allImages, variantImageStartIndex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images & Videos Gallery */}
      <ProductGallery
        images={allImages}
        videos={videos}
        productName={productName}
        jumpToIndex={jumpToIndex}
        onJumpHandled={() => setJumpToIndex(undefined)}
      />

      {/* Product Info */}
      <div>
        {/* This renders the children passed from the server component (badges, title, price, etc.) */}
        {children}

        {/* Options & Add to Cart - Client Component */}
        <ProductDetailClient
          product={product}
          material={material}
          optionGroups={optionGroups}
          basePrice={basePrice}
          baseCurrency={baseCurrency}
          locale={locale}
          onColorImagesChange={handleColorImagesChange}
        />
      </div>
    </div>
  );
}
