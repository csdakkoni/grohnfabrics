import { supabaseAdmin } from '@/lib/supabase/admin';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getFabricRolls() {
  const { data } = await supabaseAdmin
    .from('fabric_rolls')
    .select(`
      id,
      roll_number,
      lot_number,
      total_meters,
      reserved_meters,
      available_meters,
      location,
      created_at,
      product:products(name_tr, slug)
    `)
    .order('created_at', { ascending: false });
  
  return data || [];
}

async function getStockStats() {
  const { data: rolls } = await supabaseAdmin
    .from('fabric_rolls')
    .select('total_meters, reserved_meters, available_meters');
  
  if (!rolls) return { total: 0, reserved: 0, available: 0 };
  
  return {
    total: rolls.reduce((sum, r) => sum + Number(r.total_meters), 0),
    reserved: rolls.reduce((sum, r) => sum + Number(r.reserved_meters), 0),
    available: rolls.reduce((sum, r) => sum + Number(r.available_meters), 0),
  };
}

export default async function StockPage() {
  const [rolls, stats] = await Promise.all([
    getFabricRolls(),
    getStockStats(),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Stok Yönetimi</h1>
          <p className="text-[var(--foreground-muted)]">Kumaş topları ve stok takibi</p>
        </div>
        <Link href="/admin/stock/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Yeni Top Ekle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-[var(--foreground-muted)]">Toplam Stok</p>
            <p className="text-2xl font-semibold">{stats.total.toFixed(1)} m</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-[var(--foreground-muted)]">Rezerve</p>
            <p className="text-2xl font-semibold text-[var(--warning)]">{stats.reserved.toFixed(1)} m</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-[var(--foreground-muted)]">Kullanılabilir</p>
            <p className="text-2xl font-semibold text-[var(--success)]">{stats.available.toFixed(1)} m</p>
          </div>
        </div>
      </div>

      {/* Rolls Table */}
      {rolls.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Top No</th>
                <th>Ürün</th>
                <th>Lot No</th>
                <th>Toplam</th>
                <th>Rezerve</th>
                <th>Kullanılabilir</th>
                <th>Konum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rolls.map((roll) => (
                <tr key={roll.id}>
                  <td className="font-medium">{roll.roll_number || '-'}</td>
                  <td>
                    {(() => {
                      const product = Array.isArray(roll.product) ? roll.product[0] : roll.product;
                      return product ? (
                        <Link 
                          href={`/admin/products/${product.slug}`}
                          className="text-[var(--brand-primary)] hover:underline"
                        >
                          {product.name_tr}
                        </Link>
                      ) : '-';
                    })()}
                  </td>
                  <td className="text-[var(--foreground-muted)]">{roll.lot_number || '-'}</td>
                  <td>{roll.total_meters} m</td>
                  <td>
                    {roll.reserved_meters > 0 && (
                      <span className="text-[var(--warning)]">{roll.reserved_meters} m</span>
                    )}
                    {roll.reserved_meters === 0 && '-'}
                  </td>
                  <td className="text-[var(--success)]">{roll.available_meters} m</td>
                  <td className="text-[var(--foreground-muted)]">{roll.location || '-'}</td>
                  <td>
                    <Link 
                      href={`/admin/stock/${roll.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Düzenle
                    </Link>
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
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz kumaş topu yok</h3>
            <p className="empty-state-description">
              Stok takibi için kumaş toplarınızı ekleyin.
            </p>
            <Link href="/admin/stock/new" className="btn btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Yeni Top Ekle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
