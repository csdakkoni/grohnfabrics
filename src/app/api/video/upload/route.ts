import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Max video file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'videos';
    
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
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use MP4, WebM or MOV.' }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `${baseName}-${timestamp}.${ext}`;
    const path = `${folder}/${fileName}`;

    console.log(`Uploading video: ${file.name}, ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Upload to storage
    if (isR2Configured) {
      // Upload to R2
      const result = await uploadToR2(path, buffer, file.type, 'public, max-age=31536000');
      
      if (!result.success) {
        throw new Error(result.error || 'R2 upload failed');
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        fileName,
        size: file.size,
        storage: 'r2',
      });
    } else {
      // Fallback to Supabase Storage
      const { error } = await supabaseAdmin.storage
        .from('videos')
        .upload(path, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Upload failed');
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('videos')
        .getPublicUrl(path);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        storage: 'supabase',
      });
    }

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
