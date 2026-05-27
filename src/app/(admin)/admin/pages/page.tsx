'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, FileText, Eye, EyeOff, Menu, ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  slug: string;
  title_tr: string;
  title_en?: string;
  is_published: boolean;
  show_in_menu: boolean;
  show_in_footer: boolean;
  menu_order: number;
  updated_at: string;
}

export default function PagesPage() {
  const supabase = createClient();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    const { data } = await supabase
      .from('pages')
      .select('id, slug, title_tr, title_en, is_published, show_in_menu, show_in_footer, menu_order, updated_at')
      .order('menu_order', { ascending: true });
    
    setPages(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const togglePublish = async (page: Page) => {
    await supabase
      .from('pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);
    fetchPages();
  };

  const toggleMenu = async (page: Page) => {
    await supabase
      .from('pages')
      .update({ show_in_menu: !page.show_in_menu })
      .eq('id', page.id);
    fetchPages();
  };

  const toggleFooter = async (page: Page) => {
    await supabase
      .from('pages')
      .update({ show_in_footer: !page.show_in_footer })
      .eq('id', page.id);
    fetchPages();
  };

  const deletePage = async (page: Page) => {
    if (!confirm(`"${page.title_tr}" sayfasını silmek istediğinize emin misiniz?`)) return;
    
    await supabase.from('pages').delete().eq('id', page.id);
    fetchPages();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Sayfalar</h1>
          <p className="text-[var(--foreground-muted)]">Statik sayfa içeriklerini yönetin</p>
        </div>
        <Link href="/admin/pages/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Yeni Sayfa
        </Link>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--foreground-muted)]">Yükleniyor...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <h3>Henüz sayfa yok</h3>
          <p>İlk sayfanızı oluşturun</p>
          <Link href="/admin/pages/new" className="btn btn-primary mt-4">
            <Plus className="w-4 h-4" />
            Sayfa Ekle
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Sayfa</th>
                  <th>URL</th>
                  <th>Durum</th>
                  <th>Menüde</th>
                  <th>Footer'da</th>
                  <th>Güncelleme</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="text-[var(--foreground-muted)]">
                      {page.menu_order}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium">{page.title_tr}</p>
                          {page.title_en && (
                            <p className="text-xs text-[var(--foreground-muted)]">{page.title_en}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-xs bg-[var(--background-secondary)] px-2 py-1 rounded">
                        /{page.slug}
                      </code>
                    </td>
                    <td>
                      <button
                        onClick={() => togglePublish(page)}
                        className={`badge ${page.is_published ? 'badge-success' : 'badge-gray'} cursor-pointer`}
                      >
                        {page.is_published ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Yayında
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Taslak
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleMenu(page)}
                        className={`badge ${page.show_in_menu ? 'badge-primary' : 'badge-gray'} cursor-pointer`}
                      >
                        {page.show_in_menu ? (
                          <>
                            <Menu className="w-3 h-3 mr-1" />
                            Evet
                          </>
                        ) : (
                          'Hayır'
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleFooter(page)}
                        className={`badge ${page.show_in_footer ? 'badge-primary' : 'badge-gray'} cursor-pointer`}
                      >
                        {page.show_in_footer ? 'Evet' : 'Hayır'}
                      </button>
                    </td>
                    <td className="text-sm text-[var(--foreground-muted)]">
                      {new Date(page.updated_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost p-2"
                          title="Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="btn btn-ghost p-2"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deletePage(page)}
                          className="btn btn-ghost p-2 text-[var(--error)]"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
