'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/store/CartProvider';
import { ShoppingBag, ChevronLeft, CreditCard, Truck } from 'lucide-react';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Payment
  const [shippingCost, setShippingCost] = useState(0);
  
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

  // Determine market based on country
  const market = address.country === 'TR' ? 'TR' : 'GLOBAL';
  const paymentProvider = market === 'TR' ? 'iyzico' : 'stripe';

  useEffect(() => {
    // Calculate shipping based on country
    if (address.country === 'TR') {
      setShippingCost(total >= 500 ? 0 : 50); // Free shipping over 500 TRY
    } else {
      setShippingCost(25); // $25 for international
    }
  }, [address.country, total]);

  const grandTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
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
          <h1 className="text-2xl font-semibold mb-4">Sepetiniz Boş</h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            Ödeme yapabilmek için sepetinize ürün eklemeniz gerekiyor.
          </p>
          <Link href="/products" className="btn btn-primary">
            Alışverişe Başla
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
            Alışverişe Devam Et
          </Link>
          <h1 className="text-2xl font-semibold">Ödeme</h1>
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
                      <h2 className="card-title">Teslimat Bilgileri</h2>
                      <p className="card-description">Siparişinizin gönderileceği adres</p>
                    </div>
                  </div>
                  <div className="card-body space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">Ad *</label>
                        <input
                          type="text"
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Soyad *</label>
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
                        <label className="label">E-posta *</label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Telefon *</label>
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
                      <label className="label">Ülke *</label>
                      <select
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="TR">Türkiye</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="NL">Netherlands</option>
                        <option value="BE">Belgium</option>
                        <option value="AT">Austria</option>
                        <option value="CH">Switzerland</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Adres *</label>
                      <input
                        type="text"
                        value={address.addressLine1}
                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                        className="input"
                        placeholder="Sokak, Cadde, Bina No"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="label">Adres 2 (Opsiyonel)</label>
                      <input
                        type="text"
                        value={address.addressLine2}
                        onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                        className="input"
                        placeholder="Daire, Kat, vb."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="label">Şehir *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">İlçe/Eyalet</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Posta Kodu *</label>
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
                      Ödemeye Geç
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
                        <h3 className="font-medium">Teslimat Adresi</h3>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-[var(--brand-primary)]"
                      >
                        Düzenle
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
                        <h2 className="card-title">Ödeme Yöntemi</h2>
                        <p className="card-description">
                          {paymentProvider === 'iyzico' 
                            ? 'iyzico güvenli ödeme ile devam edeceksiniz' 
                            : 'Stripe güvenli ödeme ile devam edeceksiniz'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="p-4 bg-[var(--background-secondary)] rounded-xl flex items-center gap-4">
                        <CreditCard className="w-8 h-8 text-[var(--brand-primary)]" />
                        <div>
                          <p className="font-medium">
                            {paymentProvider === 'iyzico' ? 'iyzico' : 'Stripe'}
                          </p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            Kredi kartı, banka kartı veya banka havalesi
                          </p>
                        </div>
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
                            İşleniyor...
                          </>
                        ) : (
                          `₺${grandTotal.toFixed(2)} Öde`
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
                <h3 className="card-title">Sipariş Özeti</h3>
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
                        {item.salesModel === 'meter' ? `${item.quantity.toFixed(1)}m` : `${item.quantity} adet`}
                      </p>
                    </div>
                    <p className="text-sm font-medium">₺{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <hr className="border-[var(--border)]" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">Ara Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">Kargo</span>
                    <span>{shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost.toFixed(2)}`}</span>
                  </div>
                </div>

                <hr className="border-[var(--border)]" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Toplam</span>
                  <span className="text-[var(--brand-primary)]">₺{grandTotal.toFixed(2)}</span>
                </div>

                {/* Trust badges */}
                <div className="pt-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  256-bit SSL güvenli ödeme
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
