-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper function to check admin role
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

-- Helper function to check specific role
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

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

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

-- ============================================
-- PUBLIC READ POLICIES (Storefront)
-- ============================================

-- Companies: Public read
CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (is_active = TRUE);

-- Markets: Public read
CREATE POLICY "Public can view markets" ON markets FOR SELECT USING (is_active = TRUE);

-- Categories: Public read active
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (is_active = TRUE);

-- Materials: Public read
CREATE POLICY "Public can view materials" ON materials FOR SELECT USING (is_active = TRUE);

-- Products: Public read active
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_active = TRUE);

-- Product Prices: Public read
CREATE POLICY "Public can view prices" ON product_prices FOR SELECT USING (TRUE);

-- Option Groups: Public read
CREATE POLICY "Public can view option groups" ON option_groups FOR SELECT USING (TRUE);

-- Option Values: Public read
CREATE POLICY "Public can view option values" ON option_values FOR SELECT USING (TRUE);

-- Product Variants: Public read available
CREATE POLICY "Public can view variants" ON product_variants FOR SELECT USING (is_available = TRUE);

-- Preset Sizes: Public read available
CREATE POLICY "Public can view preset sizes" ON preset_sizes FOR SELECT USING (is_available = TRUE);

-- Shipping Profiles: Public read active
CREATE POLICY "Public can view shipping" ON shipping_profiles FOR SELECT USING (is_active = TRUE);

-- Site Settings: Public read
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (TRUE);

-- ============================================
-- CUSTOMER POLICIES
-- ============================================

-- Customers: Users can read/update own profile
CREATE POLICY "Users can view own profile" ON customers 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON customers 
  FOR UPDATE USING (auth.uid() = id);

-- Addresses: Users manage own addresses
CREATE POLICY "Users can view own addresses" ON addresses 
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own addresses" ON addresses 
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own addresses" ON addresses 
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own addresses" ON addresses 
  FOR DELETE USING (customer_id = auth.uid());

-- Orders: Users can view own orders
CREATE POLICY "Users can view own orders" ON orders 
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create orders" ON orders 
  FOR INSERT WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

-- Order Items: Users can view own order items
CREATE POLICY "Users can view own order items" ON order_items 
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

-- ============================================
-- ADMIN POLICIES (Full access)
-- ============================================

-- Companies
CREATE POLICY "Admin full access companies" ON companies FOR ALL USING (is_admin());

-- Markets
CREATE POLICY "Admin full access markets" ON markets FOR ALL USING (is_admin());

-- Categories
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (is_admin());

-- Materials
CREATE POLICY "Admin full access materials" ON materials FOR ALL USING (is_admin());

-- Products
CREATE POLICY "Admin full access products" ON products FOR ALL USING (is_admin());

-- Product Prices
CREATE POLICY "Admin full access prices" ON product_prices FOR ALL USING (is_admin());

-- Option Groups
CREATE POLICY "Admin full access option groups" ON option_groups FOR ALL USING (is_admin());

-- Option Values
CREATE POLICY "Admin full access option values" ON option_values FOR ALL USING (is_admin());

-- Product Variants
CREATE POLICY "Admin full access variants" ON product_variants FOR ALL USING (is_admin());

-- Preset Sizes
CREATE POLICY "Admin full access preset sizes" ON preset_sizes FOR ALL USING (is_admin());

-- Fabric Rolls
CREATE POLICY "Admin full access fabric rolls" ON fabric_rolls FOR ALL USING (is_admin());

-- Customers (Admin can view all)
CREATE POLICY "Admin can view all customers" ON customers FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update customers" ON customers FOR UPDATE USING (is_admin());

-- Addresses (Admin can view all)
CREATE POLICY "Admin can view all addresses" ON addresses FOR SELECT USING (is_admin());

-- Orders (Admin full access)
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (is_admin());

-- Order Items (Admin full access)
CREATE POLICY "Admin full access order items" ON order_items FOR ALL USING (is_admin());

-- Stock Reservations
CREATE POLICY "Admin full access reservations" ON stock_reservations FOR ALL USING (is_admin());

-- Shipping Profiles
CREATE POLICY "Admin full access shipping" ON shipping_profiles FOR ALL USING (is_admin());

-- Audit Logs (Admin read only)
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT USING (is_admin());

-- Site Settings
CREATE POLICY "Admin full access settings" ON site_settings FOR ALL USING (is_admin());

-- ============================================
-- SERVICE ROLE BYPASS
-- Note: Service role bypasses RLS by default
-- These are for documentation purposes
-- ============================================

COMMENT ON TABLE products IS 'RLS enabled. Public can read active products. Admin has full access.';
COMMENT ON TABLE orders IS 'RLS enabled. Users can view own orders. Admin has full access.';
COMMENT ON TABLE customers IS 'RLS enabled. Users can manage own profile. Admin can view all.';
