'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: string;
}

const statusFlow: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

const statusLabels: Record<string, string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Et',
  refunded: 'İade Et',
};

const statusColors: Record<string, string> = {
  paid: 'btn-primary',
  processing: 'btn-primary',
  shipped: 'btn-primary',
  delivered: 'btn-primary',
  cancelled: 'bg-[var(--error)] text-white hover:bg-[var(--error)]/90',
  refunded: 'bg-[var(--warning)] text-white hover:bg-[var(--warning)]/90',
};

export default function OrderStatusChanger({ orderId, currentStatus }: OrderStatusChangerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  const availableStatuses = statusFlow[currentStatus] || [];

  const handleStatusChange = async (newStatus: string) => {
    // If changing to shipped, show tracking number input first
    if (newStatus === 'shipped' && !showTrackingInput) {
      setShowTrackingInput(true);
      return;
    }

    setLoading(newStatus);

    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
      updateData.shipping_provider = 'ups'; // Default
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
    }

    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      alert('Durum güncellenemedi: ' + error.message);
    } else {
      router.refresh();
    }

    setLoading(null);
    setShowTrackingInput(false);
  };

  if (availableStatuses.length === 0) {
    return (
      <p className="text-sm text-[var(--foreground-muted)]">
        Bu sipariş için durum değişikliği yapılamaz.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--foreground-muted)]">
        Siparişi bir sonraki aşamaya taşıyın:
      </p>

      {/* Tracking Number Input (for shipped status) */}
      {showTrackingInput && (
        <div className="p-4 bg-[var(--background-secondary)] rounded-lg space-y-3">
          <div className="form-group">
            <label className="label">Kargo Takip Numarası</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="input"
              placeholder="1Z999AA10123456784"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('shipped')}
              disabled={loading === 'shipped'}
              className="btn btn-primary flex-1"
            >
              {loading === 'shipped' ? 'Kaydediliyor...' : 'Kargoya Ver'}
            </button>
            <button
              onClick={() => setShowTrackingInput(false)}
              className="btn btn-secondary"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Status Buttons */}
      {!showTrackingInput && (
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={loading === status}
              className={`btn ${statusColors[status] || 'btn-secondary'}`}
            >
              {loading === status ? 'İşleniyor...' : statusLabels[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
