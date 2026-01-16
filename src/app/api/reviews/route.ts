import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';
    const productId = searchParams.get('productId');
    const minRating = parseInt(searchParams.get('minRating') || '4');
    const category = searchParams.get('category'); // curtain, fabric, sample, general

    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .gte('rating', minRating)
      .order('review_date', { ascending: false })
      .limit(limit);

    // Filter by featured
    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Filter by product if specified
    if (productId) {
      query = query.eq('product_id', productId);
    }

    // Filter by category keyword (for product pages)
    if (category) {
      query = query.eq('category_keyword', category);
    }

    // Only get reviews with comments for carousel
    query = query.not('comment', 'is', null);

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Reviews fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Calculate stats
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('is_approved', true);

    const stats = {
      total: allReviews?.length || 0,
      averageRating: allReviews
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : '5.0',
      fiveStarCount: allReviews?.filter(r => r.rating === 5).length || 0,
    };

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
