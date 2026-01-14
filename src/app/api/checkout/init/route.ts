import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  salesModel: string;
}

interface CheckoutRequest {
  cart: {
    items: CartItem[];
    market: 'TR' | 'GLOBAL';
    currency: string;
  };
  address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  market: 'TR' | 'GLOBAL';
  shippingCost: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { cart, address, market, shippingCost } = body;

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    // Get company based on market (optional - some setups may not have companies)
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('code', market === 'TR' ? 'TR' : 'US')
      .maybeSingle(); // Use maybeSingle to allow null

    // company_id is optional, continue even if not found

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: null, // Guest checkout
        guest_email: address.email,
        guest_info: {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
        },
        market_id: market,
        company_id: company?.id || null,
        currency: market === 'TR' ? 'TRY' : 'USD',
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: 0, // Simplified for now
        discount_amount: 0,
        total_amount: total,
        status: 'pending',
        shipping_address: address,
        billing_address: address,
        payment_provider: market === 'TR' ? 'iyzico' : 'stripe',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: null, // Simplified - variant info stored in variant_info JSONB
      variant_info: item.variantId ? { selectedOptions: item.variantId } : null,
      product_name: item.name,
      quantity: item.quantity,
      unit_type: item.salesModel === 'meter' ? 'meter' : 'unit',
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      console.error('Order items data:', JSON.stringify(orderItems, null, 2));
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Sipariş kalemleri oluşturulamadı: ' + itemsError.message }, { status: 500 });
    }

    // Initialize payment based on market
    try {
      if (market === 'TR') {
        // iyzico payment
        return await initIyzicoPayment(order, cart.items, address, total);
      } else {
        // Stripe payment
        return await initStripePayment(order, cart.items, address, total);
      }
    } catch (paymentError) {
      console.error('Payment initialization error:', paymentError);
      // Mark order as failed
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', notes: 'Ödeme başlatılamadı' })
        .eq('id', order.id);
      
      const errorMessage = paymentError instanceof Error ? paymentError.message : 'Bilinmeyen hata';
      return NextResponse.json({ 
        error: `Ödeme başlatılamadı: ${errorMessage}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: `Bir hata oluştu: ${errorMessage}` }, { status: 500 });
  }
}

async function initIyzicoPayment(
  order: { id: string; order_number: string },
  items: CartItem[],
  address: CheckoutRequest['address'],
  total: number
) {
  const Iyzipay = require('iyzipay');
  
  const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL,
  });

  const basketItems = items.map((item, index) => ({
    id: item.productId,
    name: item.name.substring(0, 50),
    category1: 'Tekstil',
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: (item.price * item.quantity).toFixed(2),
  }));

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: order.id,
    price: total.toFixed(2),
    paidPrice: total.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: order.order_number,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/iyzico/callback`,
    enabledInstallments: [1, 2, 3, 6],
    buyer: {
      id: 'GUEST',
      name: address.firstName,
      surname: address.lastName,
      email: address.email,
      gsmNumber: address.phone,
      identityNumber: '11111111111', // Required by iyzico
      registrationAddress: address.addressLine1,
      city: address.city,
      country: 'Turkey',
      ip: '127.0.0.1',
    },
    shippingAddress: {
      contactName: `${address.firstName} ${address.lastName}`,
      city: address.city,
      country: 'Turkey',
      address: address.addressLine1,
    },
    billingAddress: {
      contactName: `${address.firstName} ${address.lastName}`,
      city: address.city,
      country: 'Turkey',
      address: address.addressLine1,
    },
    basketItems,
  };

  return new Promise<NextResponse>((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: Error, result: { status: string; errorMessage?: string; checkoutFormContent: string; paymentPageUrl: string }) => {
      if (err || result.status !== 'success') {
        console.error('iyzico error:', err || result);
        const errorDetail = err?.message || result?.errorMessage || 'iyzico bağlantı hatası';
        reject(new Error(`iyzico: ${errorDetail}`));
        return;
      }

      resolve(NextResponse.json({
        success: true,
        paymentPageUrl: result.paymentPageUrl,
        orderId: order.id,
      }));
    });
  });
}

async function initStripePayment(
  order: { id: string; order_number: string },
  items: CartItem[],
  address: CheckoutRequest['address'],
  total: number
) {
  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.salesModel === 'meter' ? 1 : item.quantity,
      ...(item.salesModel === 'meter' && {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} (${item.quantity}m)`,
          },
          unit_amount: Math.round(item.price * item.quantity * 100),
        },
      }),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: address.email,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH'],
      },
    });

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ payment_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Stripe bağlantı hatası';
    throw new Error(`Stripe: ${errorMessage}`);
  }
}
