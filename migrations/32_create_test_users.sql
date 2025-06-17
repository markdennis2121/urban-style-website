
-- Create test users for testing login functionality
-- Run this after the main authentication fix migration

DO $$
DECLARE
    test_user_id UUID;
    admin_user_id UUID;
BEGIN
    -- Create test regular user
    test_user_id := gen_random_uuid();
    
    -- Insert into auth.users (simulating signup)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        test_user_id,
        'authenticated',
        'authenticated',
        'test@urbanstyle.com',
        crypt('TestUser123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Create profile for test user
    INSERT INTO public.profiles (id, email, username, role, full_name)
    VALUES (
        test_user_id,
        'test@urbanstyle.com',
        'testuser',
        'user',
        'Test User'
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;

    -- Create test admin user
    admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_user_id,
        'authenticated',
        'authenticated',
        'admin@urbanstyle.com',
        crypt('AdminUser123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Create profile for admin user
    INSERT INTO public.profiles (id, email, username, role, full_name)
    VALUES (
        admin_user_id,
        'admin@urbanstyle.com',
        'admin',
        'admin',
        'Admin User'
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;

END $$;
