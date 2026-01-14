'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set admin flag for MarketSwitcher
  useEffect(() => {
    localStorage.setItem('isAdmin', 'true');
    // Also set cookie for server-side
    document.cookie = 'isAdmin=true;path=/;max-age=' + (60 * 60 * 24 * 30); // 30 days
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="ml-64">
        {/* Top bar with site link */}
        <div className="sticky top-0 z-30 bg-white border-b border-[var(--border)] px-6 py-2 flex justify-end">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Siteyi Görüntüle
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
