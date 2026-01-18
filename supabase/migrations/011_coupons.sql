-- ============================================
-- COUPONS / DISCOUNT CODES
-- ============================================

-- Discount type enum
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Discount configuration
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  
  -- Constraints
  min_order_amount NUMERIC(12,2) DEFAULT 0,  -- Minimum order amount to apply
  max_discount_amount NUMERIC(12,2),          -- Cap for percentage discounts
  
  -- Usage limits
  usage_limit INTEGER,                        -- Total uses allowed (null = unlimited)
  usage_count INTEGER DEFAULT 0,              -- Times used
  per_customer_limit INTEGER DEFAULT 1,       -- Uses per customer (null = unlimited)
  
  -- Market & Currency restrictions
  market_id VARCHAR(10) REFERENCES markets(id),  -- null = all markets
  currency VARCHAR(3),                            -- null = all currencies
  
  -- Validity period
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  is_first_order_only BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_expires ON coupons(expires_at);

-- Coupon usage tracking (which customer used which coupon)
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  discount_applied NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(coupon_id, order_id)
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_email ON coupon_usages(customer_email);

-- Trigger to increment usage_count when a coupon is used
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons 
  SET usage_count = usage_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_coupon_usage_increment
  AFTER INSERT ON coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- Update trigger for coupons
CREATE TRIGGER trg_coupons_updated 
  BEFORE UPDATE ON coupons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Add coupon reference to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

-- ============================================
-- SAMPLE COUPONS (Optional - for testing)
-- ============================================

-- Commented out - uncomment to create test coupons
-- INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, description) VALUES
--   ('WELCOME10', 'percentage', 10, 100, 'Hoşgeldin indirimi - %10'),
--   ('YENI50', 'fixed', 50, 250, 'Yeni müşteri indirimi - 50 TL');
