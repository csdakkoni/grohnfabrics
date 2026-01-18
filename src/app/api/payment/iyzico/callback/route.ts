import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL!,
    });

    return new Promise<NextResponse>((resolve) => {
      iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        token,
      }, async (err: Error | null, result: { 
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

          // Send order confirmation email
          try {
            const { data: order } = await supabaseAdmin
              .from('orders')
              .select(`
                order_number,
                guest_email,
                guest_info,
                subtotal,
                shipping_cost,
                discount_amount,
                total_amount,
                currency,
                shipping_address,
                order_items:order_items(product_name, quantity, unit_price, unit_type)
              `)
              .eq('id', orderId)
              .single();

            if (order && order.guest_email) {
              const shippingAddress = order.shipping_address as { addressLine1: string; city: string; country: string; postalCode: string };
              const guestInfo = order.guest_info as { firstName: string; lastName: string };
              
              await sendOrderConfirmationEmail({
                orderNumber: order.order_number,
                customerName: `${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`.trim() || 'Müşteri',
                email: order.guest_email,
                items: (order.order_items || []).map((item: { product_name: string; quantity: number; unit_price: number; unit_type: string }) => ({
                  name: item.product_name,
                  quantity: item.quantity,
                  price: item.unit_price * item.quantity,
                  unit: item.unit_type === 'meter' ? 'm' : 'adet',
                })),
                subtotal: order.subtotal,
                shippingCost: order.shipping_cost,
                discount: order.discount_amount || 0,
                total: order.total_amount,
                currency: order.currency,
                shippingAddress: {
                  addressLine1: shippingAddress?.addressLine1 || '',
                  city: shippingAddress?.city || '',
                  country: shippingAddress?.country || '',
                  postalCode: shippingAddress?.postalCode || '',
                },
              }, 'tr');
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the payment process if email fails
          }

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
