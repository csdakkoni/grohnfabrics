'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface ProductGalleryProps {
  images: string[];
  videos?: string[];
  productName: string;
}

export default function ProductGallery({ images, videos = [], productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Combine images and videos into media items
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ 
      type: 'video' as const, 
      url,
      thumbnail: url.replace(/\.[^/.]+$/, '-thumb.jpg') // Assume thumbnail exists
    })),
  ];

  const currentMedia = mediaItems[currentIndex];
  const hasMultipleMedia = mediaItems.length > 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    setIsVideoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setIsVideoPlaying(false);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsVideoPlaying(false);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center">
        <span className="text-[var(--foreground-light)]">Görsel yok</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image/Video */}
        <div 
          className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--background-secondary)] cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <video
              src={currentMedia.url}
              poster={currentMedia.thumbnail}
              className="w-full h-full object-cover"
              muted={isVideoMuted}
              loop
              playsInline
              autoPlay={isVideoPlaying}
              onClick={(e) => {
                e.stopPropagation();
                setIsVideoPlaying(!isVideoPlaying);
              }}
            />
          )}

          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>

          {/* Video controls */}
          {currentMedia.type === 'video' && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoPlaying(!isVideoPlaying);
                }}
                className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoMuted(!isVideoMuted);
                }}
                className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultipleMedia && (
          <div className="grid grid-cols-5 gap-2">
            {mediaItems.slice(0, 5).map((media, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex 
                    ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20' 
                    : 'border-transparent hover:border-[var(--border)]'
                }`}
              >
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src={media.thumbnail || media.url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
            {mediaItems.length > 5 && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="aspect-square rounded-lg overflow-hidden bg-[var(--background-secondary)] flex items-center justify-center text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--border)] transition-colors"
              >
                +{mediaItems.length - 5}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Counter */}
          {hasMultipleMedia && (
            <div className="absolute top-4 left-4 text-white/70 text-lg z-10">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          )}

          {/* Main content */}
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt={productName}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={currentMedia.url}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>

          {/* Navigation */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Thumbnail strip at bottom */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
              {mediaItems.map((media, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goToIndex(i); }}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    i === currentIndex 
                      ? 'border-white' 
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  {media.type === 'image' ? (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="relative w-full h-full">
                      <img src={media.thumbnail || media.url} alt="" className="w-full h-full object-cover" />
                      <Play className="absolute inset-0 m-auto w-4 h-4 text-white" fill="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
