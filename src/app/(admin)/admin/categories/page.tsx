'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Boxes, Edit2, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/utils';

interface Category {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  description_tr: string | null;
  description_en: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name_tr: '',
    name_en: '',
    slug: '',
    description_tr: '',
    description_en: '',
    image_url: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    setCategories(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = form.slug || slugify(form.name_tr);

    const categoryData = {
      name_tr: form.name_tr,
      name_en: form.name_en,
      slug,
      description_tr: form.description_tr || null,
      description_en: form.description_en || null,
      image_url: form.image_url || null,
    };

    if (editingId) {
      await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('categories')
        .insert(categoryData);
    }

    setForm({ name_tr: '', name_en: '', slug: '', description_tr: '', description_en: '', image_url: '' });
    setShowForm(false);
    setEditingId(null);
    loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name_tr: cat.name_tr,
      name_en: cat.name_en,
      slug: cat.slug,
      description_tr: cat.description_tr || '',
      description_en: cat.description_en || '',
      image_url: cat.image_url || '',
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    loadCategories();
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
          <h1 className="text-2xl font-semibold">Kategoriler</h1>
          <p className="text-[var(--foreground-muted)]">Ürün kategorilerini yönetin</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name_tr: '', name_en: '', slug: '', description_tr: '', description_en: '', image_url: '' }); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-xl mx-4 my-8">
            <div className="card-header">
              <h2 className="card-title">{editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Kategori Adı (TR) *</label>
                    <input
                      type="text"
                      value={form.name_tr}
                      onChange={(e) => setForm({ ...form, name_tr: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Category Name (EN) *</label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input"
                    placeholder="otomatik oluşturulur"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Açıklama (TR)</label>
                    <textarea
                      value={form.description_tr}
                      onChange={(e) => setForm({ ...form, description_tr: e.target.value })}
                      className="input"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Description (EN)</label>
                    <textarea
                      value={form.description_en}
                      onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                      className="input"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Kategori Görseli</label>
                  <ImageUpload
                    images={form.image_url ? [form.image_url] : []}
                    onImagesChange={(urls) => setForm(prev => ({ ...prev, image_url: urls[0] || '' }))}
                    folder="categories"
                    maxImages={1}
                  />
                </div>
              </div>
              <div className="card-footer flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Slug</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[var(--border)]">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name_tr} className="w-full h-full object-cover" />
                        ) : (
                          <Boxes className="w-5 h-5 text-[var(--foreground-light)]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{cat.name_tr}</p>
                        <p className="text-sm text-[var(--foreground-light)]">{cat.name_en}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[var(--foreground-muted)]">{cat.slug}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(cat.id, cat.is_active)}
                      className={`badge cursor-pointer ${cat.is_active ? 'badge-success' : 'badge-gray'}`}
                    >
                      {cat.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="btn btn-ghost btn-icon btn-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="btn btn-ghost btn-icon btn-sm text-[var(--error)]"
                      >
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
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz kategori yok</h3>
            <p className="empty-state-description">
              İlk kategorinizi ekleyerek başlayın.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-4"
            >
              <Plus className="w-4 h-4" />
              Yeni Kategori Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
