'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Layers, Check, Info } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/utils';

interface Category {
  id: string;
  name_tr: string;
}

interface Material {
  id: string;
  name: string;
}

interface OptionValueTemplate {
  id: string;
  template_id: string;
  value_tr: string;
  value_en: string;
  sku_suffix: string | null;
  hex_color: string | null;
  default_price_modifier: number;
  sort_order: number;
}

interface OptionGroupTemplate {
  id: string;
  name_tr: string;
  name_en: string;
  option_type: string;
  description: string | null;
  values?: OptionValueTemplate[];
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [variantTemplates, setVariantTemplates] = useState<OptionGroupTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name_tr: '',
    name_en: '',
    slug: '',
    description_tr: '',
    description_en: '',
    category_id: '',
    material_id: '',
    product_type: 'fabric',
    sales_model: 'meter',
    min_order_quantity: '1',
    order_step: '0.5',
    is_active: true,
    show_in_tr: true,
    show_in_global: true,
    // Prices
    price_tr: '',
    price_usd: '',
    price_eur: '',
  });

  useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name_tr')
        .eq('is_active', true)
        .order('name_tr');
      setCategories(cats || []);

      // Load materials
      const { data: mats } = await supabase
        .from('materials')
        .select('id, name')
        .order('name');
      setMaterials(mats || []);

      // Load variant templates
      const { data: templates } = await supabase
        .from('option_group_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (templates) {
        const templatesWithValues = await Promise.all(
          templates.map(async (template) => {
            const { data: values } = await supabase
              .from('option_value_templates')
              .select('*')
              .eq('template_id', template.id)
              .eq('is_active', true)
              .order('sort_order');
            return { ...template, values: values || [] };
          })
        );
        setVariantTemplates(templatesWithValues);
      }
    }
    loadData();
  }, [supabase]);

  // Auto-generate slug from Turkish name
  useEffect(() => {
    const slug = slugify(form.name_tr);
    setForm(f => ({ ...f, slug }));
  }, [form.name_tr]);

  const toggleTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate prices for active regions
    if (form.show_in_tr && !form.price_tr) {
      alert('Türkiye pazarında gösterilecek ürünler için TL fiyatı (Fiyat TL) girmelisiniz.');
      return;
    }
    if (form.show_in_global && !form.price_usd && !form.price_eur) {
      alert('Global pazarda gösterilecek ürünler için en az bir yabancı para biriminde fiyat (Fiyat USD veya Fiyat EUR) girmelisiniz.');
      return;
    }
    if (!form.show_in_tr && !form.show_in_global) {
      alert('Ürünün en az bir pazarda gösterilmesi gerekir (Türkiye veya Global).');
      return;
    }

    setLoading(true);

    try {
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name_tr: form.name_tr,
          name_en: form.name_en,
          slug: form.slug,
          description_tr: form.description_tr || null,
          description_en: form.description_en || null,
          category_id: form.category_id || null,
          material_id: form.material_id || null,
          product_type: form.product_type,
          sales_model: form.sales_model,
          min_order_quantity: form.sales_model === 'meter' 
            ? parseFloat(form.min_order_quantity) 
            : Math.max(1, Math.round(parseFloat(form.min_order_quantity) || 1)),
          order_step: form.sales_model === 'meter' 
            ? parseFloat(form.order_step) 
            : 1,
          is_active: form.is_active,
          show_in_tr: form.show_in_tr,
          show_in_global: form.show_in_global,
          images: images,
          thumbnail_url: images[0] || null,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create prices
      const prices = [];
      if (form.price_tr) {
        prices.push({
          product_id: product.id,
          market_id: 'TR',
          currency: 'TRY',
          price: parseFloat(form.price_tr),
        });
      }
      if (form.price_usd) {
        prices.push({
          product_id: product.id,
          market_id: 'GLOBAL',
          currency: 'USD',
          price: parseFloat(form.price_usd),
        });
      }
      if (form.price_eur) {
        prices.push({
          product_id: product.id,
          market_id: 'GLOBAL',
          currency: 'EUR',
          price: parseFloat(form.price_eur),
        });
      }

      if (prices.length > 0) {
        const { error: priceError } = await supabase
          .from('product_prices')
          .insert(prices);
        if (priceError) throw priceError;
      }

      // Copy selected variant templates to product
      if (selectedTemplates.size > 0) {
        for (const templateId of selectedTemplates) {
          const template = variantTemplates.find(t => t.id === templateId);
          if (!template) continue;

          // Create option group
          const { data: optionGroup, error: groupError } = await supabase
            .from('option_groups')
            .insert({
              product_id: product.id,
              name_tr: template.name_tr,
              name_en: template.name_en,
              option_type: template.option_type,
              is_required: true,
              affects_price: template.values?.some(v => v.default_price_modifier !== 0) || false,
              affects_stock: true,
            })
            .select()
            .single();

          if (groupError) throw groupError;

          // Create option values
          if (template.values && template.values.length > 0) {
            const optionValues = template.values.map((v, idx) => ({
              option_group_id: optionGroup.id,
              value_tr: v.value_tr,
              value_en: v.value_en,
              sku_suffix: v.sku_suffix,
              hex_color: v.hex_color,
              price_modifier: v.default_price_modifier,
              sort_order: idx,
              is_available: true,
            }));

            const { error: valuesError } = await supabase
              .from('option_values')
              .insert(optionValues);
            if (valuesError) throw valuesError;
          }
        }
      }

      // Ürün kaydedildi, düzenleme sayfasına yönlendir (varyant eklemesi için)
      router.push(`/admin/products/${product.id}?new=true`);
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Ürün oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Ürünlere Dön
        </Link>
        <h1 className="text-2xl font-semibold">Yeni Ürün</h1>
        <p className="text-[var(--foreground-muted)]">Yeni bir ürün ekleyin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Temel Bilgiler</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Ürün Adı (TR) *</label>
                    <input
                      type="text"
                      value={form.name_tr}
                      onChange={(e) => setForm({ ...form, name_tr: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Product Name (EN) *</label>
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
                  />
                  <p className="form-hint">grohnfabrics.com/products/{form.slug || '...'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Açıklama (TR)</label>
                    <textarea
                      value={form.description_tr}
                      onChange={(e) => setForm({ ...form, description_tr: e.target.value })}
                      className="input"
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Description (EN)</label>
                    <textarea
                      value={form.description_en}
                      onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                      className="input"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Görseller</h2>
                <p className="card-description">İlk görsel ana görsel olarak kullanılır</p>
              </div>
              <div className="card-body">
                <ImageUpload 
                  images={images} 
                  onImagesChange={setImages}
                  folder="products"
                  maxImages={10}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Fiyatlandırma</h2>
                <p className="card-description">Market bazlı fiyatlar</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="label">Türkiye (TRY)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_tr}
                      onChange={(e) => setForm({ ...form, price_tr: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Global (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_usd}
                      onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Global (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_eur}
                      onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variant Templates */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h2 className="card-title">Varyant Şablonları</h2>
                </div>
                <p className="card-description">Ön tanımlı seçenekleri ürüne ekleyin</p>
              </div>
              <div className="card-body">
                {variantTemplates.length === 0 ? (
                  <div className="text-center py-6 text-[var(--foreground-muted)]">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Henüz varyant şablonu oluşturulmamış.</p>
                    <Link href="/admin/variants" className="text-sm text-[var(--brand-primary)] hover:underline">
                      Şablon oluştur →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variantTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => toggleTemplate(template.id)}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedTemplates.has(template.id) 
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' 
                            : 'border-[var(--border)] hover:border-[var(--brand-primary)]/50'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name_tr}</span>
                              <span className="text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)] px-2 py-0.5 rounded">
                                {template.values?.length || 0} değer
                              </span>
                            </div>
                            {template.description && (
                              <p className="text-sm text-[var(--foreground-muted)] mt-1">{template.description}</p>
                            )}
                            {template.values && template.values.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {template.values.slice(0, 6).map((value) => (
                                  <span 
                                    key={value.id} 
                                    className="inline-flex items-center gap-1 text-xs bg-[var(--background-secondary)] px-2 py-1 rounded"
                                  >
                                    {value.hex_color && (
                                      <span 
                                        className="w-3 h-3 rounded-full border border-black/10" 
                                        style={{ backgroundColor: value.hex_color }}
                                      />
                                    )}
                                    {value.value_tr}
                                  </span>
                                ))}
                                {template.values.length > 6 && (
                                  <span className="text-xs text-[var(--foreground-muted)] px-2 py-1">
                                    +{template.values.length - 6} daha
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${selectedTemplates.has(template.id) 
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' 
                              : 'border-[var(--border)]'
                            }
                          `}>
                            {selectedTemplates.has(template.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedTemplates.size > 0 && (
                      <p className="text-sm text-[var(--brand-primary)] mt-2">
                        ✓ {selectedTemplates.size} şablon seçildi - kaydedildiğinde ürüne eklenecek
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Durum</h2>
              </div>
              <div className="card-body space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Aktif (Yayında)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_in_tr}
                    onChange={(e) => setForm({ ...form, show_in_tr: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Türkiye&apos;de Göster</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_in_global}
                    onChange={(e) => setForm({ ...form, show_in_global: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Global&apos;de Göster</span>
                </label>
              </div>
            </div>

            {/* Classification */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Sınıflandırma</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">Kategori</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Seçiniz...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Materyal</label>
                  <select
                    value={form.material_id}
                    onChange={(e) => setForm({ ...form, material_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Seçiniz...</option>
                    {materials.map((mat) => (
                      <option key={mat.id} value={mat.id}>{mat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Ürün Tipi *</label>
                  <select
                    value={form.product_type}
                    onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="fabric">Kumaş</option>
                    <option value="pillow">Yastık Kılıfı</option>
                    <option value="curtain">Perde</option>
                    <option value="tablecloth">Masa Örtüsü</option>
                    <option value="runner">Runner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Satış Modeli *</label>
                  <select
                    value={form.sales_model}
                    onChange={(e) => setForm({ ...form, sales_model: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="meter">Metre Bazlı</option>
                    <option value="unit">Adet Bazlı</option>
                    <option value="preset_sizes">Hazır Ölçüler</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Settings (for meter-based) */}
            {form.sales_model === 'meter' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Sipariş Ayarları</h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="form-group">
                    <label className="label">Minimum Sipariş (metre)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.min_order_quantity}
                      onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Artış Adımı (metre)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.order_step}
                      onChange={(e) => setForm({ ...form, order_step: e.target.value })}
                      className="input"
                    />
                    <p className="form-hint">Örn: 0.5 = 1m, 1.5m, 2m...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/admin/products" className="btn btn-secondary flex-1">
                İptal
              </Link>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
