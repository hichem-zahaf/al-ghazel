/*
 * Update Category Icons and Add New Categories
 * Changes emoji icons to React Icon names and adds comprehensive category list
 */

-- ============================================
-- UPDATE EXISTING CATEGORY ICONS TO REACT ICON NAMES
-- ============================================

UPDATE public.categories SET icon = 'BookOpen' WHERE name = 'Fiction';
UPDATE public.categories SET icon = 'MdAutoStories' WHERE name = 'Non-Fiction';
UPDATE public.categories SET icon = 'RiSearchLine' WHERE name = 'Mystery';
UPDATE public.categories SET icon = 'FaHeart' WHERE name = 'Romance';
UPDATE public.categories SET icon = 'FaRocket' WHERE name = 'Science Fiction';
UPDATE public.categories SET icon = 'RiMagicLine' WHERE name = 'Fantasy';
UPDATE public.categories SET icon = 'FaUser' WHERE name = 'Biography';
UPDATE public.categories SET icon = 'MdOutlineEmojiObjects' WHERE name = 'Self-Help';
UPDATE public.categories SET icon = 'FaLandmark' WHERE name = 'History';
UPDATE public.categories SET icon = 'FaBolt' WHERE name = 'Thriller';
UPDATE public.categories SET icon = 'FaChildren' WHERE name = 'Children';
UPDATE public.categories SET icon = 'IoSparkles' WHERE name = 'Poetry';

-- ============================================
-- ADD NEW CATEGORIES
-- ============================================

DO $$
BEGIN
  -- Islamic Studies
  INSERT INTO public.categories (id, name, slug, icon, description, display_order, book_count)
  VALUES
    ('aaaaaaaa-0013-0013-0013-000000000013', 'Islamic', 'islamic', 'StarCrescent', 'Islamic literature, theology, and history', 13, 0),
    ('aaaaaaaa-0014-0014-0014-000000000014', 'Quran', 'quran', 'BookOpen', 'Quranic studies, tafsir, and recitation', 14, 0),
    ('aaaaaaaa-0015-0015-0015-000000000015', 'Hadith', 'hadith', 'ScrollText', 'Hadith collections and studies', 15, 0),

  -- Language & Literature
    ('aaaaaaaa-0016-0016-0016-000000000016', 'English', 'english', 'Languages', 'English language and literature', 16, 0),
    ('aaaaaaaa-0017-0017-0017-000000000017', 'Arabic', 'arabic', ' Languages', 'Arabic language and literature', 17, 0),
    ('aaaaaaaa-0018-0018-0018-000000000018', 'French', 'french', 'Languages', 'French language and literature', 18, 0),
    ('aaaaaaaa-0019-0019-0019-000000000019', 'Literature', 'literature', 'FileText', 'Classic and contemporary literature', 19, 0),

  -- Academic & Education
    ('aaaaaaaa-0020-0020-0020-000000000020', 'Science', 'science', 'FlaskConical', 'Scientific books and research', 20, 0),
    ('aaaaaaaa-0021-0021-0021-000000000021', 'Philosophy', 'philosophy', 'BrainCircuit', 'Philosophy and critical thinking', 21, 0),
    ('aaaaaaaa-0022-0022-0022-000000000022', 'Religion', 'religion', 'PlaceOfWorship', 'Religious studies and spirituality', 22, 0),
    ('aaaaaaaa-0023-0023-0023-000000000023', 'Psychology', 'psychology', 'MentalHealth', 'Psychology and mental health', 23, 0),
    ('aaaaaaaa-0024-0024-0024-000000000024', 'Education', 'education', 'GraduationCap', 'Educational materials and pedagogy', 24, 0),

  -- Business & Finance
    ('aaaaaaaa-0025-0025-0025-000000000025', 'Business', 'business', 'Briefcase', 'Business and management', 25, 0),
    ('aaaaaaaa-0026-0026-0026-000000000026', 'Economics', 'economics', 'TrendingUp', 'Economics and finance', 26, 0),
    ('aaaaaaaa-0027-0027-0027-000000000027', 'Marketing', 'marketing', 'Megaphone', 'Marketing and advertising', 27, 0),
    ('aaaaaaaa-0028-0028-0028-000000000028', 'Entrepreneurship', 'entrepreneurship', 'Rocket', 'Entrepreneurship and startups', 28, 0),

  -- Arts & Culture
    ('aaaaaaaa-0029-0029-0029-000000000029', 'Art', 'art', 'Palette', 'Art and design', 29, 0),
    ('aaaaaaaa-0030-0030-0030-000000000030', 'Music', 'music', 'Music', 'Music and musicians', 30, 0),
    ('aaaaaaaa-0031-0031-0031-000000000031', 'Film', 'film', 'Film', 'Film and cinema', 31, 0),
    ('aaaaaaaa-0032-0032-0032-000000000032', 'Architecture', 'architecture', 'Building2', 'Architecture and design', 32, 0),

  -- Health & Lifestyle
    ('aaaaaaaa-0033-0033-0033-000000000033', 'Health', 'health', 'HeartPulse', 'Health and wellness', 33, 0),
    ('aaaaaaaa-0034-0034-0034-000000000034', 'Cooking', 'cooking', 'ChefHat', 'Cooking and recipes', 34, 0),
    ('aaaaaaaa-0035-0035-0035-000000000035', 'Travel', 'travel', 'Plane', 'Travel and adventure', 35, 0),
    ('aaaaaaaa-0036-0036-0036-000000000036', 'Sports', 'sports', 'Trophy', 'Sports and fitness', 36, 0),

  -- Politics & Society
    ('aaaaaaaa-0037-0037-0037-000000000037', 'Politics', 'politics', 'Scale', 'Politics and government', 37, 0),
    ('aaaaaaaa-0038-0038-0038-000000000038', 'Sociology', 'sociology', 'Users', 'Sociology and society', 38, 0),
    ('aaaaaaaa-0039-0039-0039-000000000039', 'Law', 'law', 'Gavel', 'Law and legal studies', 39, 0),

  -- Technology & Computing
    ('aaaaaaaa-0040-0040-0040-000000000040', 'Technology', 'technology', 'Cpu', 'Technology and computing', 40, 0),
    ('aaaaaaaa-0041-0041-0041-000000000041', 'Programming', 'programming', 'Code', 'Programming and software development', 41, 0),

  -- Other
    ('aaaaaaaa-0042-0042-0042-000000000042', 'Comics', 'comics', 'Book', 'Comics and graphic novels', 42, 0),
    ('aaaaaaaa-0043-0043-0043-000000000043', 'Crafts', 'crafts', 'Scissors', 'Crafts and hobbies', 43, 0),
    ('aaaaaaaa-0044-0044-0044-000000000044', 'Games', 'games', 'Gamepad2', 'Gaming and strategy guides', 44, 0);
EXCEPTION
  WHEN unique_violation THEN
    NULL; -- Ignore if already exists
END $$;

-- Add policies for inserting/updating categories by authenticated users
DROP POLICY IF EXISTS categories_insert_service ON public.categories;
DROP POLICY IF EXISTS categories_update_service ON public.categories;
CREATE POLICY categories_insert_service ON public.categories FOR INSERT WITH CHECK (current_user = 'service_role' OR current_user = 'authenticated');
CREATE POLICY categories_update_service ON public.categories FOR UPDATE USING (current_user = 'service_role' OR current_user = 'authenticated');
