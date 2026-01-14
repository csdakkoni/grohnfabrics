'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, GripVertical, Palette, List, Grid3X3 } from 'lucide-react';

interface OptionValue {
  id: string;
  option_group_id: string;
  value_tr: string;
  value_en: string;
  sku_suffix?: string;
  hex_color?: string;
  price_modifier: number;
  sort_order: number;
  is_available: boolean;
  isNew?: boolean;
}

interface OptionGroup {
  id: string;
  product_id: string;
  name_tr: string;
  name_en: string;
  option_type: 'select' | 'color' | 'size' | 'radio';
  is_required: boolean;
  affects_price: boolean;
  affects_stock: boolean;
  sort_order: number;
  values: OptionValue[];
  isNew?: boolean;
}

interface VariantManagerProps {
  productId: string;
}

const OPTION_TYPE_ICONS = {
  select: List,
  color: Palette,
  size: Grid3X3,
  radio: List,
};

const OPTION_TYPE_LABELS = {
  select: 'Seçim Listesi',
  color: 'Renk Seçimi',
  size: 'Beden',
  radio: 'Tek Seçim',
};

export default function VariantManager({ productId }: VariantManagerProps) {
  const supabase = createClient();
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    const { data } = await supabase
      .from('option_groups')
      .select(`
        *,
        values:option_values(*)
      `)
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (data) {
      const sorted = data.map(g => ({
        ...g,
        values: (g.values || []).sort((a: OptionValue, b: OptionValue) => a.sort_order - b.sort_order)
      }));
      setGroups(sorted);
      if (sorted.length > 0 && !expandedGroup) {
        setExpandedGroup(sorted[0].id);
      }
    }
    setLoading(false);
  }, [productId, supabase, expandedGroup]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Add new option group
  const addGroup = async () => {
    const newGroup: Partial<OptionGroup> = {
      product_id: productId,
      name_tr: 'Yeni Seçenek',
      name_en: 'New Option',
      option_type: 'select',
      is_required: true,
      affects_price: false,
      affects_stock: true,
      sort_order: groups.length,
    };

    const { data, error } = await supabase
      .from('option_groups')
      .insert(newGroup)
      .select()
      .single();

    if (data && !error) {
      const groupWithValues = { ...data, values: [], isNew: true };
      setGroups([...groups, groupWithValues]);
      setExpandedGroup(data.id);
    }
  };

  // Update option group
  const updateGroup = async (groupId: string, updates: Partial<OptionGroup>) => {
    const { error } = await supabase
      .from('option_groups')
      .update(updates)
      .eq('id', groupId);

    if (!error) {
      setGroups(groups.map(g => 
        g.id === groupId ? { ...g, ...updates } : g
      ));
    }
  };

  // Delete option group
  const deleteGroup = async (groupId: string) => {
    if (!confirm('Bu seçenek grubunu ve tüm değerlerini silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase
      .from('option_groups')
      .delete()
      .eq('id', groupId);

    if (!error) {
      setGroups(groups.filter(g => g.id !== groupId));
      if (expandedGroup === groupId) {
        setExpandedGroup(groups[0]?.id || null);
      }
    }
  };

  // Add new option value
  const addValue = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newValue: Partial<OptionValue> = {
      option_group_id: groupId,
      value_tr: 'Yeni Değer',
      value_en: 'New Value',
      price_modifier: 0,
      sort_order: group.values.length,
      is_available: true,
    };

    const { data, error } = await supabase
      .from('option_values')
      .insert(newValue)
      .select()
      .single();

    if (data && !error) {
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, values: [...g.values, { ...data, isNew: true }] }
          : g
      ));
    }
  };

  // Update option value
  const updateValue = async (valueId: string, updates: Partial<OptionValue>) => {
    const { error } = await supabase
      .from('option_values')
      .update(updates)
      .eq('id', valueId);

    if (!error) {
      setGroups(groups.map(g => ({
        ...g,
        values: g.values.map(v => 
          v.id === valueId ? { ...v, ...updates } : v
        )
      })));
    }
  };

  // Delete option value
  const deleteValue = async (groupId: string, valueId: string) => {
    const { error } = await supabase
      .from('option_values')
      .delete()
      .eq('id', valueId);

    if (!error) {
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, values: g.values.filter(v => v.id !== valueId) }
          : g
      ));
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Varyantlar</h2>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[var(--border)] rounded"></div>
            <div className="h-10 bg-[var(--border)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="card-title">Varyantlar</h2>
          <p className="card-description">Renk, beden gibi ürün seçenekleri</p>
        </div>
        <button 
          type="button"
          onClick={addGroup} 
          className="btn btn-secondary btn-sm"
        >
          <Plus className="w-4 h-4" />
          Seçenek Grubu Ekle
        </button>
      </div>

      <div className="card-body">
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-[var(--foreground-muted)]" />
            </div>
            <p className="text-[var(--foreground-muted)] mb-4">
              Henüz varyant tanımlanmamış
            </p>
            <button 
              type="button"
              onClick={addGroup} 
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              İlk Seçenek Grubunu Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const Icon = OPTION_TYPE_ICONS[group.option_type];
              const isExpanded = expandedGroup === group.id;
              
              return (
                <div 
                  key={group.id} 
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-[var(--brand-primary)]' : 'border-[var(--border)]'
                  }`}
                >
                  {/* Group Header */}
                  <div 
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-[var(--brand-primary)]/5' : 'hover:bg-[var(--background-secondary)]'
                    }`}
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <GripVertical className="w-4 h-4 text-[var(--foreground-light)] cursor-grab" />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isExpanded ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--background-secondary)]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{group.name_tr}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {OPTION_TYPE_LABELS[group.option_type]} • {group.values.length} değer
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.is_required && (
                        <span className="badge badge-primary text-xs">Zorunlu</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                        className="btn btn-ghost p-2 text-[var(--error)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
                      {/* Group Settings */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="form-group">
                          <label className="label text-xs">İsim (TR)</label>
                          <input
                            type="text"
                            value={group.name_tr}
                            onChange={(e) => updateGroup(group.id, { name_tr: e.target.value })}
                            className="input input-sm"
                          />
                        </div>
                        <div className="form-group">
                          <label className="label text-xs">Name (EN)</label>
                          <input
                            type="text"
                            value={group.name_en}
                            onChange={(e) => updateGroup(group.id, { name_en: e.target.value })}
                            className="input input-sm"
                          />
                        </div>
                        <div className="form-group">
                          <label className="label text-xs">Tip</label>
                          <select
                            value={group.option_type}
                            onChange={(e) => updateGroup(group.id, { option_type: e.target.value as OptionGroup['option_type'] })}
                            className="input input-sm"
                          >
                            <option value="select">Seçim Listesi</option>
                            <option value="color">Renk</option>
                            <option value="size">Beden</option>
                            <option value="radio">Tek Seçim</option>
                          </select>
                        </div>
                        <div className="form-group flex items-end gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={group.is_required}
                              onChange={(e) => updateGroup(group.id, { is_required: e.target.checked })}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-xs">Zorunlu</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={group.affects_price}
                              onChange={(e) => updateGroup(group.id, { affects_price: e.target.checked })}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-xs">Fiyat etkiler</span>
                          </label>
                        </div>
                      </div>

                      {/* Values */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Değerler</h4>
                          <button
                            type="button"
                            onClick={() => addValue(group.id)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Değer Ekle
                          </button>
                        </div>

                        {group.values.length === 0 ? (
                          <p className="text-sm text-[var(--foreground-muted)] text-center py-4">
                            Henüz değer eklenmemiş
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {group.values.map((value, idx) => (
                              <div 
                                key={value.id} 
                                className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-lg"
                              >
                                <GripVertical className="w-4 h-4 text-[var(--foreground-light)] cursor-grab" />
                                
                                {/* Color Preview */}
                                {group.option_type === 'color' && (
                                  <input
                                    type="color"
                                    value={value.hex_color || '#cccccc'}
                                    onChange={(e) => updateValue(value.id, { hex_color: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                  />
                                )}

                                <input
                                  type="text"
                                  value={value.value_tr}
                                  onChange={(e) => updateValue(value.id, { value_tr: e.target.value })}
                                  placeholder="Değer (TR)"
                                  className="input input-sm flex-1"
                                />
                                <input
                                  type="text"
                                  value={value.value_en}
                                  onChange={(e) => updateValue(value.id, { value_en: e.target.value })}
                                  placeholder="Value (EN)"
                                  className="input input-sm flex-1"
                                />
                                
                                {group.affects_price && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-[var(--foreground-muted)]">+₺</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={value.price_modifier}
                                      onChange={(e) => updateValue(value.id, { price_modifier: parseFloat(e.target.value) || 0 })}
                                      className="input input-sm w-20"
                                    />
                                  </div>
                                )}

                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={value.is_available}
                                    onChange={(e) => updateValue(value.id, { is_available: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className="text-xs text-[var(--foreground-muted)]">Aktif</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => deleteValue(group.id, value.id)}
                                  className="btn btn-ghost p-2 text-[var(--error)]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
