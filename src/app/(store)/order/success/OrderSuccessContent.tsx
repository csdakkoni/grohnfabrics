'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { clearCart } from '@/lib/cart';

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart on successful order
    clearCart();

    // Fetch order details if we have an orderId
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order_number) {
            setOrderNumber(data.order_number);
          }
        })
        .catch(console.error);
    }
  }, [orderId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="max-w-lg mx-auto text-center px-4">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-[var(--success-light)] rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[var(--success)]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold mb-2">Siparişiniz Alındı!</h1>
        <p className="text-[var(--foreground-muted)] mb-8">
          Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.
        </p>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-[var(--background-secondary)] rounded-xl p-6 mb-8">
            <p className="text-sm text-[var(--foreground-muted)] mb-1">Sipariş Numarası</p>
            <p className="text-2xl font-semibold text-[var(--brand-primary)]">{orderNumber}</p>
          </div>
        )}

        {/* What's Next */}
        <div className="text-left space-y-4 mb-8">
          <h2 className="font-semibold">Sırada Ne Var?</h2>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--info-light)] flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[var(--info)]" />
            </div>
            <div>
              <p className="font-medium text-sm">Onay E-postası</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Sipariş detayları e-posta adresinize gönderildi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <div>
              <p className="font-medium text-sm">Hazırlık</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Siparişiniz 1-2 iş günü içinde hazırlanacak.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-[var(--success)]" />
            </div>
            <div>
              <p className="font-medium text-sm">Kargoya Verilecek</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Kargo takip numarası e-posta ile iletilecek.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/products" className="btn btn-primary flex-1">
            Alışverişe Devam Et
          </Link>
          <Link href="/" className="btn btn-secondary flex-1">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
