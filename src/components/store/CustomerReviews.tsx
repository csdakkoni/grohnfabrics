'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from 'lucide-react';
import { useMarket } from '@/lib/market/context';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  review_date: string;
  source: string;
}

interface CustomerReviewsProps {
  reviews?: Review[];
  title?: string;
  showEtsyLink?: boolean;
}

// Etsy logo SVG
const EtsyBadge = () => (
  <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#F56400]">
      <path d="M8.56 5.45c-.4 0-.75.06-1.04.18-.28.12-.5.3-.65.53-.16.23-.26.51-.32.84-.06.33-.09.7-.09 1.12v1.88H9.5c.08 0 .15.03.2.08.06.06.09.12.09.2v1.43c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H6.46v8.45c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H4.15c-.08 0-.14-.03-.2-.09-.05-.05-.09-.12-.09-.2V12h-1.5c-.08 0-.15-.03-.2-.09-.06-.05-.09-.12-.09-.2V10.28c0-.08.03-.14.09-.2.05-.05.12-.08.2-.08h1.5V8c0-.7.09-1.32.26-1.87.17-.55.44-1.02.8-1.4.36-.38.82-.67 1.37-.87.55-.2 1.2-.3 1.95-.3h1.5c.08 0 .15.03.2.09.06.05.09.12.09.2v1.51c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09H8.56zm11.9 4.83c-.08 0-.14-.03-.2-.09-.05-.05-.09-.12-.09-.2V8.47c0-.08.03-.14.09-.2.06-.05.12-.08.2-.08h2.07c.08 0 .15.03.2.08.06.06.09.12.09.2v1.52c0 .08-.03.15-.09.2-.05.06-.12.09-.2.09h-2.07zm.09 10.17c-.08 0-.15-.03-.2-.09-.06-.05-.09-.12-.09-.2V12c0-.08.03-.14.09-.2.05-.05.12-.08.2-.08h2.07c.08 0 .14.03.2.08.05.06.08.12.08.2v8.16c0 .08-.03.15-.08.2-.06.06-.12.09-.2.09h-2.07z"/>
    </svg>
    <span className="font-medium">Verified Etsy Purchase</span>
  </div>
);

// Star rating component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating 
            ? 'fill-amber-400 text-amber-400' 
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
  </div>
);

// Avatar with initial
const Avatar = ({ name }: { name: string }) => {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    'bg-rose-100 text-rose-600',
    'bg-sky-100 text-sky-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-violet-100 text-violet-600',
    'bg-pink-100 text-pink-600',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${colors[colorIndex]}`}>
      {initial}
    </div>
  );
};

export default function CustomerReviews({ 
  reviews: propReviews, 
  title,
  showEtsyLink = true 
}: CustomerReviewsProps) {
  const { t, locale } = useMarket();
  const [reviews, setReviews] = useState<Review[]>(propReviews || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch reviews if not provided as props
  useEffect(() => {
    if (!propReviews) {
      fetch('/api/reviews?limit=20&featured=true')
        .then(res => res.json())
        .then(data => {
          if (data.reviews) setReviews(data.reviews);
        })
        .catch(console.error);
    }
  }, [propReviews]);

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  if (reviews.length === 0) return null;

  // Show 3 reviews at a time on desktop
  const visibleReviews = [];
  for (let i = 0; i < Math.min(3, reviews.length); i++) {
    visibleReviews.push(reviews[(currentIndex + i) % reviews.length]);
  }

  const defaultTitle = t('Müşterilerimiz Ne Diyor?', 'What Our Customers Say');
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="py-16 bg-[var(--background-secondary)]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4">
            {title || defaultTitle}
          </h2>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-4 text-sm text-[var(--foreground-muted)]">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{reviews.length}+ {t('doğrulanmış yorum', 'verified reviews')}</span>
            {showEtsyLink && (
              <>
                <span>•</span>
                <a
                  href="https://www.etsy.com/shop/AgoraLoom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[var(--brand-primary)] hover:underline"
                >
                  {t("Etsy'de Görüntüle", 'View on Etsy')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative" ref={containerRef}>
          {/* Navigation Buttons */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow"
              >
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-[var(--brand-primary)]/20 mb-4" />

                {/* Comment */}
                <p className="text-[var(--foreground)] leading-relaxed mb-6 line-clamp-4">
                  "{review.comment || t('Harika ürün!', 'Great product!')}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Avatar name={review.reviewer_name} />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {review.reviewer_name}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  
                  {review.source === 'etsy' && <EtsyBadge />}
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          {reviews.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(idx * 3);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 3) === idx
                      ? 'bg-[var(--brand-primary)]'
                      : 'bg-[var(--border)]'
                  }`}
                  aria-label={`Go to review set ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Grohn Fabrics",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avgRating.toFixed(1),
                "reviewCount": reviews.length,
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": reviews.slice(0, 10).map(r => ({
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": r.reviewer_name
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": r.rating
                },
                "reviewBody": r.comment
              }))
            })
          }}
        />
      </div>
    </section>
  );
}
