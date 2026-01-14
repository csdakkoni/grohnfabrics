import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import ProductActions from '@/components/admin/ProductActions';

export const dynamic = 'force-dynamic';

async function getProducts() {
  const { data } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      slug,
      name_tr,
      name_en,
      product_type,
      sales_model,
      is_active,
      is_featured,
      created_at,
      category:categories(name_tr),
      prices:product_prices(price, currency, market_id)
    `)
    .order('created_at', { ascending: false });
  
  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  const productTypeLabels: Record<string, string> = {
    fabric: 'Kumaş',
    pillow: 'Yastık',
    curtain: 'Perde',
    tablecloth: 'Masa Örtüsü',
    runner: 'Runner',
  };

  const salesModelLabels: Record<string, string> = {
    meter: 'Metre',
    unit: 'Adet',
    preset_sizes: 'Hazır Ölçü',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Ürünler</h1>
          <p className="text-[var(--foreground-muted)]">Tüm ürünleri yönetin</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </Link>
      </div>

      {/* Products Table */}
      {products.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Tip</th>
                <th>Satış Modeli</th>
                <th>Fiyat (TR)</th>
                <th>Fiyat (USD)</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const prices = product.prices || [];
                const trPrice = prices.find((p: { market_id: string }) => p.market_id === 'TR');
                const usdPrice = prices.find((p: { market_id: string; currency: string }) => p.market_id === 'GLOBAL' && p.currency === 'USD');
                const category = Array.isArray(product.category) ? product.category[0] : product.category;
                
                return (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-medium">{product.name_tr}</p>
                        <p className="text-sm text-[var(--foreground-light)]">{product.name_en}</p>
                      </div>
                    </td>
                    <td>{category?.name_tr || '-'}</td>
                    <td>
                      <span className="badge badge-gray">
                        {productTypeLabels[product.product_type]}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {salesModelLabels[product.sales_model]}
                      </span>
                    </td>
                    <td>
                      {trPrice ? `₺${trPrice.price}` : '-'}
                    </td>
                    <td>
                      {usdPrice ? `$${usdPrice.price}` : '-'}
                    </td>
                    <td>
                      {product.is_active ? (
                        <span className="badge badge-success">Aktif</span>
                      ) : (
                        <span className="badge badge-gray">Pasif</span>
                      )}
                    </td>
                    <td>
                      <ProductActions productId={product.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz ürün yok</h3>
            <p className="empty-state-description">
              İlk ürününüzü ekleyerek başlayın.
            </p>
            <Link href="/admin/products/new" className="btn btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Yeni Ürün Ekle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
