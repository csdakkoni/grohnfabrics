-- =====================================================
-- DEMO PRODUCTS FOR GROHN FABRICS
-- Beautiful sample products with real images
-- =====================================================

-- First, ensure categories exist
INSERT INTO categories (slug, name_tr, name_en, description_tr, description_en, sort_order, is_active) VALUES
  ('kadife', 'Kadife Kumaşlar', 'Velvet Fabrics', 'Lüks kadife kumaş koleksiyonu', 'Luxurious velvet fabric collection', 1, true),
  ('keten', 'Keten Kumaşlar', 'Linen Fabrics', 'Doğal keten kumaş koleksiyonu', 'Natural linen fabric collection', 2, true),
  ('pamuk', 'Pamuklu Kumaşlar', 'Cotton Fabrics', 'Saf pamuk kumaş koleksiyonu', 'Pure cotton fabric collection', 3, true),
  ('perde', 'Perde Kumaşları', 'Curtain Fabrics', 'Şık perde kumaşları', 'Elegant curtain fabrics', 4, true),
  ('dosemelik', 'Döşemelik Kumaşlar', 'Upholstery Fabrics', 'Dayanıklı döşemelik kumaşlar', 'Durable upholstery fabrics', 5, true),
  ('yastik', 'Dekoratif Yastıklar', 'Decorative Pillows', 'El yapımı dekoratif yastıklar', 'Handmade decorative pillows', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en;

-- =====================================================
-- FABRIC PRODUCTS (Meter-based)
-- =====================================================

-- 1. Premium Emerald Velvet
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'premium-emerald-velvet',
  'VLV-EMR-001',
  'Premium Zümrüt Kadife',
  'Premium Emerald Velvet',
  'Lüks zümrüt yeşili kadife kumaş. Yüksek kaliteli polyester karışımlı, yumuşak dokusu ile mobilya ve dekorasyon projeleriniz için ideal. 280cm en, 450 gr/m² ağırlık.',
  'Luxurious emerald green velvet fabric. High-quality polyester blend with soft texture, ideal for furniture and decoration projects. 280cm width, 450 gsm weight.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80',
  true, true, true, true, true
FROM categories c WHERE c.slug = 'kadife'
ON CONFLICT (slug) DO NOTHING;

-- 2. Royal Navy Velvet
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'royal-navy-velvet',
  'VLV-NVY-002',
  'Royal Lacivert Kadife',
  'Royal Navy Velvet',
  'Kraliyet laciverti kadife kumaş. Derin mavi tonuyla sofistike bir şıklık. Koltuk, puf ve yatak başlıkları için mükemmel seçim.',
  'Royal navy blue velvet fabric. Sophisticated elegance with deep blue tone. Perfect choice for sofas, poufs and headboards.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  true, true, false, true, true
FROM categories c WHERE c.slug = 'kadife'
ON CONFLICT (slug) DO NOTHING;

-- 3. Natural Oatmeal Linen
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'natural-oatmeal-linen',
  'LNN-OAT-001',
  'Doğal Yulaf Rengi Keten',
  'Natural Oatmeal Linen',
  '%100 saf Belçika keteni. Doğal yulaf rengi tonuyla rustik ve modern tasarımlar için ideal. Yıkandıkça yumuşayan doğal yapı. 150cm en.',
  '100% pure Belgian linen. Ideal for rustic and modern designs with natural oatmeal tone. Natural texture that softens with washing. 150cm width.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80',
  true, true, true, true, true
FROM categories c WHERE c.slug = 'keten'
ON CONFLICT (slug) DO NOTHING;

-- 4. Sage Green Linen
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'sage-green-linen',
  'LNN-SGE-002',
  'Adaçayı Yeşili Keten',
  'Sage Green Linen',
  'Huzur veren adaçayı yeşili tonunda %100 keten kumaş. Yatak odası ve oturma odası projeleri için mükemmel. Doğal ve sürdürülebilir.',
  'Calming sage green 100% linen fabric. Perfect for bedroom and living room projects. Natural and sustainable.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  true, false, true, true, true
FROM categories c WHERE c.slug = 'keten'
ON CONFLICT (slug) DO NOTHING;

-- 5. Ivory Cotton Canvas
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'ivory-cotton-canvas',
  'CTN-IVR-001',
  'Fildişi Pamuk Kanvas',
  'Ivory Cotton Canvas',
  'Ağır dokulu %100 pamuk kanvas. Çanta, perde ve döşeme projeleri için ideal. 340 gr/m² ağırlık, yüksek dayanıklılık.',
  'Heavy-textured 100% cotton canvas. Ideal for bags, curtains and upholstery projects. 340 gsm weight, high durability.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80',
  true, false, false, true, true
FROM categories c WHERE c.slug = 'pamuk'
ON CONFLICT (slug) DO NOTHING;

-- 6. Terracotta Cotton
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'terracotta-cotton',
  'CTN-TRC-002',
  'Terrakota Pamuk',
  'Terracotta Cotton',
  'Sıcak terrakota tonunda %100 organik pamuk. Bohem ve Akdeniz tarzı dekorasyon için ideal. Çevre dostu üretim.',
  'Warm terracotta tone 100% organic cotton. Ideal for bohemian and Mediterranean style decoration. Eco-friendly production.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  true, true, false, true, true
FROM categories c WHERE c.slug = 'pamuk'
ON CONFLICT (slug) DO NOTHING;

-- 7. Sheer White Voile
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'sheer-white-voile',
  'CRT-WHT-001',
  'Şeffaf Beyaz Tül',
  'Sheer White Voile',
  'Zarif beyaz tül perde kumaşı. Işığı yumuşatarak mekanlarınıza ferahlık katar. 300cm en, kolay dikim.',
  'Elegant white voile curtain fabric. Softens light and adds freshness to your spaces. 300cm width, easy sewing.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
  true, false, true, true, true
FROM categories c WHERE c.slug = 'perde'
ON CONFLICT (slug) DO NOTHING;

-- 8. Blackout Charcoal
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'blackout-charcoal',
  'CRT-CHR-002',
  'Karartma Antrasit',
  'Blackout Charcoal',
  '%100 karartma özellikli antrasit perde kumaşı. Yatak odaları ve ev sinemaları için ideal. Termal yalıtım sağlar.',
  '100% blackout charcoal curtain fabric. Ideal for bedrooms and home theaters. Provides thermal insulation.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  true, true, false, true, true
FROM categories c WHERE c.slug = 'perde'
ON CONFLICT (slug) DO NOTHING;

-- 9. Bouclé Cream
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'boucle-cream',
  'UPH-BCL-001',
  'Bukle Krem',
  'Bouclé Cream',
  'Trend bukle dokulu döşemelik kumaş. Modern ve İskandinav tasarım için mükemmel. Yüksek aşınma dayanımı.',
  'Trendy bouclé textured upholstery fabric. Perfect for modern and Scandinavian design. High abrasion resistance.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  true, true, true, true, true
FROM categories c WHERE c.slug = 'dosemelik'
ON CONFLICT (slug) DO NOTHING;

-- 10. Leather Look Brown
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'leather-look-brown',
  'UPH-LTH-002',
  'Deri Görünümlü Kahve',
  'Leather Look Brown',
  'Premium deri görünümlü döşemelik kumaş. Gerçek deriden ayırt edilemez görünüm, kolay bakım. Hayvan dostu alternatif.',
  'Premium leather-look upholstery fabric. Indistinguishable from real leather, easy care. Animal-friendly alternative.',
  c.id, 'fabric', 'meter', 1, 0.5,
  ARRAY[
    'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400&q=80',
  true, false, false, true, true
FROM categories c WHERE c.slug = 'dosemelik'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PILLOW PRODUCTS (Unit-based)
-- =====================================================

-- 11. Velvet Emerald Pillow
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'velvet-emerald-pillow-45x45',
  'PLW-VLV-EMR-45',
  'Kadife Zümrüt Yastık 45x45',
  'Velvet Emerald Pillow 45x45',
  'Lüks zümrüt yeşili kadife yastık. 45x45cm boyutunda, silikonlu elyaf dolgu dahil. El yapımı, gizli fermuarlı.',
  'Luxurious emerald green velvet pillow. 45x45cm size, silicone fiber filling included. Handmade with hidden zipper.',
  c.id, 'pillow', 'unit', 1, 1,
  ARRAY[
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  true, true, true, true, true
FROM categories c WHERE c.slug = 'yastik'
ON CONFLICT (slug) DO NOTHING;

-- 12. Linen Natural Pillow
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'linen-natural-pillow-50x50',
  'PLW-LNN-NAT-50',
  'Keten Doğal Yastık 50x50',
  'Linen Natural Pillow 50x50',
  '%100 Belçika keteni yastık kılıfı. 50x50cm boyutunda, premium kaz tüyü dolgulu. Doğal ve nefes alan.',
  '100% Belgian linen pillow cover. 50x50cm size with premium goose down filling. Natural and breathable.',
  c.id, 'pillow', 'unit', 1, 1,
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80',
  true, true, false, true, true
FROM categories c WHERE c.slug = 'yastik'
ON CONFLICT (slug) DO NOTHING;

-- 13. Bouclé Ivory Pillow Set
INSERT INTO products (slug, sku, name_tr, name_en, description_tr, description_en, category_id, product_type, sales_model, min_order_quantity, order_step, images, thumbnail_url, is_active, is_featured, is_new, show_in_tr, show_in_global)
SELECT 
  'boucle-ivory-pillow-set',
  'PLW-BCL-IVR-SET',
  'Bukle Fildişi Yastık Seti',
  'Bouclé Ivory Pillow Set',
  '3 parça bukle yastık seti: 2x 45x45cm + 1x 30x50cm. Trend bukle dokusu, modern tasarım. Set halinde avantajlı fiyat.',
  '3-piece bouclé pillow set: 2x 45x45cm + 1x 30x50cm. Trendy bouclé texture, modern design. Advantageous set price.',
  c.id, 'pillow', 'unit', 1, 1,
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  true, true, true, true, true
FROM categories c WHERE c.slug = 'yastik'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PRODUCT PRICES (TR & GLOBAL Markets)
-- =====================================================

-- Premium Emerald Velvet prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 450.00, 550.00
FROM products p WHERE p.slug = 'premium-emerald-velvet'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 28.00, 35.00
FROM products p WHERE p.slug = 'premium-emerald-velvet'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Royal Navy Velvet prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 420.00, NULL
FROM products p WHERE p.slug = 'royal-navy-velvet'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 26.00, NULL
FROM products p WHERE p.slug = 'royal-navy-velvet'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Natural Oatmeal Linen prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 680.00, 780.00
FROM products p WHERE p.slug = 'natural-oatmeal-linen'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 42.00, 48.00
FROM products p WHERE p.slug = 'natural-oatmeal-linen'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Sage Green Linen prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 720.00, NULL
FROM products p WHERE p.slug = 'sage-green-linen'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 45.00, NULL
FROM products p WHERE p.slug = 'sage-green-linen'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Ivory Cotton Canvas prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 280.00, NULL
FROM products p WHERE p.slug = 'ivory-cotton-canvas'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 18.00, NULL
FROM products p WHERE p.slug = 'ivory-cotton-canvas'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Terracotta Cotton prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 320.00, 380.00
FROM products p WHERE p.slug = 'terracotta-cotton'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 20.00, 24.00
FROM products p WHERE p.slug = 'terracotta-cotton'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Sheer White Voile prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 180.00, NULL
FROM products p WHERE p.slug = 'sheer-white-voile'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 12.00, NULL
FROM products p WHERE p.slug = 'sheer-white-voile'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Blackout Charcoal prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 350.00, 420.00
FROM products p WHERE p.slug = 'blackout-charcoal'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 22.00, 26.00
FROM products p WHERE p.slug = 'blackout-charcoal'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Bouclé Cream prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 580.00, 680.00
FROM products p WHERE p.slug = 'boucle-cream'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 36.00, 42.00
FROM products p WHERE p.slug = 'boucle-cream'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Leather Look Brown prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 420.00, NULL
FROM products p WHERE p.slug = 'leather-look-brown'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 26.00, NULL
FROM products p WHERE p.slug = 'leather-look-brown'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Velvet Emerald Pillow prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 890.00, 1100.00
FROM products p WHERE p.slug = 'velvet-emerald-pillow-45x45'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 55.00, 68.00
FROM products p WHERE p.slug = 'velvet-emerald-pillow-45x45'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Linen Natural Pillow prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 1250.00, NULL
FROM products p WHERE p.slug = 'linen-natural-pillow-50x50'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 78.00, NULL
FROM products p WHERE p.slug = 'linen-natural-pillow-50x50'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price;

-- Bouclé Ivory Pillow Set prices
INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'TR', 'TRY', 2200.00, 2800.00
FROM products p WHERE p.slug = 'boucle-ivory-pillow-set'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

INSERT INTO product_prices (product_id, market_id, currency, price, compare_at_price)
SELECT p.id, 'GLOBAL', 'USD', 135.00, 175.00
FROM products p WHERE p.slug = 'boucle-ivory-pillow-set'
ON CONFLICT (product_id, market_id, currency) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- =====================================================
-- FABRIC ROLLS (Stock for meter-based products)
-- =====================================================

-- Add stock for fabric products
INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-EMR-001', 'LOT-2024-001', 50.00, 'A-1-01'
FROM products p WHERE p.slug = 'premium-emerald-velvet'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-EMR-002', 'LOT-2024-001', 45.00, 'A-1-02'
FROM products p WHERE p.slug = 'premium-emerald-velvet'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-NVY-001', 'LOT-2024-002', 60.00, 'A-2-01'
FROM products p WHERE p.slug = 'royal-navy-velvet'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-OAT-001', 'LOT-2024-003', 40.00, 'B-1-01'
FROM products p WHERE p.slug = 'natural-oatmeal-linen'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-SGE-001', 'LOT-2024-004', 35.00, 'B-1-02'
FROM products p WHERE p.slug = 'sage-green-linen'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-IVR-001', 'LOT-2024-005', 80.00, 'C-1-01'
FROM products p WHERE p.slug = 'ivory-cotton-canvas'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-TRC-001', 'LOT-2024-006', 55.00, 'C-1-02'
FROM products p WHERE p.slug = 'terracotta-cotton'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-WHT-001', 'LOT-2024-007', 100.00, 'D-1-01'
FROM products p WHERE p.slug = 'sheer-white-voile'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-CHR-001', 'LOT-2024-008', 70.00, 'D-1-02'
FROM products p WHERE p.slug = 'blackout-charcoal'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-BCL-001', 'LOT-2024-009', 45.00, 'E-1-01'
FROM products p WHERE p.slug = 'boucle-cream'
ON CONFLICT DO NOTHING;

INSERT INTO fabric_rolls (product_id, roll_number, lot_number, total_meters, location)
SELECT p.id, 'R-LTH-001', 'LOT-2024-010', 65.00, 'E-1-02'
FROM products p WHERE p.slug = 'leather-look-brown'
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRODUCT VARIANTS (Stock for unit-based products - pillows)
-- =====================================================

-- Add variants with stock for pillow products
INSERT INTO product_variants (product_id, sku, options, stock_quantity)
SELECT p.id, 'PLW-VLV-EMR-45-DEF', '{}', 25
FROM products p WHERE p.slug = 'velvet-emerald-pillow-45x45'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, options, stock_quantity)
SELECT p.id, 'PLW-LNN-NAT-50-DEF', '{}', 18
FROM products p WHERE p.slug = 'linen-natural-pillow-50x50'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, options, stock_quantity)
SELECT p.id, 'PLW-BCL-IVR-SET-DEF', '{}', 12
FROM products p WHERE p.slug = 'boucle-ivory-pillow-set'
ON CONFLICT DO NOTHING;
