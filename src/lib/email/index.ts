/**
 * Email API - Sipariş emaillerini gönderen API endpointleri
 * 
 * Bu fonksiyonlar checkout/init ve order status update'de çağrılır.
 */

import { sendEmail } from './resend';
import {
    generateOrderConfirmationEmail,
    getOrderConfirmationSubject
} from './templates/order-confirmation';
import {
    generateShipmentNotificationEmail,
    getShipmentNotificationSubject
} from './templates/shipment-notification';
import {
    generateReviewRequestEmail,
    getReviewRequestSubject
} from './templates/review-request';

// Types
interface OrderEmailData {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
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

interface ShipmentEmailData {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    trackingNumber: string;
    shippingProvider: string;
    locale?: 'tr' | 'en';
}

/**
 * Sipariş onay emaili gönder
 * Ödeme başarılı olduğunda çağrılır
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    const html = generateOrderConfirmationEmail({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
        currency: data.currency,
        shippingAddress: data.shippingAddress,
        locale: data.locale,
    });

    const subject = getOrderConfirmationSubject(data.orderNumber, data.locale);

    return sendEmail({
        to: data.customerEmail,
        subject,
        html,
    });
}

/**
 * Kargo bildirimi emaili gönder
 * Sipariş "shipped" durumuna geçtiğinde çağrılır
 */
export async function sendShipmentNotificationEmail(data: ShipmentEmailData) {
    const html = generateShipmentNotificationEmail({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        trackingNumber: data.trackingNumber,
        shippingProvider: data.shippingProvider,
        locale: data.locale,
    });

    const subject = getShipmentNotificationSubject(data.orderNumber, data.locale);

    return sendEmail({
        to: data.customerEmail,
        subject,
        html,
    });
}

interface ReviewRequestEmailData {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    locale?: 'tr' | 'en';
}

/**
 * Yorum isteği emaili gönder
 * Sipariş "delivered" durumuna geçtiğinde çağrılır
 */
export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
    const html = generateReviewRequestEmail({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        locale: data.locale,
    });

    const subject = getReviewRequestSubject(data.locale);

    return sendEmail({
        to: data.customerEmail,
        subject,
        html,
    });
}

// Re-export
export type { OrderEmailData, ShipmentEmailData, ReviewRequestEmailData };

