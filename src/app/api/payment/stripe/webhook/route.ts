import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
          // Update order status
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
                : order.guest_info?.firstName || 'Customer';

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
                  locale: order.locale || 'en',
                });
                console.log('[Stripe Webhook] Order confirmation email sent to:', customerEmail);
              }
            }
          } catch (emailError) {
            console.error('[Stripe Webhook] Failed to send email:', emailError);
            // Don't fail the webhook if email fails
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

