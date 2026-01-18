'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Ticket, Save, Loader2 } from 'lucide-react';

export default function NewCouponPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    per_customer_limit: '1',
    market_id: '',
    currency: '',
    starts_at: new Date().toISOString().split('T')[0],
    expires_at: '',
    is_active: true,
    is_first_order_only: false,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('coupons')
        .insert({
          code: form.code.toUpperCase().trim(),
          discount_type: form.discount_type,
          discount_value: parseFloat(form.discount_value),
          min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
          max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
          usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
          per_customer_limit: form.per_customer_limit ? parseInt(form.per_customer_limit) : null,
          market_id: form.market_id || null,
          currency: form.currency || null,
          starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          is_active: form.is_active,
          is_first_order_only: form.is_first_order_only,
          description: form.description || null,
        });

      if (insertError) throw insertError;

      router.push('/admin/coupons');
    } catch (err) {
      console.error('Coupon creation error:', err);
      setError(err instanceof Error ? err.message : 'Kupon oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/coupons"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kuponlara Dön
        </Link>
        <h1 className="text-2xl font-semibold">Yeni Kupon</h1>
        <p className="text-[var(--foreground-muted)]">İndirim kodu oluşturun</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-[var(--error-light)] text-[var(--error)] rounded-lg">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Kupon Bilgileri</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Code */}
            <div className="form-group">
              <label className="label">Kupon Kodu *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input flex-1 font-mono"
                  placeholder="YENI2024"
                  required
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="btn btn-secondary"
                >
                  Oluştur
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="label">Açıklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                placeholder="İlk sipariş indirimi"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">İndirim Tipi *</label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  className="input"
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">
                  İndirim Değeri *
                  {form.discount_type === 'percentage' ? ' (%)' : ' (₺)'}
                </label>
                <input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="input"
                  placeholder={form.discount_type === 'percentage' ? '10' : '50'}
                  min="0"
                  step={form.discount_type === 'percentage' ? '1' : '0.01'}
                  required
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Minimum Sipariş Tutarı (₺)</label>
                <input
                  type="number"
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="input"
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
                <p className="form-hint">Boş = Limit yok</p>
              </div>
              {form.discount_type === 'percentage' && (
                <div className="form-group">
                  <label className="label">Maksimum İndirim (₺)</label>
                  <input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                    className="input"
                    placeholder="200"
                    min="0"
                    step="0.01"
                  />
                  <p className="form-hint">Yüzde indirimleri için üst limit</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Kullanım Limitleri</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Toplam Kullanım Limiti</label>
                <input
                  type="number"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  className="input"
                  placeholder="100"
                  min="1"
                />
                <p className="form-hint">Boş = Sınırsız</p>
              </div>
              <div className="form-group">
                <label className="label">Kişi Başı Limit</label>
                <input
                  type="number"
                  value={form.per_customer_limit}
                  onChange={(e) => setForm({ ...form, per_customer_limit: e.target.value })}
                  className="input"
                  placeholder="1"
                  min="1"
                />
                <p className="form-hint">Her müşteri kaç kez kullanabilir</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="first_order"
                checked={form.is_first_order_only}
                onChange={(e) => setForm({ ...form, is_first_order_only: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              <label htmlFor="first_order" className="text-sm">
                Sadece ilk sipariş için geçerli
              </label>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Kısıtlamalar</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Market</label>
                <select
                  value={form.market_id}
                  onChange={(e) => setForm({ ...form, market_id: e.target.value })}
                  className="input"
                >
                  <option value="">Tüm Marketler</option>
                  <option value="TR">Türkiye</option>
                  <option value="GLOBAL">Global</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Para Birimi</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="input"
                >
                  <option value="">Tümü</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="input"
                />
                <p className="form-hint">Boş = Süresiz</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              <label htmlFor="is_active" className="text-sm">
                Kupon aktif
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Kuponu Kaydet
              </>
            )}
          </button>
          <Link href="/admin/coupons" className="btn btn-secondary">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
