'use client';

import { useState } from 'react';
import ProductGallery from '@/components/store/ProductGallery';
import ProductDetailClient from './ProductDetailClient';

interface ProductGalleryWithVariantsProps {
  images: string[];
  videos: string[];
  productName: string;
  product: any;
  material: any;
  optionGroups: any[];
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
  const [colorImages, setColorImages] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images & Videos Gallery */}
      <ProductGallery
        images={images}
        videos={videos}
        productName={productName}
        colorImages={colorImages}
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
          onColorImagesChange={setColorImages}
        />
      </div>
    </div>
  );
}
