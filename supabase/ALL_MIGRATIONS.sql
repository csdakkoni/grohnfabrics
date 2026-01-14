-- ============================================
-- GROHN FABRICS - TÜM SQL MIGRATIONS
-- Supabase SQL Editor'de sırasıyla çalıştırın
-- ============================================

-- =============================================
-- 1. INITIAL SCHEMA (001_initial_schema.sql)
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE product_type AS ENUM ('fabric', 'pillow', 'curtain', 'tablecloth', 'runner');
CREATE TYPE sales_model AS ENUM ('meter', 'unit', 'preset_sizes');
CREATE TYPE order_status AS ENUM (
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE option_type AS ENUM ('select', 'color', 'size', 'radio');
CREATE TYPE reservation_status AS ENUM ('active', 'released', 'consumed');
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'production', 'warehouse', 'customer');

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- COMPANIES
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  address JSONB,
  contact JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO companies (code, name, legal_name) VALUES
  ('TR', 'Grohn Tekstil', 'Grohn Tekstil San. Tic. Ltd. Şti.'),
  ('US', 'Grohn LLC', 'Grohn LLC');

-- MARKETS
CREATE TABLE markets (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company_id UUID REFERENCES companies(id),
  default_currency VARCHAR(3) NOT NULL,
  supported_currencies VARCHAR(3)[] DEFAULT '{}',
  default_locale VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO markets (id, name, company_id, default_currency, supported_currencies, default_locale) VALUES
  ('TR', 'Türkiye', (SELECT id FROM companies WHERE code = 'TR'), 'TRY', ARRAY['TRY'], 'tr'),
  ('GLOBAL', 'Global', (SELECT id FROM companies WHERE code = 'US'), 'USD', ARRAY['USD', 'EUR'], 'en');

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- MATERIALS
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  composition VARCHAR(255),
  width_cm INTEGER CHECK (width_cm > 0),
  weight_gsm INTEGER CHECK (weight_gsm > 0),
  shrinkage_percent NUMERIC(5,2),
  care_instructions_tr TEXT,
  care_instructions_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100),
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_type product_type NOT NULL,
  sales_model sales_model NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  min_order_quantity NUMERIC(10,2) DEFAULT 1,
  order_step NUMERIC(10,2) DEFAULT 0.1,
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  meta_title_tr VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_description_tr TEXT,
  meta_description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  show_in_tr BOOLEAN DEFAULT TRUE,
  show_in_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(is_active);

-- PRODUCT PRICES
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  currency VARCHAR(3) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12,2),
  cost_price NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, market_id, currency)
);

CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_product_prices_market ON product_prices(market_id);

-- OPTION GROUPS
CREATE TABLE option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_tr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  option_type option_type DEFAULT 'select',
  is_required BOOLEAN DEFAULT TRUE,
  affects_price BOOLEAN DEFAULT FALSE,
  affects_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_groups_product ON option_groups(product_id);

-- OPTION VALUES
CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  value_tr VARCHAR(100) NOT NULL,
  value_en VARCHAR(100) NOT NULL,
  sku_suffix VARCHAR(50),
  hex_color VARCHAR(7),
  image_url TEXT,
  price_modifier NUMERIC(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_values_group ON option_values(option_group_id);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE,
  options JSONB NOT NULL DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  price_override_tr NUMERIC(12,2),
  price_override_usd NUMERIC(12,2),
  price_override_eur NUMERIC(12,2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- PRESET SIZES
CREATE TABLE preset_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_tr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  width_cm INTEGER NOT NULL,
  height_cm INTEGER NOT NULL,
  price_tr NUMERIC(12,2),
  price_usd NUMERIC(12,2),
  price_eur NUMERIC(12,2),
  stock_quantity INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preset_sizes_product ON preset_sizes(product_id);

-- FABRIC ROLLS
CREATE TABLE fabric_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  roll_number VARCHAR(50),
  lot_number VARCHAR(50),
  total_meters NUMERIC(10,2) NOT NULL CHECK (total_meters > 0),
  reserved_meters NUMERIC(10,2) DEFAULT 0 CHECK (reserved_meters >= 0),
  available_meters NUMERIC(10,2) GENERATED ALWAYS AS (total_meters - reserved_meters) STORED,
  location VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT available_not_negative CHECK (total_meters >= reserved_meters)
);

CREATE INDEX idx_fabric_rolls_product ON fabric_rolls(product_id);
CREATE INDEX idx_fabric_rolls_variant ON fabric_rolls(variant_id);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  tax_id VARCHAR(50),
  preferred_market VARCHAR(10) REFERENCES markets(id),
  preferred_currency VARCHAR(3),
  preferred_locale VARCHAR(5),
  is_wholesale BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(50),
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_info JSONB,
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  currency VARCHAR(3) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_cost NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_provider VARCHAR(50),
  payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  shipping_provider VARCHAR(50),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_market ON orders(market_id);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  preset_size_id UUID REFERENCES preset_sizes(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  variant_info JSONB,
  quantity NUMERIC(10,2) NOT NULL,
  unit_type VARCHAR(20) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- STOCK RESERVATIONS
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  fabric_roll_id UUID REFERENCES fabric_rolls(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  reserved_quantity NUMERIC(10,2) NOT NULL,
  unit_type VARCHAR(20) NOT NULL,
  status reservation_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_reservations_order ON stock_reservations(order_id);
CREATE INDEX idx_reservations_roll ON stock_reservations(fabric_roll_id);

-- SHIPPING PROFILES
CREATE TABLE shipping_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  provider VARCHAR(50) NOT NULL,
  name_tr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  base_rate NUMERIC(10,2) NOT NULL,
  per_kg_rate NUMERIC(10,2) DEFAULT 0,
  free_shipping_threshold NUMERIC(12,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shipping_profiles (market_id, provider, name_tr, name_en, base_rate, per_kg_rate, estimated_days_min, estimated_days_max) VALUES
  ('TR', 'yurtici', 'Yurtiçi Kargo', 'Domestic Shipping', 50, 5, 2, 4),
  ('GLOBAL', 'ups', 'UPS International', 'UPS International', 25, 8, 5, 10);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- SITE SETTINGS
CREATE TABLE site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('general', '{"site_name": "Grohn Fabrics", "contact_email": "info@grohnfabrics.com"}'),
  ('social', '{"instagram": "", "pinterest": "", "facebook": ""}'),
  ('seo', '{"default_title": "Grohn Fabrics - Premium Textile", "default_description": "High quality fabrics and home textiles"}');

-- TRIGGERS
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_materials_updated BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_product_prices_updated BEFORE UPDATE ON product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_option_groups_updated BEFORE UPDATE ON option_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_option_values_updated BEFORE UPDATE ON option_values FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_preset_sizes_updated BEFORE UPDATE ON preset_sizes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fabric_rolls_updated BEFORE UPDATE ON fabric_rolls FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ORDER NUMBER GENERATION
CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'GF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- AUDIT LOGGING FUNCTION
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION log_audit_change('product_change');
CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_audit_change('order_change');
CREATE TRIGGER trg_audit_product_prices AFTER INSERT OR UPDATE OR DELETE ON product_prices FOR EACH ROW EXECUTE FUNCTION log_audit_change('price_change');


-- =============================================
-- 2. RLS POLICIES (002_rls_policies.sql)
-- =============================================

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'sales', 'production', 'warehouse')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view markets" ON markets FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view materials" ON materials FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view prices" ON product_prices FOR SELECT USING (TRUE);
CREATE POLICY "Public can view option groups" ON option_groups FOR SELECT USING (TRUE);
CREATE POLICY "Public can view option values" ON option_values FOR SELECT USING (TRUE);
CREATE POLICY "Public can view variants" ON product_variants FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view preset sizes" ON preset_sizes FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view shipping" ON shipping_profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (TRUE);

-- CUSTOMER POLICIES
CREATE POLICY "Users can view own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (customer_id = auth.uid());
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (customer_id = auth.uid());
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);

-- ADMIN POLICIES
CREATE POLICY "Admin full access companies" ON companies FOR ALL USING (is_admin());
CREATE POLICY "Admin full access markets" ON markets FOR ALL USING (is_admin());
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admin full access materials" ON materials FOR ALL USING (is_admin());
CREATE POLICY "Admin full access products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin full access prices" ON product_prices FOR ALL USING (is_admin());
CREATE POLICY "Admin full access option groups" ON option_groups FOR ALL USING (is_admin());
CREATE POLICY "Admin full access option values" ON option_values FOR ALL USING (is_admin());
CREATE POLICY "Admin full access variants" ON product_variants FOR ALL USING (is_admin());
CREATE POLICY "Admin full access preset sizes" ON preset_sizes FOR ALL USING (is_admin());
CREATE POLICY "Admin full access fabric rolls" ON fabric_rolls FOR ALL USING (is_admin());
CREATE POLICY "Admin can view all customers" ON customers FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update customers" ON customers FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can view all addresses" ON addresses FOR SELECT USING (is_admin());
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin full access order items" ON order_items FOR ALL USING (is_admin());
CREATE POLICY "Admin full access reservations" ON stock_reservations FOR ALL USING (is_admin());
CREATE POLICY "Admin full access shipping" ON shipping_profiles FOR ALL USING (is_admin());
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admin full access settings" ON site_settings FOR ALL USING (is_admin());


-- =============================================
-- 3. STORAGE BUCKET (003_storage_bucket.sql)
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');


-- =============================================
-- 4. PAGES TABLE (004_pages_table.sql)
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

CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins full access pages" ON pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = auth.uid() 
    AND customers.role = 'admin'
  )
);

INSERT INTO pages (slug, title_tr, title_en, content_tr, content_en, is_published, show_in_menu, menu_order) VALUES
('about', 'Hakkımızda', 'About Us', '<h2>Grohn Fabrics</h2><p>Kaliteli tekstil ürünleri...</p>', '<h2>Grohn Fabrics</h2><p>Quality textile products...</p>', true, true, 1),
('contact', 'İletişim', 'Contact', '<h2>Bize Ulaşın</h2>', '<h2>Contact Us</h2>', true, true, 2),
('privacy', 'Gizlilik Politikası', 'Privacy Policy', '<h2>Gizlilik Politikası</h2>', '<h2>Privacy Policy</h2>', true, false, 10),
('terms', 'Kullanım Koşulları', 'Terms of Service', '<h2>Kullanım Koşulları</h2>', '<h2>Terms of Service</h2>', true, false, 11),
('shipping', 'Kargo ve Teslimat', 'Shipping & Delivery', '<h2>Kargo Bilgileri</h2>', '<h2>Shipping Information</h2>', true, true, 3),
('returns', 'İade ve Değişim', 'Returns & Exchanges', '<h2>İade Politikası</h2>', '<h2>Return Policy</h2>', true, true, 4)
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- 5. SEED DATA (Kategoriler ve Materyaller)
-- =============================================

INSERT INTO categories (slug, name_tr, name_en, sort_order, is_active)
VALUES
  ('kadife', 'Kadife Kumaşlar', 'Velvet Fabrics', 1, true),
  ('keten', 'Keten Kumaşlar', 'Linen Fabrics', 2, true),
  ('pamuk', 'Pamuk Kumaşlar', 'Cotton Fabrics', 3, true),
  ('jakar', 'Jakar Kumaşlar', 'Jacquard Fabrics', 4, true),
  ('perde', 'Perde Kumaşları', 'Curtain Fabrics', 5, true),
  ('dosemelik', 'Döşemelik Kumaşlar', 'Upholstery Fabrics', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en;

INSERT INTO materials (code, name, composition, is_active)
VALUES
  ('PAMUK100', '%100 Pamuk', '100% Cotton', true),
  ('KETEN100', '%100 Keten', '100% Linen', true),
  ('POLY100', '%100 Polyester', '100% Polyester', true),
  ('PAMUK-KETEN', 'Pamuk-Keten Karışım', '55% Cotton, 45% Linen', true),
  ('KADIFE', 'Kadife', 'Velvet', true),
  ('SUNI-DERI', 'Suni Deri', 'Faux Leather', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name;


-- =============================================
-- 6. NEWSLETTER TABLE (006_newsletter_table.sql)
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

CREATE POLICY "Admin can manage newsletter" ON newsletter_subscribers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = auth.uid() AND customers.role IN ('admin', 'sales')));


-- =============================================
-- 7. VARIANT TEMPLATES (007_variant_templates.sql)
-- =============================================

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

ALTER TABLE option_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_value_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active templates" ON option_group_templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active template values" ON option_value_templates FOR SELECT USING (is_active = TRUE);


-- =============================================
-- TAMAMLANDI!
-- =============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırdıktan sonra:
-- 1. Admin kullanıcı oluştur (Authentication > Users)
-- 2. customers tablosuna admin rolü ekle:
--    INSERT INTO customers (id, email, role) VALUES ('USER_UUID', 'admin@email.com', 'admin');
-- =============================================
