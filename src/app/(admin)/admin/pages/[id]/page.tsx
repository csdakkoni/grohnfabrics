'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, ExternalLink } from 'lucide-react';

interface PageData {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  meta_title_tr: string;
  meta_title_en: string;
  meta_description_tr: string;
  meta_description_en: string;
  featured_image: string;
  is_published: boolean;
  show_in_menu: boolean;
  show_in_footer: boolean;
  menu_order: number;
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>('tr');
  
  const [formData, setFormData] = useState<PageData | null>(null);

  const fetchPage = useCallback(async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setFormData(data);
    }
    setLoading(false);
  }, [supabase, id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);

    const { error } = await supabase
      .from('pages')
      .update(formData)
      .eq('id', id);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      router.push('/admin/pages');
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;
    
    await supabase.from('pages').delete().eq('id', id);
    router.push('/admin/pages');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <p className="text-[var(--foreground-muted)]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <p className="text-[var(--foreground-muted)]">Sayfa bulunamadı</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Sayfayı Düzenle</h1>
          <a
            href={`/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            Görüntüle
          </a>
        </div>
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
                        onChange={(e) => setFormData(prev => prev ? { ...prev, title_tr: e.target.value } : null)}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">İçerik (TR)</label>
                      <textarea
                        value={formData.content_tr || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, content_tr: e.target.value } : null)}
                        className="textarea"
                        rows={15}
                      />
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        HTML etiketleri kullanabilirsiniz
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Page Title (EN)</label>
                      <input
                        type="text"
                        value={formData.title_en || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Content (EN)</label>
                      <textarea
                        value={formData.content_en || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, content_en: e.target.value } : null)}
                        className="textarea"
                        rows={15}
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
                        value={formData.meta_title_tr || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, meta_title_tr: e.target.value } : null)}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Meta Açıklama (TR)</label>
                      <textarea
                        value={formData.meta_description_tr || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, meta_description_tr: e.target.value } : null)}
                        className="textarea"
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Meta Title (EN)</label>
                      <input
                        type="text"
                        value={formData.meta_title_en || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, meta_title_en: e.target.value } : null)}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Meta Description (EN)</label>
                      <textarea
                        value={formData.meta_description_en || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, meta_description_en: e.target.value } : null)}
                        className="textarea"
                        rows={3}
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
                      onChange={(e) => setFormData(prev => prev ? { ...prev, slug: e.target.value } : null)}
                      className="input flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => prev ? { ...prev, is_published: e.target.checked } : null)}
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
                    onChange={(e) => setFormData(prev => prev ? { ...prev, show_in_menu: e.target.checked } : null)}
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
                    onChange={(e) => setFormData(prev => prev ? { ...prev, show_in_footer: e.target.checked } : null)}
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
                      onChange={(e) => setFormData(prev => prev ? { ...prev, menu_order: parseInt(e.target.value) || 0 } : null)}
                      className="input"
                      min={0}
                    />
                  </div>
                )}
              </div>
              <div className="card-footer space-y-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary w-full"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-secondary w-full text-[var(--error)]"
                >
                  <Trash2 className="w-4 h-4" />
                  Sayfayı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
