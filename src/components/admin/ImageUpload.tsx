'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  folder?: string;
  maxImages?: number;
}

// Vercel free tier limit
const MAX_UPLOAD_SIZE_MB = 4;

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  folder = 'products',
  maxImages = 10 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Local blob preview URLs mapped by remote URL
  const [previewMap, setPreviewMap] = useState<Record<string, string>>({});

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewMap).forEach(blobUrl => {
        URL.revokeObjectURL(blobUrl);
      });
    };
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) {
      alert(`Maksimum ${maxImages} görsel yükleyebilirsiniz.`);
      return;
    }

    setUploading(true);
    const newImages: string[] = [];
    const newPreviews: Record<string, string> = {};
    const totalFiles = Math.min(files.length, maxImages - images.length);

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      // Create local blob preview immediately
      const localPreviewUrl = URL.createObjectURL(file);

      setProgress(`${i + 1}/${totalFiles}: ${file.name} işleniyor...`);

      try {
        // Compress if file is too large
        let processedFile = file;
        const originalSize = file.size / 1024 / 1024;
        
        if (originalSize > MAX_UPLOAD_SIZE_MB) {
          setProgress(`${i + 1}/${totalFiles}: ${file.name} sıkıştırılıyor (${originalSize.toFixed(1)}MB)...`);
          processedFile = await compressImage(file, {
            maxWidth: 2400,
            maxHeight: 2400,
            quality: 0.85,
            maxSizeMB: MAX_UPLOAD_SIZE_MB,
          });
        }

        setProgress(`${i + 1}/${totalFiles}: ${file.name} yükleniyor...`);

        const formData = new FormData();
        formData.append('file', processedFile);
        formData.append('folder', folder);

        const response = await fetch('/api/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success && data.url) {
          newImages.push(data.url);
          // Map the remote URL to the local blob preview
          newPreviews[data.url] = localPreviewUrl;
        } else {
          // Upload failed - cleanup blob URL
          URL.revokeObjectURL(localPreviewUrl);
          if (data.error) {
            console.error('Upload failed:', data.error);
            alert(`Hata: ${data.error}`);
          }
        }
      } catch (error) {
        // Upload error - cleanup blob URL
        URL.revokeObjectURL(localPreviewUrl);
        console.error('Upload error:', error);
      }
    }

    if (newImages.length > 0) {
      setPreviewMap(prev => ({ ...prev, ...newPreviews }));
      onImagesChange([...images, ...newImages]);
    }
    setUploading(false);
    setProgress('');
  };

  const handleRemove = (index: number) => {
    const removedUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    
    // Cleanup blob URL if exists
    if (previewMap[removedUrl]) {
      URL.revokeObjectURL(previewMap[removedUrl]);
      setPreviewMap(prev => {
        const next = { ...prev };
        delete next[removedUrl];
        return next;
      });
    }
    
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  // Get the best available src for an image URL
  // Prefer local blob preview (always works), fall back to remote URL
  const getImageSrc = (url: string): string => {
    return previewMap[url] || url;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' 
            : 'border-[var(--border)] hover:border-[var(--brand-primary)]'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="w-10 h-10 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--foreground-muted)]">{progress || 'Yükleniyor...'}</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-[var(--foreground-light)]" />
              <p className="text-sm font-medium">Görsel yüklemek için tıklayın veya sürükleyin</p>
              <p className="text-xs text-[var(--foreground-light)]">
                PNG, JPG, WEBP • Maks {maxImages} görsel
              </p>
              <p className="text-xs text-[var(--accent)]">
                ✨ Büyük dosyalar otomatik sıkıştırılır
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-[var(--background-secondary)]">
              <img
                src={getImageSrc(url)}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* First image badge */}
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-[var(--brand-primary)] text-white rounded">
                  Ana Görsel
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-3 p-4 bg-[var(--background-secondary)] rounded-lg">
          <ImageIcon className="w-5 h-5 text-[var(--foreground-light)]" />
          <p className="text-sm text-[var(--foreground-muted)]">
            Henüz görsel eklenmedi
          </p>
        </div>
      )}
    </div>
  );
}
