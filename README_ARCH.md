# Grohn Fabrics: İkili Şirket ve Operasyonel Mimari Protokolü

**AMAÇ:** Projenin "Global Ticari Kimliği" ile "Türkiye Operasyonel Gerçekliği" arasındaki ayrımı netleştirmek ve kodun bu ayrımı hatasız yönetmesini sağlamak.

---

## 1. Market ve Şirket Eşleşmesi (Legal & Financial)

Sistem iki farklı "Market" (Pazar) üzerinden çalışır:

### MARKET_TR
- **Ticari Muhatap:** Türkiye merkezli şahıs firması/şirketi
- **Para Birimi:** Sadece **TRY**
- **Ödeme Geçidi:** **iyzico**
- **Kullanım:** Türkiye'den alışveriş yapan yerel müşteriler

### MARKET_GLOBAL
- **Ticari Muhatap:** ABD merkezli **Grohn LLC**
- **Para Birimi:** **USD** (varsayılan) veya **EUR**
- **Ödeme Geçidi:** **Stripe**
- **Kullanım:** ABD, Avrupa ve dünyanın geri kalanı

---

## 2. Operasyonel Sabit: "The Turkey Hub" (Logistics)

Ticari yapı ikili olsa da, operasyon **TEK** bir merkezden yürütülür.

- **Fiziki Depo:** Tüm ürünler **Türkiye (Çorlu/Tekirdağ)** deposundan çıkar
- **UPS API Kuralı:** UPS hesabımız Türkiye'ye kayıtlıdır. Dolayısıyla:
  - Sipariş Global (ABD/Almanya) olsa bile, UPS `ShipFrom` adresi **HER ZAMAN Türkiye deposu** olmalıdır
  - `ShipFrom` için `CountryCode` her zaman **"TR"** gönderilmelidir
  - UPS Müşteri Numarası (Shipper Account) Türkiye hesabı olarak kullanılmalıdır

---

## 3. Veri ve State Yönetimi (Database & Code)

### Currency Persistence
Bir ürün sepete eklendiğinde, o anki `market_id`'ye ait olan para birimi (`currency`) ve fiyat kilitlenmelidir. Global dükkanda USD olarak eklenen ürün, checkout aşamasında asla TRY'ye dönmemelidir.

### Conditional Checkout
```typescript
if (market === 'TR') {
  // Sadece iyzico bileşenlerini yükle
} else {
  // Sadece Stripe bileşenlerini yükle  
}
```

### Metadata
Her iki ödeme geçidine de (Stripe/iyzico) `order_id` bilgisini metadata olarak gönder ki ödeme ile sipariş veritabanında (Supabase) eşleşebilsin.

---

## 4. Çevre Değişkenleri (Environment Variables)

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_MARKET` | Mevcut ortamın hangi pazarda başladığını kontrol eder |
| `STRIPE_SECRET_KEY` | Global pazar için Stripe API key |
| `IYZICO_API_KEY` | TR pazar için iyzico API key |
| `IYZICO_SECRET_KEY` | TR pazar için iyzico secret key |
| `IYZICO_BASE_URL` | iyzico ortam URL'i (sandbox/production) |
| `UPS_CLIENT_ID` | UPS OAuth client ID |
| `UPS_CLIENT_SECRET` | UPS OAuth secret |
| `UPS_ACCOUNT_NUMBER` | UPS Türkiye hesap numarası |
| `UPS_ENV` | test veya live (her iki pazar için aynı) |

---

## 5. Kod Yapısı Referansları

### Ödeme
- `src/app/api/checkout/init/route.ts` - Market'e göre iyzico veya Stripe
- `src/app/api/payment/iyzico/callback/route.ts` - iyzico webhook
- `src/app/api/payment/stripe/webhook/route.ts` - Stripe webhook

### UPS Kargo
- `src/lib/ups/service.ts` - ShipFrom HER ZAMAN TR
- `src/lib/ups/auth.ts` - OAuth 2.0 token yönetimi

### Sepet
- `src/lib/cart.ts` - Market ve currency persistence
- `src/components/store/AddToCartButton.tsx` - Currency'ye göre market belirleme

---

## 6. Kritik Kurallar (ASLA İHLAL ETMEYİN)

1. ❌ Global siparişte ShipFrom US/DE gönderme → ✅ Her zaman TR
2. ❌ Sepetteki USD ürünü checkout'ta TRY'ye çevirme → ✅ Currency locked
3. ❌ TR siparişi için Stripe kullanma → ✅ TR = iyzico
4. ❌ Global siparişi için iyzico kullanma → ✅ Global = Stripe

---

*Son güncelleme: 2026-01-16*
