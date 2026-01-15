// UPS OAuth 2.0 Authentication with Token Caching

import { UPSError } from './errors';
import type { UPSEnvironment, UPSTokenResponse } from './types';

// Token cache - in-memory (resets on cold start, but that's fine for serverless)
let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

// Get base URL based on environment
export function getUPSBaseUrl(): string {
  const env = (process.env.UPS_ENV || 'test') as UPSEnvironment;
  
  if (env === 'live') {
    return 'https://onlinetools.ups.com';
  }
  
  // Default to test/sandbox
  return 'https://wwwcie.ups.com';
}

// Validate required environment variables
function validateConfig(): { clientId: string; clientSecret: string; accountNumber: string } {
  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;
  const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
  
  if (!clientId) {
    throw new UPSError(
      'MISSING_CONFIG',
      'UPS_CLIENT_ID is not set',
      'UPS API yapılandırması eksik. Vercel environment variables kontrol edin.'
    );
  }
  
  if (!clientSecret) {
    throw new UPSError(
      'MISSING_CONFIG',
      'UPS_CLIENT_SECRET is not set',
      'UPS API yapılandırması eksik. Vercel environment variables kontrol edin.'
    );
  }
  
  if (!accountNumber) {
    throw new UPSError(
      'MISSING_CONFIG',
      'UPS_ACCOUNT_NUMBER is not set',
      'UPS hesap numarası eksik. Vercel environment variables kontrol edin.'
    );
  }
  
  return { clientId, clientSecret, accountNumber };
}

// Get OAuth access token (with caching)
export async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = validateConfig();
  
  // Check if we have a valid cached token
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    // Token is valid for at least 1 more minute
    return cachedToken.accessToken;
  }
  
  // Request new token
  const baseUrl = getUPSBaseUrl();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  console.log('[UPS Auth] Requesting new access token from:', baseUrl);
  
  try {
    const response = await fetch(`${baseUrl}/security/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
        'x-merchant-id': process.env.UPS_ACCOUNT_NUMBER || '',
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[UPS Auth] Token request failed:', response.status, errorText);
      throw new UPSError(
        'AUTH_FAILED',
        `Token request failed: ${response.status} - ${errorText}`,
        'UPS kimlik doğrulaması başarısız. API anahtarlarını kontrol edin.'
      );
    }
    
    const data: UPSTokenResponse = await response.json();
    
    // Cache the token
    cachedToken = {
      accessToken: data.access_token,
      // expires_in is in seconds, convert to milliseconds and subtract 5 minutes for safety
      expiresAt: now + (data.expires_in * 1000) - 300000,
    };
    
    console.log('[UPS Auth] Token obtained successfully, expires in:', data.expires_in, 'seconds');
    
    return data.access_token;
    
  } catch (error) {
    if (error instanceof UPSError) {
      throw error;
    }
    
    console.error('[UPS Auth] Network error:', error);
    throw new UPSError(
      'NETWORK_ERROR',
      String(error),
      'UPS sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.'
    );
  }
}

// Get account number
export function getAccountNumber(): string {
  const { accountNumber } = validateConfig();
  return accountNumber;
}

// Clear token cache (useful for testing)
export function clearTokenCache(): void {
  cachedToken = null;
}
