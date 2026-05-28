import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 300; // ISR: revalidate every 5 minutes

// Reserved slugs that should not be treated as CMS pages
const RESERVED_SLUGS = ['products', 'checkout', 'cart', 'order', 'login', 'admin'];

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  const { data } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  return data;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return { title: 'Sayfa Bulunamadı' };
  }

  return {
    title: page.meta_title_tr || page.title_tr,
    description: page.meta_description_tr,
    openGraph: {
      title: page.meta_title_tr || page.title_tr,
      description: page.meta_description_tr,
      images: page.featured_image ? [page.featured_image] : undefined,
    },
  };
}

export default async function DynamicPage({ params }: PageParams) {
  const { slug } = await params;

  // Check if it's a reserved slug
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--foreground)]">
          {page.title_tr}
        </h1>
        {page.title_en && (
          <p className="text-lg text-[var(--foreground-muted)] mt-1">
            {page.title_en}
          </p>
        )}
      </div>

      {/* Featured Image */}
      {page.featured_image && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={page.featured_image}
            alt={page.title_tr}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content_tr || '' }}
        style={{
          // Basic prose styles
          lineHeight: 1.8,
        }}
      />

      {/* English Content (if available) */}
      {page.content_en && (
        <div className="mt-12 pt-12 border-t border-[var(--border)]">
          <h2 className="text-xl font-medium text-[var(--foreground-muted)] mb-6">
            {page.title_en}
          </h2>
          <div 
            className="prose prose-lg max-w-none text-[var(--foreground-muted)]"
            dangerouslySetInnerHTML={{ __html: page.content_en }}
            style={{
              lineHeight: 1.8,
            }}
          />
        </div>
      )}
    </div>
  );
}
