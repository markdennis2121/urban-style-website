
-- Create product-images bucket for storing uploaded product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow authenticated users (admins) to upload product images
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
  )
);

-- Allow everyone to view product images
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'product-images');

-- Allow admins to update product images
CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
  )
);

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
  )
);
