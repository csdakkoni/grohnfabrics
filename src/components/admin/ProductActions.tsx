'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Loader2 } from 'lucide-react';

interface ProductActionsProps {
  productId: string;
}

export default function ProductActions({ productId }: ProductActionsProps) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (copying) return;
    
    if (!confirm('Bu ürünü kopyalamak istiyor musunuz? Tüm bilgiler, fiyatlar ve varyantlar kopyalanacak.')) {
      return;
    }

    setCopying(true);
    try {
      const response = await fetch('/api/admin/products/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to the new product's edit page
        router.push(`/admin/products/${result.newProductId}?new=true`);
        router.refresh();
      } else {
        alert(result.error || 'Kopyalama başarısız oldu');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Bir hata oluştu');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        disabled={copying}
        className="btn btn-ghost btn-sm"
        title="Kopyala"
      >
        {copying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <Link 
        href={`/admin/products/${productId}`}
        className="btn btn-ghost btn-sm"
      >
        Düzenle
      </Link>
    </div>
  );
}
