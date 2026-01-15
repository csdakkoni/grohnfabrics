// UPS Error Handling

export class UPSError extends Error {
  code: string;
  userMessage: string;
  
  constructor(code: string, message: string, userMessage: string) {
    super(message);
    this.name = 'UPSError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

// Common UPS error codes and user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'AUTH_FAILED': 'UPS kimlik doğrulaması başarısız. Lütfen API anahtarlarını kontrol edin.',
  'TOKEN_EXPIRED': 'UPS oturum süresi doldu. Lütfen tekrar deneyin.',
  
  // Address errors
  'INVALID_SHIPPER_NAME': 'Gönderici şirket adı eksik veya geçersiz. Admin panelinden şirket bilgilerini doldurun.',
  'INVALID_SHIPPER_ATTENTION': 'Gönderici ilgili kişi adı eksik. Admin panelinden "Resmi Unvan" alanını doldurun.',
  'INVALID_SHIPPER_ADDRESS': 'Gönderici adresi eksik veya geçersiz. Admin panelinden adres bilgilerini kontrol edin.',
  'INVALID_SHIPPER_PHONE': 'Gönderici telefon numarası eksik veya geçersiz.',
  'INVALID_SHIPTO_ADDRESS': 'Alıcı adresi eksik veya geçersiz.',
  'INVALID_SHIPTO_STATE': 'Alıcı eyalet/il bilgisi eksik veya geçersiz.',
  'INVALID_POSTAL_CODE': 'Posta kodu geçersiz.',
  
  // Package errors
  'INVALID_PACKAGE_WEIGHT': 'Paket ağırlığı geçersiz.',
  'INVALID_PACKAGE_DIMENSIONS': 'Paket boyutları geçersiz.',
  
  // Service errors
  'SERVICE_UNAVAILABLE': 'Seçilen kargo servisi bu güzergah için mevcut değil.',
  'RATE_NOT_AVAILABLE': 'Bu güzergah için fiyat bilgisi alınamadı.',
  
  // General errors
  'NETWORK_ERROR': 'UPS sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.',
  'UNKNOWN_ERROR': 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
};

export function parseUPSError(error: unknown): UPSError {
  // Handle UPS API response errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // UPS API error format
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      const errors = response.errors as Array<{ code?: string; message?: string }> | undefined;
      
      if (errors && errors.length > 0) {
        const firstError = errors[0];
        const code = firstError.code || 'UNKNOWN_ERROR';
        const message = firstError.message || 'Unknown error';
        
        // Map specific UPS error messages to our error codes
        const userMessage = mapUPSErrorToUserMessage(message);
        
        return new UPSError(code, message, userMessage);
      }
    }
    
    // Handle string error message
    if (err.message && typeof err.message === 'string') {
      const userMessage = mapUPSErrorToUserMessage(err.message);
      return new UPSError('API_ERROR', err.message, userMessage);
    }
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    const userMessage = mapUPSErrorToUserMessage(error.message);
    return new UPSError('ERROR', error.message, userMessage);
  }
  
  // Fallback
  return new UPSError('UNKNOWN_ERROR', String(error), ERROR_MESSAGES['UNKNOWN_ERROR']);
}

function mapUPSErrorToUserMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Map common UPS error patterns
  if (lowerMessage.includes('attention name')) {
    return ERROR_MESSAGES['INVALID_SHIPPER_ATTENTION'];
  }
  if (lowerMessage.includes('ship from') && lowerMessage.includes('name')) {
    return ERROR_MESSAGES['INVALID_SHIPPER_NAME'];
  }
  if (lowerMessage.includes('ship to') && lowerMessage.includes('state')) {
    return ERROR_MESSAGES['INVALID_SHIPTO_STATE'];
  }
  if (lowerMessage.includes('address')) {
    return ERROR_MESSAGES['INVALID_SHIPPER_ADDRESS'];
  }
  if (lowerMessage.includes('phone')) {
    return ERROR_MESSAGES['INVALID_SHIPPER_PHONE'];
  }
  if (lowerMessage.includes('postal') || lowerMessage.includes('zip')) {
    return ERROR_MESSAGES['INVALID_POSTAL_CODE'];
  }
  if (lowerMessage.includes('weight')) {
    return ERROR_MESSAGES['INVALID_PACKAGE_WEIGHT'];
  }
  if (lowerMessage.includes('dimension')) {
    return ERROR_MESSAGES['INVALID_PACKAGE_DIMENSIONS'];
  }
  if (lowerMessage.includes('service')) {
    return ERROR_MESSAGES['SERVICE_UNAVAILABLE'];
  }
  if (lowerMessage.includes('rate')) {
    return ERROR_MESSAGES['RATE_NOT_AVAILABLE'];
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('timeout') || lowerMessage.includes('econnrefused')) {
    return ERROR_MESSAGES['NETWORK_ERROR'];
  }
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return ERROR_MESSAGES['AUTH_FAILED'];
  }
  
  // Return original message if no pattern matches
  return message || ERROR_MESSAGES['UNKNOWN_ERROR'];
}

export function validateShipFromAddress(company: Record<string, unknown> | null): void {
  if (!company) {
    throw new UPSError(
      'MISSING_COMPANY',
      'Company info not found in database',
      'Şirket bilgileri bulunamadı. Admin panelinden şirket bilgilerini ekleyin.'
    );
  }
  
  const name = company.name as string | undefined;
  const legalName = company.legal_name as string | undefined;
  const address = company.address as Record<string, string> | null;
  const contact = company.contact as Record<string, string> | null;
  
  if (!name || name.trim().length < 2) {
    throw new UPSError(
      'INVALID_SHIPPER_NAME',
      'Company name is missing or too short',
      ERROR_MESSAGES['INVALID_SHIPPER_NAME']
    );
  }
  
  if (!legalName || legalName.trim().length < 2) {
    throw new UPSError(
      'INVALID_SHIPPER_ATTENTION',
      'Legal name (AttentionName) is missing or too short',
      ERROR_MESSAGES['INVALID_SHIPPER_ATTENTION']
    );
  }
  
  if (!address || !address.street || !address.city || !address.postal_code) {
    throw new UPSError(
      'INVALID_SHIPPER_ADDRESS',
      'Company address is incomplete',
      ERROR_MESSAGES['INVALID_SHIPPER_ADDRESS']
    );
  }
  
  if (!contact || !contact.phone) {
    throw new UPSError(
      'INVALID_SHIPPER_PHONE',
      'Company phone is missing',
      ERROR_MESSAGES['INVALID_SHIPPER_PHONE']
    );
  }
}
