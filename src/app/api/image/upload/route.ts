import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process with Sharp - create optimized versions
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${baseName}-${timestamp}`;

    // Original (optimized)
    const originalBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Thumbnail (400px)
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload original
    const { error: originalError } = await supabaseAdmin.storage
      .from('images')
      .upload(`${folder}/${fileName}.jpg`, originalBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year
      });

    if (originalError) {
      console.error('Upload error:', originalError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Upload thumbnail
    const { error: thumbError } = await supabaseAdmin.storage
      .from('images')
      .upload(`${folder}/thumbs/${fileName}.jpg`, thumbBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
      });

    if (thumbError) {
      console.error('Thumb upload error:', thumbError);
      // Continue anyway, main image is uploaded
    }

    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(`${folder}/${fileName}.jpg`);

    const { data: { publicUrl: thumbUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(`${folder}/thumbs/${fileName}.jpg`);

    return NextResponse.json({
      success: true,
      url: originalUrl,
      thumbnail: thumbUrl,
      fileName: `${fileName}.jpg`,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Note: In App Router, body parsing is handled automatically for FormData
