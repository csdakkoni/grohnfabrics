'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Palette, Ruler, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

interface OptionValueTemplate {
  id: string;
  template_id: string;
  value_tr: string;
  value_en: string;
  sku_suffix: string | null;
  hex_color: string | null;
  default_price_modifier: number;
  sort_order: number;
  is_active: boolean;
}

interface OptionGroupTemplate {
  id: string;
  name_tr: string;
  name_en: string;
  option_type: 'color' | 'size' | 'select' | 'radio';
  description: string | null;
  is_active: boolean;
  sort_order: number;
  values?: OptionValueTemplate[];
}

const optionTypeLabels: Record<string, string> = {
  color: 'Renk',
  size: 'Beden',
  select: 'Seçim',
  radio: 'Tek Seçim',
};

const optionTypeIcons: Record<string, React.ReactNode> = {
  color: <Palette className="w-4 h-4" />,
  size: <Ruler className="w-4 h-4" />,
  select: <ChevronDown className="w-4 h-4" />,
  radio: <ChevronRight className="w-4 h-4" />,
};

export default function VariantTemplatesPage() {
  const [templates, setTemplates] = useState<OptionGroupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroupTemplate | null>(null);
  const [editingValue, setEditingValue] = useState<OptionValueTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data: groups } = await supabase
      .from('option_group_templates')
      .select('*')
      .order('sort_order');

    if (groups) {
      const templatesWithValues = await Promise.all(
        groups.map(async (group) => {
          const { data: values } = await supabase
            .from('option_value_templates')
            .select('*')
            .eq('template_id', group.id)
            .order('sort_order');
          return { ...group, values: values || [] };
        })
      );
      setTemplates(templatesWithValues);
    }
    setLoading(false);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTemplates(newExpanded);
  };

  const handleSaveGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      name_tr: formData.get('name_tr') as string,
      name_en: formData.get('name_en') as string,
      option_type: formData.get('option_type') as string,
      description: formData.get('description') as string || null,
      is_active: true,
    };

    if (editingGroup) {
      await supabase
        .from('option_group_templates')
        .update(data)
        .eq('id', editingGroup.id);
    } else {
      await supabase
        .from('option_group_templates')
        .insert(data);
    }

    setShowGroupModal(false);
    setEditingGroup(null);
    loadTemplates();
  };

  const handleSaveValue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      template_id: selectedTemplateId!,
      value_tr: formData.get('value_tr') as string,
      value_en: formData.get('value_en') as string,
      sku_suffix: formData.get('sku_suffix') as string || null,
      hex_color: formData.get('hex_color') as string || null,
      default_price_modifier: parseFloat(formData.get('price_modifier') as string) || 0,
      is_active: true,
    };

    if (editingValue) {
      await supabase
        .from('option_value_templates')
        .update(data)
        .eq('id', editingValue.id);
    } else {
      await supabase
        .from('option_value_templates')
        .insert(data);
    }

    setShowValueModal(false);
    setEditingValue(null);
    setSelectedTemplateId(null);
    loadTemplates();
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Bu şablonu ve tüm değerlerini silmek istediğinize emin misiniz?')) return;
    await supabase.from('option_group_templates').delete().eq('id', id);
    loadTemplates();
  };

  const handleDeleteValue = async (id: string) => {
    if (!confirm('Bu değeri silmek istediğinize emin misiniz?')) return;
    await supabase.from('option_value_templates').delete().eq('id', id);
    loadTemplates();
  };

  const openAddValue = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingValue(null);
    setShowValueModal(true);
  };

  const openEditValue = (value: OptionValueTemplate) => {
    setSelectedTemplateId(value.template_id);
    setEditingValue(value);
    setShowValueModal(true);
  };

  // Find template for the value modal
  const currentTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Varyant Şablonları</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Ürünlerde kullanılacak ön tanımlı seçenekleri yönetin
          </p>
        </div>
        <button 
          onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Şablon
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <Palette className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-light)]" />
          <h3 className="text-lg font-medium mb-2">Henüz şablon yok</h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            Ürünlerinizde kullanmak için varyant şablonları oluşturun
          </p>
          <button 
            onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            İlk Şablonu Oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden"
            >
              {/* Template Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--background-secondary)] transition-colors"
                onClick={() => toggleExpanded(template.id)}
              >
                <div className="flex items-center gap-4">
                  <button className="text-[var(--foreground-light)]">
                    {expandedTemplates.has(template.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center text-[var(--brand-primary)]">
                    {optionTypeIcons[template.option_type]}
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name_tr}</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {optionTypeLabels[template.option_type]} • {template.values?.length || 0} değer
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => openAddValue(template.id)}
                    className="btn btn-sm btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                    Değer Ekle
                  </button>
                  <button 
                    onClick={() => { setEditingGroup(template); setShowGroupModal(true); }}
                    className="p-2 hover:bg-[var(--background-secondary)] rounded-lg"
                  >
                    <Pencil className="w-4 h-4 text-[var(--foreground-muted)]" />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(template.id)}
                    className="p-2 hover:bg-[var(--error-light)] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--error)]" />
                  </button>
                </div>
              </div>

              {/* Template Values */}
              {expandedTemplates.has(template.id) && (
                <div className="border-t border-[var(--border)] bg-[var(--background-secondary)]/50">
                  {template.values && template.values.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                      {template.values.map((value) => (
                        <div 
                          key={value.id}
                          className="flex items-center justify-between px-4 py-3 pl-16 hover:bg-[var(--background-secondary)]"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-[var(--foreground-light)] cursor-grab" />
                            {value.hex_color && (
                              <div 
                                className="w-6 h-6 rounded-full border border-[var(--border)]"
                                style={{ backgroundColor: value.hex_color }}
                              />
                            )}
                            <div>
                              <span className="font-medium">{value.value_tr}</span>
                              {value.sku_suffix && (
                                <span className="ml-2 text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)] px-2 py-0.5 rounded">
                                  SKU: {value.sku_suffix}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {value.default_price_modifier !== 0 && (
                              <span className={`text-sm font-medium ${value.default_price_modifier > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                {value.default_price_modifier > 0 ? '+' : ''}{value.default_price_modifier}₺
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => openEditValue(value)}
                                className="p-1.5 hover:bg-[var(--background-secondary)] rounded"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                              </button>
                              <button 
                                onClick={() => handleDeleteValue(value.id)}
                                className="p-1.5 hover:bg-[var(--error-light)] rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[var(--error)]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[var(--foreground-muted)]">
                      Bu şablonda henüz değer yok.
                      <button 
                        onClick={() => openAddValue(template.id)}
                        className="ml-2 text-[var(--brand-primary)] hover:underline"
                      >
                        Değer ekle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--card-bg)] rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">
                {editingGroup ? 'Şablonu Düzenle' : 'Yeni Şablon'}
              </h2>
            </div>
            <form onSubmit={handleSaveGroup}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Şablon Adı (TR)</label>
                  <input
                    name="name_tr"
                    type="text"
                    required
                    defaultValue={editingGroup?.name_tr}
                    placeholder="örn: Renkler"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Şablon Adı (EN)</label>
                  <input
                    name="name_en"
                    type="text"
                    required
                    defaultValue={editingGroup?.name_en}
                    placeholder="e.g: Colors"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Seçenek Tipi</label>
                  <select 
                    name="option_type" 
                    className="input"
                    defaultValue={editingGroup?.option_type || 'select'}
                  >
                    <option value="color">Renk (renk seçici)</option>
                    <option value="size">Beden (beden butonları)</option>
                    <option value="select">Seçim (dropdown)</option>
                    <option value="radio">Tek Seçim (radio)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                  <input
                    name="description"
                    type="text"
                    defaultValue={editingGroup?.description || ''}
                    placeholder="Şablon hakkında kısa açıklama"
                    className="input"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowGroupModal(false); setEditingGroup(null); }}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGroup ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Value Modal */}
      {showValueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--card-bg)] rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">
                {editingValue ? 'Değeri Düzenle' : 'Yeni Değer Ekle'}
              </h2>
              {currentTemplate && (
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  {currentTemplate.name_tr} şablonuna
                </p>
              )}
            </div>
            <form onSubmit={handleSaveValue}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Değer (TR)</label>
                    <input
                      name="value_tr"
                      type="text"
                      required
                      defaultValue={editingValue?.value_tr}
                      placeholder="örn: Kırmızı"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Değer (EN)</label>
                    <input
                      name="value_en"
                      type="text"
                      required
                      defaultValue={editingValue?.value_en}
                      placeholder="e.g: Red"
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">SKU Eki</label>
                    <input
                      name="sku_suffix"
                      type="text"
                      defaultValue={editingValue?.sku_suffix || ''}
                      placeholder="örn: RED"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Fiyat Farkı (₺)</label>
                    <input
                      name="price_modifier"
                      type="number"
                      step="0.01"
                      defaultValue={editingValue?.default_price_modifier || 0}
                      className="input"
                    />
                  </div>
                </div>
                {currentTemplate?.option_type === 'color' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Renk Kodu</label>
                    <div className="flex gap-3">
                      <input
                        name="hex_color"
                        type="color"
                        defaultValue={editingValue?.hex_color || '#000000'}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        readOnly
                        value={editingValue?.hex_color || '#000000'}
                        className="input flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowValueModal(false); setEditingValue(null); setSelectedTemplateId(null); }}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingValue ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
