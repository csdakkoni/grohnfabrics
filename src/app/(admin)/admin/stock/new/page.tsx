'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name_tr: string;
  slug: string;
  sales_model: string;
}

export default function NewStockPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    product_id: '',
    roll_number: '',
    lot_number: '',
    total_meters: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, name_tr, slug, sales_model')
      .eq('sales_model', 'meter')
      .eq('is_active', true)
      .order('name_tr');
    setProducts(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalMeters = parseFloat(form.total_meters);
      
      const { error } = await supabase
        .from('fabric_rolls')
        .insert({
          product_id: form.product_id,
          roll_number: form.roll_number || null,
          lot_number: form.lot_number || null,
          total_meters: totalMeters,
          available_meters: totalMeters, // Başlangıçta tamamı kullanılabilir
          reserved_meters: 0,
          location: form.location || null,
          notes: form.notes || null,
        });

      if (error) throw error;

      router.push('/admin/stock');
    } catch (error) {
      console.error('Error:', error);
      alert('Kayıt eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold">Yeni Kumaş Topu Ekle</h1>
        <p className="text-[var(--foreground-muted)]">Stok takibi için yeni kumaş topu ekleyin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Selection */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Ürün Bilgisi</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">Ürün *</label>
                  <select
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Ürün seçin...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name_tr}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    Sadece metre bazlı satılan ürünler listelenir
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
                      min="0.1"
                      value={form.total_meters}
                      onChange={(e) => setForm({ ...form, total_meters: e.target.value })}
                      className="input pr-12"
                      placeholder="0.0"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                      m
                    </span>
                  </div>
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
                  disabled={loading || !form.product_id || !form.total_meters}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Kaydet
                    </>
                  )}
                </button>
                <Link href="/admin/stock" className="btn btn-secondary w-full">
                  İptal
                </Link>
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
                  Her kumaş topu için ayrı stok kaydı tutarak metre bazlı satış ve 
                  rezervasyon takibi yapabilirsiniz. Sipariş oluşturulduğunda 
                  otomatik olarak rezerve edilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
