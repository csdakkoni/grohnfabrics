'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, Save } from 'lucide-react';

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
  const [settings, setSettings] = useState<SiteSettings>({
    general: { site_name: '', contact_email: '' },
    social: { instagram: '', pinterest: '', facebook: '' },
    seo: { default_title: '', default_description: '' },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');
    
    if (data) {
      const newSettings = { ...settings };
      data.forEach((row) => {
        if (row.key === 'general') newSettings.general = row.value as typeof settings.general;
        if (row.key === 'social') newSettings.social = row.value as typeof settings.social;
        if (row.key === 'seo') newSettings.seo = row.value as typeof settings.seo;
      });
      setSettings(newSettings);
    }
    setLoading(false);
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
