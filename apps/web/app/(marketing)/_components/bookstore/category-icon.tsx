/**
 * Category Icon Component
 * Maps category icon names to React Icons
 */

'use client';

import { FaBook, FaMagnifyingGlass, FaHeart, FaRocket, FaWandMagicSparkles, FaUser, FaLightbulb, FaLandmark, FaBolt, FaBaby, FaStar, FaScroll, FaLanguage, FaFileLines, FaFlask, FaBrain, FaPlaceOfWorship, FaHeartPulse, FaGraduationCap, FaBriefcase, FaArrowTrendUp, FaBullhorn, FaPalette, FaMusic, FaFilm, FaBuilding, FaUtensils, FaPlane, FaTrophy, FaScaleBalanced, FaUsers, FaGavel, FaMicrochip, FaCode, FaBookOpen, FaScissors, FaGamepad, FaStarAndCrescent, FaBookBookmark, FaChildren } from 'react-icons/fa6';
import { MdPsychology, MdOutlineSchool, MdRestaurant, MdSportsEsports, MdMenuBook, MdAutoStories, MdSpa, MdLocalLibrary, MdScience, MdWork, MdBusinessCenter, MdTravelExplore, MdOutlineEmojiObjects, MdOutlineStadium, MdOutlineScience, MdCastle, MdDinnerDining } from 'react-icons/md';
import { RiMagicLine, RiMentalHealthLine, RiGalleryLine, RiMusic2Line, RiFilmLine, RiBuildingLine, RiRestTimeLine, RiPlaneLine, RiTrophyLine, RiScales3Line, RiTeamLine, RiHammerLine, RiCpuLine, RiCodeSSlashLine, RiScissorsCutLine, RiGamepadLine, RiKnifeLine, RiSearchLine } from 'react-icons/ri';
import { IoLibrary, IoSparkles, IoSearch } from 'react-icons/io5';
import { cn } from '@kit/ui/utils';

interface CategoryIconProps {
  iconName?: string | null;
  className?: string;
  size?: number;
}

type IconComponent = React.ComponentType<{ className?: string; size?: number }>;

// Icon name mapping with proper React Icons components
const iconMap: Record<string, IconComponent> = {
  // Existing categories
  'BookOpen': FaBook,
  'Library': IoLibrary,
  'Search': RiSearchLine,
  'RiSearchLine': RiSearchLine,
  'Heart': FaHeart,
  'Rocket': FaRocket,
  'Wand2': RiMagicLine,
  'User': FaUser,
  'Lightbulb': MdOutlineEmojiObjects,
  'Landmark': FaLandmark,
  'Zap': FaBolt,
  'Baby': FaChildren,
  'Sparkles': IoSparkles,
  'MdAutoStories': MdAutoStories,
  // New categories
  'StarCrescent': FaStarAndCrescent,
  'MoonStar': FaStar,
  'ScrollText': FaScroll,
  'Languages': FaLanguage,
  'FileText': FaFileLines,
  'FlaskConical': MdOutlineScience,
  'BrainCircuit': FaBrain,
  'PlaceOfWorship': FaPlaceOfWorship,
  'Castle': MdCastle,
  'MentalHealth': RiMentalHealthLine,
  'Hospital': FaHeartPulse,
  'Psychology': MdPsychology,
  'GraduationCap': FaGraduationCap,
  'Education': MdOutlineSchool,
  'Briefcase': MdBusinessCenter,
  'TrendingUp': FaArrowTrendUp,
  'Megaphone': FaBullhorn,
  'Palette': RiGalleryLine,
  'Music': RiMusic2Line,
  'Film': RiFilmLine,
  'Building2': RiBuildingLine,
  'Architecture': RiBuildingLine,
  'HeartPulse': FaHeartPulse,
  'Health': MdSpa,
  'ChefHat': RiKnifeLine,
  'Cooking': MdDinnerDining,
  'Plane': RiPlaneLine,
  'Travel': MdTravelExplore,
  'Trophy': RiTrophyLine,
  'Sports': MdOutlineStadium,
  'Scale': RiScales3Line,
  'Users': RiTeamLine,
  'Gavel': RiHammerLine,
  'Cpu': RiCpuLine,
  'Technology': RiCpuLine,
  'Code': RiCodeSSlashLine,
  'Programming': FaCode,
  'Book': FaBookOpen,
  'Comics': MdMenuBook,
  'Scissors': RiScissorsCutLine,
  'Crafts': RiScissorsCutLine,
  'Gamepad2': RiGamepadLine,
  'Games': RiGamepadLine,
  'Gamepad': RiGamepadLine,
  // Aliases for lowercase variations
  'languages': FaLanguage,
  'scifi': FaRocket,
  'sci-fi': FaRocket,
  'selfhelp': MdOutlineEmojiObjects,
  'self-help': MdOutlineEmojiObjects,
  'non-fiction': MdAutoStories,
  'nonfiction': MdAutoStories,
};

export function CategoryIcon({ iconName, className, size = 32 }: CategoryIconProps) {
  if (!iconName) {
    return <FaBook className={className} size={size} />;
  }

  // Normalize the icon name and look up in the map
  const normalizedName = iconName.trim();
  const IconComponent = iconMap[normalizedName] || iconMap[normalizedName.toLowerCase()];

  if (!IconComponent) {
    // Fallback to book icon if not found
    return <FaBook className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
