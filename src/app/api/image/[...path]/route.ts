import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import sharp from 'sharp';

// Dynamic image transformation endpoint
// Usage: /api/image/products/my-image.jpg?w=800&h=600&q=80&f=webp

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
    const format = searchParams.get('f') as 'webp' | 'avif' | 'jpeg' | 'png' || 'webp';
    const fit = (searchParams.get('fit') as 'cover' | 'contain' | 'fill') || 'cover';

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

    // Return transformed image with cache headers
    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Image transform error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
