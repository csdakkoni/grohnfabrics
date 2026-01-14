import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({
          success: true,
          message: 'Bu e-posta zaten kayıtlı',
          alreadySubscribed: true,
        });
      } else {
        // Reactivate subscription
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id);
        
        return NextResponse.json({
          success: true,
          message: 'Bülten aboneliğiniz yeniden aktifleştirildi',
        });
      }
    }

    // Create new subscription
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        is_active: true,
        subscribed_at: new Date().toISOString(),
        source: 'website',
      });

    if (error) {
      // Check if table doesn't exist - store in audit_logs as fallback
      if (error.code === '42P01') {
        await supabaseAdmin
          .from('audit_logs')
          .insert({
            action: 'newsletter_subscription',
            entity_type: 'newsletter',
            entity_id: email.toLowerCase(),
            old_data: null,
            new_data: {
              email: email.toLowerCase(),
              subscribed_at: new Date().toISOString(),
              source: 'website',
            },
            user_id: null,
            user_email: email.toLowerCase(),
          });
      } else {
        throw error;
      }
    }

    // In production, you might want to:
    // 1. Send a welcome email
    // 2. Add to email marketing platform (Mailchimp, Klaviyo, etc.)

    return NextResponse.json({
      success: true,
      message: 'Bülten aboneliğiniz başarıyla oluşturuldu',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Bülten aboneliğiniz iptal edildi',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
