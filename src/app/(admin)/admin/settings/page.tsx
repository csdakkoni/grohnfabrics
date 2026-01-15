'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Building2 } from 'lucide-react';

interface Company {
  id: string;
  code: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  } | null;
}

interface SiteSettings {
  general: {
    site_name: string;
    contact_email: string;
  };
  social: {
    instagram: string;
    pinterest: string;
    facebook: string;
  };
  seo: {
    default_title: string;
    default_description: string;
  };
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    general: { site_name: '', contact_email: '' },
    social: { instagram: '', pinterest: '', facebook: '' },
    seo: { default_title: '', default_description: '' },
  });

  // Modal açıkken arka planın scroll olmasını engelle
  useEffect(() => {
    if (editingCompany) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingCompany]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const [settingsRes, companiesRes] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('companies').select('*').order('code'),
    ]);
    
    if (settingsRes.data) {
      const newSettings = { ...settings };
      settingsRes.data.forEach((row) => {
        if (row.key === 'general') newSettings.general = row.value as typeof settings.general;
        if (row.key === 'social') newSettings.social = row.value as typeof settings.social;
        if (row.key === 'seo') newSettings.seo = row.value as typeof settings.seo;
      });
      setSettings(newSettings);
    }
    
    if (companiesRes.data) {
      setCompanies(companiesRes.data);
    }
    
    setLoading(false);
  }

  async function saveCompany(company: Company) {
    setSaving(true);
    await supabase
      .from('companies')
      .update({
        name: company.name,
        legal_name: company.legal_name,
        tax_id: company.tax_id,
        address: company.address,
        contact: company.contact,
      })
      .eq('id', company.id);
    
    setEditingCompany(null);
    loadSettings();
    setSaving(false);
    alert('Şirket bilgileri kaydedildi!');
  }

  const handleSave = async () => {
    setSaving(true);
    
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'general', value: settings.general }),
      supabase.from('site_settings').upsert({ key: 'social', value: settings.social }),
      supabase.from('site_settings').upsert({ key: 'seo', value: settings.seo }),
    ]);

    setSaving(false);
    alert('Ayarlar kaydedildi!');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Ayarlar</h1>
          <p className="text-[var(--foreground-muted)]">Site genel ayarları</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Companies */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Şirket Bilgileri
            </h2>
            <p className="card-description">Fatura ve iletişim bilgileri</p>
          </div>
          <div className="card-body">
            {companies.length > 0 ? (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="p-4 border border-[var(--border)] rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="badge badge-primary mb-1">{company.code}</span>
                        <h4 className="font-medium">{company.name}</h4>
                        <p className="text-sm text-[var(--foreground-muted)]">{company.legal_name || '-'}</p>
                      </div>
                      <button
                        onClick={() => setEditingCompany(company)}
                        className="btn btn-ghost btn-sm"
                      >
                        Düzenle
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[var(--foreground-muted)]">Vergi No: </span>
                        {company.tax_id || '-'}
                      </div>
                      <div>
                        <span className="text-[var(--foreground-muted)]">E-posta: </span>
                        {company.contact?.email || '-'}
                      </div>
                      <div>
                        <span className="text-[var(--foreground-muted)]">Telefon: </span>
                        {company.contact?.phone || '-'}
                      </div>
                      <div>
                        <span className="text-[var(--foreground-muted)]">Şehir: </span>
                        {company.address?.city || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--foreground-muted)]">Şirket kaydı bulunamadı. Veritabanını kontrol edin.</p>
            )}
          </div>
        </div>

        {/* Company Edit Modal */}
        {editingCompany && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="card w-full max-w-2xl">
              <div className="card-header">
                <h2 className="card-title">Şirket Düzenle: {editingCompany.code}</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Şirket Adı *</label>
                    <input
                      type="text"
                      value={editingCompany.name}
                      onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Resmi Unvan</label>
                    <input
                      type="text"
                      value={editingCompany.legal_name || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, legal_name: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Vergi Numarası</label>
                  <input
                    type="text"
                    value={editingCompany.tax_id || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, tax_id: e.target.value })}
                    className="input"
                  />
                </div>

                <h4 className="font-medium pt-2">Adres Bilgileri</h4>
                <div className="form-group">
                  <label className="label">Adres</label>
                  <input
                    type="text"
                    value={editingCompany.address?.street || ''}
                    onChange={(e) => setEditingCompany({ 
                      ...editingCompany, 
                      address: { ...editingCompany.address, street: e.target.value } 
                    })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="label">Şehir</label>
                    <input
                      type="text"
                      value={editingCompany.address?.city || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        address: { ...editingCompany.address, city: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Posta Kodu</label>
                    <input
                      type="text"
                      value={editingCompany.address?.postal_code || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        address: { ...editingCompany.address, postal_code: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Ülke</label>
                    <input
                      type="text"
                      value={editingCompany.address?.country || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        address: { ...editingCompany.address, country: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                </div>

                <h4 className="font-medium pt-2">İletişim Bilgileri</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="label">E-posta</label>
                    <input
                      type="email"
                      value={editingCompany.contact?.email || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        contact: { ...editingCompany.contact, email: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Telefon</label>
                    <input
                      type="tel"
                      value={editingCompany.contact?.phone || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        contact: { ...editingCompany.contact, phone: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Website</label>
                    <input
                      type="url"
                      value={editingCompany.contact?.website || ''}
                      onChange={(e) => setEditingCompany({ 
                        ...editingCompany, 
                        contact: { ...editingCompany.contact, website: e.target.value } 
                      })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer flex gap-3">
                <button 
                  onClick={() => setEditingCompany(null)}
                  className="btn btn-secondary flex-1"
                >
                  İptal
                </button>
                <button 
                  onClick={() => saveCompany(editingCompany)}
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* General */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Genel Bilgiler</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="label">Site Adı</label>
              <input
                type="text"
                value={settings.general.site_name}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, site_name: e.target.value }
                })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">İletişim E-posta</label>
              <input
                type="email"
                value={settings.general.contact_email}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, contact_email: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sosyal Medya</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="label">Instagram</label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, instagram: e.target.value }
                })}
                className="input"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label className="label">Pinterest</label>
              <input
                type="url"
                value={settings.social.pinterest}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, pinterest: e.target.value }
                })}
                className="input"
                placeholder="https://pinterest.com/..."
              />
            </div>
            <div className="form-group">
              <label className="label">Facebook</label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, facebook: e.target.value }
                })}
                className="input"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">SEO Ayarları</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="label">Varsayılan Başlık</label>
              <input
                type="text"
                value={settings.seo.default_title}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, default_title: e.target.value }
                })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Varsayılan Açıklama</label>
              <textarea
                value={settings.seo.default_description}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, default_description: e.target.value }
                })}
                className="input"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* API Keys Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">API Anahtarları</h2>
            <p className="card-description">Güvenlik nedeniyle API anahtarları environment variables üzerinden yönetilir</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="font-medium">iyzico</p>
                <p className="text-[var(--foreground-muted)]">Sandbox modu aktif</p>
              </div>
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="font-medium">Stripe</p>
                <p className="text-[var(--foreground-muted)]">Test modu aktif</p>
              </div>
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="font-medium">UPS</p>
                <p className="text-[var(--foreground-muted)]">Bağlı</p>
              </div>
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="font-medium">Supabase</p>
                <p className="text-[var(--foreground-muted)]">Bağlı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
