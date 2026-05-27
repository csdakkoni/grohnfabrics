-- ============================================
-- EXPLICIT GRANTS FOR DATA API ACCESS
-- (Supabase 2026 Security Update Compatibility)
-- ============================================

-- Grant access on all existing tables in the public schema to API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure all future tables created in the public schema automatically get these privileges
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
