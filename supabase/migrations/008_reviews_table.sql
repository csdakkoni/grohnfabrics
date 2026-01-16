-- =============================================
-- 8. REVIEWS TABLE (008_reviews_table.sql)
-- =============================================
-- Müşteri yorumları tablosu - Etsy, website ve diğer kaynaklardan

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reviewer info
  reviewer_name VARCHAR(100) NOT NULL,
  reviewer_email VARCHAR(255),
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Source tracking
  source VARCHAR(50) NOT NULL DEFAULT 'website', -- etsy, website, google, etc.
  source_order_id VARCHAR(100), -- Original order ID from source
  
  -- Category matching (for filtering on product pages)
  category_keyword VARCHAR(50) DEFAULT 'general', -- curtain, fabric, sample, general
  
  -- Product linking (optional - for direct product association)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category_keyword);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Updated at trigger
CREATE TRIGGER trg_reviews_updated 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews 
  FOR SELECT 
  USING (is_approved = true);

-- Authenticated users can submit reviews (pending approval)
CREATE POLICY "Authenticated users can submit reviews" ON reviews 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access reviews" ON reviews 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.role IN ('admin', 'sales')
    )
  );

-- =============================================
-- TAMAMLANDI!
-- =============================================
