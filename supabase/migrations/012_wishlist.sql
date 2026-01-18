-- ============================================
-- WISHLIST / FAVORITES
-- ============================================

-- Wishlist table - stores user favorites
-- Works for both authenticated users and guests (via localStorage sync)
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Either customer_id (for logged-in users) or session_id (for guests)
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(100),  -- For guest users
  
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique product per user/session
  UNIQUE(customer_id, product_id),
  UNIQUE(session_id, product_id),
  
  -- At least one identifier must be present
  CONSTRAINT wishlist_user_check CHECK (
    customer_id IS NOT NULL OR session_id IS NOT NULL
  )
);

CREATE INDEX idx_wishlists_customer ON wishlists(customer_id);
CREATE INDEX idx_wishlists_session ON wishlists(session_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- ============================================
-- RLS POLICIES FOR WISHLIST
-- ============================================

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (
    customer_id = auth.uid()
    OR session_id IS NOT NULL  -- Session-based items are handled by API
  );

-- Users can insert to their own wishlist
CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR customer_id IS NULL  -- Allow guest inserts
  );

-- Users can delete from their own wishlist
CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE
  USING (
    customer_id = auth.uid()
    OR session_id IS NOT NULL
  );
