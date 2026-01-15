import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createShipment, buildShipToAddress, UPSError } from '@/lib/ups';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    // Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Check if label already exists
    if (order.shipping_label_url && order.tracking_number) {
      return NextResponse.json({
        success: true,
        trackingNumber: order.tracking_number,
        labelUrl: order.shipping_label_url,
        message: 'Etiket zaten oluşturulmuş',
      });
    }

    // Get shipping address
    const shippingAddress = order.shipping_address as Record<string, string>;
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Teslimat adresi bulunamadı' }, { status: 400 });
    }

    // Build ship-to address
    const guestInfo = order.guest_info as Record<string, string> | undefined;
    const shipTo = buildShipToAddress(shippingAddress, guestInfo);

    // Determine market
    const marketId = (order.market_id === 'TR' ? 'TR' : 'GLOBAL') as 'TR' | 'GLOBAL';

    // Default package dimensions (can be customized later)
    const packages = [{
      weight: 1,
      length: 30,
      width: 20,
      height: 10,
    }];

    // Create shipment
    const result = await createShipment(
      orderId,
      marketId,
      shipTo,
      packages,
      `Order ${order.order_number}`
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update order with tracking info
    await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: result.trackingNumber,
        shipping_provider: 'UPS',
        shipping_label_url: result.labelUrl,
        shipped_at: new Date().toISOString(),
        status: order.status === 'processing' ? 'shipped' : order.status,
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      message: 'Kargo etiketi oluşturuldu',
    });

  } catch (error) {
    console.error('[UPS Ship API] Error:', error);
    
    if (error instanceof UPSError) {
      return NextResponse.json({ error: error.userMessage }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
