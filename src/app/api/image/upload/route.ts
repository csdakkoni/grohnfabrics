import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import sharp from 'sharp';

// Size variants to generate
const SIZE_VARIANTS = {
  thumb: { width: 400, height: 400, fit: 'cover' as const, quality: 80 },
  small: { width: 600, height: 600, fit: 'inside' as const, quality: 82 },
  medium: { width: 1200, height: 1200, fit: 'inside' as const, quality: 85 },
  large: { width: 1920, height: 1920, fit: 'inside' as const, quality: 85 },
};

// Max file size: 20MB (raw upload)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    console.log(`Processing: ${file.name}, ${metadata.width}x${metadata.height}, ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Generate unique filename
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${baseName}-${timestamp}`;

    const urls: Record<string, string> = {};
    const uploadPromises: Promise<void>[] = [];

    // Process each size variant
    for (const [sizeName, config] of Object.entries(SIZE_VARIANTS)) {
      const processAndUpload = async () => {
        try {
          // Skip if original is smaller than target
          if (metadata.width && metadata.height) {
            if (metadata.width < config.width && metadata.height < config.height && sizeName !== 'thumb') {
              return;
            }
          }

          const processedBuffer = await sharp(buffer)
            .rotate() // Auto-rotate based on EXIF
            .resize(config.width, config.height, { 
              fit: config.fit,
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: config.quality, 
              progressive: true,
              mozjpeg: true // Better compression
            })
            .toBuffer();

          const path = sizeName === 'thumb' 
            ? `${folder}/thumbs/${fileName}.jpg`
            : sizeName === 'medium'
            ? `${folder}/${fileName}.jpg` // Default/main image
            : `${folder}/${sizeName}/${fileName}.jpg`;

          const { error } = await supabaseAdmin.storage
            .from('images')
            .upload(path, processedBuffer, {
              contentType: 'image/jpeg',
              cacheControl: '31536000', // 1 year
            });

          if (error) {
            console.error(`Upload error (${sizeName}):`, error);
            return;
          }

          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(path);

          urls[sizeName] = publicUrl;

        } catch (err) {
          console.error(`Processing error (${sizeName}):`, err);
        }
      };

      uploadPromises.push(processAndUpload());
    }

    // Also create WebP version for modern browsers (medium size)
    uploadPromises.push((async () => {
      try {
        const webpBuffer = await sharp(buffer)
          .rotate()
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        const { error } = await supabaseAdmin.storage
          .from('images')
          .upload(`${folder}/webp/${fileName}.webp`, webpBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
          });

        if (!error) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(`${folder}/webp/${fileName}.webp`);
          urls.webp = publicUrl;
        }
      } catch (err) {
        console.error('WebP processing error:', err);
      }
    })());

    // Wait for all uploads
    await Promise.all(uploadPromises);

    // Calculate compression stats
    const originalSize = file.size;
    const savedPercentage = urls.medium 
      ? Math.round((1 - (await getFileSize(urls.medium)) / originalSize) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      url: urls.medium || urls.large || urls.small,
      thumbnail: urls.thumb,
      variants: urls,
      fileName: `${fileName}.jpg`,
      original: {
        width: metadata.width,
        height: metadata.height,
        size: originalSize,
      },
      compression: `~${savedPercentage}% smaller`,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to estimate file size (rough)
async function getFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch {
    return 0;
  }
}
