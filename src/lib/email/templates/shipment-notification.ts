/**
 * Email Template: Kargo Bildirimi
 * 
 * Sipariş kargoya verildiğinde müşteriye gönderilir.
 */

interface ShipmentNotificationParams {
    orderNumber: string;
    orderId: string;
    customerName: string;
    trackingNumber: string;
    shippingProvider: string;
    locale?: 'tr' | 'en';
}

export function generateShipmentNotificationEmail(params: ShipmentNotificationParams): string {
    const {
        orderNumber,
        orderId,
        customerName,
        trackingNumber,
        shippingProvider,
        locale = 'en',
    } = params;

    const t = (tr: string, en: string) => locale === 'tr' ? tr : en;
    const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order/${orderId}`;

    // Generate tracking URL based on carrier
    let trackingUrl = orderUrl;
    if (shippingProvider === 'yurtici_kargo') {
        trackingUrl = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`;
    } else if (shippingProvider === 'aras_kargo') {
        trackingUrl = `https://www.araskargo.com.tr/kargo-takip/${trackingNumber}`;
    } else if (shippingProvider === 'ups' || !shippingProvider) {
        trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('Siparişiniz Kargoya Verildi', 'Your Order Has Been Shipped')}</title>
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
      <!-- Shipping Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; width: 80px; height: 80px; background-color: #e8f5e9; border-radius: 50%; line-height: 80px; font-size: 40px;">
          📦
        </div>
      </div>
      
      <h2 style="margin: 0 0 10px; color: #1a1a1a; font-size: 22px; text-align: center;">
        ${t('Siparişiniz Yola Çıktı!', 'Your Order Is On Its Way!')}
      </h2>
      
      <p style="color: #666; line-height: 1.6; margin: 0 0 25px; text-align: center;">
        ${t(
        `Merhaba ${customerName}, siparişiniz kargoya verildi ve size doğru yola çıktı.`,
        `Hello ${customerName}, your order has been shipped and is on its way to you.`
    )}
      </p>
      
      <!-- Tracking Info -->
      <div style="background-color: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <p style="margin: 0 0 5px; color: #666; font-size: 14px;">
          ${t('Sipariş Numarası', 'Order Number')}
        </p>
        <p style="margin: 0 0 15px; color: #1a1a1a; font-size: 16px; font-weight: 600; font-family: monospace;">
          #${orderNumber}
        </p>
        
        <p style="margin: 0 0 5px; color: #666; font-size: 14px;">
          ${t('Kargo Takip Numarası', 'Tracking Number')}
        </p>
        <p style="margin: 0 0 15px; color: #1a1a1a; font-size: 18px; font-weight: 600; font-family: monospace;">
          ${trackingNumber}
        </p>
        
        <p style="margin: 0 0 5px; color: #666; font-size: 14px;">
          ${t('Kargo Firması', 'Shipping Carrier')}
        </p>
        <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">
          ${shippingProvider?.toUpperCase() || 'UPS'}
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${trackingUrl}" style="display: inline-block; padding: 16px 35px; background-color: #351C15; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px;">
          ${t('Kargoyu Takip Et', 'Track Shipment')}
        </a>
      </div>
      
      <p style="margin: 25px 0 0; color: #888; font-size: 14px; text-align: center;">
        ${t(
        'Tahmini teslimat süresi 3-7 iş günüdür.',
        'Estimated delivery time is 3-7 business days.'
    )}
      </p>
      
      <!-- Order Link -->
      <div style="text-align: center; margin-top: 20px;">
        <a href="${orderUrl}" style="color: #1a1a1a; font-size: 14px;">
          ${t('Sipariş detaylarını görüntüle →', 'View order details →')}
        </a>
      </div>
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

export function getShipmentNotificationSubject(orderNumber: string, locale: 'tr' | 'en' = 'en'): string {
    return locale === 'tr'
        ? `Siparişiniz Kargoya Verildi - #${orderNumber}`
        : `Your Order Has Been Shipped - #${orderNumber}`;
}
