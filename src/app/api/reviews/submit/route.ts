/**
 * Yorum Submit API
 * 
 * Token bazlı erişim ile müşteri yorumu kabul eder.
 * Token, sipariş ID'sinden üretilir ve email ile gönderilir.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

// Token için secret key
const REVIEW_TOKEN_SECRET = process.env.REVIEW_TOKEN_SECRET || 'grohn-review-secret-2024';

/**
 * Token oluştur (orderId + secret hash)
 */
export function generateReviewToken(orderId: string): string {
    const hash = crypto
        .createHmac('sha256', REVIEW_TOKEN_SECRET)
        .update(orderId)
        .digest('hex')
        .substring(0, 24);

    return `${orderId.substring(0, 8)}-${hash}`;
}

/**
 * Token'ı doğrula ve orderId'yi çıkar
 */
export function verifyReviewToken(token: string): string | null {
    const parts = token.split('-');
    if (parts.length !== 2) return null;

    const orderIdPrefix = parts[0];
    const hash = parts[1];

    // orderId prefix'i ile başlayan siparişi bul
    // Bu basitleştirilmiş bir yaklaşım, gerçek uygulamada
    // tam orderId'yi token içinde saklayabilirsiniz
    return orderIdPrefix; // Prefix döndür, API'de tam eşleşme yapılacak
}

/**
 * POST /api/reviews/submit
 * Yorum gönderme
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, rating, comment, reviewerName } = body;

        // Validasyon
        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
        }
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating 1-5 arası olmalı' }, { status: 400 });
        }
        if (!comment || comment.trim().length < 10) {
            return NextResponse.json({ error: 'Yorum en az 10 karakter olmalı' }, { status: 400 });
        }

        // Token'dan order prefix'i al
        const orderIdPrefix = verifyReviewToken(token);
        if (!orderIdPrefix) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
        }

        // Sipariş bul (prefix ile)
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('id, order_number, customer_id, guest_email, guest_info, status')
            .ilike('id', `${orderIdPrefix}%`)
            .eq('status', 'delivered') // Sadece teslim edilmiş siparişler
            .single();

        if (orderError || !order) {
            return NextResponse.json({
                error: 'Sipariş bulunamadı veya henüz teslim edilmedi'
            }, { status: 404 });
        }

        // Token hash'ini doğrula
        const expectedToken = generateReviewToken(order.id);
        if (token !== expectedToken) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
        }

        // Daha önce yorum yapılmış mı kontrol et
        const { data: existingReview } = await supabaseAdmin
            .from('reviews')
            .select('id')
            .eq('source_order_id', order.id)
            .single();

        if (existingReview) {
            return NextResponse.json({
                error: 'Bu sipariş için zaten yorum yapılmış'
            }, { status: 409 });
        }

        // Yorum kategorisini tahmin et (basit keyword matching)
        let categoryKeyword = 'general';
        const lowerComment = comment.toLowerCase();
        if (lowerComment.includes('curtain') || lowerComment.includes('perde') || lowerComment.includes('drape')) {
            categoryKeyword = 'curtain';
        } else if (lowerComment.includes('fabric') || lowerComment.includes('kumaş') || lowerComment.includes('material')) {
            categoryKeyword = 'fabric';
        } else if (lowerComment.includes('sample') || lowerComment.includes('numune')) {
            categoryKeyword = 'sample';
        }

        // Reviewer name'i belirle
        const finalReviewerName = reviewerName?.trim() ||
            (order.guest_info?.firstName) ||
            'Anonim';

        // Yorumu kaydet
        const { data: review, error: insertError } = await supabaseAdmin
            .from('reviews')
            .insert({
                reviewer_name: finalReviewerName,
                rating,
                comment: comment.trim(),
                review_date: new Date().toISOString().split('T')[0],
                source: 'website',
                source_order_id: order.id,
                category_keyword: categoryKeyword,
                is_approved: false, // Admin onayı bekleyecek
                is_featured: false,
            })
            .select()
            .single();

        if (insertError) {
            console.error('[Reviews] Insert error:', insertError);
            return NextResponse.json({ error: 'Yorum kaydedilemedi' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Yorumunuz alındı! Onaylandıktan sonra sitemizde yayınlanacak.',
            reviewId: review.id,
        });

    } catch (error) {
        console.error('[Reviews] Submit error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

/**
 * GET /api/reviews/submit?token=xxx
 * Token doğrulama (form yüklemeden önce kontrol)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ valid: false, error: 'Token gerekli' });
    }

    const orderIdPrefix = verifyReviewToken(token);
    if (!orderIdPrefix) {
        return NextResponse.json({ valid: false, error: 'Geçersiz token' });
    }

    // Sipariş bul
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, customer_id, guest_info')
        .ilike('id', `${orderIdPrefix}%`)
        .single();

    if (!order) {
        return NextResponse.json({ valid: false, error: 'Sipariş bulunamadı' });
    }

    // Token hash'ini doğrula
    const expectedToken = generateReviewToken(order.id);
    if (token !== expectedToken) {
        return NextResponse.json({ valid: false, error: 'Geçersiz token' });
    }

    // Daha önce yorum yapılmış mı?
    const { data: existingReview } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('source_order_id', order.id)
        .single();

    if (existingReview) {
        return NextResponse.json({
            valid: false,
            error: 'Bu sipariş için zaten yorum yapılmış',
            alreadyReviewed: true,
        });
    }

    return NextResponse.json({
        valid: true,
        orderNumber: order.order_number,
        customerName: order.guest_info?.firstName || 'Müşteri',
        isDelivered: order.status === 'delivered',
    });
}
