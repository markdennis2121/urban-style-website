
-- Fix RLS policies for orders system
-- This migration simplifies and fixes the RLS policies

-- Drop ALL existing policies to start completely fresh (including the ones we might have created)
DROP POLICY IF EXISTS "users_select_own_orders" ON orders;
DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;
DROP POLICY IF EXISTS "users_update_own_orders" ON orders;
DROP POLICY IF EXISTS "admins_all_orders" ON orders;
DROP POLICY IF EXISTS "orders_users_own" ON orders;

DROP POLICY IF EXISTS "users_select_own_order_items" ON order_items;
DROP POLICY IF EXISTS "users_insert_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admins_all_order_items" ON order_items;
DROP POLICY IF EXISTS "order_items_users_own" ON order_items;

DROP POLICY IF EXISTS "admins_all_inventory_logs" ON inventory_logs;
DROP POLICY IF EXISTS "inventory_logs_authenticated" ON inventory_logs;

-- Create simple, working RLS policies for orders
CREATE POLICY "orders_user_access" ON orders
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create simple, working RLS policies for order_items
CREATE POLICY "order_items_user_access" ON order_items
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Create simple policy for inventory_logs (allow all authenticated users for now)
CREATE POLICY "inventory_logs_user_access" ON inventory_logs
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON inventory_logs TO authenticated;
