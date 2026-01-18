import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderConfirmationEmail } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'paid',
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
                customerName: `${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`.trim() || 'Customer',
                email: order.guest_email,
                items: (order.order_items || []).map((item: { product_name: string; quantity: number; unit_price: number; unit_type: string }) => ({
                  name: item.product_name,
                  quantity: item.quantity,
                  price: item.unit_price * item.quantity,
                  unit: item.unit_type === 'meter' ? 'm' : 'pcs',
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
              }, 'en');
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'expired',
            })
            .eq('id', orderId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
            })
            .eq('id', orderId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
