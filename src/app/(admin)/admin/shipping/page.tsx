'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Save, Globe, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ShippingZone {
  id: string;
  name: string;
  description: string;
  countries: { country_code: string; country_name: string }[];
  rate?: {
    id: string;
    rate: number;
    currency: string;
    estimated_days_min: number;
    estimated_days_max: number;
  };
}

interface CountryRate {
  id: string;
  country_code: string;
  country_name: string;
  rate: number;
  currency: string;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

interface ShippingProfile {
  id: string;
  market_id: string;
  provider: string;
  name_tr: string;
  name_en: string;
  base_rate: number;
}

// Tüm ülkeler listesi
const ALL_COUNTRIES = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'GB', name: 'İngiltere' },
  { code: 'DE', name: 'Almanya' },
  { code: 'FR', name: 'Fransa' },
  { code: 'NL', name: 'Hollanda' },
  { code: 'BE', name: 'Belçika' },
  { code: 'AT', name: 'Avusturya' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'IT', name: 'İtalya' },
  { code: 'ES', name: 'İspanya' },
  { code: 'PT', name: 'Portekiz' },
  { code: 'SE', name: 'İsveç' },
  { code: 'DK', name: 'Danimarka' },
  { code: 'NO', name: 'Norveç' },
  { code: 'FI', name: 'Finlandiya' },
  { code: 'PL', name: 'Polonya' },
  { code: 'CZ', name: 'Çekya' },
  { code: 'GR', name: 'Yunanistan' },
  { code: 'IE', name: 'İrlanda' },
  { code: 'CA', name: 'Kanada' },
  { code: 'AU', name: 'Avustralya' },
  { code: 'NZ', name: 'Yeni Zelanda' },
  { code: 'JP', name: 'Japonya' },
  { code: 'KR', name: 'Güney Kore' },
  { code: 'SG', name: 'Singapur' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri' },
  { code: 'SA', name: 'Suudi Arabistan' },
  { code: 'IL', name: 'İsrail' },
  { code: 'BR', name: 'Brezilya' },
  { code: 'MX', name: 'Meksika' },
  { code: 'RU', name: 'Rusya' },
  { code: 'IN', name: 'Hindistan' },
  { code: 'CN', name: 'Çin' },
];

function ShippingPageContent() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [countryRates, setCountryRates] = useState<CountryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'countries' | 'zones'>('countries');

  const supabase = createClient();
  const searchParams = useSearchParams();
  const profileIdParam = searchParams.get('profile_id');

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      loadData();
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (profileIdParam && profiles.some(p => p.id === profileIdParam)) {
      setSelectedProfile(profileIdParam);
    }
  }, [profileIdParam, profiles]);

  async function loadProfiles() {
    const { data } = await supabase
      .from('shipping_profiles')
      .select('*')
      .order('market_id');

    if (data) {
      setProfiles(data);
      // Try to select URL parameter first, then fall back to default
      if (profileIdParam && data.some(p => p.id === profileIdParam)) {
        setSelectedProfile(profileIdParam);
      } else {
        const globalProfile = data.find(p => p.market_id === 'GLOBAL');
        if (globalProfile) {
          setSelectedProfile(globalProfile.id);
        } else if (data.length > 0) {
          setSelectedProfile(data[0].id);
        }
      }
    }
    setLoading(false);
  }

  async function loadData() {
    // Ülke fiyatlarını yükle
    const { data: rates } = await supabase
      .from('shipping_country_rates')
      .select('*')
      .eq('profile_id', selectedProfile)
      .order('country_name');

    if (rates) {
      setCountryRates(rates);
    }

    // Bölgeleri yükle
    const { data: zonesData } = await supabase
      .from('shipping_zones')
      .select(`
        *,
        shipping_zone_countries(country_code, country_name),
        shipping_zone_rates!inner(id, rate, currency, estimated_days_min, estimated_days_max)
      `)
      .eq('shipping_zone_rates.profile_id', selectedProfile);

    if (zonesData) {
      setZones(zonesData.map(z => ({
        id: z.id,
        name: z.name,
        description: z.description,
        countries: z.shipping_zone_countries || [],
        rate: z.shipping_zone_rates?.[0]
      })));
    }
  }

  async function addCountryRate() {
    const newRate: Partial<CountryRate> = {
      country_code: '',
      country_name: '',
      rate: 15,
      currency: 'USD',
      estimated_days_min: 5,
      estimated_days_max: 10,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('shipping_country_rates')
      .insert({
        ...newRate,
        profile_id: selectedProfile,
        country_code: 'XX',
        country_name: 'Yeni Ülke',
      })
      .select()
      .single();

    if (data) {
      setCountryRates([...countryRates, data]);
    }
  }

  async function updateCountryRate(id: string, updates: Partial<CountryRate>) {
    // Ülke seçildiğinde adını da güncelle
    if (updates.country_code) {
      const country = ALL_COUNTRIES.find(c => c.code === updates.country_code);
      if (country) {
        updates.country_name = country.name;
      }
    }

    const { error } = await supabase
      .from('shipping_country_rates')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setCountryRates(countryRates.map(r => 
        r.id === id ? { ...r, ...updates } : r
      ));
    }
  }

  async function deleteCountryRate(id: string) {
    if (!confirm('Bu ülke fiyatını silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase
      .from('shipping_country_rates')
      .delete()
      .eq('id', id);

    if (!error) {
      setCountryRates(countryRates.filter(r => r.id !== id));
    }
  }

  async function saveAll() {
    setSaving(true);
    // Tüm değişiklikler zaten anlık kaydediliyor
    // Bu buton kullanıcıya feedback vermek için
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    alert('Değişiklikler kaydedildi!');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Kargo Fiyatları</h1>
          <p className="text-[var(--foreground-muted)]">Ülke ve bölge bazlı kargo fiyatlarını yönetin</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Profil Seçimi */}
      <div className="card">
        <div className="card-body py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-sm font-medium text-[var(--foreground)] min-w-[100px]">
              Kargo Profili:
            </label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="input max-w-xs"
            >
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name_tr} ({profile.market_id === 'TR' ? '🇹🇷 TR' : '🌍 Global'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] mb-6">
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'countries'
              ? 'text-[var(--brand-primary)] border-[var(--brand-primary)]'
              : 'text-[var(--foreground-muted)] border-transparent hover:text-[var(--foreground)]'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Ülke Fiyatları
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'zones'
              ? 'text-[var(--brand-primary)] border-[var(--brand-primary)]'
              : 'text-[var(--foreground-muted)] border-transparent hover:text-[var(--foreground)]'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          Bölgeler
        </button>
      </div>

      {/* Ülke Fiyatları */}
      {activeTab === 'countries' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div>
              <h2 className="card-title">Ülke Bazlı Fiyatlar</h2>
              <p className="card-description">Seçilen profile özel kargo fiyatı ve teslimat süreleri</p>
            </div>
            <button
              onClick={addCountryRate}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ülke Ekle
            </button>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ülke</th>
                  <th>Fiyat</th>
                  <th>Para Birimi</th>
                  <th>Teslimat (Gün)</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {countryRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[var(--foreground-muted)]">
                      Henüz ülke fiyatı eklenmemiş. "Ülke Ekle" butonuna tıklayın.
                    </td>
                  </tr>
                ) : (
                  countryRates.map(rate => (
                    <tr key={rate.id}>
                      <td className="w-1/3">
                        <select
                          value={rate.country_code}
                          onChange={(e) => updateCountryRate(rate.id, { country_code: e.target.value })}
                          className="input py-1.5"
                        >
                          <option value="">Ülke Seçin</option>
                          {ALL_COUNTRIES.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="w-28">
                        <input
                          type="number"
                          value={rate.rate}
                          onChange={(e) => updateCountryRate(rate.id, { rate: parseFloat(e.target.value) || 0 })}
                          className="input py-1.5 text-center"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="w-32">
                        <select
                          value={rate.currency}
                          onChange={(e) => updateCountryRate(rate.id, { currency: e.target.value })}
                          className="input py-1.5"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="TRY">TRY (₺)</option>
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <input
                            type="number"
                            value={rate.estimated_days_min}
                            onChange={(e) => updateCountryRate(rate.id, { estimated_days_min: parseInt(e.target.value) || 0 })}
                            className="input py-1.5 text-center"
                            min="0"
                            placeholder="Min"
                          />
                          <span className="text-[var(--foreground-muted)]">-</span>
                          <input
                            type="number"
                            value={rate.estimated_days_max}
                            onChange={(e) => updateCountryRate(rate.id, { estimated_days_max: parseInt(e.target.value) || 0 })}
                            className="input py-1.5 text-center"
                            min="0"
                            placeholder="Max"
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => updateCountryRate(rate.id, { is_active: !rate.is_active })}
                          className={`badge cursor-pointer ${
                            rate.is_active
                              ? 'badge-success'
                              : 'badge-gray'
                          }`}
                        >
                          {rate.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => deleteCountryRate(rate.id)}
                          className="btn btn-ghost btn-sm text-[var(--error)] p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bölgeler */}
      {activeTab === 'zones' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kargo Bölgeleri</h2>
            <p className="card-description">Farklı ülkeleri gruplayarak toplu kargo fiyatı tanımlayın</p>
          </div>
          <div className="card-body">
            {zones.length === 0 ? (
              <p className="text-[var(--foreground-muted)] text-center py-6">
                Henüz bölge tanımlanmamış. Bölgeler SQL ile oluşturulabilir.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {zones.map(zone => (
                  <div key={zone.id} className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--brand-primary)]/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      {zone.rate && (
                        <span className="text-[var(--brand-primary)] font-semibold text-lg">
                          {zone.rate.currency === 'TRY' ? '₺' : zone.rate.currency === 'USD' ? '$' : zone.rate.currency === 'EUR' ? '€' : ''}
                          {zone.rate.rate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-3">{zone.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {zone.countries.map(c => (
                        <span key={c.country_code} className="px-2 py-0.5 bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded text-xs">
                          {c.country_name}
                        </span>
                      ))}
                    </div>
                    {zone.rate && (
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Tahmini teslimat: <span className="font-medium text-[var(--foreground)]">{zone.rate.estimated_days_min}-{zone.rate.estimated_days_max} iş günü</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-800 font-light leading-relaxed">
                <strong>Not:</strong> Ülke bazlı fiyat tanımlandığında, o ülke için bölge fiyatı yerine ülke fiyatı kullanılır.
                Ülke fiyatı tanımlanmamış ülkeler için bölge fiyatı geçerlidir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShippingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    }>
      <ShippingPageContent />
    </Suspense>
  );
}
