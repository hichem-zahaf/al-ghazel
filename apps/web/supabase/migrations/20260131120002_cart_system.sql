-- ============================================================================
-- Cart System Migration
-- Creates tables for shopping cart and cart items
-- Note: coupons table already exists in admin_schema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add free_shipping column to existing coupons table if not exists
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'free_shipping'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN free_shipping BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Carts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users (stored in localStorage/cookie)
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id),
  UNIQUE(session_id)
);

-- Create index for faster cart lookup
CREATE INDEX IF NOT EXISTS idx_carts_account ON public.carts(account_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON public.carts(session_id);

-- ----------------------------------------------------------------------------
-- Cart Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, book_id) -- One of each book per cart
);

-- Create index for faster cart item lookup
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_book ON public.cart_items(book_id);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Carts: Users can only see their own cart
CREATE POLICY "Users can view their own cart"
  ON public.carts FOR SELECT
  USING (account_id = auth.uid());

CREATE POLICY "Users can insert their own cart"
  ON public.carts FOR INSERT
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "Users can update their own cart"
  ON public.carts FOR UPDATE
  USING (account_id = auth.uid());

CREATE POLICY "Users can delete their own cart"
  ON public.carts FOR DELETE
  USING (account_id = auth.uid());

-- Cart Items: Users can only see items in their own cart
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.account_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.account_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own cart"
  ON public.cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.account_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their own cart"
  ON public.cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.account_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Functions and Triggers
-- ----------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to carts table
DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Helper Functions
-- ----------------------------------------------------------------------------

-- Function to get or create a user's cart
CREATE OR REPLACE FUNCTION public.get_or_create_cart(user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
  cart_id UUID;
BEGIN
  -- Try to get existing cart
  SELECT id INTO cart_id FROM public.carts WHERE account_id = user_id;

  -- If no cart exists, create one
  IF cart_id IS NULL THEN
    INSERT INTO public.carts (account_id)
    VALUES (user_id)
    RETURNING id INTO cart_id;
  END IF;

  RETURN cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add item to cart
CREATE OR REPLACE FUNCTION public.add_to_cart(
  cart_id UUID,
  book_id_param UUID,
  quantity_param INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  cart_item_id UUID;
BEGIN
  -- Check if item already exists
  SELECT id INTO cart_item_id
  FROM public.cart_items
  WHERE cart_id = cart_id_param AND book_id = book_id_param;

  IF cart_item_id IS NULL THEN
    -- Insert new item
    INSERT INTO public.cart_items (cart_id, book_id, quantity)
    VALUES (cart_id_param, book_id_param, quantity_param)
    RETURNING id INTO cart_item_id;
  ELSE
    -- Update quantity (limit to 1 per book)
    UPDATE public.cart_items
    SET quantity = LEAST(quantity_param, 1)
    WHERE id = cart_item_id
    RETURNING id INTO cart_item_id;
  END IF;

  RETURN cart_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate coupon (adapted for existing coupons table structure)
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code TEXT,
  cart_subtotal NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  coupon_data public.coupons;
  result JSONB;
BEGIN
  -- Get coupon data
  SELECT * INTO coupon_data
  FROM public.coupons
  WHERE code = coupon_code AND is_active = TRUE;

  IF coupon_data.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Invalid coupon code'
    );
  END IF;

  -- Check expiration (using valid_until instead of expires_at)
  IF coupon_data.valid_until IS NOT NULL AND coupon_data.valid_until < NOW() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'This coupon has expired'
    );
  END IF;

  -- Check if coupon is valid yet (using valid_from)
  IF coupon_data.valid_from IS NOT NULL AND coupon_data.valid_from > NOW() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'This coupon is not yet valid'
    );
  END IF;

  -- Check minimum order amount (using min_purchase_amount instead of min_order_amount)
  IF coupon_data.min_purchase_amount > 0 AND cart_subtotal < coupon_data.min_purchase_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Minimum order amount not met'
    );
  END IF;

  -- Check usage limit (using usage_limit instead of max_uses)
  IF coupon_data.usage_limit IS NOT NULL AND coupon_data.used_count >= coupon_data.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Coupon usage limit reached'
    );
  END IF;

  -- Calculate discount
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', coupon_data.id,
    'discount_type', coupon_data.discount_type,
    'discount_value', coupon_data.discount_value,
    'free_shipping', coupon_data.free_shipping
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.coupons TO authenticated, anon;
GRANT ALL ON public.carts TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_cart(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_cart(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, NUMERIC) TO authenticated;