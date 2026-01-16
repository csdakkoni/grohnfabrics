/**
 * Resend Email Service
 * 
 * Sipariş onayı, kargo bildirimi ve yorum isteği emailleri gönderir.
 */

import { Resend } from 'resend';

// Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Sender email - Verified domain gerekli
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@grohnfabrics.com';
const FROM_NAME = 'Grohn Fabrics';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Email gönder
 */
export async function sendEmail({ to, subject, html, text }: EmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to,
            subject,
            html,
            text: text || stripHtml(html),
        });

        if (error) {
            console.error('[Resend] Error sending email:', error);
            return { success: false, error };
        }

        console.log('[Resend] Email sent successfully:', data?.id);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('[Resend] Exception:', error);
        return { success: false, error };
    }
}

/**
 * HTML'den text çıkar (basit)
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Re-export types
export type { EmailParams };
