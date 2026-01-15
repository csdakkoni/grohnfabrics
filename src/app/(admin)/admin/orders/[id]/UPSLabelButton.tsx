'use client';

import { useState } from 'react';
import { Truck, Download, Loader2, ExternalLink } from 'lucide-react';

interface Props {
  orderId: string;
  existingLabel?: string | null;
  existingTrackingNumber?: string | null;
}

export default function UPSLabelButton({ orderId, existingLabel, existingTrackingNumber }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelUrl, setLabelUrl] = useState<string | null>(existingLabel || null);
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

      setLabelUrl(data.labelUrl);
      setTrackingNumber(data.trackingNumber);

      // Sayfayı yenile
      window.location.reload();
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const downloadLabel = () => {
    if (!labelUrl) return;

    // Base64 PDF'i indir
    const link = document.createElement('a');
    link.href = labelUrl;
    link.download = `ups-label-${trackingNumber || orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {labelUrl && trackingNumber ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Kargo etiketi hazır!</p>
            <p className="text-xs text-green-600 mt-1">Takip No: {trackingNumber}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={downloadLabel}
              className="btn btn-primary flex-1"
            >
              <Download className="w-4 h-4" />
              Etiketi İndir
            </button>
            
            <a
              href={`https://www.ups.com/track?tracknum=${trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink className="w-4 h-4" />
              Takip Et
            </a>
          </div>
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
