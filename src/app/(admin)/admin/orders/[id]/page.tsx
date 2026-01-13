import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin } from 'lucide-react';
import OrderStatusChanger from './OrderStatusChanger';

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      customer:customers(first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .single();

  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
  const shippingAddress = order.shipping_address as Record<string, string>;

  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    paid: 'Ödendi',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal',
    refunded: 'İade',
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    processing: 'badge-primary',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    refunded: 'badge-gray',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/orders" 
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Siparişlere Dön
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{order.order_number}</h1>
            <p className="text-[var(--foreground-muted)]">
              {new Date(order.created_at).toLocaleString('tr-TR')}
            </p>
          </div>
          <span className={`badge ${statusColors[order.status] || 'badge-gray'} text-base px-4 py-2`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--brand-primary)]" />
              <h2 className="card-title">Sipariş Kalemleri</h2>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>SKU</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: {
                    id: string;
                    product_name: string;
                    product_sku: string;
                    quantity: number;
                    unit_type: string;
                    unit_price: number;
                    total_price: number;
                    variant_info?: Record<string, string>;
                  }) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-[var(--foreground-muted)]">{item.product_sku || '-'}</td>
                      <td>
                        {item.quantity} {item.unit_type === 'meter' ? 'm' : 'adet'}
                      </td>
                      <td>₺{item.unit_price}</td>
                      <td className="font-medium">₺{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <div className="flex justify-between gap-8 text-sm">
                    <span className="text-[var(--foreground-muted)]">Ara Toplam</span>
                    <span>₺{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm">
                    <span className="text-[var(--foreground-muted)]">Kargo</span>
                    <span>{order.shipping_cost > 0 ? `₺${order.shipping_cost}` : 'Ücretsiz'}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between gap-8 text-sm">
                      <span className="text-[var(--foreground-muted)]">İndirim</span>
                      <span className="text-[var(--success)]">-₺{order.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 text-lg font-semibold pt-2 border-t border-[var(--border)]">
                    <span>Toplam</span>
                    <span className="text-[var(--brand-primary)]">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: order.currency,
                      }).format(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Sipariş Durumu</h2>
            </div>
            <div className="card-body">
              <OrderStatusChanger 
                orderId={order.id} 
                currentStatus={order.status} 
              />
            </div>
          </div>

          {/* Notes */}
          {(order.customer_notes || order.admin_notes) && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Notlar</h2>
              </div>
              <div className="card-body space-y-4">
                {order.customer_notes && (
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">Müşteri Notu</p>
                    <p className="mt-1">{order.customer_notes}</p>
                  </div>
                )}
                {order.admin_notes && (
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">Admin Notu</p>
                    <p className="mt-1">{order.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--brand-primary)]" />
              <h3 className="card-title">Müşteri</h3>
            </div>
            <div className="card-body text-sm space-y-2">
              {customer ? (
                <>
                  <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                  <p className="text-[var(--foreground-muted)]">{customer.email}</p>
                  {customer.phone && <p className="text-[var(--foreground-muted)]">{customer.phone}</p>}
                </>
              ) : order.guest_email ? (
                <>
                  <p className="font-medium">
                    {order.guest_info?.firstName} {order.guest_info?.lastName}
                  </p>
                  <p className="text-[var(--foreground-muted)]">{order.guest_email}</p>
                  {order.guest_info?.phone && (
                    <p className="text-[var(--foreground-muted)]">{order.guest_info.phone}</p>
                  )}
                  <span className="badge badge-gray mt-2">Misafir</span>
                </>
              ) : (
                <p className="text-[var(--foreground-muted)]">Müşteri bilgisi yok</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
              <h3 className="card-title">Teslimat Adresi</h3>
            </div>
            <div className="card-body text-sm">
              {shippingAddress ? (
                <>
                  <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p className="text-[var(--foreground-muted)]">{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && (
                    <p className="text-[var(--foreground-muted)]">{shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-[var(--foreground-muted)]">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p className="text-[var(--foreground-muted)]">{shippingAddress.country}</p>
                </>
              ) : (
                <p className="text-[var(--foreground-muted)]">Adres bilgisi yok</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
              <h3 className="card-title">Ödeme</h3>
            </div>
            <div className="card-body text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Sağlayıcı</span>
                <span className="font-medium">
                  {order.payment_provider === 'iyzico' ? 'iyzico' : 
                   order.payment_provider === 'stripe' ? 'Stripe' : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Market</span>
                <span className={`badge ${order.market_id === 'TR' ? 'badge-primary' : 'badge-info'}`}>
                  {order.market_id === 'TR' ? '🇹🇷 TR' : '🌍 Global'}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">ID</span>
                  <span className="font-mono text-xs">{order.payment_id.substring(0, 20)}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
              <h3 className="card-title">Kargo</h3>
            </div>
            <div className="card-body text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Sağlayıcı</span>
                <span className="font-medium">
                  {order.shipping_provider || 'Belirlenmedi'}
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Takip No</span>
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Gönderim</span>
                  <span>{new Date(order.shipped_at).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
