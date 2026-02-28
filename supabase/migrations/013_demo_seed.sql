-- =====================================================
-- DEMO SEED DATA - Realistic products with real images
-- Run this AFTER the initial migrations
-- =====================================================

-- First, ensure categories exist with images
UPDATE categories SET image_url = '/images/products/Cotton-linen-curtain.jpg' WHERE slug = 'keten';
UPDATE categories SET image_url = '/images/products/beige-cotton-curtain.jpg' WHERE slug = 'pamuk';
UPDATE categories SET image_url = '/images/products/grey-curtain.jpg' WHERE slug = 'perde';

-- Add curtain-specific categories
INSERT INTO categories (slug, name_tr, name_en, description_tr, description_en, image_url, sort_order, is_active) VALUES
  ('pamuk-perde', 'Pamuk Perdeler', 'Cotton Curtains', 'Doğal pamuk liflerinden üretilen, nefes alan ve şık perdeler', 'Stylish, breathable curtains made from natural cotton fibers', '/images/products/beige-cotton-curtain.jpg', 10, true),
  ('keten-perde', 'Keten Perdeler', 'Linen Curtains', 'Doğal keten liflerden el dokuması perdeler', 'Hand-woven curtains from natural linen fibers', '/images/products/linen-curtain-panels.jpg', 11, true),
  ('isik-filtreli', 'Işık Filtreli Perdeler', 'Light Filtering Curtains', 'Gün ışığını yumuşatarak içeri alan, zarif perdeler', 'Elegant curtains that gently filter natural light', '/images/products/light-filtered-curtain.jpg', 12, true),
  ('yatak-odasi', 'Yatak Odası Perdeleri', 'Bedroom Curtains', 'Huzurlu bir uyku için özel tasarlanmış perdeler', 'Specially designed curtains for a peaceful sleep', '/images/products/beige-curtain-for-bedroom.jpg', 13, true),
  ('oturma-odasi', 'Oturma Odası Perdeleri', 'Living Room Curtains', 'Oturma odanıza şıklık katan perdeler', 'Curtains that add elegance to your living room', '/images/products/curtain-for-livingroom.jpg', 14, true),
  ('masa-ortusu', 'Masa Örtüleri', 'Tablecloths', 'El yapımı doğal kumaş masa örtüleri', 'Handmade natural fabric tablecloths', '/images/products/Cotton-linen-curtain.jpg', 20, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  image_url = EXCLUDED.image_url;

-- =====================================================
-- PRODUCTS - Curtains (preset_sizes)
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

-- 1. Beige Cotton Curtain
('bej-pamuk-perde', 'GF-CUR-001', 
 'Bej Pamuk Perde', 'Beige Cotton Curtain',
 'Doğal %100 pamuk liflerinden üretilen, ışık filtreli bej perde. Oturma odası ve yatak odası için ideal. El yapımı, her biri özenle dikilmiştir.',
 'Made from 100% natural cotton fibers, this light-filtering beige curtain is perfect for living rooms and bedrooms. Handcrafted with care.',
 (SELECT id FROM categories WHERE slug = 'pamuk-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/beige-cotton-curtain.jpg', '/images/products/beige-drapery.jpg', '/images/products/beige-light-filtered-curtain.jpg'],
 '/images/products/beige-cotton-curtain.jpg',
 true, true, false, true, true),

-- 2. Grey Cotton Curtain
('gri-pamuk-perde', 'GF-CUR-002',
 'Gri Pamuk Perde', 'Grey Cotton Curtain',
 'Modern gri tonlarında, %100 pamuk perde. Minimalist dekorasyon için mükemmel. Doğal ışığı yumuşatarak filtreler.',
 'Modern grey cotton curtain in 100% cotton. Perfect for minimalist decor. Naturally filters and softens light.',
 (SELECT id FROM categories WHERE slug = 'pamuk-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/cotton-curtain-grey.jpg', '/images/products/grey-curtain.jpg', '/images/products/grey-light-filtered-curtain.jpg'],
 '/images/products/cotton-curtain-grey.jpg',
 true, true, false, true, true),

-- 3. Anthracite Curtain
('antrasit-perde', 'GF-CUR-003',
 'Antrasit Pamuk Perde', 'Anthracite Cotton Curtain',
 'Koyu antrasit tonunda, zarif ve sofistike pamuk perde. Karartma özelliği ile yatak odası için idealdir.',
 'Dark anthracite-toned, elegant and sophisticated cotton curtain. With blackout properties, ideal for bedrooms.',
 (SELECT id FROM categories WHERE slug = 'yatak-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/anthracite-curtain.jpg', '/images/products/slate-grey-curtain.jpg', '/images/products/slate-gray-curtain.jpg'],
 '/images/products/anthracite-curtain.jpg',
 true, true, true, true, true),

-- 4. Mustard Linen Curtain
('hardal-keten-perde', 'GF-CUR-004',
 'Hardal Keten Perde', 'Mustard Linen Curtain',
 'Sıcak hardal sarısı tonunda, %100 keten perde. Doğal dokusu ile mekana karakter katar. Bohem ve İskandinav tarzına uygun.',
 'Warm mustard-toned 100% linen curtain. Adds character with its natural texture. Suits bohemian and Scandinavian styles.',
 (SELECT id FROM categories WHERE slug = 'keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/mustard-linen-curtain.jpg', '/images/products/cotton-linen-yellow-curtain.jpg', '/images/products/light-filtered-curtain-yellow.jpg'],
 '/images/products/mustard-linen-curtain.jpg',
 true, true, true, true, true),

-- 5. Off-White Curtain
('kırık-beyaz-perde', 'GF-CUR-005',
 'Kırık Beyaz Pamuk Perde', 'Off-White Cotton Curtain',
 'Zarif kırık beyaz tonunda pamuk perde. Minimalist ve temiz bir görünüm sağlar. Her mekan ile uyumlu.',
 'Elegant off-white cotton curtain. Provides a minimalist, clean look. Harmonious with any space.',
 (SELECT id FROM categories WHERE slug = 'oturma-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/off-white-curtain.jpg', '/images/products/off-white-cotton-curtain.jpg', '/images/products/white-curtain-for-livingroom.jpg'],
 '/images/products/off-white-curtain.jpg',
 true, true, false, true, true),

-- 6. Pink Cotton Curtain
('pembe-pamuk-perde', 'GF-CUR-006',
 'Pudra Pembe Pamuk Perde', 'Blush Pink Cotton Curtain',
 'Zarif pudra pembe tonunda pamuk perde. Yatak odası ve çocuk odası için ideal. Yumuşak ışık filtresi.',
 'Elegant blush pink cotton curtain. Perfect for bedrooms and children''s rooms. Soft light filtering.',
 (SELECT id FROM categories WHERE slug = 'yatak-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/pink-cotton-curtain.jpg', '/images/products/light-filtered-cotton-curtain.jpg'],
 '/images/products/pink-cotton-curtain.jpg',
 true, false, true, true, true),

-- 7. Caramel Brown Curtain
('karamel-kahve-perde', 'GF-CUR-007',
 'Karamel Kahve Perde', 'Caramel Brown Curtain',
 'Sıcak karamel kahve tonunda, lüks görünümlü perde. Oturma odası ve yemek odası için mükemmel.',
 'Warm caramel brown curtain with a luxurious appearance. Perfect for living rooms and dining rooms.',
 (SELECT id FROM categories WHERE slug = 'oturma-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/caramel-brown-curtain.jpg', '/images/products/light-brown-curtain.jpg', '/images/products/custom-made-curtain.jpg'],
 '/images/products/caramel-brown-curtain.jpg',
 true, false, false, true, true),

-- 8. Light Grey Linen Curtain
('acik-gri-keten-perde', 'GF-CUR-008',
 'Açık Gri Keten Perde', 'Light Grey Linen Curtain',
 'Doğal keten liflerden üretilen açık gri perde. Hafif ve nefes alan yapısıyla dört mevsim kullanıma uygun.',
 'Light grey curtain made from natural linen fibers. Lightweight and breathable, suitable for four-season use.',
 (SELECT id FROM categories WHERE slug = 'keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/light-grey-cotton-curtain.jpg', '/images/products/linen-curtain-grey.jpg'],
 '/images/products/light-grey-cotton-curtain.jpg',
 true, false, false, true, true),

-- 9. Tab Top Linen Curtains
('askili-keten-perde', 'GF-CUR-009',
 'Askılı (Tab Top) Keten Perde', 'Tab Top Linen Curtain',
 'Klasik askılı (tab top) tasarımlı, doğal keten perde. Rustik ve Country tarzı dekorasyon için ideal.',
 'Classic tab top design, natural linen curtain. Ideal for rustic and country-style decoration.',
 (SELECT id FROM categories WHERE slug = 'keten-perde'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/tab-top-linen-curtains.jpg', '/images/products/linen-curtain-panels.jpg'],
 '/images/products/tab-top-linen-curtains.jpg',
 true, false, true, true, true),

-- 10. Bedroom Curtain Set
('yatak-odasi-perde-seti', 'GF-CUR-010',
 'Yatak Odası Perde Seti', 'Bedroom Curtain Set',
 'Yatak odanız için özel tasarlanmış çift panel perde seti. Işık geçirmez astarı ile huzurlu bir uyku.',
 'Specially designed double panel curtain set for your bedroom. Peaceful sleep with blackout lining.',
 (SELECT id FROM categories WHERE slug = 'yatak-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/curtain-for-bedroom.jpg', '/images/products/beige-curtain-for-bedroom.jpg'],
 '/images/products/curtain-for-bedroom.jpg',
 true, true, false, true, true),

-- 11. Curtain for Living Room
('salon-perdesi', 'GF-CUR-011',
 'Salon Perdesi Premium', 'Premium Living Room Curtain',
 'Oturma odanızı dönüştürecek premium kalite perde. Doğal pamuk-keten karışımı, el işçiliği.',
 'Premium quality curtain to transform your living room. Natural cotton-linen blend, handcrafted.',
 (SELECT id FROM categories WHERE slug = 'oturma-odasi'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/curtain-for-livingroom.jpg', '/images/products/custom-made-curtain.jpg'],
 '/images/products/curtain-for-livingroom.jpg',
 true, true, false, true, true),

-- 12. Light Filtering Curtain
('isik-filtreli-perde', 'GF-CUR-012',
 'Işık Filtreli Tül Perde', 'Light Filtering Sheer Curtain',
 'Gün ışığını yumuşatarak filtreleyen, zarif tül perde. Mahremiyet sağlarken doğal aydınlığı korur.',
 'Elegant sheer curtain that gently filters daylight. Maintains natural brightness while providing privacy.',
 (SELECT id FROM categories WHERE slug = 'isik-filtreli'), 'curtain', 'preset_sizes',
 ARRAY['/images/products/light-filtered-curtain.jpg', '/images/products/light-filtered-cotton-curtain.jpg', '/images/products/light-filtered-curtain-yellow.jpg'],
 '/images/products/light-filtered-curtain.jpg',
 true, false, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en,
  images = EXCLUDED.images,
  thumbnail_url = EXCLUDED.thumbnail_url,
  is_featured = EXCLUDED.is_featured,
  is_new = EXCLUDED.is_new;

-- =====================================================
-- PRODUCTS - Fabrics (meter-based)
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

-- 13. Cotton-Linen Blend Fabric
('pamuk-keten-karisim-kumas', 'GF-FAB-001',
 'Pamuk-Keten Karışım Kumaş', 'Cotton-Linen Blend Fabric',
 'Doğal %55 pamuk, %45 keten karışım kumaş. 280 cm eninde, döşemelik ve perde için uygun. GSM: 220.',
 'Natural 55% cotton, 45% linen blend fabric. 280 cm wide, suitable for upholstery and curtains. GSM: 220.',
 (SELECT id FROM categories WHERE slug = 'keten'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/Cotton-linen-curtain.jpg', '/images/products/_DSC0063-HDR- beige poplin.jpg'],
 '/images/products/Cotton-linen-curtain.jpg',
 true, true, false, true, true),

-- 14. Beige Poplin
('bej-poplin-kumas', 'GF-FAB-002',
 'Bej Poplin Kumaş', 'Beige Poplin Fabric',
 'Premium kalite bej poplin kumaş. Perde ve döşemelik için ideal. Kolay dikilir, yıkanabilir.',
 'Premium quality beige poplin fabric. Ideal for curtains and upholstery. Easy to sew, washable.',
 (SELECT id FROM categories WHERE slug = 'pamuk'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/_DSC0063-HDR- beige poplin.jpg', '/images/products/beige-drapery.jpg'],
 '/images/products/_DSC0063-HDR- beige poplin.jpg',
 true, false, true, true, true),

-- 15. Cotton Curtain Mustard Fabric
('hardal-pamuk-kumas', 'GF-FAB-003',
 'Hardal Pamuk Kumaş', 'Mustard Cotton Fabric',
 'Canlı hardal sarısı tonunda %100 pamuk kumaş. Perde, yastık kılıfı ve masa örtüsü yapımına uygun.',
 'Vibrant mustard yellow 100% cotton fabric. Suitable for curtains, pillow covers, and tablecloths.',
 (SELECT id FROM categories WHERE slug = 'pamuk'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/cotton-linen-yellow-curtain.jpg', '/images/products/mustard-linen-curtain.jpg'],
 '/images/products/cotton-linen-yellow-curtain.jpg',
 true, false, false, true, true),

-- 16. Studio Shot Fabric
('dogal-kumas-koleksiyonu', 'GF-FAB-004',
 'Doğal Kumaş Koleksiyonu', 'Natural Fabric Collection',
 'Özenle seçilmiş doğal liflerden üretilen premium kumaş. Perde ve ev tekstili projeleriniz için.',
 'Premium fabric made from carefully selected natural fibers. For your curtain and home textile projects.',
 (SELECT id FROM categories WHERE slug = 'keten'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/_DSC0265(1)-1.jpg', '/images/products/_DSC0274(8).jpg', '/images/products/_DSC0009(2).ARW-23-28-45-060.jpg'],
 '/images/products/_DSC0265(1)-1.jpg',
 true, true, true, true, true),

-- 17. Grey Linen Fabric
('gri-keten-kumas', 'GF-FAB-005',
 'Gri Keten Kumaş', 'Grey Linen Fabric',
 'Doğal gri tonlarında %100 keten kumaş. 280 cm eninde. Perde ve masa örtüsü için ideal.',
 'Natural grey 100% linen fabric. 280 cm wide. Ideal for curtains and tablecloths.',
 (SELECT id FROM categories WHERE slug = 'keten'), 'fabric', 'meter', 1, 0.5,
 ARRAY['/images/products/linen-curtain-grey.jpg', '/images/products/light-grey-cotton-curtain.jpg'],
 '/images/products/linen-curtain-grey.jpg',
 true, false, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en,
  images = EXCLUDED.images,
  thumbnail_url = EXCLUDED.thumbnail_url,
  is_featured = EXCLUDED.is_featured;

-- =====================================================
-- PRODUCTS - Pillows (unit-based)
-- =====================================================

INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global) VALUES

-- 18. Linen Pillow
('keten-yastik', 'GF-PIL-001',
 'Keten Kırlent', 'Linen Throw Pillow',
 'Doğal keten kumaştan el yapımı kırlent. 45×45 cm. İç yastık dahil.',
 'Handmade throw pillow from natural linen fabric. 45×45 cm. Inner pillow included.',
 (SELECT id FROM categories WHERE slug = 'keten'), 'pillow', 'unit',
 ARRAY['/images/products/_DSC0359-7w.jpg', '/images/products/_DSC0274(8).jpg'],
 '/images/products/_DSC0359-7w.jpg',
 true, false, true, true, true),

-- 19. Cotton Pillow
('pamuk-kirlent', 'GF-PIL-002',
 'Pamuk Kırlent', 'Cotton Throw Pillow',
 'Yumuşak %100 pamuk kumaştan kırlent. 50×50 cm. Doğal renk tonlarında.',
 'Soft 100% cotton throw pillow. 50×50 cm. In natural color tones.',
 (SELECT id FROM categories WHERE slug = 'pamuk'), 'pillow', 'unit',
 ARRAY['/images/products/_DSC0274(8).jpg', '/images/products/beige-drapery.jpg'],
 '/images/products/_DSC0274(8).jpg',
 true, false, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  images = EXCLUDED.images,
  thumbnail_url = EXCLUDED.thumbnail_url;

-- =====================================================
-- PRODUCT PRICES (Dual-market: TR and GLOBAL)
-- =====================================================

-- Curtain prices (TRY)
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', prices.price, prices.compare_at
FROM products p
JOIN (VALUES
  ('bej-pamuk-perde', 1290.00, 1590.00),
  ('gri-pamuk-perde', 1190.00, NULL),
  ('antrasit-perde', 1390.00, 1790.00),
  ('hardal-keten-perde', 1490.00, NULL),
  ('kırık-beyaz-perde', 1090.00, NULL),
  ('pembe-pamuk-perde', 1190.00, NULL),
  ('karamel-kahve-perde', 1290.00, NULL),
  ('acik-gri-keten-perde', 1390.00, NULL),
  ('askili-keten-perde', 1190.00, NULL),
  ('yatak-odasi-perde-seti', 1890.00, 2290.00),
  ('salon-perdesi', 1690.00, NULL),
  ('isik-filtreli-perde', 990.00, NULL),
  ('pamuk-keten-karisim-kumas', 390.00, NULL),
  ('bej-poplin-kumas', 290.00, NULL),
  ('hardal-pamuk-kumas', 320.00, NULL),
  ('dogal-kumas-koleksiyonu', 450.00, NULL),
  ('gri-keten-kumas', 410.00, NULL),
  ('keten-yastik', 490.00, NULL),
  ('pamuk-kirlent', 390.00, NULL)
) AS prices(slug, price, compare_at) ON p.slug = prices.slug
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price;

-- Curtain prices (USD)
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', prices.price, prices.compare_at
FROM products p
JOIN (VALUES
  ('bej-pamuk-perde', 89.00, 109.00),
  ('gri-pamuk-perde', 79.00, NULL),
  ('antrasit-perde', 95.00, 119.00),
  ('hardal-keten-perde', 99.00, NULL),
  ('kırık-beyaz-perde', 75.00, NULL),
  ('pembe-pamuk-perde', 79.00, NULL),
  ('karamel-kahve-perde', 89.00, NULL),
  ('acik-gri-keten-perde', 95.00, NULL),
  ('askili-keten-perde', 79.00, NULL),
  ('yatak-odasi-perde-seti', 129.00, 159.00),
  ('salon-perdesi', 115.00, NULL),
  ('isik-filtreli-perde', 69.00, NULL),
  ('pamuk-keten-karisim-kumas', 28.00, NULL),
  ('bej-poplin-kumas', 22.00, NULL),
  ('hardal-pamuk-kumas', 24.00, NULL),
  ('dogal-kumas-koleksiyonu', 32.00, NULL),
  ('gri-keten-kumas', 29.00, NULL),
  ('keten-yastik', 35.00, NULL),
  ('pamuk-kirlent', 29.00, NULL)
) AS prices(slug, price, compare_at) ON p.slug = prices.slug
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price;

-- =====================================================
-- PRESET SIZES (For curtain products)
-- =====================================================

-- Standard sizes for all curtain products
INSERT INTO preset_sizes (product_id, name_tr, name_en, width_cm, height_cm, price_tr, price_usd, stock_quantity, sort_order, is_available)
SELECT p.id, sizes.name_tr, sizes.name_en, sizes.w, sizes.h, sizes.ptr, sizes.pusd, sizes.stock, sizes.ord, true
FROM products p
CROSS JOIN (VALUES
  ('140×240 cm', '140×240 cm', 140, 240, 0, 0, 25, 1),
  ('140×260 cm', '140×260 cm', 140, 260, 100, 8, 20, 2),
  ('140×280 cm', '140×280 cm', 140, 280, 200, 15, 15, 3),
  ('200×260 cm', '200×260 cm', 200, 260, 400, 30, 10, 4),
  ('200×280 cm', '200×280 cm', 200, 280, 600, 45, 8, 5)
) AS sizes(name_tr, name_en, w, h, ptr, pusd, stock, ord)
WHERE p.product_type = 'curtain' AND p.slug IN (
  'bej-pamuk-perde', 'gri-pamuk-perde', 'antrasit-perde', 'hardal-keten-perde',
  'kırık-beyaz-perde', 'pembe-pamuk-perde', 'karamel-kahve-perde', 'acik-gri-keten-perde',
  'askili-keten-perde', 'yatak-odasi-perde-seti', 'salon-perdesi', 'isik-filtreli-perde'
);

-- =====================================================
-- FABRIC ROLLS (Meter-based stock)
-- =====================================================

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, rolls.rn, rolls.lot, rolls.meters, rolls.loc
FROM products p
CROSS JOIN (VALUES
  ('R001', 'LOT-2026-01', 50.00, 'Depo A - Raf 1'),
  ('R002', 'LOT-2026-01', 35.00, 'Depo A - Raf 2'),
  ('R003', 'LOT-2026-02', 42.00, 'Depo B - Raf 1')
) AS rolls(rn, lot, meters, loc)
WHERE p.product_type = 'fabric' AND p.slug IN (
  'pamuk-keten-karisim-kumas', 'bej-poplin-kumas', 'hardal-pamuk-kumas', 
  'dogal-kumas-koleksiyonu', 'gri-keten-kumas'
);

-- =====================================================
-- CUSTOMER REVIEWS (Fake but realistic)
-- =====================================================

INSERT INTO customer_reviews (product_id, reviewer_name, rating, comment_tr, comment_en, is_approved) 
SELECT p.id, r.name, r.rating, r.ctr, r.cen, true
FROM products p
JOIN (VALUES
  ('bej-pamuk-perde', 'Ayşe K.', 5, 'Harika kalite! Tam istediğim renk tonunda geldi. Oturma odamızı tamamen değiştirdi.', 'Amazing quality! Arrived in exactly the shade I wanted. Completely transformed our living room.'),
  ('bej-pamuk-perde', 'Mehmet Y.', 4, 'Güzel kumaş, dikişleri çok düzgün. Sadece renk fotoğraftan biraz farklı geldi.', 'Nice fabric, very neat stitching. Color was slightly different from the photo though.'),
  ('gri-pamuk-perde', 'Zeynep A.', 5, 'Çok şık! Modern evimize çok yakıştı. Kargo da çok hızlıydı, teşekkürler.', 'Very elegant! Looks great in our modern home. Shipping was also very fast, thanks.'),
  ('antrasit-perde', 'Can D.', 5, 'Yatak odamız için aldım, karartma özelliği mükemmel. Derin bir uyku çekiyoruz artık.', 'Got it for our bedroom, blackout feature is perfect. We sleep deeply now.'),
  ('hardal-keten-perde', 'Elif S.', 5, 'Keten dokusu çok doğal ve güzel. Tam bohem tarzı arıyordum, buldum!', 'Linen texture is very natural and beautiful. I was looking for a boho style, found it!'),
  ('hardal-keten-perde', 'Deniz T.', 4, 'Rengi çok güzel ama doğal olduğu için biraz büzüşme oldu yıkamada.', 'Color is beautiful but being natural, it shrunk a bit in the wash.'),
  ('salon-perdesi', 'Fatma B.', 5, 'Premium kalite gerçekten hissediliyor. Misafirlerimiz çok beğendi!', 'Premium quality is truly felt. Our guests loved it!'),
  ('yatak-odasi-perde-seti', 'Ali R.', 5, 'Set olarak almak çok mantıklı. İkisi birlikte harika duruyor.', 'Buying as a set makes a lot of sense. They look great together.'),
  ('pamuk-keten-karisim-kumas', 'Seda M.', 5, 'Kumaş kalitesi çok yüksek. Kendi perdelerimi diktim, mükemmel oldu.', 'Fabric quality is very high. I sewed my own curtains, turned out perfect.'),
  ('keten-yastik', 'Burcu E.', 4, 'Çok soft bir doku, kanepe üzerinde harika duruyor.', 'Very soft texture, looks amazing on the couch.')
) AS r(slug, name, rating, ctr, cen) ON p.slug = r.slug
ON CONFLICT DO NOTHING;
