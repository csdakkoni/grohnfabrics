import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// iyzipay dosyalarını Vercel'e dahil ettirmek için manuel import
// @ts-ignore
import Iyzipay from 'iyzipay';
// @ts-ignore
import 'iyzipay/lib/IyzipayResource';
// @ts-ignore
import 'iyzipay/lib/resources/CheckoutForm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.redirect(new URL('/checkout?error=no_token', process.env.NEXT_PUBLIC_SITE_URL!));
    }
    
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_BASE_URL,
    });

    return new Promise<NextResponse>((resolve) => {
      iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        token,
      }, async (err: Error, result: { 
        status: string; 
        paymentStatus: string;
        conversationId: string;
        paymentId: string;
      }) => {
        if (err) {
          console.error('iyzico callback error:', err);
          resolve(NextResponse.redirect(new URL('/checkout?error=payment_failed', process.env.NEXT_PUBLIC_SITE_URL!)));
          return;
        }

        const orderId = result.conversationId;

        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
          // Update order status
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'paid',
              payment_id: result.paymentId,
              payment_status: 'success',
            })
            .eq('id', orderId);

          resolve(NextResponse.redirect(new URL(`/order/success?order=${orderId}`, process.env.NEXT_PUBLIC_SITE_URL!)));
        } else {
          // Payment failed
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
            })
            .eq('id', orderId);

          resolve(NextResponse.redirect(new URL('/checkout?error=payment_failed', process.env.NEXT_PUBLIC_SITE_URL!)));
        }
      });
    });

  } catch (error) {
    console.error('iyzico callback error:', error);
    return NextResponse.redirect(new URL('/checkout?error=unknown', process.env.NEXT_PUBLIC_SITE_URL!));
  }
}
