'use client';

import { useState } from 'react';
import { Truck, Download, Loader2, ExternalLink, Eye } from 'lucide-react';

interface Props {
  orderId: string;
  existingLabel?: string | null;
  existingTrackingNumber?: string | null;
}

// Base64'ü Blob'a çevir (PDF için)
function base64ToBlob(base64: string, type = 'application/pdf'): Blob {
  // data:application/pdf;base64, prefix'ini kaldır (varsa)
  const base64Data = base64.replace(/^data:.*?;base64,/, '');
  
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type });
}

export default function UPSLabelButton({ orderId, existingLabel, existingTrackingNumber }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelData, setLabelData] = useState<string | null>(existingLabel || null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(existingTrackingNumber || null);

  const createLabel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shipping/ups/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setLabelData(data.labelImage || data.labelUrl);
      setTrackingNumber(data.trackingNumber);

      // Etiketi otomatik olarak yeni sekmede aç
      if (data.labelImage) {
        openLabelInNewTab(data.labelImage);
      }
      
      // Sayfayı yenile
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openLabelInNewTab = (base64Data: string) => {
    try {
      const blob = base64ToBlob(base64Data);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('PDF açılamadı:', err);
    }
  };

  const downloadLabel = () => {
    if (!labelData) return;

    try {
      const blob = base64ToBlob(labelData);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ups-label-${trackingNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL'i temizle
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF indirilemedi:', err);
      setError('PDF indirme hatası');
    }
  };

  const viewLabel = () => {
    if (!labelData) return;
    openLabelInNewTab(labelData);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {labelData && trackingNumber ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Kargo etiketi hazır!</p>
            <p className="text-xs text-green-600 mt-1">Takip No: {trackingNumber}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={viewLabel}
              className="btn btn-primary flex-1"
            >
              <Eye className="w-4 h-4" />
              Görüntüle
            </button>
            
            <button
              onClick={downloadLabel}
              className="btn btn-secondary flex-1"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
          </div>
          
          <a
            href={`https://www.ups.com/track?tracknum=${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost w-full text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            UPS'te Takip Et
          </a>
        </div>
      ) : (
        <button
          onClick={createLabel}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Etiket Oluşturuluyor...
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" />
              UPS Kargo Etiketi Oluştur
            </>
          )}
        </button>
      )}
    </div>
  );
}
