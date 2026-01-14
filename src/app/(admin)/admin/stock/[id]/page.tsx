'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Trash2, Package, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface FabricRoll {
  id: string;
  product_id: string;
  roll_number: string | null;
  lot_number: string | null;
  total_meters: number;
  reserved_meters: number;
  available_meters: number;
  location: string | null;
  notes: string | null;
  created_at: string;
  product?: {
    name_tr: string;
    slug: string;
  };
}

export default function EditStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roll, setRoll] = useState<FabricRoll | null>(null);
  const [form, setForm] = useState({
    roll_number: '',
    lot_number: '',
    total_meters: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadRoll();
  }, [id]);

  async function loadRoll() {
    const { data, error } = await supabase
      .from('fabric_rolls')
      .select(`
        *,
        product:products(name_tr, slug)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      alert('Kayıt bulunamadı');
      router.push('/admin/stock');
      return;
    }

    setRoll(data);
    setForm({
      roll_number: data.roll_number || '',
      lot_number: data.lot_number || '',
      total_meters: data.total_meters.toString(),
      location: data.location || '',
      notes: data.notes || '',
    });
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newTotalMeters = parseFloat(form.total_meters);
      const currentReserved = roll?.reserved_meters || 0;
      
      // Yeni toplam, rezerve edilenden az olamaz
      if (newTotalMeters < currentReserved) {
        alert(`Toplam metraj, rezerve edilen miktardan (${currentReserved}m) az olamaz`);
        setSaving(false);
        return;
      }

      const newAvailable = newTotalMeters - currentReserved;
      
      const { error } = await supabase
        .from('fabric_rolls')
        .update({
          roll_number: form.roll_number || null,
          lot_number: form.lot_number || null,
          total_meters: newTotalMeters,
          available_meters: newAvailable,
          location: form.location || null,
          notes: form.notes || null,
        })
        .eq('id', id);

      if (error) throw error;

      router.push('/admin/stock');
    } catch (error) {
      console.error('Error:', error);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roll) return;
    
    if (roll.reserved_meters > 0) {
      alert('Rezerve edilmiş stok bulunan kayıt silinemez');
      return;
    }
    
    if (!confirm('Bu kumaş topunu silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('fabric_rolls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      router.push('/admin/stock');
    } catch (error) {
      console.error('Error:', error);
      alert('Silme sırasında hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border)] rounded w-48"></div>
          <div className="h-64 bg-[var(--border)] rounded"></div>
        </div>
      </div>
    );
  }

  if (!roll) return null;

  const product = Array.isArray(roll.product) ? roll.product[0] : roll.product;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/stock" 
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Stok Yönetimi
        </Link>
        <h1 className="text-2xl font-semibold">Kumaş Topu Düzenle</h1>
        <p className="text-[var(--foreground-muted)]">
          {product?.name_tr || 'Ürün'} - {roll.roll_number || roll.id.slice(0, 8)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info (Read-only) */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Ürün Bilgisi</h2>
              </div>
              <div className="card-body">
                <div className="p-4 bg-[var(--background-secondary)] rounded-xl">
                  <p className="font-medium">{product?.name_tr || 'Ürün bulunamadı'}</p>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    Eklenme: {new Date(roll.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Roll Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Top Bilgileri</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Top Numarası</label>
                    <input
                      type="text"
                      value={form.roll_number}
                      onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                      className="input"
                      placeholder="Örn: TOP-001"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Lot Numarası</label>
                    <input
                      type="text"
                      value={form.lot_number}
                      onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
                      className="input"
                      placeholder="Örn: LOT-2026-01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Toplam Metraj *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min={roll.reserved_meters}
                      value={form.total_meters}
                      onChange={(e) => setForm({ ...form, total_meters: e.target.value })}
                      className="input pr-12"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                      m
                    </span>
                  </div>
                  {roll.reserved_meters > 0 && (
                    <p className="text-sm text-[var(--warning)] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Minimum {roll.reserved_meters}m (rezerve miktar)
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Depo Konumu</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input"
                    placeholder="Örn: Raf A-3"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Notlar</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Varsa ek notlar..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card">
              <div className="card-body space-y-4">
                <button
                  type="submit"
                  disabled={saving || !form.total_meters}
                  className="btn btn-primary w-full"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Güncelle
                    </>
                  )}
                </button>
                <Link href="/admin/stock" className="btn btn-secondary w-full">
                  İptal
                </Link>
                <hr className="border-[var(--border)]" />
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={roll.reserved_meters > 0}
                  className="btn btn-ghost w-full text-[var(--error)] hover:bg-[var(--error-light)]"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
                {roll.reserved_meters > 0 && (
                  <p className="text-xs text-[var(--foreground-muted)] text-center">
                    Rezerve stok varken silinemez
                  </p>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Stok Durumu</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)]">Toplam</span>
                    <span className="font-medium">{roll.total_meters} m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)]">Rezerve</span>
                    <span className="font-medium text-[var(--warning)]">
                      {roll.reserved_meters} m
                    </span>
                  </div>
                  <hr className="border-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)]">Kullanılabilir</span>
                    <span className="font-semibold text-[var(--success)]">
                      {roll.available_meters} m
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--warning)] to-[var(--success)]"
                      style={{ 
                        width: `${((roll.available_meters + roll.reserved_meters) / roll.total_meters) * 100}%`,
                      }}
                    >
                      <div 
                        className="h-full bg-[var(--warning)]"
                        style={{ width: `${(roll.reserved_meters / roll.total_meters) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <h3 className="font-medium">Stok Takibi</h3>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Rezerve miktar, bekleyen siparişlerdeki toplam miktarı gösterir. 
                  Sipariş tamamlandığında veya iptal edildiğinde otomatik güncellenir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
