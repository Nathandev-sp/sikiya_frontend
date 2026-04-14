import { MainSecondaryBlueColor } from '../styles/GeneralAppStyle';

/**
 * Pill / chip colors for article_group — single source for Home chips and NewsHome hero flag.
 * Entertainment is not a home chip but appears on articles; keep a clear accent.
 */
export const HOME_CATEGORY_COLORS = {
    Explore: '#3B82F6',
    Politics: '#DC2626',
    Economy: '#2F7D32',
    Social: '#7C3AED',
    Tech: '#2563EB',
    Business: '#7C2D12',
    Sports: '#EA580C',
    Culture: '#475569',
    Africa: '#92400E',
    World: '#0F766E',
    Entertainment: '#9333EA',
};

export function getHomeCategoryChipColor(articleGroup) {
    if (!articleGroup) return MainSecondaryBlueColor;
    return HOME_CATEGORY_COLORS[articleGroup] ?? MainSecondaryBlueColor;
}

/** Row model for HomeScreen category strip — colors must match HOME_CATEGORY_COLORS */
export const HOME_FEED_CATEGORIES = [
    { key: 'Explore', name: 'explore', icon: 'compass', color: HOME_CATEGORY_COLORS.Explore },
    { key: 'Politics', name: 'politics', icon: 'flag', color: HOME_CATEGORY_COLORS.Politics },
    { key: 'Economy', name: 'economy', icon: 'trending-up', color: HOME_CATEGORY_COLORS.Economy },
    { key: 'Social', name: 'social', icon: 'people', color: HOME_CATEGORY_COLORS.Social },
    { key: 'Tech', name: 'tech', icon: 'hardware-chip', color: HOME_CATEGORY_COLORS.Tech },
    { key: 'Business', name: 'business', icon: 'briefcase', color: HOME_CATEGORY_COLORS.Business },
    { key: 'Sports', name: 'sports', icon: 'football', color: HOME_CATEGORY_COLORS.Sports },
    { key: 'Culture', name: 'culture', icon: 'library', color: HOME_CATEGORY_COLORS.Culture },
    { key: 'Africa', name: 'africa', icon: 'earth-outline', color: HOME_CATEGORY_COLORS.Africa },
    { key: 'World', name: 'world', icon: 'globe', color: HOME_CATEGORY_COLORS.World },
];
