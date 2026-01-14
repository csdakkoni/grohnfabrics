'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Save, Globe, MapPin } from 'lucide-react';

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

export default function ShippingPage() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [countryRates, setCountryRates] = useState<CountryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'countries' | 'zones'>('countries');

  const supabase = createClient();

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      loadData();
    }
  }, [selectedProfile]);

  async function loadProfiles() {
    const { data } = await supabase
      .from('shipping_profiles')
      .select('*')
      .order('market_id');

    if (data) {
      setProfiles(data);
      // Global profili varsayılan seç
      const globalProfile = data.find(p => p.market_id === 'GLOBAL');
      if (globalProfile) {
        setSelectedProfile(globalProfile.id);
      } else if (data.length > 0) {
        setSelectedProfile(data[0].id);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Kargo Fiyatları</h1>
          <p className="text-[var(--color-text-light)]">Ülke ve bölge bazlı kargo fiyatlarını yönetin</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Profil Seçimi */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          Kargo Profili
        </label>
        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-[var(--color-border)] rounded-lg"
        >
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name_tr} ({profile.market_id})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'countries'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Ülke Fiyatları
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'zones'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          Bölgeler
        </button>
      </div>

      {/* Ülke Fiyatları */}
      {activeTab === 'countries' && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
            <h2 className="font-semibold text-[var(--color-text)]">Ülke Bazlı Fiyatlar</h2>
            <button
              onClick={addCountryRate}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)]"
            >
              <Plus className="w-4 h-4" />
              Ülke Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-light)]">Ülke</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-light)]">Fiyat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-light)]">Para Birimi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-light)]">Teslimat (Gün)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-light)]">Durum</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text-light)]">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {countryRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-light)]">
                      Henüz ülke fiyatı eklenmemiş. "Ülke Ekle" butonuna tıklayın.
                    </td>
                  </tr>
                ) : (
                  countryRates.map(rate => (
                    <tr key={rate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <select
                          value={rate.country_code}
                          onChange={(e) => updateCountryRate(rate.id, { country_code: e.target.value })}
                          className="w-full px-2 py-1 border border-[var(--color-border)] rounded"
                        >
                          <option value="">Ülke Seçin</option>
                          {ALL_COUNTRIES.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={rate.rate}
                          onChange={(e) => updateCountryRate(rate.id, { rate: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 border border-[var(--color-border)] rounded"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={rate.currency}
                          onChange={(e) => updateCountryRate(rate.id, { currency: e.target.value })}
                          className="px-2 py-1 border border-[var(--color-border)] rounded"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="TRY">TRY</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={rate.estimated_days_min}
                            onChange={(e) => updateCountryRate(rate.id, { estimated_days_min: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 border border-[var(--color-border)] rounded"
                            min="0"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={rate.estimated_days_max}
                            onChange={(e) => updateCountryRate(rate.id, { estimated_days_max: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 border border-[var(--color-border)] rounded"
                            min="0"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateCountryRate(rate.id, { is_active: !rate.is_active })}
                          className={`px-2 py-1 rounded text-sm ${
                            rate.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rate.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteCountryRate(rate.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
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
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Kargo Bölgeleri</h2>
          
          {zones.length === 0 ? (
            <p className="text-[var(--color-text-light)]">
              Henüz bölge tanımlanmamış. Bölgeler SQL ile oluşturulabilir.
            </p>
          ) : (
            <div className="space-y-4">
              {zones.map(zone => (
                <div key={zone.id} className="border border-[var(--color-border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[var(--color-text)]">{zone.name}</h3>
                    {zone.rate && (
                      <span className="text-[var(--color-primary)] font-semibold">
                        {zone.rate.rate} {zone.rate.currency}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-light)] mb-2">{zone.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {zone.countries.map(c => (
                      <span key={c.country_code} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {c.country_name}
                      </span>
                    ))}
                  </div>
                  {zone.rate && (
                    <p className="text-xs text-[var(--color-text-light)] mt-2">
                      Tahmini teslimat: {zone.rate.estimated_days_min}-{zone.rate.estimated_days_max} iş günü
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Not:</strong> Ülke bazlı fiyat tanımlandığında, o ülke için bölge fiyatı yerine ülke fiyatı kullanılır.
              Ülke fiyatı tanımlanmamış ülkeler için bölge fiyatı geçerlidir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
