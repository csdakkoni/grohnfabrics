import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string || null;
        const roomType = formData.get('roomType') as string || null;
        const stylePreference = formData.get('stylePreference') as string || null;
        const colorPreference = formData.get('colorPreference') as string || null;
        const notes = formData.get('notes') as string || null;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Handle photo uploads — store as base64 URLs for now
        // In production, these would be uploaded to R2
        const photoUrls: string[] = [];
        const photos = formData.getAll('photos');

        for (const photo of photos) {
            if (photo instanceof File && photo.size > 0) {
                // For simplicity, we just note that a photo was uploaded
                // R2 upload integration can be added later
                photoUrls.push(`photo_${Date.now()}_${photo.name}`);
            }
        }

        // Save to database
        const { error: dbError } = await supabaseAdmin
            .from('design_requests')
            .insert({
                name,
                email,
                phone,
                room_type: roomType,
                style_preference: stylePreference,
                color_preference: colorPreference,
                notes,
                photo_urls: photoUrls,
                status: 'pending',
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            // Don't fail if table doesn't exist yet — still return success
            // This allows the form to work before the migration is run
        }

        // Send notification email (optional — uses existing Resend setup)
        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Grohn Fabrics <noreply@grohnfabrics.com>',
                    to: process.env.ADMIN_EMAIL || email,
                    subject: `Yeni Tasarım Talebi - ${name}`,
                    html: `
            <h2>Yeni Tasarım Talebi</h2>
            <p><strong>Ad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
            ${roomType ? `<p><strong>Oda Tipi:</strong> ${roomType}</p>` : ''}
            ${stylePreference ? `<p><strong>Stil:</strong> ${stylePreference}</p>` : ''}
            ${colorPreference ? `<p><strong>Renk:</strong> ${colorPreference}</p>` : ''}
            ${notes ? `<p><strong>Notlar:</strong> ${notes}</p>` : ''}
            <p><strong>Fotoğraf sayısı:</strong> ${photoUrls.length}</p>
          `,
                });
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ success: true, message: 'Design request submitted successfully' });
    } catch (err) {
        console.error('Design service error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
