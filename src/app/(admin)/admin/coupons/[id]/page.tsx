'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_customer_limit: number | null;
  market_id: string | null;
  currency: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  is_first_order_only: boolean;
  description: string | null;
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    per_customer_limit: '',
    market_id: '',
    currency: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
    is_first_order_only: false,
    description: '',
  });

  useEffect(() => {
    async function loadCoupon() {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Kupon bulunamadı');
        setLoading(false);
        return;
      }

      const c = data as Coupon;
      setCoupon(c);
      setForm({
        code: c.code,
        discount_type: c.discount_type,
        discount_value: c.discount_value.toString(),
        min_order_amount: c.min_order_amount?.toString() || '',
        max_discount_amount: c.max_discount_amount?.toString() || '',
        usage_limit: c.usage_limit?.toString() || '',
        per_customer_limit: c.per_customer_limit?.toString() || '',
        market_id: c.market_id || '',
        currency: c.currency || '',
        starts_at: c.starts_at ? new Date(c.starts_at).toISOString().split('T')[0] : '',
        expires_at: c.expires_at ? new Date(c.expires_at).toISOString().split('T')[0] : '',
        is_active: c.is_active,
        is_first_order_only: c.is_first_order_only,
        description: c.description || '',
      });
      setLoading(false);
    }

    loadCoupon();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
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
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/admin/coupons');
    } catch (err) {
      console.error('Coupon update error:', err);
      setError(err instanceof Error ? err.message : 'Kupon güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      router.push('/admin/coupons');
    } catch (err) {
      console.error('Coupon delete error:', err);
      setError(err instanceof Error ? err.message : 'Kupon silinemedi');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-8">
        <div className="card">
          <div className="empty-state">
            <h3 className="empty-state-title">Kupon bulunamadı</h3>
            <Link href="/admin/coupons" className="btn btn-primary mt-4">
              Kuponlara Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kupon Düzenle</h1>
            <p className="text-[var(--foreground-muted)]">
              <code className="px-2 py-1 bg-[var(--background-secondary)] rounded font-mono">
                {coupon.code}
              </code>
              <span className="ml-2">• {coupon.usage_count} kullanım</span>
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-ghost text-[var(--error)]"
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            Sil
          </button>
        </div>
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
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input font-mono"
                required
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="label">Açıklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
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
                  min="0"
                  step="0.01"
                />
              </div>
              {form.discount_type === 'percentage' && (
                <div className="form-group">
                  <label className="label">Maksimum İndirim (₺)</label>
                  <input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                  />
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
                  min="1"
                />
                <p className="form-hint">Mevcut: {coupon.usage_count} kullanım</p>
              </div>
              <div className="form-group">
                <label className="label">Kişi Başı Limit</label>
                <input
                  type="number"
                  value={form.per_customer_limit}
                  onChange={(e) => setForm({ ...form, per_customer_limit: e.target.value })}
                  className="input"
                  min="1"
                />
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
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Değişiklikleri Kaydet
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
