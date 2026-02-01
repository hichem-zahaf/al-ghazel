-- Allow NULL account_id for guest checkout
-- Update the foreign key constraint to allow NULL values

-- First drop the existing foreign key constraint
ALTER TABLE public.orders DROP CONSTRAINT orders_account_id_fkey;

-- Make account_id nullable
ALTER TABLE public.orders ALTER COLUMN account_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL for guest orders
ALTER TABLE public.orders
  ADD CONSTRAINT orders_account_id_fkey
  FOREIGN KEY (account_id)
  REFERENCES public.accounts(id)
  ON DELETE SET NULL;

-- Update RLS policies to allow inserts without account_id (guest orders)
DROP POLICY IF EXISTS orders_insert_own ON public.orders;

CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth.uid() = account_id OR account_id IS NULL
  );

-- Update read policy to allow reading orders without account_id
DROP POLICY IF EXISTS orders_read_own ON public.orders;

CREATE POLICY orders_read_own ON public.orders
  FOR SELECT
  TO authenticated, anon
  USING (
    auth.uid() = account_id OR account_id IS NULL
  );
