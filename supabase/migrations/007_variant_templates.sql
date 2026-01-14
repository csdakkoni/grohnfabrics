-- ============================================
-- VARIANT TEMPLATES (Ön tanımlı varyant şablonları)
-- ============================================

-- Şablon grupları (örn: "Renkler", "Bedenler", "Kumaş Desenleri")
CREATE TABLE option_group_templates (
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

-- Şablon değerleri (örn: Kırmızı, Mavi, S, M, L)
CREATE TABLE option_value_templates (
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

CREATE INDEX idx_option_value_templates_template ON option_value_templates(template_id);

-- ============================================
-- SEED DATA - Örnek şablonlar
-- ============================================

-- Renkler şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Renkler', 'Colors', 'color', 'Temel renk paleti', 1);

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
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kahverengi', 'Brown', '#8B4513', 'BRN', 10);

-- Bedenler şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bedenler', 'Sizes', 'size', 'Standart beden seçenekleri', 2);

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, sort_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XS', 'XS', 'XS', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'S', 'S', 'S', 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'M', 'M', 'M', 3),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'L', 'L', 'L', 4),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XL', 'XL', 'XL', 5),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'XXL', 'XXL', 'XXL', 6);

-- Yastık Boyutları şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Yastık Boyutları', 'Pillow Sizes', 'select', 'Yastık kılıfı boyutları', 3);

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, default_price_modifier, sort_order) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '40x40 cm', '40x40 cm', '40', 0, 1),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '45x45 cm', '45x45 cm', '45', 20, 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '50x50 cm', '50x50 cm', '50', 40, 3),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '60x60 cm', '60x60 cm', '60', 80, 4);

-- Perde Genişlikleri şablonu
INSERT INTO option_group_templates (id, name_tr, name_en, option_type, description, sort_order) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Perde Genişlikleri', 'Curtain Widths', 'select', 'Hazır perde genişlikleri', 4);

INSERT INTO option_value_templates (template_id, value_tr, value_en, sku_suffix, default_price_modifier, sort_order) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '140 cm', '140 cm', 'W140', 0, 1),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '200 cm', '200 cm', 'W200', 150, 2),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '280 cm', '280 cm', 'W280', 300, 3),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '400 cm', '400 cm', 'W400', 500, 4);

-- RLS Policies
ALTER TABLE option_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_value_templates ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can view active templates" ON option_group_templates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view active template values" ON option_value_templates
  FOR SELECT USING (is_active = TRUE);

-- Admin full access (service role bypasses RLS)
