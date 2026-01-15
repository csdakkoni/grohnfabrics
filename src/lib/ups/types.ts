// UPS API TypeScript Types

export type UPSEnvironment = 'test' | 'live';

export interface UPSConfig {
  clientId: string;
  clientSecret: string;
  accountNumber: string;
  environment: UPSEnvironment;
}

export interface UPSAddress {
  name: string;
  attentionName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvinceCode: string;
  postalCode: string;
  countryCode: string;
}

export interface UPSPackage {
  weight: number; // kg
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface UPSRateRequest {
  shipFrom: UPSAddress;
  shipTo: UPSAddress;
  packages: UPSPackage[];
  serviceCode?: string; // Optional, for specific service
}

export interface UPSRateResponse {
  success: boolean;
  rates: {
    serviceCode: string;
    serviceName: string;
    totalCharge: number;
    currency: string;
    estimatedDelivery?: string;
  }[];
  error?: string;
}

export interface UPSShipmentRequest {
  shipFrom: UPSAddress;
  shipTo: UPSAddress;
  packages: UPSPackage[];
  serviceCode: string;
  description: string;
  reference?: string;
}

export interface UPSShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  labelImage?: string; // Base64 PDF
  labelUrl?: string;
  error?: string;
}

export interface UPSTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  issued_at: number;
}

// Company info from Supabase
export interface CompanyInfo {
  id: string;
  code: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  } | null;
}
