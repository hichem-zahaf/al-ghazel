-- ============================================================================
-- Coupon Admin Policies Migration
-- Adds INSERT, UPDATE, DELETE policies for authenticated users to manage coupons
-- ============================================================================

-- Remove existing policy that doesn't allow proper management
DROP POLICY IF EXISTS coupons_read_active ON public.coupons;

-- Create new policies for full coupon management by authenticated users
CREATE POLICY "coupons_read_all" ON public.coupons FOR SELECT
  USING (true);

CREATE POLICY "coupons_insert_authenticated" ON public.coupons FOR INSERT
  WITH CHECK (current_user = 'authenticated' OR current_user = 'service_role');

CREATE POLICY "coupons_update_authenticated" ON public.coupons FOR UPDATE
  USING (current_user = 'authenticated' OR current_user = 'service_role');

CREATE POLICY "coupons_delete_authenticated" ON public.coupons FOR DELETE
  USING (current_user = 'authenticated' OR current_user = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.coupons TO authenticated, service_role;
