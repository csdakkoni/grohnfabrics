import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';
export const alt = 'Grohn Fabrics Ürün';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name_tr, name_en, thumbnail_url, product_type')
    .eq('slug', params.slug)
    .single();

  const typeLabels: Record<string, string> = {
    fabric: 'Kumaş',
    pillow: 'Yastık Kılıfı',
    curtain: 'Perde',
    tablecloth: 'Masa Örtüsü',
    runner: 'Runner',
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAF8',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #F5F3F0 0%, #E8E4E0 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#6B5A45',
              marginBottom: '40px',
              letterSpacing: '2px',
            }}
          >
            GROHN FABRICS
          </div>

          {/* Category */}
          {product && (
            <div
              style={{
                fontSize: '18px',
                color: '#9CAF88',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {typeLabels[product.product_type] || 'Ürün'}
            </div>
          )}

          {/* Product Name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 300,
              color: '#2D2A26',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {product?.name_tr || 'Ürün'}
          </div>

          {/* English Name */}
          {product?.name_en && (
            <div
              style={{
                fontSize: '24px',
                color: '#6B6560',
                marginTop: '16px',
              }}
            >
              {product.name_en}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '16px',
            color: '#9A958F',
          }}
        >
          grohnfabrics.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
