-- ============================================
-- GROHN FABRICS - DATABASE SCHEMA
-- Single migration file for clean deployment
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Product type: what kind of product
CREATE TYPE product_type AS ENUM ('fabric', 'pillow', 'curtain', 'tablecloth', 'runner');

-- Sales model: how the product is sold
CREATE TYPE sales_model AS ENUM ('meter', 'unit', 'preset_sizes');

-- Order status with clear workflow
CREATE TYPE order_status AS ENUM (
  'pending',           -- Order created, awaiting payment
  'paid',              -- Payment received
  'processing',        -- Being prepared
  'shipped',           -- Shipped to customer
  'delivered',         -- Delivered
  'cancelled',         -- Cancelled
  'refunded'           -- Refunded
);

-- Option group type for variants
CREATE TYPE option_type AS ENUM ('select', 'color', 'size', 'radio');

-- Stock reservation status
CREATE TYPE reservation_status AS ENUM ('active', 'released', 'consumed');

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'production', 'warehouse', 'customer');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPANIES (Multi-entity support)
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,  -- 'TR', 'US'
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  address JSONB,
  contact JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed companies
INSERT INTO companies (code, name, legal_name) VALUES
  ('TR', 'Grohn Tekstil', 'Grohn Tekstil San. Tic. Ltd. Şti.'),
  ('US', 'Grohn LLC', 'Grohn LLC');

-- ============================================
-- MARKETS (TR, Global)
-- ============================================

CREATE TABLE markets (
  id VARCHAR(10) PRIMARY KEY,  -- 'TR', 'GLOBAL'
  name VARCHAR(100) NOT NULL,
  company_id UUID REFERENCES companies(id),
  default_currency VARCHAR(3) NOT NULL,
  supported_currencies VARCHAR(3)[] DEFAULT '{}',
  default_locale VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed markets
INSERT INTO markets (id, name, company_id, default_currency, supported_currencies, default_locale) VALUES
  ('TR', 'Türkiye', (SELECT id FROM companies WHERE code = 'TR'), 'TRY', ARRAY['TRY'], 'tr'),
  ('GLOBAL', 'Global', (SELECT id FROM companies WHERE code = 'US'), 'USD', ARRAY['USD', 'EUR'], 'en');

-- ============================================
-- CATEGORIES
-- ============================================

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

-- ============================================
-- MATERIALS (Fabric base - for fabric products)
-- ============================================

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  composition VARCHAR(255),  -- e.g., "100% Cotton"
  width_cm INTEGER CHECK (width_cm > 0),
  weight_gsm INTEGER CHECK (weight_gsm > 0),
  shrinkage_percent NUMERIC(5,2),
  care_instructions_tr TEXT,
  care_instructions_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100),
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  
  -- Categorization
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_type product_type NOT NULL,
  sales_model sales_model NOT NULL,
  
  -- For fabric products
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  
  -- Fabric-specific (if product_type = 'fabric')
  min_order_quantity NUMERIC(10,2) DEFAULT 1,  -- Min meters/units
  order_step NUMERIC(10,2) DEFAULT 0.1,        -- Step (e.g., 0.5m increments)
  
  -- Media
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  
  -- SEO
  meta_title_tr VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_description_tr TEXT,
  meta_description_en TEXT,
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  show_in_tr BOOLEAN DEFAULT TRUE,
  show_in_global BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(is_active);

-- ============================================
-- PRODUCT PRICES (Market-specific pricing)
-- ============================================

CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  currency VARCHAR(3) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12,2),  -- Original price for discounts
  cost_price NUMERIC(12,2),        -- For margin calculation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, market_id, currency)
);

CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_product_prices_market ON product_prices(market_id);

-- ============================================
-- OPTION GROUPS (Color, Size, etc.)
-- ============================================

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

-- ============================================
-- OPTION VALUES (Red, Blue, Small, Large, etc.)
-- ============================================

CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  value_tr VARCHAR(100) NOT NULL,
  value_en VARCHAR(100) NOT NULL,
  sku_suffix VARCHAR(50),
  hex_color VARCHAR(7),           -- For color options
  image_url TEXT,                 -- Swatch image
  price_modifier NUMERIC(10,2) DEFAULT 0,  -- +/- price
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_values_group ON option_values(option_group_id);

-- ============================================
-- PRODUCT VARIANTS (Specific combinations with stock)
-- ============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE,
  options JSONB NOT NULL DEFAULT '{}',  -- {"color": "value_id", "size": "value_id"}
  
  -- Stock (for unit-based products)
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  
  -- Price override (optional)
  price_override_tr NUMERIC(12,2),
  price_override_usd NUMERIC(12,2),
  price_override_eur NUMERIC(12,2),
  
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ============================================
-- PRESET SIZES (For curtains with predefined sizes)
-- ============================================

CREATE TABLE preset_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_tr VARCHAR(100) NOT NULL,   -- "60x90 cm"
  name_en VARCHAR(100) NOT NULL,
  width_cm INTEGER NOT NULL,
  height_cm INTEGER NOT NULL,
  
  -- Prices per market
  price_tr NUMERIC(12,2),
  price_usd NUMERIC(12,2),
  price_eur NUMERIC(12,2),
  
  -- Stock
  stock_quantity INTEGER DEFAULT 0,
  
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preset_sizes_product ON preset_sizes(product_id);

-- ============================================
-- FABRIC ROLLS (Meter-based stock tracking)
-- ============================================

CREATE TABLE fabric_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  roll_number VARCHAR(50),
  lot_number VARCHAR(50),         -- For color consistency
  
  total_meters NUMERIC(10,2) NOT NULL CHECK (total_meters > 0),
  reserved_meters NUMERIC(10,2) DEFAULT 0 CHECK (reserved_meters >= 0),
  available_meters NUMERIC(10,2) GENERATED ALWAYS AS (total_meters - reserved_meters) STORED,
  
  location VARCHAR(100),          -- Warehouse location
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT available_not_negative CHECK (total_meters >= reserved_meters)
);

CREATE INDEX idx_fabric_rolls_product ON fabric_rolls(product_id);
CREATE INDEX idx_fabric_rolls_variant ON fabric_rolls(variant_id);

-- ============================================
-- CUSTOMERS (Extends Supabase Auth)
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  company_name VARCHAR(255),      -- For B2B
  tax_id VARCHAR(50),             -- For B2B invoicing
  preferred_market VARCHAR(10) REFERENCES markets(id),
  preferred_currency VARCHAR(3),
  preferred_locale VARCHAR(5),
  is_wholesale BOOLEAN DEFAULT FALSE,  -- B2B flag
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADDRESSES
-- ============================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100),             -- "Home", "Office"
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) NOT NULL,    -- ISO country code
  phone VARCHAR(50),
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_info JSONB,               -- For guest checkout
  
  -- Market & Company
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  
  -- Pricing
  currency VARCHAR(3) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_cost NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  
  -- Status
  status order_status DEFAULT 'pending',
  
  -- Addresses (snapshot)
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  
  -- Payment
  payment_provider VARCHAR(50),   -- 'iyzico', 'stripe'
  payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  
  -- Shipping
  shipping_provider VARCHAR(50),  -- 'yurtici', 'ups'
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_market ON orders(market_id);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Product snapshot (prices can change)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  preset_size_id UUID REFERENCES preset_sizes(id) ON DELETE SET NULL,
  
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  variant_info JSONB,             -- Color, size, etc.
  
  -- Quantity & Pricing
  quantity NUMERIC(10,2) NOT NULL,
  unit_type VARCHAR(20) NOT NULL, -- 'meter', 'yard', 'unit'
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- STOCK RESERVATIONS (For fabric orders)
-- ============================================

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

-- ============================================
-- SHIPPING PROFILES
-- ============================================

CREATE TABLE shipping_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id VARCHAR(10) NOT NULL REFERENCES markets(id),
  provider VARCHAR(50) NOT NULL,  -- 'yurtici', 'ups'
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

-- Seed shipping profiles
INSERT INTO shipping_profiles (market_id, provider, name_tr, name_en, base_rate, per_kg_rate, estimated_days_min, estimated_days_max) VALUES
  ('TR', 'yurtici', 'Yurtiçi Kargo', 'Domestic Shipping', 50, 5, 2, 4),
  ('GLOBAL', 'ups', 'UPS International', 'UPS International', 25, 8, 5, 10);

-- ============================================
-- AUDIT LOGS
-- ============================================

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

-- ============================================
-- SITE SETTINGS
-- ============================================

CREATE TABLE site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('general', '{"site_name": "Grohn Fabrics", "contact_email": "info@grohnfabrics.com"}'),
  ('social', '{"instagram": "", "pinterest": "", "facebook": ""}'),
  ('seo', '{"default_title": "Grohn Fabrics - Premium Textile", "default_description": "High quality fabrics and home textiles"}');

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at triggers
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

-- ============================================
-- ORDER NUMBER GENERATION
-- ============================================

CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'GF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- AUDIT LOGGING FUNCTION
-- ============================================

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

-- Audit triggers for sensitive tables
CREATE TRIGGER trg_audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION log_audit_change('product_change');
CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_audit_change('order_change');
CREATE TRIGGER trg_audit_product_prices AFTER INSERT OR UPDATE OR DELETE ON product_prices FOR EACH ROW EXECUTE FUNCTION log_audit_change('price_change');
