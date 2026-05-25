/**
 * Generates a clean URL slug from any string, mapping Turkish characters
 * (like ş, ç, ğ, ı, ö, ü) to their ASCII equivalents.
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  const trMap: Record<string, string> = {
    'Ş': 's', 'ş': 's',
    'Ç': 'c', 'ç': 'c',
    'Ğ': 'g', 'ğ': 'g',
    'İ': 'i', 'ı': 'i', 'I': 'i',
    'Ö': 'o', 'ö': 'o',
    'Ü': 'u', 'ü': 'u'
  };
  
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
