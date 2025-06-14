
-- Add columns for featured products and new arrivals
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;
