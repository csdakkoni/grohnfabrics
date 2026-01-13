'use client';

import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

// Extract base URL from Supabase storage URL
function getImageVariants(src: string) {
  if (!src) return { thumb: src, small: src, medium: src, large: src, webp: src };
  
  // Check if it's a Supabase storage URL
  if (src.includes('supabase.co/storage')) {
    const baseUrl = src.replace('/products/', '/products/');
    const fileName = src.split('/').pop()?.replace('.jpg', '') || '';
    const basePath = src.substring(0, src.lastIndexOf('/'));
    
    return {
      thumb: basePath.replace('/products', '/products/thumbs') + '/' + fileName + '.jpg',
      small: basePath + '/small/' + fileName + '.jpg',
      medium: src, // Original/default
      large: basePath + '/large/' + fileName + '.jpg',
      webp: basePath.replace('/products', '/products/webp') + '/' + fileName + '.webp',
    };
  }
  
  return { thumb: src, small: src, medium: src, large: src, webp: src };
}

// Use our dynamic image API for transformations
function getTransformUrl(src: string, width: number, format: 'jpeg' | 'webp' = 'jpeg') {
  if (!src) return src;
  
  // If it's a Supabase URL, use our API
  if (src.includes('supabase.co/storage')) {
    // Extract the path after /images/
    const match = src.match(/\/images\/(.+)$/);
    if (match) {
      const imagePath = match[1];
      return `/api/image/${imagePath}?w=${width}&f=${format}&q=82`;
    }
  }
  
  return src;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div 
        className={`bg-[var(--background-secondary)] flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-12 h-12 text-[var(--foreground-light)]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  // Generate srcset for responsive loading
  const srcSet = [
    `${getTransformUrl(src, 400, 'webp')} 400w`,
    `${getTransformUrl(src, 600, 'webp')} 600w`,
    `${getTransformUrl(src, 900, 'webp')} 900w`,
    `${getTransformUrl(src, 1200, 'webp')} 1200w`,
    `${getTransformUrl(src, 1600, 'webp')} 1600w`,
  ].join(', ');

  const fallbackSrcSet = [
    `${getTransformUrl(src, 400, 'jpeg')} 400w`,
    `${getTransformUrl(src, 600, 'jpeg')} 600w`,
    `${getTransformUrl(src, 900, 'jpeg')} 900w`,
    `${getTransformUrl(src, 1200, 'jpeg')} 1200w`,
    `${getTransformUrl(src, 1600, 'jpeg')} 1600w`,
  ].join(', ');

  return (
    <picture>
      {/* WebP for modern browsers */}
      <source 
        type="image/webp" 
        srcSet={srcSet}
        sizes={sizes}
      />
      {/* JPEG fallback */}
      <source 
        type="image/jpeg" 
        srcSet={fallbackSrcSet}
        sizes={sizes}
      />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`
          ${className}
          transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ 
          objectFit,
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
        }}
      />
    </picture>
  );
}

// Simple thumbnail component
export function Thumbnail({ 
  src, 
  alt, 
  size = 100,
  className = '' 
}: { 
  src: string; 
  alt: string; 
  size?: number;
  className?: string;
}) {
  const thumbUrl = getTransformUrl(src, size, 'webp');
  
  return (
    <img
      src={thumbUrl}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={`object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
