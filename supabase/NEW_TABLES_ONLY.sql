-- =============================================
-- SADECE YENİ TABLOLAR
-- (Temel şema zaten varsa bunu çalıştır)
-- =============================================


-- =============================================
-- 1. PAGES TABLE (CMS)
-- =============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title_tr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  content_tr TEXT,
  content_en TEXT,
  meta_title_tr VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_description_tr TEXT,
  meta_description_en TEXT,
  featured_image VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  show_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger (hata verirse atla, zaten var demektir)
DO $$ BEGIN
  CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policies (hata verirse atla)
DO $$ BEGIN
  CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access pages" ON pages FOR ALL USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = auth.uid() AND customers.role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Default pages
INSERT INTO pages (slug, title_tr, title_en, content_tr, content_en, is_published, show_in_menu, menu_order) VALUES
('about', 'Hakkımızda', 'About Us', '<h2>Grohn Fabrics</h2><p>Kaliteli tekstil ürünleri...</p>', '<h2>Grohn Fabrics</h2><p>Quality textile products...</p>', true, true, 1),
('contact', 'İletişim', 'Contact', '<h2>Bize Ulaşın</h2>', '<h2>Contact Us</h2>', true, true, 2),
('privacy', 'Gizlilik Politikası', 'Privacy Policy', '<h2>Gizlilik Politikası</h2>', '<h2>Privacy Policy</h2>', true, false, 10),
('terms', 'Kullanım Koşulları', 'Terms of Service', '<h2>Kullanım Koşulları</h2>', '<h2>Terms of Service</h2>', true, false, 11),
('shipping', 'Kargo ve Teslimat', 'Shipping & Delivery', '<h2>Kargo Bilgileri</h2>', '<h2>Shipping Information</h2>', true, true, 3),
('returns', 'İade ve Değişim', 'Returns & Exchanges', '<h2>İade Politikası</h2>', '<h2>Return Policy</h2>', true, true, 4)
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- 2. NEWSLETTER SUBSCRIBERS
-- =============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50) DEFAULT 'website',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admin can manage newsletter" ON newsletter_subscribers FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = auth.uid() AND customers.role IN ('admin', 'sales')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- 3. VARIANT TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS option_group_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_tr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  option_type option_type DEFAULT 'select',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS option_value_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES option_group_templates(id) ON DELETE CASCADE,
  value_tr VARCHAR(100) NOT NULL,
  value_en VARCHAR(100) NOT NULL,
  sku_suffix VARCHAR(50),
  hex_color VARCHAR(7),
  image_url TEXT,
  default_price_modifier NUMERIC(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_option_value_templates_template ON option_value_templates(template_id);

ALTER TABLE option_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_value_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view active templates" ON option_group_templates FOR SELECT USING (is_active = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active template values" ON option_value_templates FOR SELECT USING (is_active = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Renkler şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Renkler', 'Colors', 'color', 'Temel renk paleti', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO option_value_templates (template_id, value_tr, value_en, hex_color, sku_suffix, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Beyaz', 'White', '#FFFFFF', 'WHT', 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Krem', 'Cream', '#FFFDD0', 'CRM', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bej', 'Beige', '#F5F5DC', 'BEJ', 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gri', 'Gray', '#808080', 'GRY', 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Antrasit', 'Anthracite', '#383838', 'ANT', 5),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Siyah', 'Black', '#000000', 'BLK', 6),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lacivert', 'Navy', '#000080', 'NVY', 7),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bordo', 'Burgundy', '#800020', 'BRD', 8),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Yeşil', 'Green', '#228B22', 'GRN', 9),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kahverengi', 'Brown', '#8B4513', 'BRN', 10)
ON CONFLICT DO NOTHING;

-- Bedenler şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bedenler', 'Sizes', 'size', 'Standart beden seçenekleri', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, sort_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XS', 'XS', 'XS', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'S', 'S', 'S', 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'M', 'M', 'M', 3),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'L', 'L', 'L', 4),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XL', 'XL', 'XL', 5),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XXL', 'XXL', 'XXL', 6)
ON CONFLICT DO NOTHING;

-- Yastık Boyutları şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Yastık Boyutları', 'Pillow Sizes', 'select', 'Yastık kılıfı boyutları', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, default_price_modifier, sort_order) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '40x40 cm', '40x40 cm', '40', 0, 1),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '45x45 cm', '45x45 cm', '45', 20, 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '50x50 cm', '50x50 cm', '50', 40, 3),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '60x60 cm', '60x60 cm', '60', 80, 4)
ON CONFLICT DO NOTHING;

-- Perde Genişlikleri şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Perde Genişlikleri', 'Curtain Widths', 'select', 'Hazır perde genişlikleri', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, default_price_modifier, sort_order) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '140 cm', '140 cm', 'W140', 0, 1),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '200 cm', '200 cm', 'W200', 150, 2),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '280 cm', '280 cm', 'W280', 300, 3),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '400 cm', '400 cm', 'W400', 500, 4)
ON CONFLICT DO NOTHING;


-- =============================================
-- 4. SEED DATA (Kategoriler)
-- =============================================

INSERT INTO categories (slug, name_tr, name_en, sort_order, is_active)
VALUES
  ('kadife', 'Kadife Kumaşlar', 'Velvet Fabrics', 1, true),
  ('keten', 'Keten Kumaşlar', 'Linen Fabrics', 2, true),
  ('pamuk', 'Pamuk Kumaşlar', 'Cotton Fabrics', 3, true),
  ('jakar', 'Jakar Kumaşlar', 'Jacquard Fabrics', 4, true),
  ('perde', 'Perde Kumaşları', 'Curtain Fabrics', 5, true),
  ('dosemelik', 'Döşemelik Kumaşlar', 'Upholstery Fabrics', 6, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO materials (code, name, composition, is_active)
VALUES
  ('PAMUK100', '%100 Pamuk', '100% Cotton', true),
  ('KETEN100', '%100 Keten', '100% Linen', true),
  ('POLY100', '%100 Polyester', '100% Polyester', true),
  ('PAMUK-KETEN', 'Pamuk-Keten Karışım', '55% Cotton, 45% Linen', true),
  ('KADIFE', 'Kadife', 'Velvet', true),
  ('SUNI-DERI', 'Suni Deri', 'Faux Leather', true)
ON CONFLICT (code) DO NOTHING;


-- =============================================
-- TAMAMLANDI!
-- =============================================
