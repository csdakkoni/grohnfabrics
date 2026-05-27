'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Globe, Edit2, Save, Plus, Trash2 } from 'lucide-react';

interface Market {
  id: string;
  name: string;
  company_id: string | null;
  default_currency: string;
  supported_currencies: string[];
  default_locale: string;
  is_active: boolean;
}

interface ShippingProfile {
  id: string;
  market_id: string;
  provider: string;
  name_tr: string;
  name_en: string;
  base_rate: number;
  per_kg_rate: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

interface Company {
  id: string;
  code: string;
  name: string;
}

export default function MarketsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<ShippingProfile[]>([]);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [editingShipping, setEditingShipping] = useState<ShippingProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [marketsRes, companiesRes, shippingRes] = await Promise.all([
      supabase.from('markets').select('*'),
      supabase.from('companies').select('id, code, name'),
      supabase.from('shipping_profiles').select('*').order('market_id'),
    ]);

    setMarkets(marketsRes.data || []);
    setCompanies(companiesRes.data || []);
    setShippingProfiles(shippingRes.data || []);
    setLoading(false);
  }

  async function saveMarket(market: Market) {
    setSaving(true);
    await supabase
      .from('markets')
      .update({
        name: market.name,
        company_id: market.company_id,
        default_currency: market.default_currency,
        supported_currencies: market.supported_currencies,
        default_locale: market.default_locale,
        is_active: market.is_active,
      })
      .eq('id', market.id);

    setEditingMarket(null);
    loadData();
    setSaving(false);
  }

  async function saveShipping(profile: ShippingProfile) {
    setSaving(true);
    
    if (profile.id.startsWith('new-')) {
      // Create new
      await supabase.from('shipping_profiles').insert({
        market_id: profile.market_id,
        provider: profile.provider,
        name_tr: profile.name_tr,
        name_en: profile.name_en,
        base_rate: profile.base_rate,
        per_kg_rate: profile.per_kg_rate,
        free_shipping_threshold: profile.free_shipping_threshold,
        estimated_days_min: profile.estimated_days_min,
        estimated_days_max: profile.estimated_days_max,
        is_active: profile.is_active,
      });
    } else {
      // Update existing
      await supabase
        .from('shipping_profiles')
        .update({
          provider: profile.provider,
          name_tr: profile.name_tr,
          name_en: profile.name_en,
          base_rate: profile.base_rate,
          per_kg_rate: profile.per_kg_rate,
          free_shipping_threshold: profile.free_shipping_threshold,
          estimated_days_min: profile.estimated_days_min,
          estimated_days_max: profile.estimated_days_max,
          is_active: profile.is_active,
        })
        .eq('id', profile.id);
    }

    setEditingShipping(null);
    loadData();
    setSaving(false);
  }

  async function deleteShipping(id: string) {
    if (!confirm('Bu kargo profilini silmek istediğinize emin misiniz?')) return;
    await supabase.from('shipping_profiles').delete().eq('id', id);
    loadData();
  }

  const addNewShipping = (marketId: string) => {
    setEditingShipping({
      id: 'new-' + Date.now(),
      market_id: marketId,
      provider: marketId === 'TR' ? 'yurtici_kargo' : 'ups',
      name_tr: '',
      name_en: '',
      base_rate: 0,
      per_kg_rate: 0,
      free_shipping_threshold: null,
      estimated_days_min: 1,
      estimated_days_max: 3,
      is_active: true,
    });
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
          const company = companies.find(c => c.id === market.company_id);
          return (
            <div key={market.id} className="card">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center text-lg">
                    {market.id === 'TR' ? '🇹🇷' : '🌍'}
                  </div>
                  <div>
                    <h3 className="card-title">{market.name}</h3>
                    <p className="card-description">{company?.name || 'Şirket bağlı değil'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingMarket(market)}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
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
                    <p className="text-[var(--foreground-muted)]">Durum</p>
                    <span className={`badge ${market.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {market.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Edit Modal */}
      {editingMarket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg mx-4">
            <div className="card-header">
              <h2 className="card-title">Market Düzenle: {editingMarket.id}</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label className="label">Market Adı</label>
                <input
                  type="text"
                  value={editingMarket.name}
                  onChange={(e) => setEditingMarket({ ...editingMarket, name: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Bağlı Şirket</label>
                <select
                  value={editingMarket.company_id || ''}
                  onChange={(e) => setEditingMarket({ ...editingMarket, company_id: e.target.value || null })}
                  className="input"
                >
                  <option value="">Seçiniz...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Varsayılan Para Birimi</label>
                  <select
                    value={editingMarket.default_currency}
                    onChange={(e) => setEditingMarket({ ...editingMarket, default_currency: e.target.value })}
                    className="input"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Varsayılan Dil</label>
                  <select
                    value={editingMarket.default_locale}
                    onChange={(e) => setEditingMarket({ ...editingMarket, default_locale: e.target.value })}
                    className="input"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMarket.is_active}
                    onChange={(e) => setEditingMarket({ ...editingMarket, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Aktif</span>
                </label>
              </div>
            </div>
            <div className="card-footer flex gap-3">
              <button onClick={() => setEditingMarket(null)} className="btn btn-secondary flex-1">
                İptal
              </button>
              <button onClick={() => saveMarket(editingMarket)} disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Profiles */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="card-title">Kargo Profilleri</h2>
            <p className="card-description">Market bazlı kargo ücretleri</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addNewShipping('TR')} className="btn btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              TR Ekle
            </button>
            <button onClick={() => addNewShipping('GLOBAL')} className="btn btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Global Ekle
            </button>
          </div>
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
                  <th>Süre</th>
                  <th>Durum</th>
                  <th></th>
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
                      {profile.market_id === 'TR' ? `₺${profile.base_rate}` : `$${profile.base_rate}`}
                      {profile.free_shipping_threshold && (
                        <span className="block text-xs text-[var(--foreground-muted)]">
                          Min: {profile.market_id === 'TR' ? `₺${profile.free_shipping_threshold}` : `$${profile.free_shipping_threshold}`}
                        </span>
                      )}
                    </td>
                    <td>
                      {profile.market_id === 'TR' ? `₺${profile.per_kg_rate}` : `$${profile.per_kg_rate}`}
                    </td>
                    <td className="text-[var(--foreground-muted)]">
                      {profile.estimated_days_min}-{profile.estimated_days_max} gün
                    </td>
                    <td>
                      <span className={`badge ${profile.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {profile.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingShipping(profile)} className="btn btn-ghost btn-sm">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteShipping(profile.id)} className="btn btn-ghost btn-sm text-[var(--error)]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <p className="empty-state-description">Yukarıdaki butonlardan yeni kargo profili ekleyin.</p>
          </div>
        )}
      </div>

      {/* Shipping Edit Modal */}
      {editingShipping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg mx-4">
            <div className="card-header">
              <h2 className="card-title">
                {editingShipping.id.startsWith('new-') ? 'Yeni Kargo Profili' : 'Kargo Profili Düzenle'}
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Market</label>
                  <select
                    value={editingShipping.market_id}
                    onChange={(e) => setEditingShipping({ ...editingShipping, market_id: e.target.value })}
                    className="input"
                    disabled={!editingShipping.id.startsWith('new-')}
                  >
                    <option value="TR">🇹🇷 Türkiye</option>
                    <option value="GLOBAL">🌍 Global</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Sağlayıcı</label>
                  <select
                    value={editingShipping.provider}
                    onChange={(e) => setEditingShipping({ ...editingShipping, provider: e.target.value })}
                    className="input"
                  >
                    <option value="yurtici_kargo">Yurtiçi Kargo</option>
                    <option value="aras_kargo">Aras Kargo</option>
                    <option value="mng_kargo">MNG Kargo</option>
                    <option value="ptt">PTT Kargo</option>
                    <option value="ups">UPS</option>
                    <option value="dhl">DHL</option>
                    <option value="fedex">FedEx</option>
                    <option value="custom">Diğer / Özel</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Ad (TR)</label>
                  <input
                    type="text"
                    value={editingShipping.name_tr}
                    onChange={(e) => setEditingShipping({ ...editingShipping, name_tr: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Name (EN)</label>
                  <input
                    type="text"
                    value={editingShipping.name_en}
                    onChange={(e) => setEditingShipping({ ...editingShipping, name_en: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="label">Taban Ücret</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingShipping.base_rate}
                    onChange={(e) => setEditingShipping({ ...editingShipping, base_rate: parseFloat(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Kg Başına</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingShipping.per_kg_rate}
                    onChange={(e) => setEditingShipping({ ...editingShipping, per_kg_rate: parseFloat(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Min Bedava Limiti</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingShipping.free_shipping_threshold ?? ''}
                    onChange={(e) => setEditingShipping({ ...editingShipping, free_shipping_threshold: parseFloat(e.target.value) || null })}
                    className="input"
                    placeholder="Limit Yok"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Min Gün</label>
                  <input
                    type="number"
                    value={editingShipping.estimated_days_min}
                    onChange={(e) => setEditingShipping({ ...editingShipping, estimated_days_min: parseInt(e.target.value) || 1 })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Max Gün</label>
                  <input
                    type="number"
                    value={editingShipping.estimated_days_max}
                    onChange={(e) => setEditingShipping({ ...editingShipping, estimated_days_max: parseInt(e.target.value) || 3 })}
                    className="input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingShipping.is_active}
                    onChange={(e) => setEditingShipping({ ...editingShipping, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Aktif</span>
                </label>
              </div>
            </div>
            <div className="card-footer flex gap-3">
              <button onClick={() => setEditingShipping(null)} className="btn btn-secondary flex-1">
                İptal
              </button>
              <button onClick={() => saveShipping(editingShipping)} disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
