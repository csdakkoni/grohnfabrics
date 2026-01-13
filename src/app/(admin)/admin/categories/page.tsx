'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Boxes, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
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
    
    const slug = form.slug || form.name_tr
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (editingId) {
      await supabase
        .from('categories')
        .update({ name_tr: form.name_tr, name_en: form.name_en, slug })
        .eq('id', editingId);
    } else {
      await supabase
        .from('categories')
        .insert({ name_tr: form.name_tr, name_en: form.name_en, slug });
    }

    setForm({ name_tr: '', name_en: '', slug: '' });
    setShowForm(false);
    setEditingId(null);
    loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setForm({ name_tr: cat.name_tr, name_en: cat.name_en, slug: cat.slug });
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
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name_tr: '', name_en: '', slug: '' }); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md mx-4">
            <div className="card-header">
              <h2 className="card-title">{editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body space-y-4">
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
                    <div>
                      <p className="font-medium">{cat.name_tr}</p>
                      <p className="text-sm text-[var(--foreground-light)]">{cat.name_en}</p>
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
