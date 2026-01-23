import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { generateShipmentNotificationEmail, getShipmentNotificationSubject } from '@/lib/email/templates/shipment-notification';
import { generateReviewRequestEmail, getReviewRequestSubject } from '@/lib/email/templates/review-request';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = body; // 'shipping' or 'review_request'

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get customer email
    const customerEmail = order.guest_email || order.guest_info?.email;
    const customerName = order.guest_info?.firstName || order.shipping_address?.first_name || 'Customer';
    
    if (!customerEmail) {
      return NextResponse.json({ error: 'No email found for order' }, { status: 400 });
    }

    // Determine locale from order
    const locale = order.market_id === 'TR' ? 'tr' : 'en';

    let emailHtml: string;
    let subject: string;

    if (type === 'shipping') {
      // Shipping notification
      emailHtml = generateShipmentNotificationEmail({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName,
        trackingNumber: order.tracking_number,
        shippingProvider: order.shipping_provider || 'ups',
        locale,
      });
      subject = getShipmentNotificationSubject(order.order_number, locale);
    } else if (type === 'review_request') {
      // Review request email
      emailHtml = generateReviewRequestEmail({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName,
        locale,
      });
      subject = getReviewRequestSubject(locale);
    } else {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'Grohn Fabrics <noreply@grohnfabrics.com>',
      to: [customerEmail],
      subject,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      type,
    });

  } catch (error) {
    console.error('Notify API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
