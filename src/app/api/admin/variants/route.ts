import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List all variant templates with their values
export async function GET() {
  try {
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('option_group_templates')
      .select('*')
      .order('sort_order');

    if (groupsError) {
      return NextResponse.json({ error: groupsError.message }, { status: 500 });
    }

    // Load values for each group
    const templatesWithValues = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: values } = await supabaseAdmin
          .from('option_value_templates')
          .select('*')
          .eq('template_id', group.id)
          .order('sort_order');
        return { ...group, values: values || [] };
      })
    );

    return NextResponse.json({ templates: templatesWithValues });
  } catch (error) {
    console.error('Variant templates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update a template group or value
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_group': {
        const { error } = await supabaseAdmin
          .from('option_group_templates')
          .insert({
            name_tr: data.name_tr,
            name_en: data.name_en,
            option_type: data.option_type,
            description: data.description || null,
            is_active: true,
            sort_order: data.sort_order || 0,
          });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'update_group': {
        const { error } = await supabaseAdmin
          .from('option_group_templates')
          .update({
            name_tr: data.name_tr,
            name_en: data.name_en,
            option_type: data.option_type,
            description: data.description || null,
          })
          .eq('id', data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'delete_group': {
        const { error } = await supabaseAdmin
          .from('option_group_templates')
          .delete()
          .eq('id', data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'create_value': {
        const { error } = await supabaseAdmin
          .from('option_value_templates')
          .insert({
            template_id: data.template_id,
            value_tr: data.value_tr,
            value_en: data.value_en,
            sku_suffix: data.sku_suffix || null,
            hex_color: data.hex_color || null,
            default_price_modifier: data.default_price_modifier || 0,
            is_active: true,
            sort_order: data.sort_order || 0,
          });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'update_value': {
        const { error } = await supabaseAdmin
          .from('option_value_templates')
          .update({
            value_tr: data.value_tr,
            value_en: data.value_en,
            sku_suffix: data.sku_suffix || null,
            hex_color: data.hex_color || null,
            default_price_modifier: data.default_price_modifier || 0,
          })
          .eq('id', data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'delete_value': {
        const { error } = await supabaseAdmin
          .from('option_value_templates')
          .delete()
          .eq('id', data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Variant templates POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
