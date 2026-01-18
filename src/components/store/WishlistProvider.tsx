'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    slug: string;
    name_tr: string;
    name_en?: string;
    thumbnail_url?: string;
    images?: string[];
    product_type: string;
    sales_model: string;
    prices?: Array<{ price: number; currency: string; market_id: string }>;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// Generate or get session ID for guest users
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('grohn_wishlist_session');
  if (!sessionId) {
    sessionId = 'ws_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('grohn_wishlist_session', sessionId);
  }
  return sessionId;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`/api/wishlist?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.product_id === productId);
  }, [items]);

  const addToWishlist = useCallback(async (productId: string) => {
    const sessionId = getSessionId();
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sessionId }),
      });

      if (response.ok) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    const sessionId = getSessionId();
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sessionId }),
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.product_id !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      refresh: fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
