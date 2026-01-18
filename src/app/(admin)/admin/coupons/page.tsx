import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, Ticket, Calendar, Users, TrendingUp, MoreHorizontal, Trash2, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  market_id: string | null;
  currency: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  is_first_order_only: boolean;
  description: string | null;
  created_at: string;
}

async function getCoupons() {
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Coupon fetch error:', error);
    return [];
  }
  return data as Coupon[];
}

async function getStats() {
  const { data: coupons } = await supabaseAdmin
    .from('coupons')
    .select('is_active, usage_count');

  const totalCoupons = coupons?.length || 0;
  const activeCoupons = coupons?.filter(c => c.is_active).length || 0;
  const totalUsage = coupons?.reduce((sum, c) => sum + (c.usage_count || 0), 0) || 0;

  // Calculate total discount given
  const { data: usages } = await supabaseAdmin
    .from('coupon_usages')
    .select('discount_applied');

  const totalDiscount = usages?.reduce((sum, u) => sum + Number(u.discount_applied || 0), 0) || 0;

  return { totalCoupons, activeCoupons, totalUsage, totalDiscount };
}

export default async function CouponsPage() {
  const [coupons, stats] = await Promise.all([getCoupons(), getStats()]);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Kuponlar</h1>
          <p className="text-[var(--foreground-muted)]">İndirim kodlarını yönetin</p>
        </div>
        <Link href="/admin/coupons/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Yeni Kupon
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Toplam Kupon</p>
              <p className="text-2xl font-semibold">{stats.totalCoupons}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Aktif Kupon</p>
              <p className="text-2xl font-semibold">{stats.activeCoupons}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--info)]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Toplam Kullanım</p>
              <p className="text-2xl font-semibold">{stats.totalUsage}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Toplam İndirim</p>
              <p className="text-2xl font-semibold">₺{stats.totalDiscount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      {coupons.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Kupon Kodu</th>
                <th>İndirim</th>
                <th>Kullanım</th>
                <th>Min. Tutar</th>
                <th>Geçerlilik</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <div>
                      <code className="px-2 py-1 bg-[var(--background-secondary)] rounded font-mono text-sm">
                        {coupon.code}
                      </code>
                      {coupon.description && (
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-medium">
                      {coupon.discount_type === 'percentage' 
                        ? `%${coupon.discount_value}`
                        : `₺${coupon.discount_value}`
                      }
                    </span>
                    {coupon.max_discount_amount && (
                      <span className="text-xs text-[var(--foreground-muted)] block">
                        (max ₺{coupon.max_discount_amount})
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="font-medium">{coupon.usage_count}</span>
                    {coupon.usage_limit && (
                      <span className="text-[var(--foreground-muted)]">
                        /{coupon.usage_limit}
                      </span>
                    )}
                  </td>
                  <td>
                    {coupon.min_order_amount > 0 
                      ? `₺${coupon.min_order_amount}` 
                      : '-'
                    }
                  </td>
                  <td className="text-sm">
                    <div>{formatDate(coupon.starts_at)}</div>
                    {coupon.expires_at && (
                      <div className={`text-xs ${isExpired(coupon.expires_at) ? 'text-[var(--error)]' : 'text-[var(--foreground-muted)]'}`}>
                        → {formatDate(coupon.expires_at)}
                      </div>
                    )}
                  </td>
                  <td>
                    {!coupon.is_active ? (
                      <span className="badge badge-gray">Pasif</span>
                    ) : isExpired(coupon.expires_at) ? (
                      <span className="badge badge-error">Süresi Doldu</span>
                    ) : coupon.usage_limit && coupon.usage_count >= coupon.usage_limit ? (
                      <span className="badge badge-warning">Limit Doldu</span>
                    ) : (
                      <span className="badge badge-success">Aktif</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz kupon yok</h3>
            <p className="empty-state-description">
              İlk kuponunuzu oluşturarak müşterilerinize indirim sunun.
            </p>
            <Link href="/admin/coupons/new" className="btn btn-primary mt-4">
              <Plus className="w-5 h-5" />
              Kupon Oluştur
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
