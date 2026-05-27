'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function NewPagePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>('tr');
  
  const [formData, setFormData] = useState({
    slug: '',
    title_tr: '',
    title_en: '',
    content_tr: '',
    content_en: '',
    meta_title_tr: '',
    meta_title_en: '',
    meta_description_tr: '',
    meta_description_en: '',
    is_published: false,
    show_in_menu: false,
    show_in_footer: false,
    menu_order: 0,
  });

  const generateSlug = (title: string) => {
    return slugify(title);
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title_tr: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('pages')
      .insert([formData]);

    if (error) {
      alert('Hata: ' + error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/pages');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/pages" 
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Sayfalara Dön
        </Link>
        <h1 className="text-2xl font-semibold">Yeni Sayfa</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Tabs */}
            <div className="card">
              <div className="border-b border-[var(--border)]">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tr')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'tr'
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                        : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    🇹🇷 Türkçe
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'en'
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                        : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>
              <div className="card-body space-y-4">
                {activeTab === 'tr' ? (
                  <>
                    <div className="form-group">
                      <label className="label">Sayfa Başlığı (TR) *</label>
                      <input
                        type="text"
                        value={formData.title_tr}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="input"
                        required
                        placeholder="Hakkımızda"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">İçerik (TR)</label>
                      <textarea
                        value={formData.content_tr}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_tr: e.target.value }))}
                        className="textarea"
                        rows={12}
                        placeholder="HTML içerik yazabilirsiniz..."
                      />
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Page Title (EN)</label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                        className="input"
                        placeholder="About Us"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Content (EN)</label>
                      <textarea
                        value={formData.content_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                        className="textarea"
                        rows={12}
                        placeholder="You can write HTML content..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SEO */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">SEO Ayarları</h2>
              </div>
              <div className="card-body space-y-4">
                {activeTab === 'tr' ? (
                  <>
                    <div className="form-group">
                      <label className="label">Meta Başlık (TR)</label>
                      <input
                        type="text"
                        value={formData.meta_title_tr}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title_tr: e.target.value }))}
                        className="input"
                        placeholder="Hakkımızda | Grohn Fabrics"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Meta Açıklama (TR)</label>
                      <textarea
                        value={formData.meta_description_tr}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_description_tr: e.target.value }))}
                        className="textarea"
                        rows={3}
                        placeholder="Sayfa açıklaması (160 karakter)"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Meta Title (EN)</label>
                      <input
                        type="text"
                        value={formData.meta_title_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title_en: e.target.value }))}
                        className="input"
                        placeholder="About Us | Grohn Fabrics"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Meta Description (EN)</label>
                      <textarea
                        value={formData.meta_description_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                        className="textarea"
                        rows={3}
                        placeholder="Page description (160 characters)"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Yayın</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--foreground-muted)]">/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="input flex-1"
                      required
                      placeholder="hakkimizda"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <label htmlFor="is_published" className="text-sm">
                    Yayında
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="show_in_menu"
                    checked={formData.show_in_menu}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_in_menu: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <label htmlFor="show_in_menu" className="text-sm">
                    Menüde göster
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="show_in_footer"
                    checked={formData.show_in_footer}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_in_footer: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <label htmlFor="show_in_footer" className="text-sm">
                    Footer'da göster
                  </label>
                </div>

                {formData.show_in_menu && (
                  <div className="form-group">
                    <label className="label">Menü Sırası</label>
                    <input
                      type="number"
                      value={formData.menu_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, menu_order: parseInt(e.target.value) || 0 }))}
                      className="input"
                      min={0}
                    />
                  </div>
                )}
              </div>
              <div className="card-footer flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Önizleme</h3>
              </div>
              <div className="card-body">
                <div className="p-4 bg-[var(--background-secondary)] rounded-lg">
                  <p className="text-sm text-[var(--brand-primary)] mb-1">
                    grohnfabrics.com/{formData.slug || 'slug'}
                  </p>
                  <p className="font-medium">
                    {formData.meta_title_tr || formData.title_tr || 'Sayfa Başlığı'}
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                    {formData.meta_description_tr || 'Meta açıklama...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
