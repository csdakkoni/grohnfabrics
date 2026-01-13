import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getOrders() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
      customer_id,
      guest_email,
      market_id,
      currency,
      total_amount,
      status,
      payment_provider,
      shipping_provider,
      tracking_number,
      created_at,
      customer:customers(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });
  
  return data || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

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
        <h1 className="text-2xl font-semibold">Siparişler</h1>
        <p className="text-[var(--foreground-muted)]">Tüm siparişleri görüntüleyin ve yönetin</p>
      </div>

      {/* Orders Table */}
      {orders.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Market</th>
                <th>Tutar</th>
                <th>Ödeme</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
                const customerName = customer 
                  ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                  : order.guest_email || 'Misafir';
                
                return (
                  <tr key={order.id}>
                    <td className="font-medium">{order.order_number}</td>
                    <td>
                      <div>
                        <p>{customerName}</p>
                        <p className="text-sm text-[var(--foreground-light)]">
                          {customer?.email || order.guest_email}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${order.market_id === 'TR' ? 'badge-primary' : 'badge-info'}`}>
                        {order.market_id === 'TR' ? '🇹🇷 Türkiye' : '🌍 Global'}
                      </span>
                    </td>
                    <td className="font-medium">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: order.currency,
                      }).format(order.total_amount)}
                    </td>
                    <td>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {order.payment_provider === 'iyzico' ? 'iyzico' : 
                         order.payment_provider === 'stripe' ? 'Stripe' : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="text-[var(--foreground-muted)]">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Detay
                      </Link>
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
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz sipariş yok</h3>
            <p className="empty-state-description">
              İlk siparişiniz geldiğinde burada görünecek.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
