echo '-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS UPDATE public.profiles SET role = 'super_admin' WHERE email = 'superadmin@urbanstyle.com';
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'superadmin@urbanstyle.com'; language 'plpgsql';

-- Create trigger for automatically updating updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS UPDATE public.profiles SET role = 'super_admin' WHERE email = 'superadmin@urbanstyle.com';
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'superadmin@urbanstyle.com'; language 'plpgsql';

-- Create trigger for handling new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = OLD.role);

-- Policy for admins to view all regular user profiles
CREATE POLICY "Admins can view user profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Policy for super_admins to update any profile
CREATE POLICY "Super admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Give anon and authenticated users access to the profiles table
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;' > profiles.sql
