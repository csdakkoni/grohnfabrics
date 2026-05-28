'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Trash2, CheckCircle, Info, Video, X, Loader2, Plus, Copy } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import VariantManager from '@/components/admin/VariantManager';

interface Category {
  id: string;
  name_tr: string;
}

interface Material {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name_tr: string;
  name_en: string;
  slug: string;
  description_tr: string | null;
  description_en: string | null;
  category_id: string | null;
  material_id: string | null;
  product_type: string;
  sales_model: string;
  min_order_quantity: number;
  order_step: number;
  is_active: boolean;
  show_in_tr: boolean;
  show_in_global: boolean;
  images: string[];
  videos: string[];
  thumbnail_url: string | null;
}

interface ProductPrice {
  id: string;
  market_id: string;
  currency: string;
  price: number;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isNewProduct = searchParams.get('new') === 'true';
  const [showNewProductBanner, setShowNewProductBanner] = useState(isNewProduct);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [videoUploading, setVideoUploading] = useState(false);
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
    price_tr: '',
    price_usd: '',
    price_eur: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [productRes, categoriesRes, materialsRes, pricesRes] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('categories').select('id, name_tr').eq('is_active', true).order('name_tr'),
      supabase.from('materials').select('id, name').order('name'),
      supabase.from('product_prices').select('*').eq('product_id', id),
    ]);

    if (productRes.data) {
      const p = productRes.data as Product;
      setForm({
        name_tr: p.name_tr,
        name_en: p.name_en,
        slug: p.slug,
        description_tr: p.description_tr || '',
        description_en: p.description_en || '',
        category_id: p.category_id || '',
        material_id: p.material_id || '',
        product_type: p.product_type,
        sales_model: p.sales_model,
        min_order_quantity: p.min_order_quantity.toString(),
        order_step: p.order_step.toString(),
        is_active: p.is_active,
        show_in_tr: p.show_in_tr,
        show_in_global: p.show_in_global,
        price_tr: '',
        price_usd: '',
        price_eur: '',
      });
      setImages(p.images || []);
      setVideos(p.videos || []);
    }

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (materialsRes.data) {
      setMaterials(materialsRes.data);
    }

    if (pricesRes.data) {
      setPrices(pricesRes.data);
      const trPrice = pricesRes.data.find((p: ProductPrice) => p.market_id === 'TR');
      const usdPrice = pricesRes.data.find((p: ProductPrice) => p.market_id === 'GLOBAL' && p.currency === 'USD');
      const eurPrice = pricesRes.data.find((p: ProductPrice) => p.market_id === 'GLOBAL' && p.currency === 'EUR');
      
      setForm(f => ({
        ...f,
        price_tr: trPrice?.price?.toString() || '',
        price_usd: usdPrice?.price?.toString() || '',
        price_eur: eurPrice?.price?.toString() || '',
      }));
    }

    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
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
          videos: videos,
          thumbnail_url: images[0] || null,
        })
        .eq('id', id);

      if (productError) throw productError;

      // Update prices - upsert each
      const priceUpdates = [];
      
      if (form.price_tr) {
        priceUpdates.push({
          product_id: id,
          market_id: 'TR',
          currency: 'TRY',
          price: parseFloat(form.price_tr),
        });
      }
      if (form.price_usd) {
        priceUpdates.push({
          product_id: id,
          market_id: 'GLOBAL',
          currency: 'USD',
          price: parseFloat(form.price_usd),
        });
      }
      if (form.price_eur) {
        priceUpdates.push({
          product_id: id,
          market_id: 'GLOBAL',
          currency: 'EUR',
          price: parseFloat(form.price_eur),
        });
      }

      for (const priceData of priceUpdates) {
        await supabase
          .from('product_prices')
          .upsert(priceData, { 
            onConflict: 'product_id,market_id,currency',
          });
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Ürün güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Silme işlemi başarısız oldu.');
      return;
    }
    
    router.push('/admin/products');
    router.refresh();
  };

  const handleCopy = async () => {
    if (copying) return;
    
    if (!confirm('Bu ürünü kopyalamak istiyor musunuz? Tüm bilgiler, fiyatlar ve varyantlar kopyalanacak.')) {
      return;
    }

    setCopying(true);
    try {
      const response = await fetch('/api/admin/products/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/admin/products/${result.newProductId}?new=true`);
        router.refresh();
      } else {
        alert(result.error || 'Kopyalama başarısız oldu');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Bir hata oluştu');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border)] rounded w-48"></div>
          <div className="h-96 bg-[var(--border)] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* New Product Success Banner */}
      {showNewProductBanner && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800">Ürün başarıyla oluşturuldu! 🎉</h3>
            <p className="text-sm text-green-700 mt-1">
              Şimdi aşağıda varyant seçenekleri (renk, beden vb.) ekleyebilirsiniz. 
              Varyant eklemezseniz ürün basit ürün olarak yayınlanır.
            </p>
          </div>
          <button 
            onClick={() => setShowNewProductBanner(false)}
            className="text-green-600 hover:text-green-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/admin/products" 
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Ürünlere Dön
          </Link>
          <h1 className="text-2xl font-semibold">Ürün Düzenle</h1>
          <p className="text-[var(--foreground-muted)]">{form.name_tr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy} 
            disabled={copying}
            className="btn btn-secondary"
          >
            {copying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Kopyala
          </button>
          <button onClick={handleDelete} className="btn btn-ghost text-[var(--error)]">
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
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

            {/* Videos */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Videolar
                </h2>
                <p className="card-description">Ürün tanıtım videoları (MP4, max 100MB)</p>
              </div>
              <div className="card-body">
                {/* Existing Videos */}
                {videos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {videos.map((videoUrl, idx) => (
                      <div key={idx} className="relative group">
                        <video 
                          src={videoUrl} 
                          className="w-full aspect-video rounded-lg bg-black object-cover"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Video */}
                <div className="flex gap-4">
                  <label className={`flex-1 border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--brand-primary)] transition-colors ${videoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {videoUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
                        <span className="text-sm text-[var(--foreground-muted)]">Video yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="w-8 h-8 text-[var(--foreground-muted)]" />
                        <span className="text-sm text-[var(--foreground-muted)]">Video Yükle</span>
                        <span className="text-xs text-[var(--foreground-light)]">veya sürükle bırak</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Check file size (100MB)
                        if (file.size > 100 * 1024 * 1024) {
                          alert('Video 100MB\'dan küçük olmalı');
                          return;
                        }

                        setVideoUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'videos');

                          // Upload video directly to R2
                          const response = await fetch('/api/video/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          const result = await response.json();
                          
                          if (result.success && result.url) {
                            setVideos([...videos, result.url]);
                          } else {
                            throw new Error(result.error || 'Video yüklenemedi');
                          }
                        } catch (err) {
                          console.error('Video upload error:', err);
                          alert('Video yüklenirken hata oluştu');
                        } finally {
                          setVideoUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  {/* URL Input */}
                  <div className="w-72">
                    <input
                      type="text"
                      placeholder="veya video URL yapıştır"
                      className="input w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const url = input.value.trim();
                          if (url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube') || url.includes('vimeo'))) {
                            setVideos([...videos, url]);
                            input.value = '';
                          } else if (url) {
                            alert('Geçerli bir video URL girin (.mp4, .webm veya YouTube/Vimeo)');
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-[var(--foreground-light)] mt-1">Enter ile ekle</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Fiyatlandırma</h2>
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <VariantManager productId={id} />
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
                  <label className="label">Ürün Tipi</label>
                  <select
                    value={form.product_type}
                    onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                    className="input"
                  >
                    <option value="fabric">Kumaş</option>
                    <option value="pillow">Yastık Kılıfı</option>
                    <option value="curtain">Perde</option>
                    <option value="tablecloth">Masa Örtüsü</option>
                    <option value="runner">Runner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Satış Modeli</label>
                  <select
                    value={form.sales_model}
                    onChange={(e) => setForm({ ...form, sales_model: e.target.value })}
                    className="input"
                  >
                    <option value="meter">Metre Bazlı</option>
                    <option value="unit">Adet Bazlı</option>
                    <option value="preset_sizes">Hazır Ölçüler</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Settings */}
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
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/admin/products" className="btn btn-secondary flex-1">
                İptal
              </Link>
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
