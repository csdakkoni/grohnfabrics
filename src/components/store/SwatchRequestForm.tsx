'use client';

import { useState } from 'react';
import { Scissors, X, Check, Loader2, Package } from 'lucide-react';
import { useMarket } from '@/lib/market/context';

interface SwatchRequestFormProps {
  productId: string;
  productName: string;
  productImage?: string;
  colorOptions?: Array<{ id: string; name: string; hex?: string }>;
}

export default function SwatchRequestForm({
  productId,
  productName,
  productImage,
  colorOptions = [],
}: SwatchRequestFormProps) {
  const { t, region } = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    country: region === 'TR' ? 'Turkey' : 'United States',
    postalCode: '',
    selectedColors: [] as string[],
    notes: '',
  });

  const handleColorToggle = (colorId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter(id => id !== colorId)
        : prev.selectedColors.length < 3
          ? [...prev.selectedColors, colorId]
          : prev.selectedColors, // Max 3 colors
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/swatch-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productId,
          productName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          address: '',
          city: '',
          country: region === 'TR' ? 'Turkey' : 'United States',
          postalCode: '',
          selectedColors: [],
          notes: '',
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-xl font-medium hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
      >
        <Scissors className="w-5 h-5" />
        {t('Ücretsiz Numune İste', 'Request Free Swatch')}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t('Ücretsiz Numune Talebi', 'Free Swatch Request')}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {t('3 adede kadar renk seçebilirsiniz', 'Select up to 3 colors')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[var(--background-secondary)] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  {t('Talebiniz Alındı!', 'Request Submitted!')}
                </h4>
                <p className="text-[var(--foreground-muted)]">
                  {t(
                    'Numuneleriniz en kısa sürede adresinize gönderilecektir.',
                    'Your swatches will be shipped to your address soon.'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Product Preview */}
                <div className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl">
                  {productImage && (
                    <img 
                      src={productImage} 
                      alt={productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium">{productName}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {t('Kumaş Numunesi', 'Fabric Swatch')}
                    </p>
                  </div>
                </div>

                {/* Color Selection */}
                {colorOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('Renk Seçimi', 'Color Selection')} 
                      <span className="text-[var(--foreground-muted)] font-normal">
                        {' '}({formData.selectedColors.length}/3)
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => handleColorToggle(color.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                            formData.selectedColors.includes(color.id)
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                              : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                          }`}
                        >
                          {color.hex && (
                            <span 
                              className="w-4 h-4 rounded-full border border-black/10"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          <span className="text-sm">{color.name}</span>
                          {formData.selectedColors.includes(color.id) && (
                            <Check className="w-4 h-4 text-[var(--brand-primary)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t('Ad Soyad', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t('E-posta', 'Email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('Adres', 'Address')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={t('Sokak, Bina No, Daire', 'Street, Building, Apt')}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('Şehir', 'City')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('Posta Kodu', 'Postal Code')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('Ülke', 'Country')} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="Turkey">Turkey</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">{t('Diğer', 'Other')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('Notlar (Opsiyonel)', 'Notes (Optional)')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    placeholder={t('Özel istekleriniz varsa belirtin...', 'Any special requests...')}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Info */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <strong>{t('Bilgi:', 'Note:')}</strong>{' '}
                  {t(
                    'Numuneler ücretsiz gönderilmektedir. Teslimat süresi 5-10 iş günüdür.',
                    'Swatches are shipped free of charge. Delivery takes 5-10 business days.'
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('Gönderiliyor...', 'Submitting...')}
                    </>
                  ) : (
                    <>
                      <Scissors className="w-5 h-5" />
                      {t('Numune Talep Et', 'Request Swatch')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
