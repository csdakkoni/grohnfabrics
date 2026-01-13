-- ============================================
-- PAGES TABLE FOR CMS
-- Run this in Supabase SQL Editor
-- ============================================

-- Pages table for static content management
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

-- Create trigger for updated_at
CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public read published pages" ON pages
  FOR SELECT USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins full access pages" ON pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.role = 'admin'
    )
  );

-- Insert default pages
INSERT INTO pages (slug, title_tr, title_en, content_tr, content_en, is_published, show_in_menu, menu_order) VALUES
('about', 'Hakkımızda', 'About Us', 
  '<h2>Grohn Fabrics</h2><p>Kaliteli tekstil ürünleri...</p>', 
  '<h2>Grohn Fabrics</h2><p>Quality textile products...</p>',
  true, true, 1),
('contact', 'İletişim', 'Contact', 
  '<h2>Bize Ulaşın</h2><p>Sorularınız için iletişime geçin...</p>', 
  '<h2>Contact Us</h2><p>Get in touch for your questions...</p>',
  true, true, 2),
('privacy', 'Gizlilik Politikası', 'Privacy Policy', 
  '<h2>Gizlilik Politikası</h2><p>Kişisel verilerinizin korunması...</p>', 
  '<h2>Privacy Policy</h2><p>Protection of your personal data...</p>',
  true, false, 10),
('terms', 'Kullanım Koşulları', 'Terms of Service', 
  '<h2>Kullanım Koşulları</h2><p>Site kullanım şartları...</p>', 
  '<h2>Terms of Service</h2><p>Website terms of use...</p>',
  true, false, 11),
('shipping', 'Kargo ve Teslimat', 'Shipping & Delivery', 
  '<h2>Kargo Bilgileri</h2><p>Kargo ve teslimat şartları...</p>', 
  '<h2>Shipping Information</h2><p>Shipping and delivery terms...</p>',
  true, true, 3),
('returns', 'İade ve Değişim', 'Returns & Exchanges', 
  '<h2>İade Politikası</h2><p>İade ve değişim koşulları...</p>', 
  '<h2>Return Policy</h2><p>Return and exchange conditions...</p>',
  true, true, 4)
ON CONFLICT (slug) DO NOTHING;
