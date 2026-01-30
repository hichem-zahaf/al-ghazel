-- ============================================
-- Seed Data for Al-Ghazel Bookstore
-- ============================================

-- ============================================
-- INSERT TEST USERS
-- ============================================

-- Note: These users are created using direct SQL for seeding purposes.
-- In production, users should be created through the authentication flow.
-- The kit.new_user_created_setup() trigger will automatically create accounts.

DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
  customer_user_id UUID := gen_random_uuid();
BEGIN
  -- Create admin user with super-admin role
  -- The password hash below is for "testingpassword"
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@al-ghazel.com',
    crypt('testingpassword', gen_salt('bf')),
    NOW(),
    '{"name": "Admin User"}',
    '{"role": "super-admin", "provider": "email"}',
    NOW(),
    NOW(),
    NOW()
  );

  -- Create customer user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    customer_user_id,
    'authenticated',
    'authenticated',
    'customer@al-ghazel.com',
    crypt('testingpassword', gen_salt('bf')),
    NOW(),
    '{"name": "Customer User"}',
    '{"role": "customer", "provider": "email"}',
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- ============================================
-- INSERT SAMPLE AUTHORS
-- ============================================

DO $$
BEGIN
  INSERT INTO public.authors (id, name, bio, nationality, is_featured)
  VALUES
    (gen_random_uuid(), 'Matt Haig', 'British author for children and adults. His memoir Reasons to Stay Alive was a number one bestseller, staying in the British top ten for 46 weeks.', 'British', true),
    (gen_random_uuid(), 'James Clear', 'American author and speaker focused on habits, decision-making, and continuous improvement.', 'American', true),
    (gen_random_uuid(), 'Alex Michaelides', 'Cypriot-born British author and screenwriter.', 'Cypriot', false),
    (gen_random_uuid(), 'Delia Owens', 'American author, zoologist, and conservationist.', 'American', true),
    (gen_random_uuid(), 'Tara Westover', 'American memoirist and historian.', 'American', false);
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- INSERT SAMPLE CATEGORIES
-- ============================================

DO $$
BEGIN
  INSERT INTO public.categories (id, name, slug, description)
  VALUES
    (gen_random_uuid(), 'Fiction', 'fiction', 'Fictional literature and novels'),
    (gen_random_uuid(), 'Non-Fiction', 'non-fiction', 'Factual books and informational content'),
    (gen_random_uuid(), 'Self-Help', 'self-help', 'Personal development and self-improvement'),
    (gen_random_uuid(), 'Mystery', 'mystery', 'Crime, mystery, and thriller novels'),
    (gen_random_uuid(), 'Science Fiction', 'science-fiction', 'Sci-fi and fantasy literature'),
    (gen_random_uuid(), 'Biography', 'biography', 'Life stories and memoirs');
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- INSERT SAMPLE BOOKS
-- ============================================

DO $$
DECLARE
  matt_haig_id UUID;
  james_clear_id UUID;
  alex_michaelides_id UUID;
  delia_owens_id UUID;
  tara_westmore_id UUID;
BEGIN
  -- Get author IDs for book creation
  SELECT id INTO matt_haig_id FROM public.authors WHERE name = 'Matt Haig' LIMIT 1;
  SELECT id INTO james_clear_id FROM public.authors WHERE name = 'James Clear' LIMIT 1;
  SELECT id INTO alex_michaelides_id FROM public.authors WHERE name = 'Alex Michaelides' LIMIT 1;
  SELECT id INTO delia_owens_id FROM public.authors WHERE name = 'Delia Owens' LIMIT 1;
  SELECT id INTO tara_westmore_id FROM public.authors WHERE name = 'Tara Westover' LIMIT 1;

  IF matt_haig_id IS NOT NULL THEN
    INSERT INTO public.books (id, title, subtitle, description, author_id, isbn, cover_image_url, publisher, published_date, pages, price, original_price, discount_percentage, stock_quantity, rating, rating_count, is_featured, is_bestseller)
    VALUES
      (gen_random_uuid(), 'The Midnight Library', 'A Novel', 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.', matt_haig_id, '978-0525559474', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'Viking', '2020-08-25'::DATE, 304, 16.99, 24.99, 32, 45, 4.5, 1250, true, true);
  END IF;

  IF james_clear_id IS NOT NULL THEN
    INSERT INTO public.books (id, title, subtitle, description, author_id, isbn, cover_image_url, publisher, published_date, pages, price, original_price, discount_percentage, stock_quantity, rating, rating_count, is_featured, is_bestseller)
    VALUES
      (gen_random_uuid(), 'Atomic Habits', 'An Easy & Proven Way to Build Good Habits & Break Bad Ones', 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.', james_clear_id, '978-0735211292', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 'Avery', '2018-10-16'::DATE, 320, 14.50, 18.99, 24, 67, 4.8, 2100, true, true);
  END IF;

  IF alex_michaelides_id IS NOT NULL THEN
    INSERT INTO public.books (id, title, subtitle, description, author_id, isbn, cover_image_url, publisher, published_date, pages, price, original_price, discount_percentage, stock_quantity, rating, rating_count, is_featured, is_bestseller)
    VALUES
      (gen_random_uuid(), 'The Silent Patient', 'A Novel', 'Alicia Berenson''s life is seemingly perfect until one day she shoots her husband five times in the face.', alex_michaelides_id, '978-1250301697', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Celadon Books', '2019-02-05'::DATE, 336, 12.99, NULL, NULL, 34, 4.3, 890, false, true);
  END IF;

  IF delia_owens_id IS NOT NULL THEN
    INSERT INTO public.books (id, title, subtitle, description, author_id, isbn, cover_image_url, publisher, published_date, pages, price, original_price, discount_percentage, stock_quantity, rating, rating_count, is_featured, is_bestseller)
    VALUES
      (gen_random_uuid(), 'Where the Crawdads Sing', 'A Novel', 'A painfully beautiful first novel that is at once a murder mystery and a coming-of-age narrative.', delia_owens_id, '978-0735219090', 'https://images.unsplash.com/photo-1495630806767-7886d27fb74b?w=400', 'Putnam', '2018-08-14'::DATE, 384, 15.99, 19.99, 20, 52, 4.7, 1560, true, true);
  END IF;

  IF tara_westmore_id IS NOT NULL THEN
    INSERT INTO public.books (id, title, subtitle, description, author_id, isbn, cover_image_url, publisher, published_date, pages, price, original_price, discount_percentage, stock_quantity, rating, rating_count, is_featured, is_bestseller)
    VALUES
      (gen_random_uuid(), 'Educated', 'A Memoir', 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge.', tara_westmore_id, '978-0399590504', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', 'Random House', '2018-02-20'::DATE, 352, 14.95, NULL, NULL, 28, 4.6, 1100, true, false);
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- INSERT SAMPLE COUPONS
-- ============================================

DO $$
BEGIN
  INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active)
  VALUES
    ('SUMMER20', 'Summer sale - 20% off all books', 'percentage', 20, 0, NULL, 1000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '180 days', true),
    ('WELCOME10', 'Welcome offer - $10 off your first order', 'fixed', 10, 25, 50, 500, NOW() - INTERVAL '60 days', NOW() + INTERVAL '365 days', true),
    ('READMORE', 'Reading enthusiast - 15% off orders over $50', 'percentage', 15, 50, 30, 200, NOW() - INTERVAL '15 days', NOW() + INTERVAL '90 days', true);
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- SET UP BOOK OF THE DAY
-- ============================================

DO $$
DECLARE
  book_id UUID;
  i INTEGER;
BEGIN
  -- Get a featured book (The Midnight Library)
  SELECT id INTO book_id FROM public.books WHERE title = 'The Midnight Library' LIMIT 1;

  IF book_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      BEGIN
        INSERT INTO public.book_of_the_day (book_id, featured_date, description)
        VALUES (book_id, CURRENT_DATE + i, 'A dazzling novel about all the choices that go into a life well lived. Matt Haig''s bestseller about second chances.');
      EXCEPTION
        WHEN unique_violation THEN
          NULL; -- Ignore if already exists
      END;
    END LOOP;
  END IF;
END $$;

-- ============================================
-- SET UP AUTHOR OF THE DAY
-- ============================================

DO $$
DECLARE
  author_id UUID;
BEGIN
  -- Get Matt Haig
  SELECT id INTO author_id FROM public.authors WHERE name = 'Matt Haig' LIMIT 1;

  IF author_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.author_of_the_day (author_id, featured_date, description)
      VALUES (author_id, CURRENT_DATE, 'British author known for his uplifting fiction and insightful non-fiction about mental health.');
    EXCEPTION
      WHEN unique_violation THEN
        NULL; -- Ignore if already exists
    END;
  END IF;
END $$;
