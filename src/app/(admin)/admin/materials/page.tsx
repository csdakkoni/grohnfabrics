'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Palette, Edit2, Trash2 } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  code: string | null;
  composition: string | null;
  width_cm: number | null;
  weight_gsm: number | null;
  is_active: boolean;
}

export default function MaterialsPage() {
  const supabase = createClient();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    composition: '',
    width_cm: '',
    weight_gsm: '',
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    setMaterials(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: form.name,
      code: form.code || null,
      composition: form.composition || null,
      width_cm: form.width_cm ? parseInt(form.width_cm) : null,
      weight_gsm: form.weight_gsm ? parseInt(form.weight_gsm) : null,
    };

    if (editingId) {
      await supabase.from('materials').update(payload).eq('id', editingId);
    } else {
      await supabase.from('materials').insert(payload);
    }

    setForm({ name: '', code: '', composition: '', width_cm: '', weight_gsm: '' });
    setShowForm(false);
    setEditingId(null);
    loadMaterials();
  };

  const handleEdit = (mat: Material) => {
    setForm({
      name: mat.name,
      code: mat.code || '',
      composition: mat.composition || '',
      width_cm: mat.width_cm?.toString() || '',
      weight_gsm: mat.weight_gsm?.toString() || '',
    });
    setEditingId(mat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu materyali silmek istediğinize emin misiniz?')) return;
    await supabase.from('materials').delete().eq('id', id);
    loadMaterials();
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
          <h1 className="text-2xl font-semibold">Materyaller</h1>
          <p className="text-[var(--foreground-muted)]">Kumaş ve materyal tanımları</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', code: '', composition: '', width_cm: '', weight_gsm: '' }); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Materyal
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg mx-4">
            <div className="card-header">
              <h2 className="card-title">{editingId ? 'Materyal Düzenle' : 'Yeni Materyal'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Materyal Adı *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Kod</label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="input"
                      placeholder="ör: CTN-001"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Kompozisyon</label>
                  <input
                    type="text"
                    value={form.composition}
                    onChange={(e) => setForm({ ...form, composition: e.target.value })}
                    className="input"
                    placeholder="ör: %100 Pamuk"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">En (cm)</label>
                    <input
                      type="number"
                      value={form.width_cm}
                      onChange={(e) => setForm({ ...form, width_cm: e.target.value })}
                      className="input"
                      placeholder="280"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Ağırlık (g/m²)</label>
                    <input
                      type="number"
                      value={form.weight_gsm}
                      onChange={(e) => setForm({ ...form, weight_gsm: e.target.value })}
                      className="input"
                      placeholder="200"
                    />
                  </div>
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

      {/* Materials List */}
      {materials.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Materyal</th>
                <th>Kod</th>
                <th>Kompozisyon</th>
                <th>En</th>
                <th>Ağırlık</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.id}>
                  <td className="font-medium">{mat.name}</td>
                  <td className="text-[var(--foreground-muted)]">{mat.code || '-'}</td>
                  <td>{mat.composition || '-'}</td>
                  <td>{mat.width_cm ? `${mat.width_cm} cm` : '-'}</td>
                  <td>{mat.weight_gsm ? `${mat.weight_gsm} g/m²` : '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(mat)}
                        className="btn btn-ghost btn-icon btn-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
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
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz materyal yok</h3>
            <p className="empty-state-description">
              Kumaş ve materyal tanımlarınızı ekleyin.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-4"
            >
              <Plus className="w-4 h-4" />
              Yeni Materyal Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
