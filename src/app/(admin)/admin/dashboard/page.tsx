import { supabaseAdmin } from '@/lib/supabase/admin';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [products, orders, customers] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id, total_amount, status', { count: 'exact' }),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
  ]);

  const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
  const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0;

  return {
    totalProducts: products.count || 0,
    totalOrders: orders.count || 0,
    totalCustomers: customers.count || 0,
    totalRevenue,
    pendingOrders,
  };
}

async function getRecentOrders() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, total_amount, currency, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  return data || [];
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const statCards = [
    { 
      label: 'Toplam Ürün', 
      value: stats.totalProducts, 
      icon: Package,
      color: 'var(--brand-primary)'
    },
    { 
      label: 'Toplam Sipariş', 
      value: stats.totalOrders, 
      icon: ShoppingCart,
      color: 'var(--accent)'
    },
    { 
      label: 'Müşteriler', 
      value: stats.totalCustomers, 
      icon: Users,
      color: 'var(--info)'
    },
    { 
      label: 'Bekleyen Sipariş', 
      value: stats.pendingOrders, 
      icon: TrendingUp,
      color: 'var(--warning)'
    },
  ];

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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[var(--foreground-muted)]">Grohn Fabrics yönetim paneli</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="card-body flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Son Siparişler</h2>
        </div>
        {recentOrders.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.order_number}</td>
                    <td>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: order.currency || 'TRY',
                      }).format(order.total_amount)}
                    </td>
                    <td>
                      <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="text-[var(--foreground-muted)]">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz sipariş yok</h3>
            <p className="empty-state-description">
              İlk siparişiniz geldiğinde burada görünecek.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
