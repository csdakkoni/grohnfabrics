import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, ChevronLeft, MapPin, Phone, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  unit_price: number;
  total_price: number;
  product?: {
    slug: string;
    thumbnail_url?: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
  guest_email?: string;
  guest_info?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  shipping_address?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  shipping_provider?: string;
  tracking_number?: string;
  order_items?: OrderItem[];
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
}

async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        product_name,
        quantity,
        unit_type,
        unit_price,
        total_price,
        product:products(slug, thumbnail_url, images)
      ),
      customer:customers(first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Order;
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const statusSteps = [
    { key: 'pending', label: 'Sipariş Alındı', icon: Clock },
    { key: 'paid', label: 'Ödeme Onaylandı', icon: CheckCircle },
    { key: 'processing', label: 'Hazırlanıyor', icon: Package },
    { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
    { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);

  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    paid: 'Ödendi',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
    refunded: 'İade Edildi',
  };

  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
  const customerName = customer
    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
    : order.guest_info
      ? `${order.guest_info.firstName || ''} ${order.guest_info.lastName || ''}`.trim()
      : 'Misafir';
  const customerEmail = customer?.email || order.guest_email;
  const customerPhone = customer?.phone || order.guest_info?.phone;

  return (
    <div className="bg-[var(--background-secondary)] min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Siparişlerime Dön
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Sipariş #{order.order_number}</h1>
              <p className="text-[var(--foreground-muted)]">
                {new Date(order.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${isCancelled
                ? 'bg-red-100 text-red-800'
                : order.status === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        {!isCancelled && (
          <div className="card mb-8">
            <div className="card-body">
              <h2 className="font-medium mb-6">Sipariş Durumu</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--border)]" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-[var(--brand-primary)] transition-all duration-500"
                  style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors
                          ${isCompleted
                            ? 'bg-[var(--brand-primary)] text-white'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] border-2 border-[var(--border)]'
                          }
                          ${isCurrent ? 'ring-4 ring-[var(--brand-primary)]/20' : ''}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`
                          mt-2 text-xs text-center max-w-[80px]
                          ${isCompleted ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-muted)]'}
                        `}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Info */}
              {order.tracking_number && (
                <div className="mt-8 p-4 bg-[var(--background-secondary)] rounded-xl">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">Kargo Takip Numarası</p>
                  <p className="font-medium font-mono">{order.tracking_number}</p>
                  {order.shipping_provider && (
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                      {order.shipping_provider === 'yurtici_kargo' ? 'Yurtiçi Kargo' :
                        order.shipping_provider === 'aras_kargo' ? 'Aras Kargo' :
                          order.shipping_provider === 'ups' ? 'UPS' :
                            order.shipping_provider === 'dhl' ? 'DHL' :
                              order.shipping_provider}
                    </p>
                  )}
                  {/* Yurtiçi Kargo Tracking Link */}
                  {order.shipping_provider === 'yurtici_kargo' && (
                    <a
                      href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#1A365D] text-white text-sm font-medium rounded-lg hover:bg-[#2A4365] transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Yurtiçi Kargo'da Takip Et
                    </a>
                  )}

                  {/* Aras Kargo Tracking Link */}
                  {order.shipping_provider === 'aras_kargo' && (
                    <a
                      href={`https://www.araskargo.com.tr/kargo-takip/${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#D97706] text-white text-sm font-medium rounded-lg hover:bg-[#B45309] transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Aras Kargo'da Takip Et
                    </a>
                  )}

                  {/* UPS Tracking Link */}
                  {(order.shipping_provider === 'ups' || !order.shipping_provider) && (
                    <a
                      href={`https://www.ups.com/track?tracknum=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#351C15] text-white text-sm font-medium rounded-lg hover:bg-[#4A2A1F] transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      UPS'de Kargoyu Takip Et
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Sipariş Detayları</h2>
                <p className="card-description">{order.order_items?.length || 0} ürün</p>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {order.order_items?.map((item) => {
                  const product = Array.isArray(item.product) ? item.product[0] : item.product;
                  const imageUrl = product?.thumbnail_url || product?.images?.[0];

                  return (
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-[var(--foreground-light)]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {product?.slug ? (
                          <Link href={`/products/${product.slug}`} className="font-medium hover:text-[var(--brand-primary)]">
                            {item.product_name}
                          </Link>
                        ) : (
                          <p className="font-medium">{item.product_name}</p>
                        )}
                        <p className="text-sm text-[var(--foreground-muted)] mt-1">
                          {item.unit_type === 'meter'
                            ? `${item.quantity.toFixed(1)} metre`
                            : `${item.quantity} adet`
                          }
                          {' × '}
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: order.currency,
                          }).format(item.unit_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: order.currency,
                          }).format(item.total_price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card-footer">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">Ara Toplam</span>
                    <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order.currency }).format(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">Kargo</span>
                    <span>{order.shipping_cost === 0 ? 'Ücretsiz' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order.currency }).format(order.shipping_cost)}</span>
                  </div>
                  <hr className="border-[var(--border)]" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Toplam</span>
                    <span className="text-[var(--brand-primary)]">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order.currency }).format(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Müşteri Bilgileri</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[var(--foreground-muted)]" />
                  </div>
                  <div>
                    <p className="font-medium">{customerName}</p>
                  </div>
                </div>
                {customerEmail && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">{customerEmail}</p>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">{customerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Teslimat Adresi</h3>
                </div>
                <div className="card-body">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.shipping_address.firstName} {order.shipping_address.lastName}
                      </p>
                      <p className="text-[var(--foreground-muted)] mt-1">
                        {order.shipping_address.addressLine1}
                      </p>
                      {order.shipping_address.addressLine2 && (
                        <p className="text-[var(--foreground-muted)]">
                          {order.shipping_address.addressLine2}
                        </p>
                      )}
                      <p className="text-[var(--foreground-muted)]">
                        {order.shipping_address.city}
                        {order.shipping_address.state && `, ${order.shipping_address.state}`}
                        {' '}
                        {order.shipping_address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Need Help */}
            <div className="card">
              <div className="card-body text-center">
                <p className="text-sm text-[var(--foreground-muted)] mb-3">
                  Siparişinizle ilgili bir sorun mu var?
                </p>
                <Link href="/contact" className="btn btn-secondary w-full">
                  Bize Ulaşın
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
