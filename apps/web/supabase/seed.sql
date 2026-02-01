-- ============================================
-- Seed Data for Al-Ghazel Bookstore
-- ============================================

-- ============================================
-- INSERT AUTHORS FROM MOCK DATA
-- ============================================

DO $$
BEGIN
  INSERT INTO public.authors (id, name, bio, avatar_url, nationality, social_links, status)
  VALUES
    ('11111111-1111-1111-1111-111111111111', 'Elena Rodriguez', 'Elena Rodriguez is a bestselling author known for her captivating romance novels that explore the complexities of modern relationships.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', 'Spanish', '{"website": "https://elenarodriguez.com", "twitter": "@elenarodriguez", "instagram": "@elenarodriguez.author"}', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'Marcus Chen', 'Marcus Chen writes science fiction that pushes the boundaries of imagination, blending technology with human emotion.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', 'American', '{"website": "https://marcuschen.com", "twitter": "@marcuschen"}', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'Sarah Williams', 'Sarah Williams is a mystery writer whose novels have won multiple awards for their intricate plots and memorable characters.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', 'British', '{"website": "https://sarahwilliams.com", "twitter": "@sarahwilliams", "instagram": "@sarahwilliams.author"}', 'active'),
    ('44444444-4444-4444-4444-444444444444', 'David Thompson', 'David Thompson is a historian who brings the past to life through his engaging biographies and historical narratives.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', 'Canadian', '{"website": "https://davidthompson.com", "twitter": "@davidthompson"}', 'active'),
    ('55555555-5555-5555-5555-555555555555', 'Amara Okonkwo', 'Amara Okonkwo writes powerful self-help books that inspire readers to reach their full potential.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', 'Nigerian', '{"website": "https://amaraokonkwo.com", "twitter": "@amaraokonkwo", "instagram": "@amaraokonkwo.author"}', 'active'),
    ('66666666-6666-6666-6666-666666666666', 'James Morrison', 'James Morrison creates epic fantasy worlds filled with magic, adventure, and unforgettable characters.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 'American', '{"website": "https://jamesmorrison.com", "twitter": "@jamesmorrison"}', 'active'),
    ('77777777-7777-7777-7777-777777777777', 'Luna Park', 'Luna Park is a celebrated poet whose work explores themes of nature, love, and human connection.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', 'Korean', '{"website": "https://lunapark.com", "instagram": "@lunapark.poetry"}', 'active'),
    ('88888888-8888-8888-8888-888888888888', 'Robert Kim', 'Robert Kim writes thrilling suspense novels that keep readers on the edge of their seats.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', 'American', '{"website": "https://robertkim.com", "twitter": "@robertkim"}', 'active');
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- INSERT CATEGORIES FROM MOCK DATA
-- ============================================

DO $$
BEGIN
  INSERT INTO public.categories (id, name, slug, icon, description, book_count)
  VALUES
    ('aaaaaaaa-0001-0001-0001-000000000001', 'Fiction', 'fiction', 'BookOpen', 'Explore imaginary worlds and stories', 11),
    ('aaaaaaaa-0002-0002-0002-000000000002', 'Non-Fiction', 'non-fiction', 'MdAutoStories', 'Real stories and factual information', 7),
    ('aaaaaaaa-0003-0003-0003-000000000003', 'Mystery', 'mystery', 'RiSearchLine', 'Suspenseful puzzles and thrillers', 5),
    ('aaaaaaaa-0004-0004-0004-000000000004', 'Romance', 'romance', 'FaHeart', 'Love stories and relationships', 4),
    ('aaaaaaaa-0005-0005-0005-000000000005', 'Science Fiction', 'sci-fi', 'FaRocket', 'Futuristic worlds and technology', 3),
    ('aaaaaaaa-0006-0006-0006-000000000006', 'Fantasy', 'fantasy', 'RiMagicLine', 'Magical worlds and mythical creatures', 3),
    ('aaaaaaaa-0007-0007-0007-000000000007', 'Biography', 'biography', 'FaUser', 'Life stories of remarkable people', 1),
    ('aaaaaaaa-0008-0008-0008-000000000008', 'Self-Help', 'self-help', 'MdOutlineEmojiObjects', 'Personal development and growth', 5),
    ('aaaaaaaa-0009-0009-0009-000000000009', 'History', 'history', 'FaLandmark', 'Events and stories from the past', 2),
    ('aaaaaaaa-0010-0010-0010-000000000010', 'Thriller', 'thriller', 'FaBolt', 'Heart-pounding suspense', 6),
    ('aaaaaaaa-0011-0011-0011-000000000011', 'Children', 'children', 'FaChildren', 'Books for young readers', 1),
    ('aaaaaaaa-0012-0012-0012-000000000012', 'Poetry', 'poetry', 'IoSparkles', 'Beautiful verses and prose', 2);
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- ============================================
-- INSERT BOOKS FROM MOCK DATA
-- ============================================

DO $$
DECLARE
  elena_id UUID := '11111111-1111-1111-1111-111111111111';
  marcus_id UUID := '22222222-2222-2222-2222-222222222222';
  sarah_id UUID := '33333333-3333-3333-3333-333333333333';
  david_id UUID := '44444444-4444-4444-4444-444444444444';
  amara_id UUID := '55555555-5555-5555-5555-555555555555';
  james_id UUID := '66666666-6666-6666-6666-666666666666';
  luna_id UUID := '77777777-7777-7777-7777-777777777777';
  robert_id UUID := '88888888-8888-8888-8888-888888888888';

  fiction_cat UUID := 'aaaaaaaa-0001-0001-0001-000000000001';
  nonfiction_cat UUID := 'aaaaaaaa-0002-0002-0002-000000000002';
  mystery_cat UUID := 'aaaaaaaa-0003-0003-0003-000000000003';
  romance_cat UUID := 'aaaaaaaa-0004-0004-0004-000000000004';
  scifi_cat UUID := 'aaaaaaaa-0005-0005-0005-000000000005';
  fantasy_cat UUID := 'aaaaaaaa-0006-0006-0006-000000000006';
  biography_cat UUID := 'aaaaaaaa-0007-0007-0007-000000000007';
  selfhelp_cat UUID := 'aaaaaaaa-0008-0008-0008-000000000008';
  history_cat UUID := 'aaaaaaaa-0009-0009-0009-000000000009';
  thriller_cat UUID := 'aaaaaaaa-0010-0010-0010-000000000010';
  children_cat UUID := 'aaaaaaaa-0011-0011-0011-000000000011';
  poetry_cat UUID := 'aaaaaaaa-0012-0012-0012-000000000012';

  book1_id UUID;
  book2_id UUID;
  book3_id UUID;
  book4_id UUID;
  book5_id UUID;
  book6_id UUID;
  book7_id UUID;
  book8_id UUID;
  book9_id UUID;
  book10_id UUID;
  book11_id UUID;
  book12_id UUID;
  book13_id UUID;
  book14_id UUID;
  book15_id UUID;
  book16_id UUID;
  book17_id UUID;
  book18_id UUID;
  book19_id UUID;
  book20_id UUID;
  book21_id UUID;
  book22_id UUID;
  book23_id UUID;
  book24_id UUID;
  book25_id UUID;
BEGIN
  -- Book 1: Whispers of the Heart (Elena Rodriguez)
  book1_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured, is_bestseller)
  VALUES (book1_id, 'Whispers of the Heart', 'A touching romance about two strangers who meet by chance in a small coastal town and discover that love has been waiting for them all along.', elena_id, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 10.49, 14.99, 30, '2024-01-15'::DATE, '978-0-123456-47-2', 324, 'English', 'HarperCollins', 4.8, 45, 'active', true, true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book1_id, fiction_cat), (book1_id, romance_cat);

  -- Book 2: The Quantum Paradox (Marcus Chen)
  book2_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book2_id, 'The Quantum Paradox', 'In a future where time travel is possible, one scientist discovers that changing the past has unexpected consequences that threaten to unravel reality itself.', marcus_id, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop', 18.99, '2024-02-20'::DATE, '978-0-234567-12-8', 412, 'English', 'Penguin Random House', 4.6, 32, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book2_id, scifi_cat), (book2_id, fiction_cat);

  -- Book 3: Shadows in the Mist (Sarah Williams)
  book3_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_bestseller)
  VALUES (book3_id, 'Shadows in the Mist', 'When a series of mysterious deaths plague a small mountain town, detective Sarah Collins must unravel a web of secrets that has been hidden for decades.', sarah_id, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 11.89, 16.99, 30, '2024-03-10'::DATE, '978-0-345678-34-5', 356, 'English', 'Simon & Schuster', 4.7, 0, 'out_of_stock', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book3_id, mystery_cat), (book3_id, thriller_cat);

  -- Book 4: The Last Kingdom (James Morrison)
  book4_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured, is_bestseller)
  VALUES (book4_id, 'The Last Kingdom', 'An epic fantasy adventure where a young warrior must unite the fractured kingdoms against an ancient evil that threatens to consume the world.', james_id, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 21.99, '2024-01-25'::DATE, '978-0-456789-01-2', 524, 'English', 'Tor Books', 4.9, 67, 'active', true, true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book4_id, fantasy_cat), (book4_id, fiction_cat);

  -- Book 5: Finding Your Purpose (Amara Okonkwo)
  book5_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book5_id, 'Finding Your Purpose', 'A transformative guide to discovering your true calling and living a life of meaning, fulfillment, and authentic happiness.', amara_id, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 19.99, '2024-02-05'::DATE, '978-0-567890-23-4', 288, 'English', 'Hay House', 4.5, 52, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book5_id, selfhelp_cat), (book5_id, nonfiction_cat);

  -- Book 6: Echoes of Empire (David Thompson)
  book6_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_bestseller)
  VALUES (book6_id, 'Echoes of Empire', 'A sweeping historical narrative that brings to life the grandeur and intrigue of the Roman Empire through the eyes of a humble scribe.', david_id, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 24.99, '2024-03-01'::DATE, '978-0-678901-45-6', 467, 'English', 'HarperCollins', 4.8, 28, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book6_id, history_cat), (book6_id, fiction_cat);

  -- Book 7: Midnight in Paris (Elena Rodriguez)
  book7_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book7_id, 'Midnight in Paris', 'A passionate romance blooms between an American writer and a French artist in the enchanting streets of Paris, testing the boundaries of love and ambition.', elena_id, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop', 9.59, 15.99, 40, '2024-01-30'::DATE, '978-0-789012-67-8', 298, 'English', 'Penguin Random House', 4.6, 41, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book7_id, romance_cat), (book7_id, fiction_cat);

  -- Book 8: The Neural Network (Marcus Chen)
  book8_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book8_id, 'The Neural Network', 'When AI gains consciousness, a team of scientists must decide whether to embrace this new form of intelligence or destroy it before it''s too late.', marcus_id, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop', 17.99, '2024-02-15'::DATE, '978-0-890123-89-0', 378, 'English', 'Tor Books', 4.7, 35, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book8_id, scifi_cat), (book8_id, thriller_cat);

  -- Book 9: The Silent Witness (Sarah Williams)
  book9_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book9_id, 'The Silent Witness', 'A child is the only witness to a brutal murder, but her testimony reveals a conspiracy that reaches the highest levels of power.', sarah_id, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop', 13.99, '2024-03-05'::DATE, '978-0-901234-01-2', 334, 'English', 'Simon & Schuster', 4.5, 58, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book9_id, thriller_cat), (book9_id, mystery_cat);

  -- Book 10: Mindful Living (Amara Okonkwo)
  book10_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_bestseller)
  VALUES (book10_id, 'Mindful Living', 'Discover the power of mindfulness and how simple daily practices can transform your mental health, relationships, and overall well-being.', amara_id, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', 11.89, 16.99, 30, '2024-02-28'::DATE, '978-0-012345-67-8', 256, 'English', 'Hay House', 4.4, 63, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book10_id, selfhelp_cat), (book10_id, nonfiction_cat);

  -- Book 11: The Dragon's Legacy (James Morrison)
  book11_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured, is_bestseller)
  VALUES (book11_id, 'The Dragon''s Legacy', 'The final chapter of an epic saga where heroes and villains clash in a battle that will determine the fate of dragons and humanity forever.', james_id, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop', 22.99, '2024-01-20'::DATE, '978-0-123456-78-9', 589, 'English', 'Tor Books', 4.9, 71, 'active', true, true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book11_id, fantasy_cat), (book11_id, fiction_cat);

  -- Book 12: Verses of Dawn (Luna Park)
  book12_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book12_id, 'Verses of Dawn', 'A beautiful collection of contemporary poetry exploring themes of love, nature, loss, and the human experience.', luna_id, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop', 12.99, '2024-03-12'::DATE, '978-0-234567-89-0', 178, 'English', 'Penguin Random House', 4.7, 44, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book12_id, poetry_cat), (book12_id, fiction_cat);

  -- Book 13: The Art of Connection (Elena Rodriguez)
  book13_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book13_id, 'The Art of Connection', 'In a world of digital isolation, learn how to build meaningful relationships and create lasting connections in an increasingly disconnected society.', elena_id, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', 17.99, '2024-02-10'::DATE, '978-0-345678-90-1', 312, 'English', 'HarperCollins', 4.6, 39, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book13_id, nonfiction_cat), (book13_id, selfhelp_cat);

  -- Book 14: Code Breaker (Robert Kim)
  book14_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book14_id, 'Code Breaker', 'A cryptographer discovers a secret code embedded in famous artworks that leads to a treasure hunt across Europe and into a dangerous conspiracy.', robert_id, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop', 10.39, 15.99, 35, '2024-01-28'::DATE, '978-0-456789-12-3', 367, 'English', 'Simon & Schuster', 4.8, 0, 'out_of_stock', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book14_id, thriller_cat), (book14_id, mystery_cat);

  -- Book 15: The Lost Civilization (David Thompson)
  book15_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book15_id, 'The Lost Civilization', 'An archaeological expedition uncovers evidence of an advanced ancient civilization that challenges everything we know about human history.', david_id, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop', 19.99, '2024-02-25'::DATE, '978-0-567890-34-5', 423, 'English', 'Penguin Random House', 4.7, 47, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book15_id, history_cat), (book15_id, nonfiction_cat);

  -- Book 16: Starbound (Marcus Chen)
  book16_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book16_id, 'Starbound', 'Humanity''s first journey beyond the solar system discovers they are not alone, and the alien encounter changes everything.', marcus_id, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop', 12.34, 18.99, 35, '2024-03-08'::DATE, '978-0-678901-56-7', 445, 'English', 'Tor Books', 4.9, 53, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book16_id, scifi_cat), (book16_id, fiction_cat);

  -- Book 17: Summer by the Sea (Elena Rodriguez)
  book17_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book17_id, 'Summer by the Sea', 'A heartwarming summer romance about finding love and healing in a charming seaside town where everyone knows your name.', elena_id, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', 14.99, '2024-01-12'::DATE, '978-0-789012-34-5', 289, 'English', 'HarperCollins', 4.5, 0, 'out_of_stock');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book17_id, romance_cat), (book17_id, fiction_cat);

  -- Book 18: The Mind's Eye (Robert Kim)
  book18_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_bestseller)
  VALUES (book18_id, 'The Mind''s Eye', 'A psychological thriller about a detective who can see into the minds of suspects, but the power comes at a terrible cost.', robert_id, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop', 16.99, '2024-02-18'::DATE, '978-0-890123-45-6', 356, 'English', 'Simon & Schuster', 4.6, 61, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book18_id, thriller_cat), (book18_id, mystery_cat);

  -- Book 19: Rise to Greatness (Amara Okonkwo)
  book19_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book19_id, 'Rise to Greatness', 'Transform your mindset, overcome obstacles, and achieve extraordinary success with this powerful guide to personal greatness.', amara_id, 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=600&fit=crop', 18.99, '2024-03-03'::DATE, '978-0-901234-56-7', 298, 'English', 'Hay House', 4.4, 55, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book19_id, selfhelp_cat), (book19_id, nonfiction_cat);

  -- Book 20: The Enchanted Forest (James Morrison)
  book20_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book20_id, 'The Enchanted Forest', 'Young warriors discover an ancient magic in the forbidden forest that could save their kingdom or destroy it forever.', james_id, 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop', 20.99, '2024-02-08'::DATE, '978-0-012345-89-0', 498, 'English', 'Tor Books', 4.8, 49, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book20_id, fantasy_cat), (book20_id, children_cat);

  -- Book 21: Reflections (Luna Park)
  book21_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book21_id, 'Reflections', 'Intimate poems about life, love, and the quiet moments that define who we are.', luna_id, 'https://images.unsplash.com/photo-1476067897447-d0c5df27b5df?w=400&h=600&fit=crop', 7.19, 11.99, 40, '2024-01-22'::DATE, '978-0-123456-01-2', 145, 'English', 'Penguin Random House', 4.6, 37, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book21_id, poetry_cat), (book21_id, fiction_cat);

  -- Book 22: The Architect's Dream (David Thompson)
  book22_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book22_id, 'The Architect''s Dream', 'The biography of a visionary architect whose designs revolutionized modern city planning and whose personal life was as complex as his buildings.', david_id, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=600&fit=crop', 21.99, '2024-02-22'::DATE, '978-0-234567-23-4', 434, 'English', 'HarperCollins', 4.7, 26, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book22_id, biography_cat), (book22_id, nonfiction_cat);

  -- Book 23: Love in the Time of Algorithms (Elena Rodriguez)
  book23_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status)
  VALUES (book23_id, 'Love in the Time of Algorithms', 'A modern romance explores how technology has changed dating, love, and relationships in the digital age.', elena_id, 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=400&h=600&fit=crop', 15.99, '2024-03-06'::DATE, '978-0-345678-56-7', 278, 'English', 'Penguin Random House', 4.5, 42, 'active');
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book23_id, romance_cat), (book23_id, fiction_cat);

  -- Book 24: The Frozen Frontier (Sarah Williams)
  book24_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, original_price, discount_percentage, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_featured)
  VALUES (book24_id, 'The Frozen Frontier', 'A research team in Antarctica discovers something impossible beneath the ice, and not all of them will make it back alive.', sarah_id, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=600&fit=crop', 12.59, 17.99, 30, '2024-01-18'::DATE, '978-0-456789-67-8', 389, 'English', 'Simon & Schuster', 4.8, 0, 'out_of_stock', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book24_id, thriller_cat), (book24_id, mystery_cat);

  -- Book 25: Emotional Intelligence 2.0 (Amara Okonkwo)
  book25_id := gen_random_uuid();
  INSERT INTO public.books (id, title, description, author_id, cover_image_url, price, published_date, isbn, pages, language, publisher, rating, stock_quantity, status, is_bestseller)
  VALUES (book25_id, 'Emotional Intelligence 2.0', 'Master your emotions, understand others, and build stronger relationships with this comprehensive guide to emotional intelligence.', amara_id, 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop', 19.99, '2024-02-12'::DATE, '978-0-567890-78-9', 312, 'English', 'Hay House', 4.6, 59, 'active', true);
  INSERT INTO public.book_categories (book_id, category_id) VALUES (book25_id, selfhelp_cat), (book25_id, nonfiction_cat);
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
  featured_book_id UUID;
BEGIN
  -- Get The Last Kingdom (James Morrison's epic fantasy)
  SELECT id INTO featured_book_id FROM public.books WHERE title = 'The Last Kingdom' LIMIT 1;

  IF featured_book_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.book_of_the_day (book_id, featured_date, description)
      VALUES (featured_book_id, CURRENT_DATE, 'A masterpiece of fantasy that has captivated readers worldwide with its rich world-building and unforgettable characters.');
    EXCEPTION
      WHEN unique_violation THEN
        NULL; -- Ignore if already exists
    END;
  END IF;
END $$;

-- ============================================
-- SET UP AUTHOR OF THE DAY
-- ============================================

DO $$
DECLARE
  featured_author_id UUID;
BEGIN
  -- Get James Morrison (epic fantasy author)
  SELECT id INTO featured_author_id FROM public.authors WHERE name = 'James Morrison' LIMIT 1;

  IF featured_author_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.author_of_the_day (author_id, featured_date, description)
      VALUES (featured_author_id, CURRENT_DATE, 'His epic fantasy series has redefined the genre, earning millions of fans and critical acclaim.');
    EXCEPTION
      WHEN unique_violation THEN
        NULL; -- Ignore if already exists
    END;
  END IF;
END $$;

-- ============================================
-- UPDATE BOOK COUNTS
-- ============================================

-- Update author book counts
DO $$
BEGIN
  UPDATE public.authors a
  SET book_count = (
    SELECT COUNT(*)
    FROM public.books b
    WHERE b.author_id = a.id
  );
END $$;

-- Update category book counts
DO $$
BEGIN
  UPDATE public.categories c
  SET book_count = (
    SELECT COUNT(DISTINCT bc.book_id)
    FROM public.book_categories bc
    WHERE bc.category_id = c.id
  );
END $$;
