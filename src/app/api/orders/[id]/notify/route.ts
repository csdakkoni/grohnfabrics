import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendShippingNotificationEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { type } = await request.json();

    if (type !== 'shipping') {
      return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    // Fetch order with items
    const { data: order, error } = await supabaseAdmin
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
        tracking_number,
        market_id,
        order_items:order_items(product_name, quantity, unit_price, unit_type)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.guest_email) {
      return NextResponse.json({ error: 'No email address' }, { status: 400 });
    }

    const shippingAddress = order.shipping_address as { 
      addressLine1: string; 
      city: string; 
      country: string; 
      postalCode: string;
    };
    const guestInfo = order.guest_info as { firstName: string; lastName: string };

    // Determine locale based on market
    const locale = order.market_id === 'TR' ? 'tr' : 'en';

    // Generate UPS tracking URL
    const trackingUrl = order.tracking_number 
      ? `https://www.ups.com/track?tracknum=${order.tracking_number}`
      : undefined;

    const result = await sendShippingNotificationEmail({
      orderNumber: order.order_number,
      customerName: `${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`.trim() || (locale === 'tr' ? 'Müşteri' : 'Customer'),
      email: order.guest_email,
      items: (order.order_items || []).map((item: { 
        product_name: string; 
        quantity: number; 
        unit_price: number; 
        unit_type: string;
      }) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price * item.quantity,
        unit: item.unit_type === 'meter' ? 'm' : (locale === 'tr' ? 'adet' : 'pcs'),
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
      trackingNumber: order.tracking_number || undefined,
      trackingUrl,
    }, locale);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
