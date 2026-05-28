/**
 * Email Template: Sipariş Onayı
 * 
 * Ödeme başarılı olduğunda müşteriye gönderilir.
 */

interface OrderConfirmationParams {
    orderNumber: string;
    orderId: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        unitType: string;
        price: number;
    }>;
    subtotal: number;
    shippingCost: number;
    total: number;
    currency: string;
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
    };
    locale?: 'tr' | 'en';
}

export function generateOrderConfirmationEmail(params: OrderConfirmationParams): string {
    const {
        orderNumber,
        orderId,
        customerName,
        items,
        subtotal,
        shippingCost,
        total,
        currency,
        shippingAddress,
        locale = 'en',
    } = params;

    const t = (tr: string, en: string) => locale === 'tr' ? tr : en;
    const formatPrice = (amount: number) =>
        new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency,
        }).format(amount);

    const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order/${orderId}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('Sipariş Onayı', 'Order Confirmation')}</title>
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
      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px;">
        ${t('Merhaba', 'Hello')} ${customerName}! 👋
      </h2>
      
      <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
        ${t(
        'Siparişinizi aldık ve hazırlamaya başladık. Aşağıda sipariş detaylarınızı bulabilirsiniz.',
        'We received your order and started preparing it. Below are your order details.'
    )}
      </p>
      
      <!-- Order Number -->
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          ${t('Sipariş Numarası', 'Order Number')}
        </p>
        <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 18px; font-weight: 600; font-family: monospace;">
          #${orderNumber}
        </p>
      </div>
      
      <!-- Items -->
      <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        ${t('Ürünler', 'Items')}
      </h3>
      
      ${items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <div>
            <p style="margin: 0; color: #1a1a1a; font-weight: 500;">${item.name}</p>
            <p style="margin: 3px 0 0; color: #888; font-size: 14px;">
              ${item.unitType === 'meter' ? `${item.quantity.toFixed(1)} ${t('metre', 'meters')}` : `${item.quantity} ${t('adet', 'pcs')}`}
            </p>
          </div>
          <p style="margin: 0; color: #1a1a1a; font-weight: 500;">${formatPrice(item.price)}</p>
        </div>
      `).join('')}
      
      <!-- Totals -->
      <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #666;">${t('Ara Toplam', 'Subtotal')}</span>
          <span style="color: #1a1a1a;">${formatPrice(subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #666;">${t('Kargo', 'Shipping')}</span>
          <span style="color: #1a1a1a;">${shippingCost === 0 ? t('Ücretsiz', 'Free') : formatPrice(shippingCost)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
          <span style="color: #1a1a1a;">${t('Toplam', 'Total')}</span>
          <span style="color: #1a1a1a;">${formatPrice(total)}</span>
        </div>
      </div>
      
      <!-- Shipping Address -->
      <div style="margin-top: 30px; padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
        <h4 style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
          ${t('Teslimat Adresi', 'Shipping Address')}
        </h4>
        <p style="margin: 0; color: #666; line-height: 1.6;">
          ${shippingAddress.line1}<br>
          ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
          ${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} ${shippingAddress.postalCode}<br>
          ${shippingAddress.country}
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${orderUrl}" style="display: inline-block; padding: 14px 30px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-weight: 500; border-radius: 8px;">
          ${t('Siparişi Görüntüle', 'View Order')}
        </a>
      </div>
      
      <p style="margin: 30px 0 0; color: #888; font-size: 14px; text-align: center;">
        ${t(
        'Sorularınız için bize grohn@grohn.com.tr adresinden ulaşabilirsiniz.',
        'For any questions, contact us at grohn@grohn.com.tr'
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

export function getOrderConfirmationSubject(orderNumber: string, locale: 'tr' | 'en' = 'en'): string {
    return locale === 'tr'
        ? `Sipariş Onayı - #${orderNumber}`
        : `Order Confirmation - #${orderNumber}`;
}
