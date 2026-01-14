'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Palette,
  Boxes,
  Globe,
  LogOut,
  FileEdit,
  Layers,
  Truck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Ürünler', href: '/admin/products', icon: Package },
  { name: 'Varyantlar', href: '/admin/variants', icon: Layers },
  { name: 'Kategoriler', href: '/admin/categories', icon: Boxes },
  { name: 'Siparişler', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Müşteriler', href: '/admin/customers', icon: Users },
  { name: 'Materyaller', href: '/admin/materials', icon: Palette },
  { name: 'Kargo', href: '/admin/shipping', icon: Truck },
  { name: 'Sayfalar', href: '/admin/pages', icon: FileEdit },
  { name: 'Marketler', href: '/admin/markets', icon: Globe },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--sidebar-bg)] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="text-lg font-semibold text-white">
          GROHN FABRICS
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-[var(--sidebar-active)] text-white' 
                  : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-white/5'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
