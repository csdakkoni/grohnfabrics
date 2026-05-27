-- ============================================
-- ADD show_in_footer COLUMN TO pages TABLE
-- ============================================

ALTER TABLE pages ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN DEFAULT false;
