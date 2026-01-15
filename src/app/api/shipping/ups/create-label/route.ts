import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// UPS Base URL - Test: https://wwwcie.ups.com, Live: https://onlinetools.ups.com
const UPS_BASE_URL = process.env.UPS_BASE_URL || 'https://wwwcie.ups.com';

// UPS OAuth token al
async function getUPSToken(): Promise<string> {
  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('UPS API bilgileri eksik');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${UPS_BASE_URL}/security/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('UPS OAuth error:', error);
    throw new Error('UPS token alınamadı');
  }

  const data = await response.json();
  return data.access_token;
}

// Şirket bilgilerini al (gönderici adresi)
async function getCompanyInfo(market: string) {
  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('code', market === 'TR' ? 'TR' : 'US')
    .single();

  if (!company) {
    throw new Error('Şirket bilgileri bulunamadı');
  }

  return company;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    // Sipariş bilgilerini al
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Eğer zaten etiket oluşturulmuşsa
    if (order.shipping_label_url) {
      return NextResponse.json({ 
        success: true, 
        labelUrl: order.shipping_label_url,
        trackingNumber: order.tracking_number,
        message: 'Etiket zaten oluşturulmuş'
      });
    }

    const shippingAddress = order.shipping_address as Record<string, string>;
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Teslimat adresi bulunamadı' }, { status: 400 });
    }

    // Şirket bilgilerini al
    const company = await getCompanyInfo(order.market_id);
    const companyAddress = company.address as Record<string, string>;
    const companyContact = company.contact as Record<string, string>;

    // UPS token al
    const token = await getUPSToken();
    const accountNumber = process.env.UPS_ACCOUNT_NUMBER;

    if (!accountNumber) {
      return NextResponse.json({ error: 'UPS hesap numarası eksik' }, { status: 500 });
    }

    // Ülke kodunu belirle
    const countryCodeMap: Record<string, string> = {
      'Turkey': 'TR',
      'Türkiye': 'TR',
      'United States': 'US',
      'USA': 'US',
      'Germany': 'DE',
      'France': 'FR',
      'United Kingdom': 'GB',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Austria': 'AT',
      'Switzerland': 'CH',
      'Australia': 'AU',
      'Canada': 'CA',
    };

    const shipToCountry = countryCodeMap[shippingAddress.country] || shippingAddress.country?.substring(0, 2).toUpperCase() || 'TR';
    const shipFromCountry = countryCodeMap[companyAddress?.country || 'Turkey'] || 'TR';

    // State değerlerini belirle - US için zorunlu, diğerleri için şehir kullan
    const getStateCode = (state: string | undefined, city: string | undefined, country: string): string => {
      if (state && state.trim()) return state.trim();
      if (country === 'US') return 'NY'; // US için default
      return city || 'Istanbul'; // Diğer ülkeler için şehir adı
    };

    const shipperState = getStateCode(companyAddress?.state, companyAddress?.city, shipFromCountry);
    const shipToState = getStateCode(shippingAddress.state, shippingAddress.city, shipToCountry);

    // Türkçe karakterleri ASCII'ye çevir (UPS bazen sorun çıkarıyor)
    const sanitizeName = (name: string): string => {
      return name
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .trim()
        .substring(0, 35); // UPS max 35 karakter
    };

    // Gönderici bilgileri - boş olmamalı
    const shipperName = sanitizeName(company.name || 'Grohn Fabrics');
    const shipperAttentionName = sanitizeName(company.legal_name || company.name || 'Operations Manager');

    console.log('Ship From:', { 
      country: shipFromCountry, 
      state: shipperState, 
      city: companyAddress?.city,
      name: shipperName,
      attentionName: shipperAttentionName
    });
    console.log('Ship To:', { country: shipToCountry, state: shipToState, city: shippingAddress.city });

    // UPS Shipment Request
    const shipmentRequest = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate', // validate yerine nonvalidate - daha esnek
          TransactionReference: {
            CustomerContext: order.order_number,
          },
        },
        Shipment: {
          Description: `Order ${order.order_number}`.substring(0, 50),
          Shipper: {
            Name: shipperName,
            AttentionName: shipperAttentionName,
            Phone: {
              Number: (companyContact?.phone || '5551234567').replace(/[^0-9]/g, '').slice(-10),
            },
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [sanitizeName(companyAddress?.street || 'Default Address')],
              City: sanitizeName(companyAddress?.city || 'Istanbul'),
              StateProvinceCode: sanitizeName(shipperState),
              PostalCode: companyAddress?.postal_code || '34000',
              CountryCode: shipFromCountry,
            },
          },
          ShipTo: {
            Name: sanitizeName(`${shippingAddress.firstName || 'Customer'} ${shippingAddress.lastName || ''}`),
            AttentionName: sanitizeName(`${shippingAddress.firstName || 'Customer'} ${shippingAddress.lastName || ''}`),
            Phone: {
              Number: (order.guest_info?.phone || shippingAddress.phone || '5551234567').replace(/[^0-9]/g, '').slice(-10),
            },
            Address: {
              AddressLine: [shippingAddress.addressLine1, shippingAddress.addressLine2]
                .filter(Boolean)
                .map(line => sanitizeName(line || '')),
              City: sanitizeName(shippingAddress.city || 'Istanbul'),
              StateProvinceCode: shipToState,
              PostalCode: shippingAddress.postalCode || '34000',
              CountryCode: shipToCountry,
            },
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: '01', // Transportation
              BillShipper: {
                AccountNumber: accountNumber,
              },
            },
          },
          Service: {
            Code: shipToCountry === 'TR' ? '011' : '65', // TR: UPS Standard, International: UPS Saver
            Description: shipToCountry === 'TR' ? 'UPS Standard' : 'UPS Worldwide Saver',
          },
          Package: {
            PackagingType: {
              Code: '02', // 02 = Customer Supplied Package
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'CM',
              },
              Length: '30',
              Width: '20',
              Height: '10',
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'KGS',
              },
              Weight: '1.0',
            },
          },
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: 'PDF',
          },
          LabelStockSize: {
            Height: '6',
            Width: '4',
          },
        },
      },
    };

    console.log('UPS Request:', JSON.stringify(shipmentRequest, null, 2));

    // UPS API'ye istek gönder
    const upsResponse = await fetch(`${UPS_BASE_URL}/api/shipments/v1/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'transId': order.id,
        'transactionSrc': 'grohnfabrics',
      },
      body: JSON.stringify(shipmentRequest),
    });

    const upsData = await upsResponse.json();
    console.log('UPS Response:', JSON.stringify(upsData, null, 2));

    if (!upsResponse.ok || upsData.response?.errors) {
      const errorMessage = upsData.response?.errors?.[0]?.message || 'UPS API hatası';
      console.error('UPS API Error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Başarılı yanıtı işle
    const shipmentResult = upsData.ShipmentResponse?.ShipmentResults;
    if (!shipmentResult) {
      return NextResponse.json({ error: 'UPS yanıtı beklendiği gibi değil' }, { status: 500 });
    }

    const trackingNumber = shipmentResult.ShipmentIdentificationNumber;
    const labelImage = shipmentResult.PackageResults?.[0]?.ShippingLabel?.GraphicImage;

    // Label'ı base64'ten decode et ve URL oluştur
    let labelUrl = '';
    if (labelImage) {
      // Base64 PDF'i data URL'e çevir
      labelUrl = `data:application/pdf;base64,${labelImage}`;
    }

    // Siparişi güncelle
    await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        shipping_provider: 'UPS',
        shipping_label_url: labelUrl,
        shipped_at: new Date().toISOString(),
        status: order.status === 'processing' ? 'shipped' : order.status,
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      trackingNumber,
      labelUrl,
      message: 'Kargo etiketi oluşturuldu',
    });

  } catch (error) {
    console.error('UPS Label Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
