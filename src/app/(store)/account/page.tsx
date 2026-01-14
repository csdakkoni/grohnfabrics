'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Package, LogOut, ChevronRight, Eye, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  items_count?: number;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function AccountPage() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Get customer profile
      const { data: customer } = await supabase
        .from('customers')
        .select('id, email, first_name, last_name')
        .eq('id', authUser.id)
        .single();
      
      if (customer) {
        setUser(customer);
        await loadOrders(customer.id);
      } else {
        // Create customer profile if doesn't exist
        await supabase.from('customers').insert({
          id: authUser.id,
          email: authUser.email,
        });
        setUser({
          id: authUser.id,
          email: authUser.email || '',
        });
      }
    }
    setLoading(false);
  }

  async function loadOrders(customerId: string) {
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        currency,
        created_at,
        order_items(id)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    setOrders((data || []).map(order => ({
      ...order,
      items_count: Array.isArray(order.order_items) ? order.order_items.length : 0,
    })));
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        setAuthSuccess('Kayıt başarılı! E-posta adresinize gelen doğrulama linkine tıklayın.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await checkUser();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  };

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
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--border)] rounded w-48"></div>
            <div className="h-32 bg-[var(--border)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show login/register form
  if (!user) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-primary-light)] mx-auto flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[var(--brand-primary)]" />
            </div>
            <h1 className="text-2xl font-semibold">
              {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h1>
            <p className="text-[var(--foreground-muted)] mt-2">
              {isSignUp 
                ? 'Siparişlerinizi takip etmek için hesap oluşturun' 
                : 'Hesabınıza giriş yaparak siparişlerinizi takip edin'
              }
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleAuth} className="card-body space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                  {authSuccess}
                </div>
              )}

              <div className="form-group">
                <label className="label">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary w-full"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isSignUp ? 'Kaydediliyor...' : 'Giriş yapılıyor...'}
                  </>
                ) : (
                  isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'
                )}
              </button>
            </form>

            <div className="card-footer text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-sm text-[var(--brand-primary)] hover:underline"
              >
                {isSignUp 
                  ? 'Zaten hesabınız var mı? Giriş yapın' 
                  : 'Hesabınız yok mu? Kaydolun'
                }
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
            Misafir olarak sipariş verdiyseniz, sipariş takibi için e-postanıza gelen 
            linki kullanabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  // Logged in - show account dashboard
  return (
    <div className="bg-[var(--background-secondary)] min-h-screen py-8">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--brand-primary-light)] flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : 'Hoş geldiniz'
                      }
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">{user.email}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === 'orders' 
                        ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] font-medium' 
                        : 'text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Siparişlerim
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] font-medium' 
                        : 'text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Profilim
                  </button>
                </nav>

                <hr className="my-4 border-[var(--border)]" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold">Siparişlerim</h1>
                  <p className="text-[var(--foreground-muted)]">
                    Geçmiş ve aktif siparişlerinizi görüntüleyin
                  </p>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="card">
                        <div className="card-body">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                                <Package className="w-6 h-6 text-[var(--foreground-muted)]" />
                              </div>
                              <div>
                                <p className="font-medium">{order.order_number}</p>
                                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                                  <Clock className="w-3 h-3" />
                                  {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                                <p className="font-semibold mt-1">
                                  {new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: order.currency,
                                  }).format(order.total_amount)}
                                </p>
                              </div>
                              <Link 
                                href={`/order/${order.id}`}
                                className="p-2 hover:bg-[var(--background-secondary)] rounded-lg"
                              >
                                <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)]" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body py-12 text-center">
                      <Package className="w-16 h-16 mx-auto text-[var(--foreground-light)] mb-4" />
                      <h3 className="text-lg font-medium mb-2">Henüz sipariş yok</h3>
                      <p className="text-[var(--foreground-muted)] mb-6">
                        Verdiğiniz siparişler burada görünecek.
                      </p>
                      <Link href="/products" className="btn btn-primary">
                        Alışverişe Başla
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold">Profilim</h1>
                  <p className="text-[var(--foreground-muted)]">
                    Hesap bilgilerinizi görüntüleyin ve güncelleyin
                  </p>
                </div>

                <div className="card">
                  <div className="card-body space-y-4">
                    <div className="form-group">
                      <label className="label">E-posta</label>
                      <input
                        type="email"
                        value={user.email}
                        className="input bg-[var(--background-secondary)]"
                        disabled
                      />
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        E-posta adresi değiştirilemez
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">Ad</label>
                        <input
                          type="text"
                          value={user.first_name || ''}
                          className="input"
                          placeholder="Adınız"
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Soyad</label>
                        <input
                          type="text"
                          value={user.last_name || ''}
                          className="input"
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>

                    <button className="btn btn-primary">
                      Güncelle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
