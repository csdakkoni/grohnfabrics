-- =====================================================
-- DEMO SEED DATA - AgoraLoom/Grohn Fabrics Style
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses ON CONFLICT)
-- =====================================================

-- =====================================================
-- CATEGORIES with real + generated images
-- =====================================================
UPDATE categories SET image_url = '/images/products/category-cotton-linen.png', description_tr = 'Doğal pamuk-keten karışım kumaşlardan üretilen, ışık filtreli perdeler', description_en = 'Light-filtering curtains made from natural cotton-linen blend fabrics' WHERE slug = 'pamuk';
UPDATE categories SET image_url = '/images/products/category-muslin.png', description_tr = '%100 organik pamuk müslin kumaştan el yapımı perdeler', description_en = 'Handcrafted curtains from 100% organic cotton muslin fabric' WHERE slug = 'keten';
UPDATE categories SET image_url = '/images/products/grey-curtain.jpg', description_tr = 'Her oda için ışık filtreli ve karartma perde seçenekleri', description_en = 'Light filtering and blackout curtain options for every room' WHERE slug = 'perde';

INSERT INTO categories (slug, name_tr, name_en, description_tr, description_en, image_url, sort_order, is_active) VALUES
  ('pamuk-keten-perde', 'Pamuk-Keten Perdeler', 'Cotton Linen Curtains', 
   '%70 pamuk, %30 keten karışım kumaştan, ışık filtreli, OEKO-TEX® sertifikalı perdeler. 150 cm eninde, 145 GSM.',
   '70% cotton, 30% linen blend, light-filtering, OEKO-TEX® certified curtains. 59 inches wide, 145 GSM.',
   '/images/products/category-cotton-linen.png', 1, true),
  ('muslin-perde', 'Müslin Perdeler', 'Muslin Curtains',
   '%100 organik pamuk müslin kumaştan üretilen yarı şeffaf perdeler. 69 renk seçeneği, 120 GSM.',
   'Semi-sheer curtains made from 100% organic cotton muslin fabric. 69 color options, 120 GSM.',
   '/images/products/category-muslin.png', 2, true),
  ('masa-ortusu', 'Masa Örtüleri', 'Tablecloths',
   'Doğal pamuk-keten karışım kumaştan el yapımı masa örtüleri. Dikdörtgen, kare ve yuvarlak seçenekleri.',
   'Handmade tablecloths from natural cotton-linen blend fabric. Rectangular, square, and round options.',
   '/images/products/category-tablecloth.png', 3, true),
  ('kumas', 'Kumaş (Metre ile)', 'Fabric By The Yard',
   'DIY projeleriniz için doğal kumaşlar. Metreyle satış, perde, masa örtüsü ve ev tekstili için ideal.',
   'Natural fabrics for your DIY projects. Sold by the yard, ideal for curtains, tablecloths and home textiles.',
   '/images/products/Cotton-linen-curtain.jpg', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en,
  image_url = EXCLUDED.image_url;

-- =====================================================
-- PRODUCTS - Cotton Linen Curtains (preset_sizes)
-- 70% Cotton, 30% Linen, 145 GSM, OEKO-TEX®
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

('bej-pamuk-keten-perde', 'GF-CL-BEI',
 'Bej Pamuk-Keten Perde', 'Beige Cotton Linen Curtain',
 E'%70 pamuk ve %30 keten karışımından üretilen, ışık filtreli bej perde.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM\n• Sertifika: OEKO-TEX® & Organik\n• Askı: Rod pocket (7.5 cm), Tab top (10 cm), Back top (10 cm)\n• Bakım: 40°C makinede yıkanabilir',
 E'Made from a 70% cotton and 30% linen blend, this light-filtering beige curtain adds warmth to any room.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)\n• Certification: OEKO-TEX® & Organic\n• Hanging: Rod pocket (3"), Tab top (4"), Back top (4")\n• Care: Machine wash up to 40°C',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/beige-cotton-curtain.jpg', '/images/products/beige-drapery.jpg', '/images/products/beige-light-filtered-curtain.jpg'],
 '/images/products/beige-cotton-curtain.jpg',
 true, true, false, true, true),

('antrasit-pamuk-keten-perde', 'GF-CL-ANT',
 'Antrasit Pamuk-Keten Perde', 'Anthracite Cotton Linen Curtain',
 E'Koyu antrasit tonunda, zarif ve sofistike pamuk-keten perde.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM\n• Sertifika: OEKO-TEX® & Organik\n• Askı: Rod pocket, Tab top, Back top',
 E'Elegant anthracite-toned cotton linen curtain with sophisticated appeal.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)\n• Certification: OEKO-TEX® & Organic\n• Hanging: Rod pocket, Tab top, Back top',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/anthracite-curtain.jpg', '/images/products/slate-grey-curtain.jpg', '/images/products/slate-gray-curtain.jpg'],
 '/images/products/anthracite-curtain.jpg',
 true, true, true, true, true),

('hardal-pamuk-keten-perde', 'GF-CL-MUS',
 'Hardal Sarı Pamuk-Keten Perde', 'Mustard Yellow Cotton Linen Curtain',
 E'Sıcak hardal sarısı tonunda pamuk-keten perde. Bohem ve İskandinav tarzına uygun.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM\n• Sertifika: OEKO-TEX® & Organik',
 E'Warm mustard yellow cotton linen curtain. Suits bohemian and Scandinavian styles.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)\n• Certification: OEKO-TEX® & Organic',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/mustard-linen-curtain.jpg', '/images/products/cotton-linen-yellow-curtain.jpg', '/images/products/light-filtered-curtain-yellow.jpg'],
 '/images/products/mustard-linen-curtain.jpg',
 true, true, true, true, true),

('acik-gri-pamuk-keten-perde', 'GF-CL-LGR',
 'Açık Gri Pamuk-Keten Perde', 'Light Gray Cotton Linen Curtain',
 E'Doğal açık gri tonunda pamuk-keten perde. Minimalist dekorasyon için mükemmel.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM',
 E'Natural light gray cotton linen curtain. Perfect for minimalist decor.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/light-grey-cotton-curtain.jpg', '/images/products/linen-curtain-grey.jpg', '/images/products/grey-light-filtered-curtain.jpg'],
 '/images/products/light-grey-cotton-curtain.jpg',
 true, true, false, true, true),

('kirik-beyaz-pamuk-keten-perde', 'GF-CL-OFW',
 'Kırık Beyaz Pamuk-Keten Perde', 'Off White Cotton Linen Curtain',
 E'Zarif kırık beyaz tonunda pamuk-keten perde. Her mekan ile uyumlu.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM',
 E'Elegant off-white cotton linen curtain. Harmonious with any space.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/off-white-curtain.jpg', '/images/products/off-white-cotton-curtain.jpg', '/images/products/white-curtain-for-livingroom.jpg'],
 '/images/products/off-white-curtain.jpg',
 true, false, false, true, true),

('pembe-pamuk-keten-perde', 'GF-CL-PNK',
 'Pembe Pamuk-Keten Perde', 'Rose Pink Cotton Linen Curtain',
 E'Zarif pudra pembe tonunda pamuk-keten perde. Yatak odası ve çocuk odası için ideal.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM',
 E'Elegant rose pink cotton linen curtain. Perfect for bedrooms and nurseries.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/pink-cotton-curtain.jpg', '/images/products/light-filtered-cotton-curtain.jpg'],
 '/images/products/pink-cotton-curtain.jpg',
 true, false, true, true, true),

('yesil-pamuk-keten-perde', 'GF-CL-GRN',
 'Açık Yeşil Pamuk-Keten Perde', 'Light Green Cotton Linen Curtain',
 E'Doğal açık yeşil tonunda pamuk-keten perde. Taze ve huzurlu bir ortam yaratır.\n\n• Kumaş: %70 Pamuk, %30 Keten karışım\n• Ağırlık: 145 GSM',
 E'Natural light green cotton linen curtain. Creates a fresh and peaceful atmosphere.\n\n• Fabric: 70% Cotton, 30% Linen blend\n• Weight: 145 GSM (4.3 oz/yd²)',
 (SELECT id FROM categories WHERE slug = 'pamuk-keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/Cotton-linen-curtain.jpg', '/images/products/beige-drapery.jpg'],
 '/images/products/Cotton-linen-curtain.jpg',
 true, false, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr, name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr, description_en = EXCLUDED.description_en,
  images = EXCLUDED.images, thumbnail_url = EXCLUDED.thumbnail_url,
  is_featured = EXCLUDED.is_featured, is_new = EXCLUDED.is_new;

-- =====================================================
-- PRODUCTS - Muslin Curtains (preset_sizes)
-- 100% Organic Cotton Muslin, 120 GSM
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

('bej-muslin-perde', 'GF-MS-BEI',
 'Bej Müslin Perde', 'Beige Muslin Curtain',
 E'%100 organik pamuk müslin kumaştan üretilen yarı şeffaf bej perde.\n\n• Kumaş: %100 Organik Pamuk Müslin\n• Ağırlık: 120 GSM (3.55 oz/yd²)\n• Askı: Rod pocket (7.5 cm), Tab top (10 cm)\n• Bakım: 40°C makinede yıkanabilir\n• Renk: 38/69',
 E'Semi-sheer beige curtain crafted from 100% organic cotton muslin.\n\n• Fabric: 100% Organic Cotton Muslin\n• Weight: 120 GSM (3.55 oz/yd²)\n• Hanging: Rod pocket (3"), Tab top (4")\n• Care: Machine wash up to 40°C\n• Color: 38/69',
 (SELECT id FROM categories WHERE slug = 'muslin-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/beige-curtain-for-bedroom.jpg', '/images/products/beige-cotton-curtain.jpg'],
 '/images/products/beige-curtain-for-bedroom.jpg',
 true, true, false, true, true),

('gri-muslin-perde', 'GF-MS-GRY',
 'Gri Müslin Perde', 'Grey Muslin Curtain',
 E'%100 organik pamuk müslin kumaştan üretilen gri perde.\n\n• Kumaş: %100 Organik Pamuk Müslin\n• Ağırlık: 120 GSM\n• Renk: 58/69',
 E'Grey curtain crafted from 100% organic cotton muslin.\n\n• Fabric: 100% Organic Cotton Muslin\n• Weight: 120 GSM\n• Color: 58/69',
 (SELECT id FROM categories WHERE slug = 'muslin-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/grey-curtain.jpg', '/images/products/cotton-curtain-grey.jpg'],
 '/images/products/grey-curtain.jpg',
 true, false, false, true, true),

('karamel-muslin-perde', 'GF-MS-CAR',
 'Karamel Müslin Perde', 'Caramel Muslin Curtain',
 E'%100 organik pamuk müslin kumaştan karamel tonunda perde.\n\n• Kumaş: %100 Organik Pamuk Müslin\n• Ağırlık: 120 GSM\n• Renk: 43/69',
 E'Caramel-toned curtain from 100% organic cotton muslin.\n\n• Fabric: 100% Organic Cotton Muslin\n• Weight: 120 GSM\n• Color: 43/69',
 (SELECT id FROM categories WHERE slug = 'muslin-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/caramel-brown-curtain.jpg', '/images/products/light-brown-curtain.jpg', '/images/products/custom-made-curtain.jpg'],
 '/images/products/caramel-brown-curtain.jpg',
 true, false, true, true, true),

('pembe-muslin-perde', 'GF-MS-PNK',
 'Pudra Pembe Müslin Perde', 'Powder Pink Muslin Curtain',
 E'%100 organik pamuk müslin kumaştan pudra pembe perde.\n\n• Kumaş: %100 Organik Pamuk Müslin\n• Ağırlık: 120 GSM\n• Renk: 04/69',
 E'Powder pink curtain from 100% organic cotton muslin.\n\n• Fabric: 100% Organic Cotton Muslin\n• Weight: 120 GSM\n• Color: 04/69',
 (SELECT id FROM categories WHERE slug = 'muslin-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/pink-cotton-curtain.jpg', '/images/products/curtain-for-bedroom.jpg'],
 '/images/products/pink-cotton-curtain.jpg',
 true, false, false, true, true),

('isik-filtreli-muslin-perde', 'GF-MS-ECR',
 'Ekru Müslin Perde', 'Ecru Muslin Curtain',
 E'%100 organik pamuk müslin kumaştan ekru tonunda ışık filtreli perde.\n\n• Kumaş: %100 Organik Pamuk Müslin\n• Ağırlık: 120 GSM\n• Renk: 03/69',
 E'Ecru light-filtering curtain from 100% organic cotton muslin.\n\n• Fabric: 100% Organic Cotton Muslin\n• Weight: 120 GSM\n• Color: 03/69',
 (SELECT id FROM categories WHERE slug = 'muslin-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/light-filtered-curtain.jpg', '/images/products/light-filtered-cotton-curtain.jpg', '/images/products/off-white-cotton-curtain.jpg'],
 '/images/products/light-filtered-curtain.jpg',
 true, true, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr, name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr, description_en = EXCLUDED.description_en,
  images = EXCLUDED.images, thumbnail_url = EXCLUDED.thumbnail_url,
  is_featured = EXCLUDED.is_featured, is_new = EXCLUDED.is_new;

-- =====================================================
-- PRODUCTS - Tablecloths (preset_sizes)
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

('bej-masa-ortusu', 'GF-TC-BEI',
 'Bej Masa Örtüsü', 'Beige Tablecloth',
 E'Doğal pamuk-keten karışım kumaştan el yapımı bej masa örtüsü.\n\n• Kumaş: %70 Pamuk, %30 Keten\n• Ağırlık: 145 GSM\n• Seçenekler: Dikdörtgen, Kare, Yuvarlak',
 E'Handmade beige tablecloth from natural cotton-linen blend.\n\n• Fabric: 70% Cotton, 30% Linen\n• Weight: 145 GSM\n• Options: Rectangular, Square, Round',
 (SELECT id FROM categories WHERE slug = 'masa-ortusu'), 'tablecloth', 'preset_sizes',
 ARRAY['/images/products/beige-drapery.jpg', '/images/products/_DSC0063-HDR- beige poplin.jpg'],
 '/images/products/beige-drapery.jpg',
 true, false, false, true, true),

('gri-masa-ortusu', 'GF-TC-GRY',
 'Gri Masa Örtüsü', 'Grey Tablecloth',
 E'Doğal pamuk-keten karışım kumaştan el yapımı gri masa örtüsü.',
 E'Handmade grey tablecloth from natural cotton-linen blend.',
 (SELECT id FROM categories WHERE slug = 'masa-ortusu'), 'tablecloth', 'preset_sizes',
 ARRAY['/images/products/slate-grey-curtain.jpg', '/images/products/grey-light-filtered-curtain.jpg'],
 '/images/products/slate-grey-curtain.jpg',
 true, false, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr, name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr, description_en = EXCLUDED.description_en,
  images = EXCLUDED.images, thumbnail_url = EXCLUDED.thumbnail_url;

-- =====================================================
-- PRODUCTS - Fabric by the Yard (meter-based)
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

('pamuk-keten-kumas-metrelik', 'GF-FB-CLB',
 'Pamuk-Keten Kumaş (Metrelik)', 'Cotton Linen Fabric By The Yard',
 E'%70 pamuk, %30 keten karışım kumaş. DIY projekleriniz için metreyle satış.\n\n• En: 150 cm (59 inç)\n• Ağırlık: 145 GSM\n• OEKO-TEX® sertifikalı\n• Perde, masa örtüsü, yastık kılıfı için ideal',
 E'70% cotton, 30% linen blend fabric. Sold by the yard for DIY projects.\n\n• Width: 59 inches (150 cm)\n• Weight: 145 GSM (4.3 oz/yd²)\n• OEKO-TEX® certified\n• Ideal for curtains, tablecloths, pillowcases',
 (SELECT id FROM categories WHERE slug = 'kumas'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/Cotton-linen-curtain.jpg', '/images/products/_DSC0063-HDR- beige poplin.jpg', '/images/products/_DSC0265(1)-1.jpg'],
 '/images/products/Cotton-linen-curtain.jpg',
 true, false, false, true, true),

('muslin-kumas-metrelik', 'GF-FB-MUS',
 'Müslin Kumaş (Metrelik)', 'Muslin Fabric By The Yard',
 E'%100 organik pamuk müslin kumaş. Bebek ürünleri, perde ve yazlık elbise için ideal.\n\n• En: 140 cm (55 inç)\n• Ağırlık: 120 GSM\n• %100 Organik Pamuk\n• OEKO-TEX® sertifikalı',
 E'100% organic cotton muslin fabric. Ideal for baby products, curtains and summer dresses.\n\n• Width: 55 inches (140 cm)\n• Weight: 120 GSM (3.55 oz/yd²)\n• 100% Organic Cotton\n• OEKO-TEX® certified',
 (SELECT id FROM categories WHERE slug = 'kumas'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/_DSC0274(8).jpg', '/images/products/_DSC0265(1)-1.jpg'],
 '/images/products/_DSC0274(8).jpg',
 true, false, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr, name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr, description_en = EXCLUDED.description_en,
  images = EXCLUDED.images, thumbnail_url = EXCLUDED.thumbnail_url;

-- =====================================================
-- PRODUCT PRICES (TRY + USD)
-- =====================================================

-- TRY Prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', v.price, v.compare_at
FROM products p JOIN (VALUES
  ('bej-pamuk-keten-perde',      1290, 1590),
  ('antrasit-pamuk-keten-perde', 1290, 1590),
  ('hardal-pamuk-keten-perde',   1290, NULL),
  ('acik-gri-pamuk-keten-perde', 1290, NULL),
  ('kirik-beyaz-pamuk-keten-perde', 1290, NULL),
  ('pembe-pamuk-keten-perde',    1290, NULL),
  ('yesil-pamuk-keten-perde',    1290, NULL),
  ('bej-muslin-perde',           890, NULL),
  ('gri-muslin-perde',           890, NULL),
  ('karamel-muslin-perde',       890, NULL),
  ('pembe-muslin-perde',         890, NULL),
  ('isik-filtreli-muslin-perde', 890, NULL),
  ('bej-masa-ortusu',            690, NULL),
  ('gri-masa-ortusu',            690, NULL),
  ('pamuk-keten-kumas-metrelik', 390, NULL),
  ('muslin-kumas-metrelik',      290, NULL)
) AS v(slug, price, compare_at) ON p.slug = v.slug
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- USD Prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', v.price, v.compare_at
FROM products p JOIN (VALUES
  ('bej-pamuk-keten-perde',      79, 99),
  ('antrasit-pamuk-keten-perde', 79, 99),
  ('hardal-pamuk-keten-perde',   79, NULL),
  ('acik-gri-pamuk-keten-perde', 79, NULL),
  ('kirik-beyaz-pamuk-keten-perde', 79, NULL),
  ('pembe-pamuk-keten-perde',    79, NULL),
  ('yesil-pamuk-keten-perde',    79, NULL),
  ('bej-muslin-perde',           59, NULL),
  ('gri-muslin-perde',           59, NULL),
  ('karamel-muslin-perde',       59, NULL),
  ('pembe-muslin-perde',         59, NULL),
  ('isik-filtreli-muslin-perde', 59, NULL),
  ('bej-masa-ortusu',            49, NULL),
  ('gri-masa-ortusu',            49, NULL),
  ('pamuk-keten-kumas-metrelik', 28, NULL),
  ('muslin-kumas-metrelik',      22, NULL)
) AS v(slug, price, compare_at) ON p.slug = v.slug
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- =====================================================
-- PRESET SIZES - Curtains (1 panel)
-- =====================================================

INSERT INTO preset_sizes (product_id, name_tr, name_en, width_cm, height_cm, price_tr, price_usd, stock_quantity, sort_order, is_available)
SELECT p.id, s.name_tr, s.name_en, s.w, s.h, s.ptr, s.pusd, s.stock, s.ord, true
FROM products p
CROSS JOIN (VALUES
  ('50×63 inç (127×160 cm)', '50×63" (127×160 cm)',  127, 160, 0,    0,    30, 1),
  ('50×84 inç (127×213 cm)', '50×84" (127×213 cm)',  127, 213, 200,  10,   25, 2),
  ('50×96 inç (127×244 cm)', '50×96" (127×244 cm)',  127, 244, 400,  18,   20, 3),
  ('50×108 inç (127×274 cm)','50×108" (127×274 cm)', 127, 274, 600,  25,   15, 4),
  ('50×120 inç (127×305 cm)','50×120" (127×305 cm)', 127, 305, 800,  35,   10, 5)
) AS s(name_tr, name_en, w, h, ptr, pusd, stock, ord)
WHERE p.product_type = 'curtain' AND p.slug LIKE '%pamuk-keten-perde'
ON CONFLICT DO NOTHING;

-- Muslin curtain sizes (slightly different pricing)
INSERT INTO preset_sizes (product_id, name_tr, name_en, width_cm, height_cm, price_tr, price_usd, stock_quantity, sort_order, is_available)
SELECT p.id, s.name_tr, s.name_en, s.w, s.h, s.ptr, s.pusd, s.stock, s.ord, true
FROM products p
CROSS JOIN (VALUES
  ('50×63 inç (127×160 cm)', '50×63" (127×160 cm)',  127, 160, 0,    0,    30, 1),
  ('50×84 inç (127×213 cm)', '50×84" (127×213 cm)',  127, 213, 150,  8,    25, 2),
  ('50×96 inç (127×244 cm)', '50×96" (127×244 cm)',  127, 244, 300,  15,   20, 3),
  ('50×108 inç (127×274 cm)','50×108" (127×274 cm)', 127, 274, 450,  20,   15, 4),
  ('50×120 inç (127×305 cm)','50×120" (127×305 cm)', 127, 305, 600,  28,   10, 5)
) AS s(name_tr, name_en, w, h, ptr, pusd, stock, ord)
WHERE p.product_type = 'curtain' AND p.slug LIKE '%muslin-perde'
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRESET SIZES - Tablecloths
-- =====================================================

INSERT INTO preset_sizes (product_id, name_tr, name_en, width_cm, height_cm, price_tr, price_usd, stock_quantity, sort_order, is_available)
SELECT p.id, s.name_tr, s.name_en, s.w, s.h, s.ptr, s.pusd, s.stock, s.ord, true
FROM products p
CROSS JOIN (VALUES
  ('140×180 cm Dikdörtgen', '55×70" Rectangle',  140, 180, 0,    0,    15, 1),
  ('140×220 cm Dikdörtgen', '55×87" Rectangle',  140, 220, 200,  12,   12, 2),
  ('140×260 cm Dikdörtgen', '55×102" Rectangle', 140, 260, 400,  22,   10, 3),
  ('150×150 cm Kare',       '59×59" Square',      150, 150, 100,  5,    10, 4),
  ('Ø 150 cm Yuvarlak',     'Ø 59" Round',        150, 150, 200,  12,    8, 5)
) AS s(name_tr, name_en, w, h, ptr, pusd, stock, ord)
WHERE p.slug LIKE '%masa-ortusu'
ON CONFLICT DO NOTHING;

-- =====================================================
-- FABRIC ROLLS (Meter stock)
-- =====================================================

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, r.rn, r.lot, r.meters, r.loc
FROM products p
CROSS JOIN (VALUES
  ('R001', 'LOT-2026-A', 80.00, 'Depo A - Raf 1'),
  ('R002', 'LOT-2026-A', 55.00, 'Depo A - Raf 2'),
  ('R003', 'LOT-2026-B', 65.00, 'Depo B - Raf 1')
) AS r(rn, lot, meters, loc)
WHERE p.product_type = 'fabric'
ON CONFLICT DO NOTHING;

-- =====================================================
-- REVIEWS
-- =====================================================

INSERT INTO reviews (product_id, reviewer_name, rating, comment, source, category_keyword, is_approved, is_featured)
SELECT p.id, r.name, r.rating, r.cmt, 'website', 'curtain', true, r.feat
FROM products p JOIN (VALUES
  ('bej-pamuk-keten-perde', 'Ayşe K.', 5, 'Harika kalite! Tam istediğim renk tonunda geldi. Oturma odamızı tamamen değiştirdi.', true),
  ('bej-pamuk-keten-perde', 'Sarah M.', 5, 'Beautiful quality, exactly as described. The light filtering is perfect — not too dark, not too sheer.', true),
  ('antrasit-pamuk-keten-perde', 'Can D.', 5, 'Yatak odamız için aldım, harika bir görünüm. Kumaş kalitesi çok yüksek.', true),
  ('hardal-pamuk-keten-perde', 'Elif S.', 5, 'Keten dokusu çok doğal ve güzel. Bohem tarzı arıyordum, buldum!', false),
  ('bej-muslin-perde', 'Jennifer L.', 5, 'So soft and airy! Perfect for our nursery. The organic cotton feels wonderful.', true),
  ('bej-muslin-perde', 'Mehmet Y.', 4, 'Güzel kumaş ama biraz şeffaf geldi. Tül olarak kullanıyoruz harika duruyor.', false),
  ('isik-filtreli-muslin-perde', 'Zeynep A.', 5, 'Çok şık! Modern evimize çok yakıştı. Kargo da çok hızlıydı.', true),
  ('acik-gri-pamuk-keten-perde', 'Fatma B.', 5, 'Premium kalite gerçekten hissediliyor. Misafirlerimiz çok beğendi!', true),
  ('pamuk-keten-kumas-metrelik', 'Seda M.', 5, 'Kumaş kalitesi çok yüksek. Kendi perdelerimi diktim, mükemmel oldu.', false),
  ('karamel-muslin-perde', 'Emily R.', 4, 'Love the color! Arrived quickly and well packaged. Beautiful in our living room.', false)
) AS r(slug, name, rating, cmt, feat) ON p.slug = r.slug
ON CONFLICT DO NOTHING;
