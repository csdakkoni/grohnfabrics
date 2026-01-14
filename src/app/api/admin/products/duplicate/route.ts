import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get original product
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Generate new slug
    const timestamp = Date.now();
    const newSlug = `${original.slug}-kopya-${timestamp}`;

    // Create copy (without id, created_at, updated_at)
    const { id, created_at, updated_at, ...productData } = original;
    
    const newProduct = {
      ...productData,
      slug: newSlug,
      name_tr: `${original.name_tr} (Kopya)`,
      name_en: original.name_en ? `${original.name_en} (Copy)` : null,
      is_active: false, // Kopya varsayılan olarak pasif
      is_featured: false,
      images: original.images || [], // Görselleri de kopyala
      videos: original.videos || [],
    };

    const { data: createdProduct, error: createError } = await supabaseAdmin
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (createError || !createdProduct) {
      console.error('Create error:', createError);
      return NextResponse.json({ error: 'Failed to create copy' }, { status: 500 });
    }

    // Copy prices
    const { data: prices } = await supabaseAdmin
      .from('product_prices')
      .select('*')
      .eq('product_id', productId);

    if (prices && prices.length > 0) {
      const newPrices = prices.map(p => ({
        product_id: createdProduct.id,
        market_id: p.market_id,
        currency: p.currency,
        price: p.price,
      }));

      await supabaseAdmin
        .from('product_prices')
        .insert(newPrices);
    }

    // Copy option groups and values
    const { data: optionGroups } = await supabaseAdmin
      .from('option_groups')
      .select(`
        *,
        values:option_values(*)
      `)
      .eq('product_id', productId);

    if (optionGroups && optionGroups.length > 0) {
      for (const group of optionGroups) {
        // Create new option group
        const { id: groupId, product_id, created_at, updated_at, values, ...groupData } = group;
        
        const { data: newGroup } = await supabaseAdmin
          .from('option_groups')
          .insert({
            ...groupData,
            product_id: createdProduct.id,
          })
          .select()
          .single();

        // Copy option values
        if (newGroup && values && values.length > 0) {
          const newValues = values.map((v: any) => {
            const { id, option_group_id, created_at, updated_at, ...valueData } = v;
            return {
              ...valueData,
              option_group_id: newGroup.id,
            };
          });

          await supabaseAdmin
            .from('option_values')
            .insert(newValues);
        }
      }
    }

    return NextResponse.json({
      success: true,
      newProductId: createdProduct.id,
      message: 'Ürün başarıyla kopyalandı',
    });

  } catch (error) {
    console.error('Duplicate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
