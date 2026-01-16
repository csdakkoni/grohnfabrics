import { cookies } from 'next/headers';
import { CartProvider } from '@/components/store/CartProvider';
import CartDrawer from '@/components/store/CartDrawer';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { MarketProvider, RegionId, Locale } from '@/lib/market/context';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Region is fixed by IP (determines price, shipping, payment)
  // Admin can override via admin_region_override cookie
  const adminOverride = cookieStore.get('admin_region_override')?.value as RegionId | undefined;
  const regionCookie = cookieStore.get('region')?.value as RegionId | undefined;
  const initialRegion: RegionId = adminOverride || (regionCookie === 'GLOBAL' ? 'GLOBAL' : 'TR');
  
  // Locale can be changed by user (determines UI language only)
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;
  const initialLocale: Locale = localeCookie === 'en' ? 'en' : 'tr';

  return (
    <MarketProvider initialRegion={initialRegion} initialLocale={initialLocale}>
    <CartProvider>
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <StoreHeader />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <StoreFooter />
    </div>
    </CartProvider>
    </MarketProvider>
  );
}
