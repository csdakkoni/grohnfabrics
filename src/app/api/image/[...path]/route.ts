import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { downloadFromR2, uploadToR2, isR2Configured } from '@/lib/r2';
import sharp from 'sharp';

// Dynamic image transformation endpoint
// Usage: /api/image/products/my-image.jpg?w=800&h=600&q=80&f=webp
//
// Features:
// - On-the-fly image transformation (Cloudinary-like)
// - Server-side caching in R2 or Supabase Storage
// - CDN-friendly cache headers
// - WebP/AVIF/JPEG/PNG support

// Generate cache key from transformation params
function getCacheKey(imagePath: string, params: URLSearchParams): string {
  const width = params.get('w') || '0';
  const height = params.get('h') || '0';
  const quality = params.get('q') || '80';
  const format = params.get('f') || 'webp';
  const fit = params.get('fit') || 'cover';
  
  const baseName = imagePath.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `cache/${baseName}_w${width}_h${height}_q${quality}_${format}_${fit}.${ext}`;
}

// Download from storage (R2 or Supabase)
async function downloadImage(path: string): Promise<Buffer | null> {
  if (isR2Configured) {
    return await downloadFromR2(path);
  } else {
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .download(path);
    
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
}

// Upload to storage (R2 or Supabase)
async function uploadCache(path: string, buffer: Buffer, contentType: string): Promise<void> {
  if (isR2Configured) {
    await uploadToR2(path, buffer, contentType);
  } else {
    await supabaseAdmin.storage
      .from('images')
      .upload(path, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true,
      });
  }
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

    // Determine content type
    const getContentType = (fmt: string) => {
      switch (fmt) {
        case 'webp': return 'image/webp';
        case 'avif': return 'image/avif';
        case 'png': return 'image/png';
        default: return 'image/jpeg';
      }
    };

    // Try to get from cache first
    if (cacheKey) {
      const cachedBuffer = await downloadImage(cacheKey);

      if (cachedBuffer) {
        return new Response(new Uint8Array(cachedBuffer), {
          headers: {
            'Content-Type': getContentType(format),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'CDN-Cache-Control': 'public, max-age=31536000',
            'X-Cache': 'HIT',
            'X-Storage': isR2Configured ? 'R2' : 'Supabase',
          },
        });
      }
    }

    // Download original image
    const buffer = await downloadImage(imagePath);

    if (!buffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

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
      uploadCache(cacheKey, outputBuffer, contentType)
        .then(() => console.log(`Cached: ${cacheKey}`))
        .catch(() => {});
    }

    // Return transformed image with cache headers
    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'X-Cache': 'MISS',
        'X-Storage': isR2Configured ? 'R2' : 'Supabase',
      },
    });

  } catch (error) {
    console.error('Image transform error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
