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
                *,
                order_items(product_name, quantity, unit_type, total_price),
                customer:customers(first_name, last_name, email)
              `)
              .eq('id', orderId)
              .single();

            if (order) {
              const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
              const customerEmail = customer?.email || order.guest_email;
              const customerName = customer
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : order.guest_info?.firstName || 'Müşteri';

              if (customerEmail) {
                const shippingAddr = order.shipping_address || {};

                await sendOrderConfirmationEmail({
                  orderId: order.id,
                  orderNumber: order.order_number,
                  customerEmail,
                  customerName,
                  items: (order.order_items || []).map((item: { product_name: string; quantity: number; unit_type: string; total_price: number }) => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    unitType: item.unit_type,
                    price: item.total_price,
                  })),
                  subtotal: order.subtotal,
                  shippingCost: order.shipping_cost,
                  total: order.total_amount,
                  currency: order.currency,
                  shippingAddress: {
                    line1: shippingAddr.addressLine1 || '',
                    line2: shippingAddr.addressLine2,
                    city: shippingAddr.city || '',
                    state: shippingAddr.state,
                    postalCode: shippingAddr.postalCode || '',
                    country: shippingAddr.country || '',
                  },
                  locale: 'tr', // iyzico is always Turkish market
                });
                console.log('[iyzico Callback] Order confirmation email sent to:', customerEmail);
              }
            }
          } catch (emailError) {
            console.error('[iyzico Callback] Failed to send email:', emailError);
            // Don't fail the redirect if email fails
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

