import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Eye,
  Clock,
  Truck
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderStats {
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  market_id: string;
}

async function getStats() {
  const [products, orders, customers] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id, total_amount, currency, status, created_at, market_id'),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
  ]);

  const allOrders = (orders.data || []) as OrderStats[];
  
  // Calculate total revenue by currency
  const revenueByTRY = allOrders
    .filter(o => o.currency === 'TRY' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  const revenueByUSD = allOrders
    .filter(o => o.currency === 'USD' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
  const processingOrders = allOrders.filter(o => o.status === 'processing' || o.status === 'paid').length;
  const shippedOrders = allOrders.filter(o => o.status === 'shipped').length;

  // Calculate this month vs last month
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthOrders = allOrders.filter(o => new Date(o.created_at) >= thisMonthStart);
  const lastMonthOrders = allOrders.filter(o => {
    const d = new Date(o.created_at);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });

  const thisMonthRevenue = thisMonthOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  const lastMonthRevenue = lastMonthOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
    : 100;

  const orderChange = lastMonthOrders.length > 0
    ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100)
    : 100;

  return {
    totalProducts: products.count || 0,
    totalOrders: allOrders.length,
    totalCustomers: customers.count || 0,
    revenueByTRY,
    revenueByUSD,
    pendingOrders,
    processingOrders,
    shippedOrders,
    thisMonthOrders: thisMonthOrders.length,
    thisMonthRevenue,
    revenueChange,
    orderChange,
  };
}

async function getRecentOrders() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, total_amount, currency, status, created_at, guest_email, market_id')
    .order('created_at', { ascending: false })
    .limit(5);
  
  return data || [];
}

async function getDailyRevenue() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabaseAdmin
    .from('orders')
    .select('total_amount, currency, created_at, status')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  // Group by date
  const dailyData: Record<string, { TRY: number; USD: number; orders: number }> = {};
  
  // Initialize last 30 days with zeros
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyData[key] = { TRY: 0, USD: 0, orders: 0 };
  }

  // Fill in actual data
  (data || []).forEach((order) => {
    const key = order.created_at.split('T')[0];
    if (dailyData[key]) {
      if (order.currency === 'TRY') {
        dailyData[key].TRY += Number(order.total_amount || 0);
      } else {
        dailyData[key].USD += Number(order.total_amount || 0);
      }
      dailyData[key].orders += 1;
    }
  });

  return Object.entries(dailyData).map(([date, values]) => ({
    date,
    ...values,
  }));
}

async function getTopProducts() {
  const { data } = await supabaseAdmin
    .from('order_items')
    .select(`
      product_id,
      product_name,
      quantity,
      total_price,
      order:orders(status, currency)
    `)
    .limit(100);

  // Aggregate by product
  const productStats: Record<string, { name: string; revenue: number; quantity: number }> = {};
  
  (data || []).forEach((item) => {
    const order = item.order as { status: string; currency: string } | null;
    if (order?.status === 'cancelled') return;
    
    if (!productStats[item.product_id]) {
      productStats[item.product_id] = { name: item.product_name, revenue: 0, quantity: 0 };
    }
    productStats[item.product_id].revenue += Number(item.total_price || 0);
    productStats[item.product_id].quantity += Number(item.quantity || 0);
  });

  return Object.entries(productStats)
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

async function getOrdersByStatus() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('status');

  const counts: Record<string, number> = {};
  (data || []).forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });

  return counts;
}

export default async function DashboardPage() {
  const [stats, recentOrders, dailyRevenue, topProducts, ordersByStatus] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getDailyRevenue(),
    getTopProducts(),
    getOrdersByStatus(),
  ]);

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

  const statusChartColors: Record<string, string> = {
    pending: 'var(--warning)',
    paid: 'var(--info)',
    processing: 'var(--brand-primary)',
    shipped: '#6366f1',
    delivered: 'var(--success)',
    cancelled: 'var(--error)',
    refunded: '#9ca3af',
  };

  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.TRY), 1);
  const totalStatusOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[var(--foreground-muted)]">Grohn Fabrics yönetim paneli</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="card bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] text-white">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className={`text-sm flex items-center gap-1 ${stats.revenueChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {stats.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.revenueChange).toFixed(0)}%
              </span>
            </div>
            <p className="text-white/70 text-sm">Bu Ay Ciro</p>
            <p className="text-3xl font-semibold">₺{stats.thisMonthRevenue.toLocaleString()}</p>
            <div className="mt-2 text-sm text-white/60">
              Toplam: ₺{stats.revenueByTRY.toLocaleString()} + ${stats.revenueByUSD.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <span className={`text-sm flex items-center gap-1 ${stats.orderChange >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {stats.orderChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.orderChange).toFixed(0)}%
              </span>
            </div>
            <p className="text-[var(--foreground-muted)] text-sm">Bu Ay Sipariş</p>
            <p className="text-3xl font-semibold">{stats.thisMonthOrders}</p>
            <div className="mt-2 text-sm text-[var(--foreground-muted)]">
              Toplam: {stats.totalOrders} sipariş
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[var(--warning)]" />
              </div>
            </div>
            <p className="text-[var(--foreground-muted)] text-sm">Bekleyen İşlem</p>
            <p className="text-3xl font-semibold">{stats.pendingOrders + stats.processingOrders}</p>
            <div className="mt-2 text-sm text-[var(--foreground-muted)]">
              {stats.pendingOrders} ödeme bekliyor, {stats.processingOrders} hazırlanıyor
            </div>
          </div>
        </div>

        {/* Shipped Card */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--info)]/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[var(--info)]" />
              </div>
            </div>
            <p className="text-[var(--foreground-muted)] text-sm">Kargoda</p>
            <p className="text-3xl font-semibold">{stats.shippedOrders}</p>
            <div className="mt-2 text-sm text-[var(--foreground-muted)]">
              Teslimat bekleyen siparişler
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h2 className="card-title">Son 30 Gün Ciro (TRY)</h2>
          </div>
          <div className="card-body">
            <div className="h-48 flex items-end gap-1">
              {dailyRevenue.map((day, i) => (
                <div 
                  key={day.date}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  <div 
                    className="w-full bg-[var(--brand-primary)] rounded-t hover:bg-[var(--brand-primary-dark)] transition-colors cursor-pointer"
                    style={{ 
                      height: `${Math.max((day.TRY / maxDailyRevenue) * 100, 2)}%`,
                      minHeight: day.TRY > 0 ? '4px' : '2px',
                      opacity: day.TRY > 0 ? 1 : 0.3,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-[var(--foreground)] text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</div>
                      <div>₺{day.TRY.toLocaleString()}</div>
                      <div>{day.orders} sipariş</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-2">
              <span>{new Date(dailyRevenue[0]?.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
              <span>Bugün</span>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sipariş Durumları</h2>
          </div>
          <div className="card-body space-y-3">
            {Object.entries(ordersByStatus)
              .filter(([status]) => status !== 'cancelled')
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{statusLabels[status] || status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(count / totalStatusOrders) * 100}%`,
                        backgroundColor: statusChartColors[status] || 'var(--foreground-muted)',
                      }}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="card-title">Son Siparişler</h2>
            <Link href="/admin/orders" className="text-sm text-[var(--brand-primary)] hover:underline">
              Tümünü Gör
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {order.guest_email} • {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {order.currency === 'TRY' ? '₺' : '$'}{Number(order.total_amount).toLocaleString()}
                    </p>
                    <span className={`badge text-xs ${statusColors[order.status] || 'badge-gray'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <ShoppingCart className="w-8 h-8 mx-auto text-[var(--foreground-light)] mb-2" />
              <p className="text-sm text-[var(--foreground-muted)]">Henüz sipariş yok</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="card-title">En Çok Satan Ürünler</h2>
            <Link href="/admin/products" className="text-sm text-[var(--brand-primary)] hover:underline">
              Tümünü Gör
            </Link>
          </div>
          {topProducts.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {topProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-sm font-medium text-[var(--foreground-muted)]">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {product.quantity} adet satıldı
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--brand-primary)]">
                      ₺{product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <Package className="w-8 h-8 mx-auto text-[var(--foreground-light)] mb-2" />
              <p className="text-sm text-[var(--foreground-muted)]">Henüz satış yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
