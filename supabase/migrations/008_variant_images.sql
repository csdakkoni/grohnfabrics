-- ============================================
-- VARIANT IMAGES
-- Her renk/varyant için ayrı görseller
-- ============================================

-- Add images column to option_values
ALTER TABLE option_values 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN option_values.images IS 'Array of image URLs for this option value (e.g., different images for each color)';

-- Example: Kırmızı renk seçeneğine 3 görsel bağlanabilir
-- images = ['https://...red1.jpg', 'https://...red2.jpg', 'https://...red3.jpg']
