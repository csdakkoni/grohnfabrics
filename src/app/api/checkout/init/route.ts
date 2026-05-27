import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// iyzipay dosyalarını Vercel'e dahil ettirmek için manuel import
// @ts-ignore
import Iyzipay from 'iyzipay';
// @ts-ignore
import 'iyzipay/lib/IyzipayResource';
// @ts-ignore  
import 'iyzipay/lib/resources/CheckoutFormInitialize';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

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
  coupon?: {
    id: string;
    code: string;
    discountAmount: number;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { cart, address, market, shippingCost, coupon } = body;

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = coupon?.discountAmount || 0;
    const total = subtotal + shippingCost - discountAmount;

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
        discount_amount: discountAmount,
        total_amount: total,
        status: 'pending',
        shipping_address: address,
        billing_address: address,
        payment_provider: market === 'TR' ? 'iyzico' : 'stripe',
        coupon_id: coupon?.id || null,
        coupon_code: coupon?.code || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });
    }

    // Record coupon usage if coupon was applied
    if (coupon?.id) {
      await supabaseAdmin
        .from('coupon_usages')
        .insert({
          coupon_id: coupon.id,
          order_id: order.id,
          customer_email: address.email.toLowerCase(),
          discount_applied: discountAmount,
        });
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

// iyzipay npm paketi ile ödeme - outputFileTracingIncludes ile Vercel'e dahil edildi
async function initIyzicoPayment(
  order: { id: string; order_number: string },
  items: CartItem[],
  address: CheckoutRequest['address'],
  total: number
) {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('iyzico API bilgileri eksik');
  }

  const iyzipay = new Iyzipay({
    apiKey: apiKey,
    secretKey: secretKey,
    uri: baseUrl,
  });

  // Ürün basketItems
  const productBasketItems = items.map((item) => ({
    id: item.productId.substring(0, 50),
    name: item.name.substring(0, 50),
    category1: 'Tekstil',
    category2: 'Kumaş',
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: (item.price * item.quantity).toFixed(2),
  }));

  // Kargo maliyetini de ekle (iyzico için tüm kırılımlar toplamı = price olmalı)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCostForIyzico = total - subtotal;
  
  const basketItems = shippingCostForIyzico > 0 
    ? [
        ...productBasketItems,
        {
          id: 'SHIPPING',
          name: 'Kargo Ücreti',
          category1: 'Hizmet',
          category2: 'Kargo',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: shippingCostForIyzico.toFixed(2),
        }
      ]
    : productBasketItems;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: order.id,
    price: total.toFixed(2),
    paidPrice: total.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: order.order_number,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/iyzico/callback`,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: 'BY' + order.id.substring(0, 20),
      name: address.firstName || 'Test',
      surname: address.lastName || 'User',
      gsmNumber: address.phone || '+905350000000',
      email: address.email || 'test@test.com',
      identityNumber: '74300864791',
      lastLoginDate: '2015-10-05 12:43:35',
      registrationDate: '2013-04-21 15:12:09',
      registrationAddress: address.addressLine1?.substring(0, 100) || 'Test Address',
      ip: '85.34.78.112',
      city: address.city || 'Istanbul',
      country: 'Turkey',
      zipCode: address.postalCode || '34732',
    },
    shippingAddress: {
      contactName: `${address.firstName || 'Test'} ${address.lastName || 'User'}`,
      city: address.city || 'Istanbul',
      country: 'Turkey',
      address: address.addressLine1?.substring(0, 100) || 'Test Address',
      zipCode: address.postalCode || '34732',
    },
    billingAddress: {
      contactName: `${address.firstName || 'Test'} ${address.lastName || 'User'}`,
      city: address.city || 'Istanbul',
      country: 'Turkey',
      address: address.addressLine1?.substring(0, 100) || 'Test Address',
      zipCode: address.postalCode || '34732',
    },
    basketItems,
  };

  console.log('iyzico request:', JSON.stringify(request, null, 2));

  return new Promise<NextResponse>((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: Error | null, result: {
      status: string;
      errorCode?: string;
      errorMessage?: string;
      paymentPageUrl?: string;
      checkoutFormContent?: string;
      token?: string;
    }) => {
      console.log('iyzico callback - err:', err);
      console.log('iyzico callback - result:', JSON.stringify(result));
      
      if (err) {
        console.error('iyzico SDK error:', err);
        reject(new Error(`iyzico: ${err.message}`));
        return;
      }
      
      if (result.status !== 'success') {
        console.error('iyzico error:', result);
        reject(new Error(`iyzico: ${result.errorMessage || result.errorCode || 'Bilinmeyen hata'}`));
        return;
      }

      resolve(NextResponse.json({
        success: true,
        paymentPageUrl: result.paymentPageUrl,
        checkoutFormContent: result.checkoutFormContent,
        token: result.token,
        orderId: order.id,
      }));
    });
  });
}

async function initStripePayment(
  order: { id: string; order_number: string },
  items: CartItem[],
  address: CheckoutRequest['address'],
  total: number,
  currency: string = 'usd'
) {
  try {
    const currencyLower = currency.toLowerCase();
    
    const lineItems = items.map(item => {
      if (item.salesModel === 'meter') {
        return {
          price_data: {
            currency: currencyLower,
            product_data: {
              name: `${item.name} (${item.quantity}m)`,
            },
            unit_amount: Math.round(item.price * item.quantity * 100),
          },
          quantity: 1,
        };
      }
      return {
        price_data: {
          currency: currencyLower,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Türkiye için shipping address collection'ı dahil et
    const isTurkey = currency.toUpperCase() === 'TRY';
    const allowedCountries = isTurkey 
      ? ['TR'] 
      : ['US', 'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH', 'AU', 'CA'];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: address.email,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        market: isTurkey ? 'TR' : 'GLOBAL',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,
      shipping_address_collection: {
        allowed_countries: allowedCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      // Automatic tax calculation (requires Stripe Tax to be enabled in Dashboard)
      automatic_tax: { enabled: true },
      // Auto-create invoice after payment
      invoice_creation: { enabled: true },
      // Allow EU customers to enter VAT numbers
      tax_id_collection: { enabled: true },
      // Auto-update customer info from checkout
      customer_update: { address: 'auto', name: 'auto' },
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
