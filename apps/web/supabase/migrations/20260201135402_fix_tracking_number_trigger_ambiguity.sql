-- Fix ambiguous column reference in generate_tracking_number trigger
-- The variable name 'tracking_number' conflicts with the column name

CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  random_part TEXT;
  date_part TEXT;
  new_tracking_number TEXT;  -- Renamed to avoid ambiguity with column name
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Try to generate a unique tracking number
  WHILE attempts < max_attempts LOOP
    random_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_tracking_number := 'AG-' || date_part || '-' || random_part;

    -- Check if this tracking number already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.orders WHERE tracking_number = new_tracking_number
    ) THEN
      NEW.tracking_number := new_tracking_number;
      RETURN NEW;
    END IF;

    attempts := attempts + 1;
  END LOOP;

  -- If we couldn't generate a unique number, raise an error
  RAISE EXCEPTION 'Could not generate unique tracking number after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql;
