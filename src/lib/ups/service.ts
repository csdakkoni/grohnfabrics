// UPS Service - Rate Calculation and Shipment Creation

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAccessToken, getUPSBaseUrl, getAccountNumber } from './auth';
import { parseUPSError, validateShipFromAddress, UPSError } from './errors';
import type { 
  UPSAddress, 
  UPSPackage, 
  UPSRateRequest, 
  UPSRateResponse,
  UPSShipmentRequest,
  UPSShipmentResponse,
  CompanyInfo
} from './types';

// Turkish character sanitization for UPS API
function sanitizeText(text: string, maxLength: number = 35): string {
  return text
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .trim()
    .substring(0, maxLength);
}

// Phone number cleanup
function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '').slice(-10) || '5551234567';
}

// Get company info from Supabase
// ÖNEMLİ: Fiziki gönderim her zaman Türkiye'den yapılır
// Bu nedenle ShipFrom için HER ZAMAN TR şirketi kullanılır
// (marketId sadece fatura için kullanılır, kargo için değil)
async function getCompanyInfo(): Promise<CompanyInfo> {
  // Türkiye UPS hesabı kullanıldığı için ShipFrom her zaman TR
  const companyCode = 'TR';
  
  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('code', companyCode)
    .single();
  
  if (error || !company) {
    throw new UPSError(
      'MISSING_COMPANY',
      `Company with code ${companyCode} not found`,
      'TR şirket bilgileri bulunamadı. Admin panelinden Türkiye şirket bilgilerini ekleyin.'
    );
  }
  
  // Validate required fields
  validateShipFromAddress(company);
  
  return company as CompanyInfo;
}

// Build UPS Address object from company info
function buildShipFromAddress(company: CompanyInfo): UPSAddress {
  const address = company.address || {};
  const contact = company.contact || {};
  
  return {
    name: sanitizeText(company.name),
    attentionName: sanitizeText(company.legal_name || company.name),
    phone: sanitizePhone(contact.phone || ''),
    addressLine1: sanitizeText(address.street || '', 35),
    city: sanitizeText(address.city || '', 30),
    stateProvinceCode: sanitizeText(address.state || address.city || '', 5),
    postalCode: address.postal_code || '',
    countryCode: getCountryCode(address.country || 'Turkey'),
  };
}

// Map country names to ISO codes
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'Turkey': 'TR',
    'Türkiye': 'TR',
    'United States': 'US',
    'USA': 'US',
    'Germany': 'DE',
    'France': 'FR',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Switzerland': 'CH',
    'Australia': 'AU',
    'Canada': 'CA',
    'Italy': 'IT',
    'Spain': 'ES',
  };
  
  // Check if it's already a 2-letter code
  if (country.length === 2) {
    return country.toUpperCase();
  }
  
  return countryMap[country] || country.substring(0, 2).toUpperCase();
}

// UPS Service Codes
const UPS_SERVICES = {
  // Domestic Turkey
  'TR_STANDARD': '011',      // UPS Standard
  'TR_EXPRESS': '07',        // UPS Express
  
  // International
  'INTL_SAVER': '65',        // UPS Worldwide Saver
  'INTL_EXPRESS': '07',      // UPS Worldwide Express
  'INTL_EXPEDITED': '08',    // UPS Worldwide Expedited
};

/**
 * Calculate shipping rates from UPS
 */
export async function calculateRate(request: UPSRateRequest): Promise<UPSRateResponse> {
  try {
    const token = await getAccessToken();
    const baseUrl = getUPSBaseUrl();
    const accountNumber = getAccountNumber();
    
    const rateRequest = {
      RateRequest: {
        Request: {
          RequestOption: 'Shop', // Get all available rates
        },
        Shipment: {
          Shipper: {
            Name: request.shipFrom.name,
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [request.shipFrom.addressLine1],
              City: request.shipFrom.city,
              StateProvinceCode: request.shipFrom.stateProvinceCode,
              PostalCode: request.shipFrom.postalCode,
              CountryCode: request.shipFrom.countryCode,
            },
          },
          ShipTo: {
            Name: request.shipTo.name,
            Address: {
              AddressLine: [request.shipTo.addressLine1],
              City: request.shipTo.city,
              StateProvinceCode: request.shipTo.stateProvinceCode,
              PostalCode: request.shipTo.postalCode,
              CountryCode: request.shipTo.countryCode,
            },
          },
          ShipFrom: {
            Name: request.shipFrom.name,
            Address: {
              AddressLine: [request.shipFrom.addressLine1],
              City: request.shipFrom.city,
              StateProvinceCode: request.shipFrom.stateProvinceCode,
              PostalCode: request.shipFrom.postalCode,
              CountryCode: request.shipFrom.countryCode,
            },
          },
          Package: request.packages.map(pkg => ({
            PackagingType: { Code: '02' }, // Customer Supplied Package
            Dimensions: {
              UnitOfMeasurement: { Code: 'CM' },
              Length: String(pkg.length),
              Width: String(pkg.width),
              Height: String(pkg.height),
            },
            PackageWeight: {
              UnitOfMeasurement: { Code: 'KGS' },
              Weight: String(pkg.weight),
            },
          })),
        },
      },
    };
    
    console.log('[UPS Rate] Request:', JSON.stringify(rateRequest, null, 2));
    
    const response = await fetch(`${baseUrl}/api/rating/v1/Rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'transId': `rate-${Date.now()}`,
        'transactionSrc': 'grohnfabrics',
      },
      body: JSON.stringify(rateRequest),
    });
    
    const data = await response.json();
    console.log('[UPS Rate] Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok || data.response?.errors) {
      throw parseUPSError(data);
    }
    
    const ratedShipment = data.RateResponse?.RatedShipment;
    if (!ratedShipment) {
      return { success: false, rates: [], error: 'No rates available' };
    }
    
    const rates = (Array.isArray(ratedShipment) ? ratedShipment : [ratedShipment]).map((rate: Record<string, unknown>) => {
      const service = rate.Service as { Code: string; Description?: string };
      const totalCharges = rate.TotalCharges as { MonetaryValue: string; CurrencyCode: string };
      
      return {
        serviceCode: service.Code,
        serviceName: service.Description || `Service ${service.Code}`,
        totalCharge: parseFloat(totalCharges.MonetaryValue),
        currency: totalCharges.CurrencyCode,
      };
    });
    
    return { success: true, rates };
    
  } catch (error) {
    console.error('[UPS Rate] Error:', error);
    if (error instanceof UPSError) {
      return { success: false, rates: [], error: error.userMessage };
    }
    return { success: false, rates: [], error: 'Rate calculation failed' };
  }
}

/**
 * Create a shipment and get shipping label
 * NOT: Fiziki gönderim her zaman Türkiye'den yapılır (TR UPS hesabı)
 * marketId parametresi artık kullanılmıyor - ShipFrom her zaman TR
 */
export async function createShipment(
  orderId: string,
  _marketId: 'TR' | 'GLOBAL', // Artık kullanılmıyor, uyumluluk için tutuldu
  shipTo: UPSAddress,
  packages: UPSPackage[],
  description: string
): Promise<UPSShipmentResponse> {
  try {
    // Get company info from database (her zaman TR şirketi)
    const company = await getCompanyInfo();
    const shipFrom = buildShipFromAddress(company);
    
    const token = await getAccessToken();
    const baseUrl = getUPSBaseUrl();
    const accountNumber = getAccountNumber();
    
    // Determine service code based on destination
    const isDomestic = shipTo.countryCode === shipFrom.countryCode;
    const serviceCode = isDomestic ? UPS_SERVICES.TR_STANDARD : UPS_SERVICES.INTL_SAVER;
    const serviceName = isDomestic ? 'UPS Standard' : 'UPS Worldwide Saver';
    
    const shipmentRequest = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate',
          TransactionReference: {
            CustomerContext: orderId,
          },
        },
        Shipment: {
          Description: sanitizeText(description, 50),
          Shipper: {
            Name: shipFrom.name,
            AttentionName: shipFrom.attentionName,
            Phone: { Number: shipFrom.phone },
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [shipFrom.addressLine1],
              City: shipFrom.city,
              StateProvinceCode: shipFrom.stateProvinceCode,
              PostalCode: shipFrom.postalCode,
              CountryCode: shipFrom.countryCode,
            },
          },
          ShipTo: {
            Name: shipTo.name,
            AttentionName: shipTo.attentionName,
            Phone: { Number: shipTo.phone },
            Address: {
              AddressLine: [shipTo.addressLine1, shipTo.addressLine2].filter(Boolean),
              City: shipTo.city,
              StateProvinceCode: shipTo.stateProvinceCode,
              PostalCode: shipTo.postalCode,
              CountryCode: shipTo.countryCode,
            },
          },
          ShipFrom: {
            Name: shipFrom.name,
            AttentionName: shipFrom.attentionName,
            Phone: { Number: shipFrom.phone },
            Address: {
              AddressLine: [shipFrom.addressLine1],
              City: shipFrom.city,
              StateProvinceCode: shipFrom.stateProvinceCode,
              PostalCode: shipFrom.postalCode,
              CountryCode: shipFrom.countryCode,
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
            Code: serviceCode,
            Description: serviceName,
          },
          Package: packages.map(pkg => ({
            PackagingType: { Code: '02' },
            Dimensions: {
              UnitOfMeasurement: { Code: 'CM' },
              Length: String(pkg.length || 30),
              Width: String(pkg.width || 20),
              Height: String(pkg.height || 10),
            },
            PackageWeight: {
              UnitOfMeasurement: { Code: 'KGS' },
              Weight: String(pkg.weight || 1),
            },
          })),
        },
        LabelSpecification: {
          LabelImageFormat: { Code: 'PDF' },
          LabelStockSize: {
            Height: '6',
            Width: '4',
          },
        },
      },
    };
    
    console.log('[UPS Ship] Request:', JSON.stringify(shipmentRequest, null, 2));
    
    const response = await fetch(`${baseUrl}/api/shipments/v1/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'transId': orderId,
        'transactionSrc': 'grohnfabrics',
      },
      body: JSON.stringify(shipmentRequest),
    });
    
    const data = await response.json();
    console.log('[UPS Ship] Response status:', response.status);
    
    if (!response.ok) {
      console.error('[UPS Ship] Error response:', JSON.stringify(data, null, 2));
      throw parseUPSError(data);
    }
    
    const shipmentResults = data.ShipmentResponse?.ShipmentResults;
    if (!shipmentResults) {
      throw new UPSError(
        'INVALID_RESPONSE',
        'Invalid response from UPS API',
        'UPS yanıtı beklendiği gibi değil. Lütfen tekrar deneyin.'
      );
    }
    
    const trackingNumber = shipmentResults.ShipmentIdentificationNumber;
    const labelImage = shipmentResults.PackageResults?.[0]?.ShippingLabel?.GraphicImage;
    
    console.log('[UPS Ship] Success - Tracking:', trackingNumber);
    
    return {
      success: true,
      trackingNumber,
      labelImage,
      labelUrl: labelImage ? `data:application/pdf;base64,${labelImage}` : undefined,
    };
    
  } catch (error) {
    console.error('[UPS Ship] Error:', error);
    
    if (error instanceof UPSError) {
      return { success: false, error: error.userMessage };
    }
    
    const parsedError = parseUPSError(error);
    return { success: false, error: parsedError.userMessage };
  }
}

/**
 * Helper: Build ShipTo address from order shipping address
 */
export function buildShipToAddress(shippingAddress: Record<string, string>, guestInfo?: Record<string, string>): UPSAddress {
  const firstName = shippingAddress.firstName || guestInfo?.firstName || 'Customer';
  const lastName = shippingAddress.lastName || guestInfo?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return {
    name: sanitizeText(fullName),
    attentionName: sanitizeText(fullName),
    phone: sanitizePhone(shippingAddress.phone || guestInfo?.phone || ''),
    addressLine1: sanitizeText(shippingAddress.addressLine1 || '', 35),
    addressLine2: shippingAddress.addressLine2 ? sanitizeText(shippingAddress.addressLine2, 35) : undefined,
    city: sanitizeText(shippingAddress.city || '', 30),
    stateProvinceCode: sanitizeText(shippingAddress.state || shippingAddress.city || '', 5),
    postalCode: shippingAddress.postalCode || '',
    countryCode: getCountryCode(shippingAddress.country || ''),
  };
}
