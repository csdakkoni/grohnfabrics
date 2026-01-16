'use client';

/**
 * Yorum Yazma Sayfası
 * 
 * Token bazlı erişim ile müşteri yorumu alır.
 * URL: /review/[token]
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TokenValidation {
    valid: boolean;
    orderNumber?: string;
    customerName?: string;
    isDelivered?: boolean;
    error?: string;
    alreadyReviewed?: boolean;
}

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [validation, setValidation] = useState<TokenValidation | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewerName, setReviewerName] = useState('');

    // Token doğrulama
    useEffect(() => {
        async function validateToken() {
            try {
                const res = await fetch(`/api/reviews/submit?token=${token}`);
                const data = await res.json();
                setValidation(data);
                if (data.customerName) {
                    setReviewerName(data.customerName);
                }
            } catch {
                setValidation({ valid: false, error: 'Bağlantı hatası' });
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            validateToken();
        }
    }, [token]);

    // Form gönderme
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (comment.trim().length < 10) {
            setError('Lütfen en az 10 karakter uzunluğunda bir yorum yazın.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    rating,
                    comment: comment.trim(),
                    reviewerName: reviewerName.trim(),
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Bir hata oluştu');
            }
        } catch {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--brand-primary)]" />
                    <p className="mt-4 text-[var(--foreground-muted)]">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Invalid token
    if (!validation?.valid) {
        return (
            <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[var(--background)] rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-semibold mb-2">
                        {validation?.alreadyReviewed ? 'Zaten Yorum Yaptınız' : 'Geçersiz Link'}
                    </h1>
                    <p className="text-[var(--foreground-muted)] mb-6">
                        {validation?.alreadyReviewed
                            ? 'Bu sipariş için zaten bir yorum gönderdiniz. Teşekkür ederiz!'
                            : validation?.error || 'Bu yorum linki geçerli değil veya süresi dolmuş olabilir.'}
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // Submitted success
    if (submitted) {
        return (
            <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[var(--background)] rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-xl font-semibold mb-2">Teşekkürler!</h1>
                    <p className="text-[var(--foreground-muted)] mb-6">
                        Yorumunuz başarıyla alındı. Onaylandıktan sonra sitemizde yayınlanacak.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/" className="btn btn-secondary">
                            Ana Sayfa
                        </Link>
                        <Link href="/products" className="btn btn-primary">
                            Alışverişe Devam Et
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Review form
    return (
        <div className="min-h-screen bg-[var(--background-secondary)] py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold mb-2">Deneyiminizi Paylaşın</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Sipariş #{validation.orderNumber} için değerlendirmeniz
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[var(--background)] rounded-2xl shadow-lg p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-3 text-center">
                                Değerlendirmeniz
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-gray-200 text-gray-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm text-[var(--foreground-muted)] mt-2">
                                {rating === 1 && 'Çok Kötü'}
                                {rating === 2 && 'Kötü'}
                                {rating === 3 && 'Orta'}
                                {rating === 4 && 'İyi'}
                                {rating === 5 && 'Mükemmel'}
                            </p>
                        </div>

                        {/* Reviewer Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Adınız
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={reviewerName}
                                onChange={(e) => setReviewerName(e.target.value)}
                                placeholder="Adınız (opsiyonel)"
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--background)]"
                            />
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium mb-2">
                                Yorumunuz
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ürünler hakkındaki düşüncelerinizi paylaşın..."
                                rows={5}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--background)] resize-none"
                                required
                                minLength={10}
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                En az 10 karakter ({comment.length}/10+)
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || comment.length < 10}
                            className="w-full btn btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Yorumu Gönder
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-center text-[var(--foreground-muted)] mt-6">
                    Yorumunuz onaylandıktan sonra sitemizde görünecektir.
                    Kişisel bilgileriniz korunmaktadır.
                </p>
            </div>
        </div>
    );
}
