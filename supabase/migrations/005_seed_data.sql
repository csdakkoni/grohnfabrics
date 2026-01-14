-- Seed data for Grohn Fabrics
-- This migration adds initial data for companies, markets, and shipping profiles

-- =====================================================
-- COMPANIES
-- =====================================================
INSERT INTO companies (id, code, name, tax_number, tax_office, address, default_currency, is_active)
VALUES 
  (gen_random_uuid(), 'TR', 'Grohn Tekstil Ltd. Şti.', '1234567890', 'Merter VD', 
   '{"line1": "Tekstilciler Cad. No:123", "city": "İstanbul", "district": "Güngören", "postal_code": "34164", "country": "TR"}'::jsonb,
   'TRY', true),
  (gen_random_uuid(), 'US', 'Grohn Fabrics LLC', '', '', 
   '{"line1": "123 Textile Ave", "city": "New York", "state": "NY", "postal_code": "10001", "country": "US"}'::jsonb,
   'USD', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address;

-- =====================================================
-- MARKETS
-- =====================================================
INSERT INTO markets (id, company_id, name, default_currency, supported_currencies, default_locale, supported_locales, countries)
SELECT 
  'TR',
  c.id,
  'Türkiye',
  'TRY',
  ARRAY['TRY', 'USD', 'EUR'],
  'tr',
  ARRAY['tr', 'en'],
  ARRAY['TR']
FROM companies c WHERE c.code = 'TR'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  supported_currencies = EXCLUDED.supported_currencies;

INSERT INTO markets (id, company_id, name, default_currency, supported_currencies, default_locale, supported_locales, countries)
SELECT 
  'GLOBAL',
  c.id,
  'Global',
  'USD',
  ARRAY['USD', 'EUR', 'GBP'],
  'en',
  ARRAY['en', 'de', 'fr'],
  ARRAY['US', 'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH']
FROM companies c WHERE c.code = 'US'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  supported_currencies = EXCLUDED.supported_currencies;

-- =====================================================
-- SHIPPING PROFILES
-- =====================================================
-- Turkish market shipping
INSERT INTO shipping_profiles (id, market_id, provider, name_tr, name_en, base_rate, per_kg_rate, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active)
VALUES
  (gen_random_uuid(), 'TR', 'yurtici_kargo', 'Yurtiçi Kargo - Standart', 'Yurtiçi Kargo - Standard', 
   35.00, 5.00, 500.00, 1, 3, true),
  (gen_random_uuid(), 'TR', 'yurtici_kargo', 'Yurtiçi Kargo - Express', 'Yurtiçi Kargo - Express', 
   55.00, 8.00, 750.00, 1, 2, true),
  (gen_random_uuid(), 'TR', 'aras_kargo', 'Aras Kargo - Standart', 'Aras Kargo - Standard', 
   30.00, 4.50, 500.00, 2, 4, true)
ON CONFLICT DO NOTHING;

-- Global market shipping
INSERT INTO shipping_profiles (id, market_id, provider, name_tr, name_en, base_rate, per_kg_rate, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active)
VALUES
  (gen_random_uuid(), 'GLOBAL', 'ups', 'UPS Worldwide Saver', 'UPS Worldwide Saver', 
   25.00, 15.00, 250.00, 3, 7, true),
  (gen_random_uuid(), 'GLOBAL', 'dhl', 'DHL Express', 'DHL Express', 
   35.00, 20.00, 300.00, 2, 5, true),
  (gen_random_uuid(), 'GLOBAL', 'fedex', 'FedEx International', 'FedEx International', 
   30.00, 18.00, 275.00, 3, 6, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CATEGORIES (Sample)
-- =====================================================
INSERT INTO categories (id, slug, name_tr, name_en, sort_order, is_active)
VALUES
  (gen_random_uuid(), 'kadife', 'Kadife Kumaşlar', 'Velvet Fabrics', 1, true),
  (gen_random_uuid(), 'keten', 'Keten Kumaşlar', 'Linen Fabrics', 2, true),
  (gen_random_uuid(), 'pamuk', 'Pamuk Kumaşlar', 'Cotton Fabrics', 3, true),
  (gen_random_uuid(), 'jakar', 'Jakar Kumaşlar', 'Jacquard Fabrics', 4, true),
  (gen_random_uuid(), 'perde', 'Perde Kumaşları', 'Curtain Fabrics', 5, true),
  (gen_random_uuid(), 'dosemelik', 'Döşemelik Kumaşlar', 'Upholstery Fabrics', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en;

-- =====================================================
-- MATERIALS (Sample)
-- =====================================================
INSERT INTO materials (id, slug, name_tr, name_en, description_tr, description_en, properties, is_active)
VALUES
  (gen_random_uuid(), 'pamuk-100', '%100 Pamuk', '100% Cotton', 
   'Doğal, nefes alan ve yumuşak pamuk kumaş', 'Natural, breathable and soft cotton fabric',
   '{"breathability": "high", "durability": "medium", "washable": true}'::jsonb, true),
  (gen_random_uuid(), 'keten-100', '%100 Keten', '100% Linen',
   'Dayanıklı ve doğal keten kumaş', 'Durable and natural linen fabric',
   '{"breathability": "very_high", "durability": "high", "washable": true}'::jsonb, true),
  (gen_random_uuid(), 'polyester-100', '%100 Polyester', '100% Polyester',
   'Dayanıklı ve bakımı kolay polyester', 'Durable and easy-care polyester',
   '{"breathability": "low", "durability": "very_high", "washable": true}'::jsonb, true),
  (gen_random_uuid(), 'pamuk-keten', 'Pamuk-Keten Karışım', 'Cotton-Linen Blend',
   '%55 Pamuk, %45 Keten karışımı', '55% Cotton, 45% Linen blend',
   '{"breathability": "high", "durability": "high", "washable": true}'::jsonb, true),
  (gen_random_uuid(), 'kadife', 'Kadife', 'Velvet',
   'Lüks kadife kumaş', 'Luxurious velvet fabric',
   '{"breathability": "medium", "durability": "medium", "washable": false}'::jsonb, true),
  (gen_random_uuid(), 'suni-deri', 'Suni Deri', 'Faux Leather',
   'Dayanıklı ve bakımı kolay suni deri', 'Durable and easy-care faux leather',
   '{"breathability": "low", "durability": "very_high", "washable": false}'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en;

-- =====================================================
-- SITE SETTINGS (Default values)
-- =====================================================
INSERT INTO site_settings (id, site_name, contact_email, contact_phone, address, social_links, seo_settings)
VALUES (
  gen_random_uuid(),
  'Grohn Fabrics',
  'info@grohnfabrics.com',
  '+90 212 123 45 67',
  '{"line1": "Tekstilciler Cad. No:123", "city": "İstanbul", "district": "Güngören", "postal_code": "34164", "country": "TR"}'::jsonb,
  '{"instagram": "https://instagram.com/grohnfabrics", "pinterest": "https://pinterest.com/grohnfabrics", "facebook": "https://facebook.com/grohnfabrics"}'::jsonb,
  '{"title": "Grohn Fabrics - Premium Kumaş ve Ev Tekstili", "description": "Türkiye''den dünyaya kaliteli kumaş ve ev tekstili ürünleri. Premium döşemelik kumaşlar, perdeler ve ev tekstili.", "keywords": "kumaş, perde, ev tekstili, döşemelik, kadife, keten"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DEFAULT PAGES (CMS)
-- =====================================================
INSERT INTO pages (id, slug, title_tr, title_en, content_tr, content_en, is_published, show_in_menu, menu_order)
VALUES
  (gen_random_uuid(), 'about', 'Hakkımızda', 'About Us',
   '<h2>Grohn Fabrics Hakkında</h2>
   <p>Grohn Fabrics, 2010 yılından bu yana Türkiye''nin önde gelen kumaş ve ev tekstili markalarından biri olarak hizmet vermektedir.</p>
   <h3>Misyonumuz</h3>
   <p>Kaliteli kumaş ve ev tekstili ürünlerini, uygun fiyatlarla tüm dünyaya ulaştırmak.</p>
   <h3>Vizyonumuz</h3>
   <p>Tekstil sektöründe dünya çapında tanınan, güvenilir ve yenilikçi bir marka olmak.</p>',
   '<h2>About Grohn Fabrics</h2>
   <p>Grohn Fabrics has been one of Turkey''s leading fabric and home textile brands since 2010.</p>
   <h3>Our Mission</h3>
   <p>To deliver quality fabrics and home textiles to the world at affordable prices.</p>
   <h3>Our Vision</h3>
   <p>To be a globally recognized, reliable and innovative brand in the textile industry.</p>',
   true, true, 1),
  
  (gen_random_uuid(), 'shipping', 'Kargo Bilgisi', 'Shipping Information',
   '<h2>Kargo ve Teslimat</h2>
   <h3>Türkiye İçi Kargo</h3>
   <ul>
     <li>500₺ ve üzeri siparişlerde ücretsiz kargo</li>
     <li>Standart teslimat: 1-3 iş günü</li>
     <li>Express teslimat: 1-2 iş günü</li>
   </ul>
   <h3>Uluslararası Kargo</h3>
   <ul>
     <li>250$ ve üzeri siparişlerde ücretsiz kargo</li>
     <li>Teslimat süresi: 3-7 iş günü</li>
     <li>UPS, DHL ve FedEx ile gönderim</li>
   </ul>',
   '<h2>Shipping and Delivery</h2>
   <h3>Domestic Shipping (Turkey)</h3>
   <ul>
     <li>Free shipping on orders over ₺500</li>
     <li>Standard delivery: 1-3 business days</li>
     <li>Express delivery: 1-2 business days</li>
   </ul>
   <h3>International Shipping</h3>
   <ul>
     <li>Free shipping on orders over $250</li>
     <li>Delivery time: 3-7 business days</li>
     <li>Shipped via UPS, DHL and FedEx</li>
   </ul>',
   true, true, 2),
  
  (gen_random_uuid(), 'returns', 'İade Politikası', 'Return Policy',
   '<h2>İade ve Değişim</h2>
   <p>Müşteri memnuniyeti bizim için en önemli önceliktir.</p>
   <h3>İade Koşulları</h3>
   <ul>
     <li>Ürünler 14 gün içinde iade edilebilir</li>
     <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
     <li>Metre ile kesilen kumaşlar iade edilemez</li>
   </ul>
   <h3>İade Süreci</h3>
   <p>İade talebinizi info@grohnfabrics.com adresine gönderin.</p>',
   '<h2>Returns and Exchanges</h2>
   <p>Customer satisfaction is our top priority.</p>
   <h3>Return Conditions</h3>
   <ul>
     <li>Products can be returned within 14 days</li>
     <li>Product must be unused and in original packaging</li>
     <li>Cut-to-length fabrics cannot be returned</li>
   </ul>
   <h3>Return Process</h3>
   <p>Send your return request to info@grohnfabrics.com</p>',
   true, true, 3),
  
  (gen_random_uuid(), 'privacy', 'Gizlilik Politikası', 'Privacy Policy',
   '<h2>Gizlilik Politikası</h2>
   <p>Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını ve kullanıldığını açıklar.</p>
   <h3>Toplanan Bilgiler</h3>
   <p>Sipariş işlemleri için ad, adres, e-posta ve telefon bilgileri toplanır.</p>
   <h3>Bilgi Kullanımı</h3>
   <p>Bilgileriniz yalnızca sipariş işlemleri ve iletişim için kullanılır.</p>',
   '<h2>Privacy Policy</h2>
   <p>This privacy policy explains how your personal data is collected and used.</p>
   <h3>Information Collected</h3>
   <p>Name, address, email and phone information is collected for order processing.</p>
   <h3>Use of Information</h3>
   <p>Your information is used only for order processing and communication.</p>',
   true, false, 4),
  
  (gen_random_uuid(), 'terms', 'Kullanım Koşulları', 'Terms of Service',
   '<h2>Kullanım Koşulları</h2>
   <p>Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş olursunuz.</p>
   <h3>Genel</h3>
   <p>Tüm içerik ve materyaller Grohn Fabrics''e aittir ve telif hakkı ile korunmaktadır.</p>',
   '<h2>Terms of Service</h2>
   <p>By using this website, you agree to the following terms.</p>
   <h3>General</h3>
   <p>All content and materials belong to Grohn Fabrics and are protected by copyright.</p>',
   true, false, 5),
  
  (gen_random_uuid(), 'faq', 'Sıkça Sorulan Sorular', 'Frequently Asked Questions',
   '<h2>Sıkça Sorulan Sorular</h2>
   <h3>Nasıl sipariş verebilirim?</h3>
   <p>Ürünü sepete ekleyin, teslimat bilgilerinizi girin ve ödemenizi tamamlayın.</p>
   <h3>Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
   <p>Kredi kartı, banka kartı ve havale ile ödeme kabul ediyoruz.</p>
   <h3>Siparişimi nasıl takip edebilirim?</h3>
   <p>Hesabınıza giriş yaparak siparişlerinizi takip edebilirsiniz.</p>',
   '<h2>Frequently Asked Questions</h2>
   <h3>How can I place an order?</h3>
   <p>Add the product to cart, enter your delivery details and complete your payment.</p>
   <h3>Which payment methods do you accept?</h3>
   <p>We accept credit card, debit card and bank transfer.</p>
   <h3>How can I track my order?</h3>
   <p>Log in to your account to track your orders.</p>',
   true, true, 6)
ON CONFLICT (slug) DO UPDATE SET
  content_tr = EXCLUDED.content_tr,
  content_en = EXCLUDED.content_en;
