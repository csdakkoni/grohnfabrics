-- ============================================
-- PRODUCT VIDEOS
-- Ürünlere video ekleme desteği
-- ============================================

-- Add videos column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN products.videos IS 'Array of video URLs for this product';

-- Example: 
-- videos = ['https://r2.../product-video-1.mp4', 'https://r2.../product-video-2.mp4']
