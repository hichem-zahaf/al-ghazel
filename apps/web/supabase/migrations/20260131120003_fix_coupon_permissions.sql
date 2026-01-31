-- Fix coupon validation permissions for guest users
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, NUMERIC) TO anon;