-- Design Requests table for Free Design Service
CREATE TABLE IF NOT EXISTS design_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  room_type TEXT,
  style_preference TEXT,
  color_preference TEXT,
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE design_requests ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access on design_requests"
  ON design_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anyone can insert (public form submission)
CREATE POLICY "Public can insert design_requests"
  ON design_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Index for admin queries
CREATE INDEX idx_design_requests_status ON design_requests(status);
CREATE INDEX idx_design_requests_created ON design_requests(created_at DESC);
