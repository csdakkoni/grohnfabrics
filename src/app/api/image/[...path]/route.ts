import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import sharp from 'sharp';

// Dynamic image transformation endpoint
// Usage: /api/image/products/my-image.jpg?w=800&h=600&q=80&f=webp
//
// Features:
// - On-the-fly image transformation (Cloudinary-like)
// - Server-side caching in Supabase Storage
// - CDN-friendly cache headers
// - WebP/AVIF/JPEG/PNG support

// Generate cache key from transformation params
function getCacheKey(imagePath: string, params: URLSearchParams): string {
  const width = params.get('w') || '0';
  const height = params.get('h') || '0';
  const quality = params.get('q') || '80';
  const format = params.get('f') || 'webp';
  const fit = params.get('fit') || 'cover';
  
  // e.g., products/foto.jpg → cache/products/foto_w800_h600_q80_webp_cover.webp
  const baseName = imagePath.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `cache/${baseName}_w${width}_h${height}_q${quality}_${format}_${fit}.${ext}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = path.join('/');
    const searchParams = request.nextUrl.searchParams;

    // Parse transformation parameters
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : 80;
    const format = (searchParams.get('f') as 'webp' | 'avif' | 'jpeg' | 'png') || 'webp';
    const fit = (searchParams.get('fit') as 'cover' | 'contain' | 'fill' | 'inside') || 'cover';

    // Check if we have transformation params
    const hasTransformations = width || height || searchParams.get('f') || searchParams.get('q');
    
    // Generate cache key
    const cacheKey = hasTransformations ? getCacheKey(imagePath, searchParams) : null;

    // Try to get from cache first
    if (cacheKey) {
      const { data: cachedData } = await supabaseAdmin.storage
        .from('images')
        .download(cacheKey);

      if (cachedData) {
        const cachedBuffer = Buffer.from(await cachedData.arrayBuffer());
        const contentType = format === 'webp' ? 'image/webp' 
          : format === 'avif' ? 'image/avif'
          : format === 'png' ? 'image/png'
          : 'image/jpeg';

        return new Response(new Uint8Array(cachedBuffer), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'CDN-Cache-Control': 'public, max-age=31536000',
            'X-Cache': 'HIT',
          },
        });
      }
    }

    // Download original image from Supabase
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .download(imagePath);

    if (error || !data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Convert to buffer
    const buffer = Buffer.from(await data.arrayBuffer());

    // Apply transformations with Sharp
    let transformer = sharp(buffer).rotate();

    // Resize if dimensions specified
    if (width || height) {
      transformer = transformer.resize(width, height, { 
        fit,
        withoutEnlargement: true,
      });
    }

    // Convert to requested format
    let outputBuffer: Buffer;
    let contentType: string;

    switch (format) {
      case 'avif':
        outputBuffer = await transformer.avif({ quality }).toBuffer();
        contentType = 'image/avif';
        break;
      case 'webp':
        outputBuffer = await transformer.webp({ quality }).toBuffer();
        contentType = 'image/webp';
        break;
      case 'png':
        outputBuffer = await transformer.png().toBuffer();
        contentType = 'image/png';
        break;
      case 'jpeg':
      default:
        outputBuffer = await transformer.jpeg({ quality, progressive: true }).toBuffer();
        contentType = 'image/jpeg';
        break;
    }

    // Save to cache (async, don't wait)
    if (cacheKey) {
      supabaseAdmin.storage
        .from('images')
        .upload(cacheKey, outputBuffer, {
          contentType,
          cacheControl: '31536000',
          upsert: true,
        })
        .then(() => console.log(`Cached: ${cacheKey}`))
        .catch(() => {}); // Ignore cache errors
    }

    // Return transformed image with cache headers
    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'X-Cache': 'MISS',
      },
    });

  } catch (error) {
    console.error('Image transform error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
