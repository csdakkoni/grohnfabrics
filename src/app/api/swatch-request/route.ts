import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      address,
      city,
      country,
      postalCode,
      productId,
      productName,
      selectedColors,
      notes,
    } = body;

    // Validate required fields
    if (!name || !email || !address || !city || !country || !postalCode || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to database
    const { data: swatchRequest, error: dbError } = await supabaseAdmin
      .from('swatch_requests')
      .insert({
        name,
        email,
        address,
        city,
        country,
        postal_code: postalCode,
        product_id: productId,
        product_name: productName,
        selected_colors: selectedColors || [],
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB save fails - we still want to send the email
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: 'Grohn Fabrics <noreply@grohnfabrics.com>',
        to: ['grohn@grohn.com.tr'],
        subject: `New Swatch Request: ${productName}`,
        html: `
          <h2>New Swatch Request</h2>
          <p><strong>Product:</strong> ${productName}</p>
          <p><strong>Colors:</strong> ${selectedColors?.join(', ') || 'Not specified'}</p>
          <hr />
          <h3>Shipping Address</h3>
          <p>
            ${name}<br />
            ${address}<br />
            ${city}, ${postalCode}<br />
            ${country}
          </p>
          <p><strong>Email:</strong> ${email}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <hr />
          <p><small>Request ID: ${swatchRequest?.id || 'N/A'}</small></p>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    try {
      await resend.emails.send({
        from: 'Grohn Fabrics <noreply@grohnfabrics.com>',
        to: [email],
        subject: 'Your Swatch Request Confirmation - Grohn Fabrics',
        html: `
          <h2>Thank you for your swatch request!</h2>
          <p>Dear ${name},</p>
          <p>We've received your request for fabric swatches. Your samples will be shipped within 1-2 business days.</p>
          
          <h3>Order Details</h3>
          <p><strong>Product:</strong> ${productName}</p>
          ${selectedColors?.length > 0 ? `<p><strong>Colors:</strong> ${selectedColors.join(', ')}</p>` : ''}
          
          <h3>Shipping Address</h3>
          <p>
            ${address}<br />
            ${city}, ${postalCode}<br />
            ${country}
          </p>
          
          <p>Estimated delivery: 5-10 business days</p>
          
          <p>If you have any questions, feel free to reply to this email.</p>
          
          <p>Best regards,<br />The Grohn Fabrics Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Customer email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Swatch request submitted successfully',
      id: swatchRequest?.id,
    });
  } catch (error) {
    console.error('Swatch request error:', error);
    return NextResponse.json(
      { error: 'Failed to process swatch request' },
      { status: 500 }
    );
  }
}

// GET - List swatch requests (admin only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabaseAdmin
    .from('swatch_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data });
}
