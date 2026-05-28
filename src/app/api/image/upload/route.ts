import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import sharp from 'sharp';

// Next.js App Router config
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout
export const dynamic = 'force-dynamic';

// Size variants to generate
const SIZE_VARIANTS = {
  thumb: { width: 400, height: 400, fit: 'cover' as const, quality: 80 },
  small: { width: 600, height: 600, fit: 'inside' as const, quality: 82 },
  medium: { width: 1200, height: 1200, fit: 'inside' as const, quality: 85 },
  large: { width: 1920, height: 1920, fit: 'inside' as const, quality: 85 },
};

// Max file size: 20MB (raw upload, will be compressed client-side anyway)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Storage provider type
type StorageProvider = 'r2' | 'supabase';

// Get current storage provider
function getStorageProvider(): StorageProvider {
  return isR2Configured ? 'r2' : 'supabase';
}

// Upload to Supabase Storage
async function uploadToSupabase(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: boolean; url: string }> {
  const { error } = await supabaseAdmin.storage
    .from('images')
    .upload(path, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    return { success: false, url: '' };
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(path);

  return { success: true, url: publicUrl };
}

// Upload to selected provider with fallback
async function uploadFile(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: boolean; url: string; provider: string }> {
  // Try R2 first if configured
  if (isR2Configured) {
    try {
      const result = await uploadToR2(path, buffer, contentType);
      if (result.success) {
        return { success: true, url: result.url, provider: 'r2' };
      }
      console.log('R2 failed, falling back to Supabase...');
    } catch (err) {
      console.error('R2 error, falling back to Supabase:', err);
    }
  }

  // Fallback to Supabase Storage
  const result = await uploadToSupabase(path, buffer, contentType);
  return { ...result, provider: 'supabase' };
}

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
    console.log(`Processing: ${file.name}, ${metadata.width}x${metadata.height}, ${(file.size / 1024 / 1024).toFixed(2)}MB, provider: ${getStorageProvider()}`);

    // Generate unique filename (ensure no leading dash)
    const timestamp = Date.now();
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')  // Remove extension
      .replace(/[^a-z0-9]/gi, '-')  // Replace special chars
      .replace(/^-+/, '')  // Remove leading dashes
      .replace(/-+$/, '')  // Remove trailing dashes
      .replace(/-+/g, '-')  // Replace multiple dashes
      .toLowerCase() || 'image';  // Fallback if empty
    const fileName = `${baseName}-${timestamp}`;

    const urls: Record<string, string> = {};
    const uploadPromises: Promise<void>[] = [];

    // For variant images, only upload single size (faster)
    const isVariantUpload = folder.startsWith('variants/');
    const sizesToProcess = isVariantUpload 
      ? { medium: SIZE_VARIANTS.medium }  // Only medium for variants
      : SIZE_VARIANTS;

    // Process each size variant
    for (const [sizeName, config] of Object.entries(sizesToProcess)) {
      const processAndUpload = async () => {
        try {
          // Skip if original is smaller than target (except thumb and variant uploads)
          // For variants, always process to ensure we get a URL back
          if (!isVariantUpload && metadata.width && metadata.height && sizeName !== 'thumb') {
            if (metadata.width < config.width && metadata.height < config.height) {
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
              mozjpeg: true
            })
            .toBuffer();

          const path = sizeName === 'thumb' 
            ? `${folder}/thumbs/${fileName}.jpg`
            : sizeName === 'medium'
            ? `${folder}/${fileName}.jpg`
            : `${folder}/${sizeName}/${fileName}.jpg`;

          const result = await uploadFile(path, processedBuffer, 'image/jpeg');
          
          if (result.success) {
            urls[sizeName] = result.url;
          }
        } catch (err) {
          console.error(`Processing error (${sizeName}):`, err);
        }
      };

      uploadPromises.push(processAndUpload());
    }

    // Create WebP version (skip for variant uploads - speed optimization)
    if (!isVariantUpload) {
      uploadPromises.push((async () => {
        try {
          const webpBuffer = await sharp(buffer)
            .rotate()
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();

          const path = `${folder}/webp/${fileName}.webp`;
          const result = await uploadFile(path, webpBuffer, 'image/webp');
          
          if (result.success) {
            urls.webp = result.url;
          }
        } catch (err) {
          console.error('WebP processing error:', err);
        }
      })());
    }

    // Wait for all uploads
    await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      url: urls.medium || urls.large || urls.small,
      thumbnail: urls.thumb,
      variants: urls,
      fileName: `${fileName}.jpg`,
      storage: getStorageProvider(),
      original: {
        width: metadata.width,
        height: metadata.height,
        size: file.size,
      },
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    // More descriptive error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
      return NextResponse.json({ 
        error: 'Görsel çok büyük. Lütfen daha küçük bir görsel deneyin.' 
      }, { status: 413 });
    }
    
    if (errorMessage.includes('timeout')) {
      return NextResponse.json({ 
        error: 'İşlem zaman aşımına uğradı. Lütfen daha küçük bir görsel deneyin.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: `Yükleme hatası: ${errorMessage}` 
    }, { status: 500 });
  }
}
