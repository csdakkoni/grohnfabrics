import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

// GET - Fetch wishlist items
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    
    // Try to get authenticated user
    const cookieStore = await cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabaseAdmin
      .from('wishlists')
      .select(`
        id,
        product_id,
        created_at,
        product:products(
          id,
          slug,
          name_tr,
          name_en,
          thumbnail_url,
          images,
          product_type,
          sales_model,
          prices:product_prices(price, currency, market_id)
        )
      `)
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('customer_id', user.id);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return NextResponse.json({ items: [] });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Wishlist fetch error:', error);
      return NextResponse.json({ error: 'Favoriler yüklenemedi' }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { productId, sessionId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    // Check if user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Build insert data
    const insertData: {
      product_id: string;
      customer_id?: string;
      session_id?: string;
    } = {
      product_id: productId,
    };

    if (user) {
      insertData.customer_id = user.id;
    } else if (sessionId) {
      insertData.session_id = sessionId;
    } else {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 400 });
    }

    // Check if already in wishlist
    let existsQuery = supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('product_id', productId);

    if (user) {
      existsQuery = existsQuery.eq('customer_id', user.id);
    } else {
      existsQuery = existsQuery.eq('session_id', sessionId);
    }

    const { data: existing } = await existsQuery.maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Zaten favorilerde' });
    }

    // Insert
    const { error } = await supabaseAdmin
      .from('wishlists')
      .insert(insertData);

    if (error) {
      console.error('Wishlist insert error:', error);
      return NextResponse.json({ error: 'Favorilere eklenemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { productId, sessionId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    // Check if user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let deleteQuery = supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('product_id', productId);

    if (user) {
      deleteQuery = deleteQuery.eq('customer_id', user.id);
    } else if (sessionId) {
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    } else {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 400 });
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Wishlist delete error:', error);
      return NextResponse.json({ error: 'Favorilerden kaldırılamadı' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
