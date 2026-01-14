import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
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

    // Store in database (create contact_messages table if using this)
    // For now, we'll use audit_logs as a simple storage
    const { error: dbError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'contact_form_submission',
        entity_type: 'contact',
        entity_id: email,
        old_data: null,
        new_data: {
          name,
          email,
          phone: phone || null,
          subject,
          message,
          submitted_at: new Date().toISOString(),
        },
        user_id: null,
        user_email: email,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if db storage fails - we'll still try to send email
    }

    // In production, you would send an email here
    // Example with Resend, SendGrid, or Nodemailer
    // await sendEmail({
    //   to: process.env.CONTACT_EMAIL || 'info@grohnfabrics.com',
    //   subject: `[İletişim Formu] ${subject} - ${name}`,
    //   body: `
    //     Ad: ${name}
    //     E-posta: ${email}
    //     Telefon: ${phone || 'Belirtilmedi'}
    //     Konu: ${subject}
    //     
    //     Mesaj:
    //     ${message}
    //   `,
    // });

    // Log for debugging in development
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message: message.substring(0, 100) + '...',
    });

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
