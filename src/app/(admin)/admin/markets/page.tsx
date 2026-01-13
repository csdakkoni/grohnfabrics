import { supabaseAdmin } from '@/lib/supabase/admin';
import { Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getMarkets() {
  const { data } = await supabaseAdmin
    .from('markets')
    .select(`
      *,
      company:companies(name)
    `);
  
  return data || [];
}

async function getShippingProfiles() {
  const { data } = await supabaseAdmin
    .from('shipping_profiles')
    .select('*')
    .order('market_id');
  
  return data || [];
}

export default async function MarketsPage() {
  const [markets, shippingProfiles] = await Promise.all([
    getMarkets(),
    getShippingProfiles(),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Marketler</h1>
        <p className="text-[var(--foreground-muted)]">Türkiye ve Global market ayarları</p>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {markets.map((market) => {
          const company = Array.isArray(market.company) ? market.company[0] : market.company;
          return (
          <div key={market.id} className="card">
            <div className="card-header flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center text-lg">
                {market.id === 'TR' ? '🇹🇷' : '🌍'}
              </div>
              <div>
                <h3 className="card-title">{market.name}</h3>
                <p className="card-description">{company?.name}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--foreground-muted)]">Varsayılan Para Birimi</p>
                  <p className="font-medium">{market.default_currency}</p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Desteklenen Para Birimleri</p>
                  <p className="font-medium">{market.supported_currencies?.join(', ') || '-'}</p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Varsayılan Dil</p>
                  <p className="font-medium">{market.default_locale === 'tr' ? 'Türkçe' : 'English'}</p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Ödeme Sağlayıcı</p>
                  <p className="font-medium">{market.id === 'TR' ? 'iyzico' : 'Stripe'}</p>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Shipping Profiles */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Kargo Profilleri</h2>
          <p className="card-description">Market bazlı kargo ücretleri</p>
        </div>
        {shippingProfiles.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Sağlayıcı</th>
                  <th>Ad</th>
                  <th>Taban Ücret</th>
                  <th>Kg Başı</th>
                  <th>Tahmini Süre</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {shippingProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <span className={`badge ${profile.market_id === 'TR' ? 'badge-primary' : 'badge-info'}`}>
                        {profile.market_id === 'TR' ? '🇹🇷 TR' : '🌍 Global'}
                      </span>
                    </td>
                    <td className="font-medium">{profile.provider}</td>
                    <td>{profile.name_tr}</td>
                    <td>
                      {profile.market_id === 'TR' 
                        ? `₺${profile.base_rate}` 
                        : `$${profile.base_rate}`}
                    </td>
                    <td>
                      {profile.market_id === 'TR' 
                        ? `₺${profile.per_kg_rate}` 
                        : `$${profile.per_kg_rate}`}
                    </td>
                    <td className="text-[var(--foreground-muted)]">
                      {profile.estimated_days_min}-{profile.estimated_days_max} gün
                    </td>
                    <td>
                      <span className={`badge ${profile.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {profile.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Kargo profili yok</h3>
          </div>
        )}
      </div>
    </div>
  );
}
