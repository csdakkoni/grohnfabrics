-- =============================================
-- 11. SWATCH REQUESTS TABLE
-- =============================================
-- Numune talepleri için tablo

CREATE TABLE IF NOT EXISTS swatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer info
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Shipping address
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  
  -- Product info
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  selected_colors TEXT[] DEFAULT '{}',
  
  -- Additional info
  notes TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swatch_requests_status ON swatch_requests(status);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_email ON swatch_requests(email);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_product ON swatch_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_created ON swatch_requests(created_at DESC);

-- Updated at trigger
CREATE TRIGGER trg_swatch_requests_updated 
  BEFORE UPDATE ON swatch_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE swatch_requests ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access swatch_requests" ON swatch_requests 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.role IN ('admin', 'sales', 'warehouse')
    )
  );

-- Service role bypass (for API)
CREATE POLICY "Service role bypass swatch_requests" ON swatch_requests
  FOR ALL
  USING (auth.role() = 'service_role');
