'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from './WishlistProvider';
import { useState } from 'react';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export default function WishlistButton({ 
  productId, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`
          ${buttonSizeClasses[size]}
          rounded-full
          transition-all duration-200
          ${inWishlist 
            ? 'bg-[var(--error-light)] text-[var(--error)]' 
            : 'bg-white/90 text-[var(--foreground-muted)] hover:bg-white hover:text-[var(--error)]'
          }
          ${isAnimating ? 'scale-125' : 'scale-100'}
          ${className}
        `}
        title={inWishlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      >
        <Heart 
          className={`${sizeClasses[size]} transition-all ${inWishlist ? 'fill-current' : ''}`} 
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`
        btn btn-secondary flex items-center gap-2
        ${inWishlist ? 'text-[var(--error)]' : ''}
        ${className}
      `}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-all ${inWishlist ? 'fill-current' : ''}`} 
      />
      <span>{inWishlist ? 'Favorilerde' : 'Favorilere Ekle'}</span>
    </button>
  );
}
