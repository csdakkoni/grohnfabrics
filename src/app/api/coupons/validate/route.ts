import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface ValidateCouponRequest {
  code: string;
  email: string;
  orderTotal: number;
  market: 'TR' | 'GLOBAL';
  currency: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_customer_limit: number | null;
  market_id: string | null;
  currency: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  is_first_order_only: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponRequest = await request.json();
    const { code, email, orderTotal, market, currency } = body;

    if (!code || !email) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Kupon kodu ve e-posta gerekli' 
      }, { status: 400 });
    }

    // Fetch coupon
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Geçersiz kupon kodu' 
      });
    }

    const c = coupon as Coupon;

    // Check if active
    if (!c.is_active) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Bu kupon artık geçerli değil' 
      });
    }

    // Check dates
    const now = new Date();
    if (c.starts_at && new Date(c.starts_at) > now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Bu kupon henüz aktif değil' 
      });
    }

    if (c.expires_at && new Date(c.expires_at) < now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Bu kuponun süresi dolmuş' 
      });
    }

    // Check usage limit
    if (c.usage_limit !== null && c.usage_count >= c.usage_limit) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Bu kupon kullanım limitine ulaştı' 
      });
    }

    // Check per-customer limit
    if (c.per_customer_limit !== null) {
      const { count } = await supabaseAdmin
        .from('coupon_usages')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', c.id)
        .eq('customer_email', email.toLowerCase());

      if (count !== null && count >= c.per_customer_limit) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Bu kuponu daha fazla kullanamazsınız' 
        });
      }
    }

    // Check market restriction
    if (c.market_id && c.market_id !== market) {
      return NextResponse.json({ 
        valid: false, 
        error: market === 'TR' 
          ? 'Bu kupon sadece uluslararası siparişler için geçerli'
          : 'Bu kupon sadece Türkiye siparişleri için geçerli'
      });
    }

    // Check currency restriction
    if (c.currency && c.currency !== currency) {
      return NextResponse.json({ 
        valid: false, 
        error: `Bu kupon sadece ${c.currency} para birimi için geçerli` 
      });
    }

    // Check minimum order amount
    if (c.min_order_amount && orderTotal < c.min_order_amount) {
      const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum sipariş tutarı: ${currencySymbol}${c.min_order_amount}` 
      });
    }

    // Check first order only
    if (c.is_first_order_only) {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('guest_email', email.toLowerCase())
        .neq('status', 'cancelled');

      if (count !== null && count > 0) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Bu kupon sadece ilk sipariş için geçerli' 
        });
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (c.discount_type === 'percentage') {
      discountAmount = (orderTotal * c.discount_value) / 100;
      // Apply max discount cap if set
      if (c.max_discount_amount && discountAmount > c.max_discount_amount) {
        discountAmount = c.max_discount_amount;
      }
    } else {
      discountAmount = c.discount_value;
    }

    // Discount can't exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Bir hata oluştu' 
    }, { status: 500 });
  }
}
