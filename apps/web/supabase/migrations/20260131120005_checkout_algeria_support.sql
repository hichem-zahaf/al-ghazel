-- ============================================================================
-- Checkout Algeria Support Migration
-- Adds Algeria-specific fields to orders table and checkout data storage
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add Algeria-specific columns to orders table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Add wilaya_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'wilaya_code'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN wilaya_code VARCHAR(3);
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN city VARCHAR(255);
  END IF;

  -- Add delivery_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_type VARCHAR(50);
  END IF;

  -- Make shipping_postal_code nullable (not used in Algeria)
  ALTER TABLE public.orders ALTER COLUMN shipping_postal_code DROP NOT NULL;

  -- Change shipping_country default to Algeria
  ALTER TABLE public.orders ALTER COLUMN shipping_country SET DEFAULT 'Algeria';

END $$;

-- ----------------------------------------------------------------------------
-- Add checkout_data column to accounts table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'checkout_data'
  ) THEN
    ALTER TABLE public.accounts ADD COLUMN checkout_data JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Create index for tracking number lookups
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- ----------------------------------------------------------------------------
-- Create index for wilaya_code lookups
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_wilaya_code ON public.orders(wilaya_code);

-- ----------------------------------------------------------------------------
-- Add comments to new columns
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.orders.wilaya_code IS 'Algeria wilaya code (01-58)';
COMMENT ON COLUMN public.orders.city IS 'City/commune name in Algeria';
COMMENT ON COLUMN public.orders.delivery_type IS 'Delivery type: home_delivery or office_delivery';
COMMENT ON COLUMN public.accounts.checkout_data IS 'Saved checkout details for authenticated users';

-- ----------------------------------------------------------------------------
-- Update RLS policies for new columns
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist
DROP POLICY IF EXISTS orders_read_own ON public.orders;
DROP POLICY IF EXISTS orders_insert_own ON public.orders;
DROP POLICY IF EXISTS orders_update_own ON public.orders;

-- Recreate policies to include new columns
CREATE POLICY orders_read_own ON public.orders FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY orders_insert_own ON public.orders FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY orders_update_own ON public.orders FOR UPDATE USING (auth.uid() = account_id);

-- Grant permissions for new columns
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, UPDATE ON public.accounts TO authenticated;

-- ----------------------------------------------------------------------------
-- Function to generate unique tracking number
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  random_part TEXT;
  date_part TEXT;
  tracking_number TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Try to generate a unique tracking number
  WHILE attempts < max_attempts LOOP
    random_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    tracking_number := 'AG-' || date_part || '-' || random_part;

    -- Check if this tracking number already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.orders WHERE tracking_number = tracking_number
    ) THEN
      NEW.tracking_number := tracking_number;
      RETURN NEW;
    END IF;

    attempts := attempts + 1;
  END LOOP;

  -- If we couldn't generate a unique number, raise an error
  RAISE EXCEPTION 'Could not generate unique tracking number after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS generate_tracking_number_trigger ON public.orders;

-- Create trigger to generate tracking number before insert
CREATE TRIGGER generate_tracking_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL)
  EXECUTE FUNCTION public.generate_tracking_number();

-- ----------------------------------------------------------------------------
-- Function to save checkout data to account
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.save_checkout_data(
  user_account_id UUID,
  checkout_email VARCHAR(320),
  checkout_phone VARCHAR(50),
  checkout_wilaya_code VARCHAR(3),
  checkout_city VARCHAR(255),
  checkout_address_line VARCHAR(255),
  checkout_delivery_type VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.accounts
  SET checkout_data = jsonb_build_object(
    'email', checkout_email,
    'phone', checkout_phone,
    'wilayaCode', checkout_wilaya_code,
    'city', checkout_city,
    'addressLine', checkout_address_line,
    'deliveryType', checkout_delivery_type,
    'updatedAt', NOW()
  )
  WHERE id = user_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.save_checkout_data(
  UUID, VARCHAR(320), VARCHAR(50), VARCHAR(3), VARCHAR(255), VARCHAR(255), VARCHAR(50)
) TO authenticated;

-- ----------------------------------------------------------------------------
-- Helper function to get order by tracking number (public access)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_order_by_tracking_number(tracking_number_param VARCHAR(100))
RETURNS TABLE (
  id UUID,
  order_number VARCHAR(50),
  tracking_number VARCHAR(100),
  status order_status,
  delivery_status delivery_status,
  created_at TIMESTAMPTZ,
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(320),
  shipping_phone VARCHAR(50),
  shipping_address_line1 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_country VARCHAR(100),
  wilaya_code VARCHAR(3),
  city VARCHAR(255),
  delivery_type VARCHAR(50),
  subtotal DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  shipping_amount DECIMAL(10, 2),
  total DECIMAL(10, 2),
  currency VARCHAR(3)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.order_number,
    o.tracking_number,
    o.status,
    o.delivery_status,
    o.created_at,
    o.shipping_name,
    o.shipping_email,
    o.shipping_phone,
    o.shipping_address_line1,
    o.shipping_city,
    o.shipping_state,
    o.shipping_country,
    o.wilaya_code,
    o.city,
    o.delivery_type,
    o.subtotal,
    o.discount_amount,
    o.shipping_amount,
    o.total,
    o.currency
  FROM public.orders o
  WHERE o.tracking_number = tracking_number_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_number(VARCHAR(100)) TO authenticated, anon;
