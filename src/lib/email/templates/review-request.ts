/**
 * Email Template: Yorum İsteği
 * 
 * Sipariş teslim edildikten sonra müşteriye gönderilir.
 */

import crypto from 'crypto';

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

interface ReviewRequestParams {
    orderId: string;
    orderNumber: string;
    customerName: string;
    locale?: 'tr' | 'en';
}

export function generateReviewRequestEmail(params: ReviewRequestParams): string {
    const {
        orderId,
        orderNumber,
        customerName,
        locale = 'en',
    } = params;

    const t = (tr: string, en: string) => locale === 'tr' ? tr : en;
    const reviewToken = generateReviewToken(orderId);
    const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/review/${reviewToken}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('Deneyiminizi Paylaşın', 'Share Your Experience')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 2px;">
        GROHN FABRICS
      </h1>
    </div>
    
    <!-- Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px;">
      <!-- Stars Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="font-size: 40px;">⭐⭐⭐⭐⭐</span>
      </div>
      
      <h2 style="margin: 0 0 10px; color: #1a1a1a; font-size: 22px; text-align: center;">
        ${t('Siparişiniz Teslim Edildi!', 'Your Order Was Delivered!')}
      </h2>
      
      <p style="color: #666; line-height: 1.6; margin: 0 0 25px; text-align: center;">
        ${t(
        `Merhaba ${customerName}, siparişiniz (${orderNumber}) teslim edildi. Ürünlerimiz hakkındaki düşüncelerinizi paylaşır mısınız?`,
        `Hello ${customerName}, your order (${orderNumber}) has been delivered. Would you share your thoughts about our products?`
    )}
      </p>
      
      <!-- Info Box -->
      <div style="background-color: #fef9c3; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          ${t(
        '✨ Yorumunuz diğer müşterilere yardımcı olur ve bizi motive eder!',
        '✨ Your review helps other customers and motivates us!'
    )}
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${reviewUrl}" style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px;">
          ${t('Yorum Yaz', 'Write a Review')}
        </a>
      </div>
      
      <p style="margin: 30px 0 0; color: #888; font-size: 14px; text-align: center;">
        ${t(
        'Sadece 1 dakikanızı alır. Teşekkür ederiz!',
        'It only takes 1 minute. Thank you!'
    )}
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} Grohn Fabrics. ${t('Tüm hakları saklıdır.', 'All rights reserved.')}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getReviewRequestSubject(locale: 'tr' | 'en' = 'en'): string {
    return locale === 'tr'
        ? 'Deneyiminizi paylaşır mısınız? ⭐'
        : 'Would you share your experience? ⭐';
}
