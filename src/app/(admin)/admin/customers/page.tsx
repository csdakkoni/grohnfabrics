import { supabaseAdmin } from '@/lib/supabase/admin';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCustomers() {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  return data || [];
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    sales: 'Satış',
    production: 'Üretim',
    warehouse: 'Depo',
    customer: 'Müşteri',
  };

  const roleColors: Record<string, string> = {
    admin: 'badge-error',
    sales: 'badge-info',
    production: 'badge-warning',
    warehouse: 'badge-primary',
    customer: 'badge-gray',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Müşteriler</h1>
        <p className="text-[var(--foreground-muted)]">Kayıtlı kullanıcılar ve müşteriler</p>
      </div>

      {/* Customers Table */}
      {customers.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Firma</th>
                <th>Rol</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="font-medium">
                      {customer.first_name || customer.last_name 
                        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                        : '-'}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td className="text-[var(--foreground-muted)]">{customer.phone || '-'}</td>
                  <td>{customer.company_name || '-'}</td>
                  <td>
                    <span className={`badge ${roleColors[customer.role] || 'badge-gray'}`}>
                      {roleLabels[customer.role] || customer.role}
                    </span>
                  </td>
                  <td className="text-[var(--foreground-muted)]">
                    {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Henüz müşteri yok</h3>
            <p className="empty-state-description">
              Kayıtlı kullanıcılarınız burada görünecek.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
