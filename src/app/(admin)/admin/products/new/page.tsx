'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name_tr: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name_tr: '',
    name_en: '',
    slug: '',
    description_tr: '',
    description_en: '',
    category_id: '',
    product_type: 'fabric',
    sales_model: 'meter',
    min_order_quantity: '1',
    order_step: '0.5',
    is_active: true,
    show_in_tr: true,
    show_in_global: true,
    // Prices
    price_tr: '',
    price_usd: '',
    price_eur: '',
  });

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name_tr')
        .eq('is_active', true)
        .order('name_tr');
      setCategories(data || []);
    }
    loadCategories();
  }, [supabase]);

  // Auto-generate slug from Turkish name
  useEffect(() => {
    const slug = form.name_tr
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setForm(f => ({ ...f, slug }));
  }, [form.name_tr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name_tr: form.name_tr,
          name_en: form.name_en,
          slug: form.slug,
          description_tr: form.description_tr || null,
          description_en: form.description_en || null,
          category_id: form.category_id || null,
          product_type: form.product_type,
          sales_model: form.sales_model,
          min_order_quantity: parseFloat(form.min_order_quantity),
          order_step: parseFloat(form.order_step),
          is_active: form.is_active,
          show_in_tr: form.show_in_tr,
          show_in_global: form.show_in_global,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create prices
      const prices = [];
      if (form.price_tr) {
        prices.push({
          product_id: product.id,
          market_id: 'TR',
          currency: 'TRY',
          price: parseFloat(form.price_tr),
        });
      }
      if (form.price_usd) {
        prices.push({
          product_id: product.id,
          market_id: 'GLOBAL',
          currency: 'USD',
          price: parseFloat(form.price_usd),
        });
      }
      if (form.price_eur) {
        prices.push({
          product_id: product.id,
          market_id: 'GLOBAL',
          currency: 'EUR',
          price: parseFloat(form.price_eur),
        });
      }

      if (prices.length > 0) {
        const { error: priceError } = await supabase
          .from('product_prices')
          .insert(prices);
        if (priceError) throw priceError;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Ürün oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Ürünlere Dön
        </Link>
        <h1 className="text-2xl font-semibold">Yeni Ürün</h1>
        <p className="text-[var(--foreground-muted)]">Yeni bir ürün ekleyin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Temel Bilgiler</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Ürün Adı (TR) *</label>
                    <input
                      type="text"
                      value={form.name_tr}
                      onChange={(e) => setForm({ ...form, name_tr: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Product Name (EN) *</label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input"
                  />
                  <p className="form-hint">grohnfabrics.com/products/{form.slug || '...'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Açıklama (TR)</label>
                    <textarea
                      value={form.description_tr}
                      onChange={(e) => setForm({ ...form, description_tr: e.target.value })}
                      className="input"
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Description (EN)</label>
                    <textarea
                      value={form.description_en}
                      onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                      className="input"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Fiyatlandırma</h2>
                <p className="card-description">Market bazlı fiyatlar</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="label">Türkiye (TRY)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_tr}
                      onChange={(e) => setForm({ ...form, price_tr: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Global (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_usd}
                      onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Global (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_eur}
                      onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Durum</h2>
              </div>
              <div className="card-body space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Aktif (Yayında)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_in_tr}
                    onChange={(e) => setForm({ ...form, show_in_tr: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Türkiye&apos;de Göster</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_in_global}
                    onChange={(e) => setForm({ ...form, show_in_global: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Global&apos;de Göster</span>
                </label>
              </div>
            </div>

            {/* Classification */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Sınıflandırma</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">Kategori</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Seçiniz...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Ürün Tipi *</label>
                  <select
                    value={form.product_type}
                    onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="fabric">Kumaş</option>
                    <option value="pillow">Yastık Kılıfı</option>
                    <option value="curtain">Perde</option>
                    <option value="tablecloth">Masa Örtüsü</option>
                    <option value="runner">Runner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Satış Modeli *</label>
                  <select
                    value={form.sales_model}
                    onChange={(e) => setForm({ ...form, sales_model: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="meter">Metre Bazlı</option>
                    <option value="unit">Adet Bazlı</option>
                    <option value="preset_sizes">Hazır Ölçüler</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Settings (for meter-based) */}
            {form.sales_model === 'meter' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Sipariş Ayarları</h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="form-group">
                    <label className="label">Minimum Sipariş (metre)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.min_order_quantity}
                      onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Artış Adımı (metre)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.order_step}
                      onChange={(e) => setForm({ ...form, order_step: e.target.value })}
                      className="input"
                    />
                    <p className="form-hint">Örn: 0.5 = 1m, 1.5m, 2m...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/admin/products" className="btn btn-secondary flex-1">
                İptal
              </Link>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
