'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/store/CartProvider';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ShoppingBag, ChevronLeft, CreditCard, Truck, Ticket, X, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Tüm ülkeler listesi
const COUNTRIES = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'GB', name: 'İngiltere' },
  { code: 'DE', name: 'Almanya' },
  { code: 'FR', name: 'Fransa' },
  { code: 'NL', name: 'Hollanda' },
  { code: 'BE', name: 'Belçika' },
  { code: 'AT', name: 'Avusturya' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'IT', name: 'İtalya' },
  { code: 'ES', name: 'İspanya' },
  { code: 'PT', name: 'Portekiz' },
  { code: 'SE', name: 'İsveç' },
  { code: 'DK', name: 'Danimarka' },
  { code: 'NO', name: 'Norveç' },
  { code: 'FI', name: 'Finlandiya' },
  { code: 'PL', name: 'Polonya' },
  { code: 'GR', name: 'Yunanistan' },
  { code: 'IE', name: 'İrlanda' },
  { code: 'CA', name: 'Kanada' },
  { code: 'AU', name: 'Avustralya' },
  { code: 'NZ', name: 'Yeni Zelanda' },
  { code: 'JP', name: 'Japonya' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri' },
];

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Payment
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingCurrency, setShippingCurrency] = useState('TRY');
  const [estimatedDays, setEstimatedDays] = useState<{ min: number; max: number } | null>(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  
  const supabase = createClient();
  const { t } = useTranslation();
  
  const [address, setAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'TR',
  });

  // Cart yüklendiğinde ülkeyi market'a göre güncelle
  useEffect(() => {
    if (cart.market === 'GLOBAL' && address.country === 'TR') {
      setAddress(prev => ({ ...prev, country: 'US' }));
    }
  }, [cart.market]);

  // Market ve currency sepetten al (ürün eklenirken belirleniyor)
  const market = cart.market || 'TR';
  const currency = cart.currency || 'TRY';
  const paymentProvider = market === 'TR' ? 'iyzico' : 'stripe';

  useEffect(() => {
    // Fetch shipping rate for selected country
    async function fetchShippingRate() {
      if (address.country === 'TR') {
        // Türkiye için sabit kargo
        setShippingCost(total >= 500 ? 0 : 50);
        setShippingCurrency('TRY');
        setEstimatedDays({ min: 2, max: 4 });
        return;
      }

      // Ülke bazlı fiyat ara
      const { data: countryRate } = await supabase
        .from('shipping_country_rates')
        .select('*')
        .eq('country_code', address.country)
        .eq('is_active', true)
        .single();

      if (countryRate) {
        setShippingCost(countryRate.rate);
        setShippingCurrency(countryRate.currency);
        setEstimatedDays({
          min: countryRate.estimated_days_min,
          max: countryRate.estimated_days_max,
        });
        return;
      }

      // Bölge bazlı fiyat ara - önce ülkenin bölgesini bul
      const { data: zoneCountry } = await supabase
        .from('shipping_zone_countries')
        .select('zone_id')
        .eq('country_code', address.country)
        .single();

      if (zoneCountry?.zone_id) {
        // Bölge fiyatını al
        const { data: zoneRate } = await supabase
          .from('shipping_zone_rates')
          .select('rate, currency, estimated_days_min, estimated_days_max')
          .eq('zone_id', zoneCountry.zone_id)
          .eq('is_active', true)
          .single();

        if (zoneRate) {
          setShippingCost(zoneRate.rate);
          setShippingCurrency(zoneRate.currency);
          setEstimatedDays({
            min: zoneRate.estimated_days_min,
            max: zoneRate.estimated_days_max,
          });
          return;
        }
      }

      // Varsayılan fiyat
      setShippingCost(25);
      setShippingCurrency('USD');
      setEstimatedDays({ min: 7, max: 14 });
    }

    fetchShippingRate();
  }, [address.country, total]);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const grandTotal = total + shippingCost - discountAmount;

  // Validate and apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          email: address.email || 'guest@temp.com',
          orderTotal: total,
          market,
          currency,
        }),
      });

      const data = await response.json();

      if (!data.valid) {
        setCouponError(data.error || t('checkout.coupon_invalid'));
        return;
      }

      setAppliedCoupon(data.coupon);
      setCouponCode('');
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError(t('checkout.coupon_error'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2 && !agreedTerms) {
      alert(market === 'TR'
        ? 'Devam etmeden önce lütfen Ön Bilgilendirme Koşullarını ve Mesafeli Satış Sözleşmesini okuyup kabul edin.'
        : 'Please accept the Terms of Service and Privacy Policy to proceed.'
      );
      return;
    }

    setLoading(true);

    try {
      // Create order and initiate payment
      const response = await fetch('/api/checkout/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          address,
          market,
          shippingCost,
          coupon: appliedCoupon ? {
            id: appliedCoupon.id,
            code: appliedCoupon.code,
            discountAmount: appliedCoupon.discountAmount,
          } : null,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      // Redirect to payment page
      if (paymentProvider === 'iyzico') {
        // iyzico returns a payment page URL
        window.location.href = data.paymentPageUrl;
      } else {
        // Stripe returns a checkout session URL
        window.location.href = data.checkoutUrl;
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-[var(--foreground-light)] mb-4" />
          <h1 className="text-2xl font-semibold mb-4">{t('cart.empty')}</h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            {t('cart.empty_desc')}
          </p>
          <Link href="/products" className="btn btn-primary">
            {t('home.shop_now')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-secondary)] min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('cart.continue_shopping')}
          </Link>
          <h1 className="text-2xl font-semibold">{t('checkout.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping Info */}
              {step === 1 && (
                <div className="card">
                  <div className="card-header flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h2 className="card-title">{t('checkout.step1')}</h2>
                      <p className="card-description">{t('checkout.step1_desc')}</p>
                    </div>
                  </div>
                  <div className="card-body space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">{t('checkout.firstname')} *</label>
                        <input
                          type="text"
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">{t('checkout.lastname')} *</label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">{t('checkout.email')} *</label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">{t('checkout.phone')} *</label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className="input"
                          placeholder="+90 5XX XXX XX XX"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">{t('checkout.country')} *</label>
                      <select
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="input"
                        required
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Kargo Bilgisi */}
                    {address.country !== 'TR' && estimatedDays && (
                      <div className="p-3 bg-blue-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Truck className="w-4 h-4" />
                          <span>
                            Kargo: {shippingCost} {shippingCurrency} 
                            ({estimatedDays.min}-{estimatedDays.max} {t('checkout.business_days')})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="label">{t('checkout.address')} *</label>
                      <input
                        type="text"
                        value={address.addressLine1}
                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                        className="input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="label">{t('checkout.address2')}</label>
                      <input
                        type="text"
                        value={address.addressLine2}
                        onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                        className="input"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="label">{t('checkout.city')} *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">{t('checkout.state')}</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">{t('checkout.postal')} *</label>
                        <input
                          type="text"
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button type="submit" className="btn btn-primary w-full">
                      {t('checkout.continue')}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Address Summary */}
                  <div className="card">
                    <div className="card-header flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
                        <h3 className="font-medium">{t('checkout.delivery_address')}</h3>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-[var(--brand-primary)]"
                      >
                        {t('checkout.edit')}
                      </button>
                    </div>
                    <div className="card-body text-sm">
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p className="text-[var(--foreground-muted)]">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="text-[var(--foreground-muted)]">{address.addressLine2}</p>}
                      <p className="text-[var(--foreground-muted)]">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="card">
                    <div className="card-header flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h2 className="card-title">{t('checkout.step2')}</h2>
                        <p className="card-description">
                          {paymentProvider === 'iyzico' 
                            ? t('checkout.iyzico_desc')
                            : t('checkout.stripe_desc')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="card-body space-y-6">
                      <div className="p-4 bg-[var(--background-secondary)] rounded-xl flex items-center gap-4">
                        <CreditCard className="w-8 h-8 text-[var(--brand-primary)]" />
                        <div>
                          <p className="font-medium">
                            {paymentProvider === 'iyzico' ? 'iyzico' : 'Stripe'}
                          </p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {t('checkout.card_desc')}
                          </p>
                        </div>
                      </div>

                      {/* Legal Terms Checkbox */}
                      <div className="flex items-start gap-3 pt-4 text-sm text-[var(--foreground-muted)] border-t border-[var(--border)]">
                        <input
                          type="checkbox"
                          id="agreedTerms"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                          required
                        />
                        <label htmlFor="agreedTerms" className="leading-snug select-none cursor-pointer">
                          {market === 'TR' ? (
                            <>
                              Bilgilerimin doğruluğunu,{' '}
                              <Link href="/distance-sales" target="_blank" className="underline text-[var(--brand-primary)] font-medium hover:text-[var(--brand-primary-dark)]">
                                Ön Bilgilendirme Koşullarını
                              </Link>{' '}
                              ve{' '}
                              <Link href="/distance-sales" target="_blank" className="underline text-[var(--brand-primary)] font-medium hover:text-[var(--brand-primary-dark)]">
                                Mesafeli Satış Sözleşmesini
                              </Link>{' '}
                              okuduğumu ve kabul ettiğimi onaylıyorum.
                            </>
                          ) : (
                            <>
                              I confirm that my details are correct and I agree to the{' '}
                              <Link href="/terms" target="_blank" className="underline text-[var(--brand-primary)] font-medium hover:text-[var(--brand-primary-dark)]">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link href="/privacy" target="_blank" className="underline text-[var(--brand-primary)] font-medium hover:text-[var(--brand-primary-dark)]">
                                Privacy Policy
                              </Link>.
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary w-full"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('checkout.processing')}
                          </>
                        ) : (
                          `${t('checkout.pay')} ${currency === 'TRY' ? '₺' : '$'}${grandTotal.toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="card-header">
                <h3 className="card-title">{t('checkout.order_summary')}</h3>
              </div>
              <div className="card-body space-y-4">
                {/* Items */}
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ''}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-[var(--foreground-light)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {item.salesModel === 'meter' ? `${item.quantity.toFixed(1)}m` : `${item.quantity}x`}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{currency === 'TRY' ? '₺' : '$'}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <hr className="border-[var(--border)]" />

                {/* Coupon Input */}
                <div className="space-y-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-[var(--success-light)] rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[var(--success)]" />
                        <span className="text-sm font-medium text-[var(--success)]">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs text-[var(--success)]">
                          ({appliedCoupon.discountType === 'percentage' 
                            ? `%${appliedCoupon.discountValue}` 
                            : `${currency === 'TRY' ? '₺' : '$'}${appliedCoupon.discountValue}`})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1 hover:bg-[var(--success)]/10 rounded"
                      >
                        <X className="w-4 h-4 text-[var(--success)]" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-light)]" />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            placeholder={t('checkout.coupon_placeholder')}
                            className="input pl-9 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="btn btn-secondary btn-sm"
                        >
                          {couponLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            t('checkout.apply')
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-[var(--error)] mt-1">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                <hr className="border-[var(--border)]" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('cart.subtotal')}</span>
                    <span>{currency === 'TRY' ? '₺' : '$'}{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('cart.shipping')}</span>
                    <span>
                      {shippingCost === 0 
                        ? t('cart.free_shipping')
                        : `${shippingCurrency === 'TRY' ? '₺' : shippingCurrency === 'EUR' ? '€' : '$'}${shippingCost.toFixed(2)}`
                      }
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[var(--success)]">
                      <span>{t('checkout.discount')}</span>
                      <span>-{currency === 'TRY' ? '₺' : '$'}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {estimatedDays && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--foreground-muted)]">{t('checkout.estimated_delivery')}</span>
                      <span>{estimatedDays.min}-{estimatedDays.max} {t('checkout.business_days')}</span>
                    </div>
                  )}
                </div>

                <hr className="border-[var(--border)]" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('cart.total')}</span>
                  <span className="text-[var(--brand-primary)]">
                    {currency === 'TRY' ? '₺' : '$'}{grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Trust badges */}
                <div className="pt-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('checkout.secure')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
