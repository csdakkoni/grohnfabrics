// Email utility functions
// Uses Resend API for sending emails
// Configure RESEND_API_KEY in .env

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  email: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    addressLine1: string;
    city: string;
    country: string;
    postalCode: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
}

// Send email using Resend API
export async function sendEmail({ to, subject, html, from }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'Grohn Fabrics <orders@grohnfabrics.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error: 'Email sending failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Email sending failed' };
  }
}

// Generate order confirmation email HTML
export function generateOrderConfirmationEmail(order: OrderData, locale: 'tr' | 'en' = 'tr'): string {
  const isEnglish = locale === 'en';
  const currencySymbol = order.currency === 'TRY' ? '₺' : order.currency === 'EUR' ? '€' : '$';

  const t = (tr: string, en: string) => isEnglish ? en : tr;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('Sipariş Onayı', 'Order Confirmation')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f2ec;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #7A9B76; margin: 0; font-size: 24px; font-weight: 600;">GROHN FABRICS</h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <!-- Success Header -->
      <div style="background: linear-gradient(135deg, #7A9B76, #5C7A58); padding: 32px; text-align: center;">
        <div style="width: 64px; height: 64px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">✓</span>
        </div>
        <h2 style="color: white; margin: 0 0 8px; font-size: 24px;">${t('Siparişiniz Alındı!', 'Order Confirmed!')}</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">${t('Teşekkür ederiz', 'Thank you')}, ${order.customerName}</p>
      </div>

      <!-- Order Info -->
      <div style="padding: 32px;">
        <div style="background: #f5f2ec; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 14px; color: #5C665E;">${t('Sipariş Numarası', 'Order Number')}</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #2C3830;">${order.orderNumber}</p>
        </div>

        <!-- Items -->
        <h3 style="margin: 0 0 16px; font-size: 16px; color: #2C3830;">${t('Sipariş Detayları', 'Order Details')}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.items.map(item => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e0d8;">
                <p style="margin: 0; font-weight: 500; color: #2C3830;">${item.name}</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #5C665E;">
                  ${item.quantity} ${item.unit}
                </p>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e0d8; text-align: right; font-weight: 500; color: #2C3830;">
                ${currencySymbol}${item.price.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </table>

        <!-- Totals -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e0d8;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #5C665E;">${t('Ara Toplam', 'Subtotal')}</span>
            <span style="color: #2C3830;">${currencySymbol}${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #5C665E;">${t('Kargo', 'Shipping')}</span>
            <span style="color: #2C3830;">${order.shippingCost === 0 ? t('Ücretsiz', 'Free') : `${currencySymbol}${order.shippingCost.toFixed(2)}`}</span>
          </div>
          ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6B9B6B;">${t('İndirim', 'Discount')}</span>
            <span style="color: #6B9B6B;">-${currencySymbol}${order.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e0d8;">
            <span style="font-size: 18px; font-weight: 600; color: #2C3830;">${t('Toplam', 'Total')}</span>
            <span style="font-size: 18px; font-weight: 600; color: #7A9B76;">${currencySymbol}${order.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Shipping Address -->
        <div style="margin-top: 32px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #2C3830;">${t('Teslimat Adresi', 'Shipping Address')}</h3>
          <div style="background: #f5f2ec; border-radius: 12px; padding: 16px;">
            <p style="margin: 0; color: #2C3830;">
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #5C665E; font-size: 14px;">
      <p style="margin: 0 0 8px;">${t('Sorularınız için bize ulaşın', 'Questions? Contact us')}</p>
      <a href="mailto:grohn@grohn.com.tr" style="color: #7A9B76; text-decoration: none;">grohn@grohn.com.tr</a>
      <p style="margin: 24px 0 0; font-size: 12px; color: #8A9189;">
        © ${new Date().getFullYear()} Grohn Fabrics. ${t('Tüm hakları saklıdır.', 'All rights reserved.')}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate shipping notification email HTML
export function generateShippingNotificationEmail(order: OrderData, locale: 'tr' | 'en' = 'tr'): string {
  const isEnglish = locale === 'en';

  const t = (tr: string, en: string) => isEnglish ? en : tr;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('Siparişiniz Kargoya Verildi', 'Your Order Has Been Shipped')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f2ec;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #7A9B76; margin: 0; font-size: 24px; font-weight: 600;">GROHN FABRICS</h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <!-- Header with truck icon -->
      <div style="background: linear-gradient(135deg, #7B9BC4, #5a7ba8); padding: 32px; text-align: center;">
        <div style="width: 64px; height: 64px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">🚚</span>
        </div>
        <h2 style="color: white; margin: 0 0 8px; font-size: 24px;">${t('Siparişiniz Yola Çıktı!', 'Your Order is On Its Way!')}</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">${t('Kargo takip bilgileriniz aşağıda', 'Track your shipment below')}</p>
      </div>

      <div style="padding: 32px;">
        <!-- Order Number -->
        <div style="background: #f5f2ec; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 14px; color: #5C665E;">${t('Sipariş Numarası', 'Order Number')}</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #2C3830;">${order.orderNumber}</p>
        </div>

        ${order.trackingNumber ? `
        <!-- Tracking Info -->
        <div style="background: #E8F2E8; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #5C665E;">${t('Kargo Takip Numarası', 'Tracking Number')}</p>
          <p style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #2C3830; font-family: monospace;">${order.trackingNumber}</p>
          ${order.trackingUrl ? `
            <a href="${order.trackingUrl}" style="display: inline-block; background: #7A9B76; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              ${t('Kargo Takip', 'Track Shipment')} →
            </a>
          ` : ''}
        </div>
        ` : ''}

        <!-- Shipping Address -->
        <div>
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #2C3830;">${t('Teslimat Adresi', 'Delivery Address')}</h3>
          <div style="background: #f5f2ec; border-radius: 12px; padding: 16px;">
            <p style="margin: 0; color: #2C3830;">
              ${order.customerName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
        </div>

        <!-- What to expect -->
        <div style="margin-top: 32px; padding: 20px; border: 1px solid #e5e0d8; border-radius: 12px;">
          <h4 style="margin: 0 0 12px; color: #2C3830;">${t('Teslimat Hakkında', 'About Delivery')}</h4>
          <ul style="margin: 0; padding-left: 20px; color: #5C665E; font-size: 14px; line-height: 1.8;">
            <li>${t('Kargo takip numaranızla siparişinizi takip edebilirsiniz', 'You can track your order with the tracking number above')}</li>
            <li>${t('Teslimat sırasında evde olmazsanız, kargo firması size ulaşacaktır', 'If you\'re not home during delivery, the carrier will contact you')}</li>
            <li>${t('Herhangi bir sorunuz için bize ulaşabilirsiniz', 'Contact us if you have any questions')}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #5C665E; font-size: 14px;">
      <p style="margin: 0 0 8px;">${t('Sorularınız için bize ulaşın', 'Questions? Contact us')}</p>
      <a href="mailto:grohn@grohn.com.tr" style="color: #7A9B76; text-decoration: none;">grohn@grohn.com.tr</a>
      <p style="margin: 24px 0 0; font-size: 12px; color: #8A9189;">
        © ${new Date().getFullYear()} Grohn Fabrics. ${t('Tüm hakları saklıdır.', 'All rights reserved.')}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(order: OrderData, locale: 'tr' | 'en' = 'tr') {
  const isEnglish = locale === 'en';
  const subject = isEnglish 
    ? `Order Confirmed - ${order.orderNumber}`
    : `Sipariş Onayı - ${order.orderNumber}`;

  return sendEmail({
    to: order.email,
    subject,
    html: generateOrderConfirmationEmail(order, locale),
  });
}

// Send shipping notification email
export async function sendShippingNotificationEmail(order: OrderData, locale: 'tr' | 'en' = 'tr') {
  const isEnglish = locale === 'en';
  const subject = isEnglish 
    ? `Your Order Has Shipped - ${order.orderNumber}`
    : `Siparişiniz Kargoya Verildi - ${order.orderNumber}`;

  return sendEmail({
    to: order.email,
    subject,
    html: generateShippingNotificationEmail(order, locale),
  });
}
