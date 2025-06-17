
-- Emergency RLS disable script for immediate functionality
-- Use only if RLS continues to cause issues and immediate functionality is required

-- This script can be run to completely disable RLS for troubleshooting
-- Uncomment the lines below if you need to disable RLS entirely:

-- BEGIN;

-- Disable RLS on all tables
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
-- DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- DROP POLICY IF EXISTS "products_select_all" ON public.products;
-- DROP POLICY IF EXISTS "products_manage_admin" ON public.products;
-- DROP POLICY IF EXISTS "sessions_own" ON public.user_sessions;

-- Grant full access to all authenticated users
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- COMMIT;

-- Note: This completely removes security restrictions. 
-- Use only for personal projects or development environments.
-- Remember to re-enable proper security before going to production.
