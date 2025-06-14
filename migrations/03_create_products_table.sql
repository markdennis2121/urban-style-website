
-- Create products table
CREATE TABLE products (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products
CREATE POLICY "Anyone can read products" ON products
    FOR SELECT TO authenticated, anon
    USING (true);

-- Only admins and super admins can manage products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products
INSERT INTO products (name, brand, description, price, category, stock, image) VALUES
('Cartoon Astronaut T-shirt', 'StyleCo', 'Comfortable cotton t-shirt with cartoon astronaut print', 80.00, 'T-Shirts', 50, '/images/fe/6.jpg'),
('OversizeObsession', 'TrendWear', 'Trendy oversized t-shirt for casual wear', 80.00, 'T-Shirts', 30, '/images/fe/1.jpg'),
('MaxComfort', 'ComfortCo', 'Ultra-soft cotton blend t-shirt for maximum comfort', 80.00, 'T-Shirts', 45, '/images/fe/2.jpg'),
('SlouchyStyle', 'RelaxWear', 'Relaxed fit t-shirt with modern design', 80.00, 'T-Shirts', 25, '/images/new/6.jpg'),
('GiantGarb', 'BigStyle', 'Extra large fit t-shirt for comfortable wearing', 80.00, 'T-Shirts', 35, '/images/fe/4.jpg'),
('FreeFlow', 'ActiveWear', 'Lightweight and breathable t-shirt for active lifestyle', 80.00, 'T-Shirts', 40, '/images/fe/5.jpg');
