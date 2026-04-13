import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, useWindowDimensions, ActivityIndicator, StatusBar, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NewsCategory from '../Components/NewsCategory';
import HighLight from '../Components/Highlights';
import AppScreenBackgroundColor, { articleTitleFont, generalActiveOpacity, generalTextColor, generalTextFont, generalTitleFont, main_Style, mainTitleColor, MainBrownSecondaryColor, MainSecondaryBlueColor, PrimBtnColor, withdrawnTitleColor, homeScreenPadding, homeSectionGap, homeCardVerticalGap, homeChipBorderRadius, homeFeedBackgroundColor } from '../styles/GeneralAppStyle';
import NewsAPI from '../../API/NewsAPI';
import SikiyaAPI from '../../API/SikiyaAPI';
import VerticalSpacer from '../Components/UI/VerticalSpacer';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import NewsCartv2 from '../Components/NewsCartv2';
import sleep from '../Helpers/Sleep';
import BannerAdComponent from '../Components/Ads/BannerAd';
import { useLanguage } from '../Context/LanguageContext';

// Create a completely stable Highlights wrapper component outside HomeScreen
// This ensures it's never recreated and never rerenders
const StableHighlightsWrapper = React.memo(({ preloadedHeadlines, headerHeight }) => {
    return (
        <Animated.View style={{ height: headerHeight }}>
            <HighLight preloadedHeadlines={preloadedHeadlines} hideLogo />
        </Animated.View>
    );
}, () => true); // Always return true = never rerender

StableHighlightsWrapper.displayName = 'StableHighlightsWrapper';

// Static logo component with notification bell
const StaticLogo = React.memo(({ onNotificationPress, unreadCount }) => (
    <View style={styles.logoStaticContainer}>
        {/* Invisible placeholder on left for centering */}
        <View style={styles.notificationPlaceholder} />
        
        {/* Centered logo */}
        <Image 
            style={styles.logoStatic}
            source={require("../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png")}
        />
        
        {/* Notification bell on right */}
        <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={generalActiveOpacity}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="notifications-outline" size={26} color={withdrawnTitleColor} />
            {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    </View>
));
StaticLogo.displayName = 'StaticLogo';

const HomeScreen = ({route}) => {
    const navigation = useNavigation();
    const { t } = useLanguage();

    // Import the preloaded data
    const preloadedHomeArticles = route?.params?.preloadedHomeArticles;
    const preloadedHeadlines = route?.params?.preloadedHeadlines;
    
    // Notification state
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Making the API Request ------------------ /top-headlines
    // Cache articles per category to prevent disappearing during transitions
    const [articlesByCategory, setArticlesByCategory] = useState({
        'Explore': preloadedHomeArticles || [],
        'Politics': [],
        'Economy': [],
        'Social': [],
        'Tech': [],
        'Business': [],
        'Sports': [],
        'Culture': [],
        'Africa': [],
        'World': [],
    });
    const [loading, setLoading] = useState(!preloadedHomeArticles);
    const [showLoader, setShowLoader] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Explore'); // Default to Explore
    const [filteringCategory, setFilteringCategory] = useState(false); // For client-side filtering
    const loaderTimeoutRef = useRef(null);
    
    // Get headline article IDs to exclude from main list
    const headlineArticleIds = useRef(new Set());
    
    // Memoize preloadedHeadlines to prevent unnecessary rerenders
    const stablePreloadedHeadlines = useRef(preloadedHeadlines);
    useEffect(() => {
        stablePreloadedHeadlines.current = preloadedHeadlines;
    }, [preloadedHeadlines]);
    
    // Get current articles for selected category
    const articles = articlesByCategory[selectedCategory] || [];
    
    // Extract headline IDs from preloaded headlines
    useEffect(() => {
        if (preloadedHeadlines && Array.isArray(preloadedHeadlines)) {
            headlineArticleIds.current = new Set(
                preloadedHeadlines.map(headline => headline._id || headline.article_id)
            );
        }
    }, [preloadedHeadlines]);
    const [categoryPages, setCategoryPages] = useState({
        'Explore': 1,
        'Politics': 1,
        'Economy': 1,
        'Social': 1,
        'Tech': 1,
        'Business': 1,
        'Sports': 1,
        'Culture': 1,
        'Africa': 1,
        'World': 1,
    });
    const [hasMoreByCategory, setHasMoreByCategory] = useState({
        'Explore': true,
        'Politics': true,
        'Economy': true,
        'Social': true,
        'Tech': true,
        'Business': true,
        'Sports': true,
        'Culture': true,
        'Africa': true,
        'World': true,
    });
    const scrollY = useRef(new Animated.Value(0)).current;

    //scrollview snap interval
    const { height } = useWindowDimensions();

    useEffect(() => {
        // Only fetch if we do not have preloaded articles
        if (!preloadedHomeArticles) {
            fetchTopHeadlines('Explore', true);
        }
        
        // Fetch unread notification count
        fetchUnreadNotificationCount();
        
        // Set up interval to refresh unread count every 30 seconds
        const notificationInterval = setInterval(() => {
            fetchUnreadNotificationCount();
        }, 30000);
        
        // Cleanup timeout on unmount
        return () => {
            if (loaderTimeoutRef.current) {
                clearTimeout(loaderTimeoutRef.current);
            }
            clearInterval(notificationInterval);
        };
    }, [preloadedHomeArticles]);
    
    // Fetch unread notification count
    const fetchUnreadNotificationCount = async () => {
        try {
            const response = await SikiyaAPI.get('/notifications/unread-count');
            if (response.data.success) {
                setUnreadNotificationCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            // Silently fail - likely auth issue or backend not ready
            // Don't log error to avoid console spam
            setUnreadNotificationCount(0);
        }
    };
    
    // Handle notification bell press
    const handleNotificationPress = () => {
        navigation.navigate('NotificationCenter');
    };

    const fetchTopHeadlines = async (category = null, isInitial = false) => {
        try {
            const limit = category === 'Explore' ? 10 : 10; // Load 10 articles initially
            // For Explore, don't pass article_group (shows all articles)
            const endpoint = category === 'Explore' 
                ? `articles/home?page=1&limit=${limit}` 
                : `articles/home?article_group=${category}&page=1&limit=${limit}`;
            const response = await SikiyaAPI.get(endpoint);
            
            // Remove duplicates based on _id and exclude headline articles
            const uniqueArticles = response.data.filter((article, index, self) => {
                // Remove duplicates
                const isUnique = index === self.findIndex(a => a._id === article._id);
                // Exclude headline articles
                const notInHeadlines = !headlineArticleIds.current.has(article._id);
                return isUnique && notInHeadlines;
            });
            
            // Update articles cache for this category
            setArticlesByCategory(prev => ({
                ...prev,
                [category]: uniqueArticles
            }));
            
            // Reset pagination for this category
            setCategoryPages(prev => ({
                ...prev,
                [category]: 1
            }));
            
            // Check if there are more articles
            const hasMore = uniqueArticles.length >= limit;
            setHasMoreByCategory(prev => ({
                ...prev,
                [category]: hasMore
            }));
        } catch (error) {
            console.error('Error fetching top headlines:', error);
            // On error, set hasMore to false for this category
            setHasMoreByCategory(prev => ({
                ...prev,
                [category]: false
            }));
        } finally {
            // Only set loading=false if this was initial load
            // For category switching, loading should already be false
            if (isInitial) {
                setLoading(false);
            }
            setShowLoader(false);
            setFilteringCategory(false);
            // Clear any pending timeout
            if (loaderTimeoutRef.current) {
                clearTimeout(loaderTimeoutRef.current);
                loaderTimeoutRef.current = null;
            }
        }
    };

    // Fetch more articles for specific category (infinite scroll)
    const fetchMoreArticles = useCallback(async (category) => {
        if (loadingMore || !hasMoreByCategory[category]) return;
        
        setLoadingMore(true);
        const currentPage = categoryPages[category];
        const nextPage = currentPage + 1;
        const limit = 10; // Load 10 articles per pagination

        try {
            if (category === 'Explore') {
                // For Explore, load from all categories (no article_group filter)
                const endpoint = `articles/home?page=${nextPage}&limit=${limit}`;
                const response = await SikiyaAPI.get(endpoint);
                
                if (response.data.length > 0) {
                    // Add new articles to existing ones, filtering out duplicates and headline articles
                    const newArticles = response.data.filter(a => 
                        !headlineArticleIds.current.has(a._id)
                    );
                    
                    setArticlesByCategory(prev => {
                        const currentArticles = prev[category] || [];
                        const existingIds = new Set(currentArticles.map(a => a._id));
                        const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a._id));
                        return {
                            ...prev,
                            [category]: [...currentArticles, ...uniqueNewArticles]
                        };
                    });
                    
                    // Update page number for this category
                    setCategoryPages(prev => ({
                        ...prev,
                        [category]: nextPage
                    }));

                    // Check if there are more articles
                    if (response.data.length < limit) {
                        setHasMoreByCategory(prev => ({
                            ...prev,
                            [category]: false
                        }));
                    }
                } else {
                    setHasMoreByCategory(prev => ({
                        ...prev,
                        [category]: false
                    }));
                }
            } else {
                // For specific categories, only load articles with that article_group
                const endpoint = `articles/home?article_group=${category}&page=${nextPage}&limit=${limit}`;
                const response = await SikiyaAPI.get(endpoint);
                
                if (response.data.length > 0) {
                    // Add new articles to existing ones, filtering out duplicates and headline articles
                    const newArticles = response.data.filter(a => 
                        !headlineArticleIds.current.has(a._id)
                    );
                    
                    setArticlesByCategory(prev => {
                        const currentArticles = prev[category] || [];
                        const existingIds = new Set(currentArticles.map(a => a._id));
                        const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a._id));
                        return {
                            ...prev,
                            [category]: [...currentArticles, ...uniqueNewArticles]
                        };
                    });
                    
                    // Update page number for this category
                    setCategoryPages(prev => ({
                        ...prev,
                        [category]: nextPage
                    }));

                    // Check if there are more articles
                    if (response.data.length < limit) {
                        setHasMoreByCategory(prev => ({
                            ...prev,
                            [category]: false
                        }));
                    }
                } else {
                    setHasMoreByCategory(prev => ({
                        ...prev,
                        [category]: false
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching more articles:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMoreByCategory, categoryPages]);

    //------------------------------------------

    // Animated wrapper must fit flash carousel (overflow: hidden). Sync with Highlights: chrome + optional page dots row (~18px when 2+ items).
    // Chrome: stories marginTop(2) + flash marginTop(4) + flash marginBottom(0) + page dots + stories paddingBottom(8).
    const highlightsSectionHeight = Math.ceil(14 + height * 0.35 + 12 + 12);
    const HomeHeaderHeight = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [highlightsSectionHeight, 0],
        extrapolate: 'clamp',
    });

    // Categories with translation keys
    const categories = [
        { key: 'Explore', name: 'explore', icon: 'compass', color: MainSecondaryBlueColor },
        { key: 'Politics', name: 'politics', icon: 'flag', color: '#CB0E01' },
        { key: 'Economy', name: 'economy', icon: 'trending-up', color: '#51783F' },
        { key: 'Social', name: 'social', icon: 'people', color: '#7C3AED' },
        { key: 'Tech', name: 'tech', icon: 'hardware-chip', color: '#2563EB' },
        { key: 'Business', name: 'business', icon: 'briefcase', color: '#562C2C' },
        { key: 'Sports', name: 'sports', icon: 'football', color: '#C24A0A' },
        { key: 'Culture', name: 'culture', icon: 'library', color: '#57755F' },
        { key: 'Africa', name: 'africa', icon: 'earth-outline', color: MainBrownSecondaryColor },
        { key: 'World', name: 'world', icon: 'globe', color: '#1A7474' },
    ];

    const handleCategoryPress = async (categoryKey) => {
        if (categoryKey === selectedCategory) return; // Prevent re-fetching same category
        
        // Clear any existing timeout
        if (loaderTimeoutRef.current) {
            clearTimeout(loaderTimeoutRef.current);
        }
        
        // IMPORTANT: Never set loading=true when switching categories
        // This prevents the full-screen loader from appearing and hiding the logo
        
        // For Explore, just switch - no filtering needed
        if (categoryKey === 'Explore') {
            setSelectedCategory(categoryKey);
            setFilteringCategory(false);
            setLoading(false); // Ensure loading is false
            return;
        }
        
        // For other categories, filter from Explore cache (client-side filtering)
        const exploreArticles = articlesByCategory['Explore'] || [];
        
        // Check if we have Explore articles to filter from
        if (exploreArticles.length > 0) {
            // Show filtering state (only in bottom half)
            setFilteringCategory(true);
            
            // Filter articles by category from Explore cache
            const filteredArticles = exploreArticles.filter(article => 
                article.article_group === categoryKey
            );
            
            // Update category immediately with filtered articles
            setSelectedCategory(categoryKey);
            
            // Update cache for this category with filtered articles
            setArticlesByCategory(prev => ({
                ...prev,
                [categoryKey]: filteredArticles
            }));
            
            // Reset pagination for this category
            setCategoryPages(prev => ({
                ...prev,
                [categoryKey]: 1
            }));
            
            // If we have filtered articles, allow pagination
            // If no filtered articles, still allow pagination to fetch from API
            setHasMoreByCategory(prev => ({
                ...prev,
                [categoryKey]: true // Always true initially, will be updated by pagination
            }));
            
            // Ensure loading is false (never show full-screen loader)
            setLoading(false);
            setShowLoader(false);
            
            // Hide filtering state after a short delay for smooth transition
            setTimeout(() => {
                setFilteringCategory(false);
            }, 200);
            
            // IMPORTANT: Always fetch page 1 from API in background to get full list
            // This ensures pagination works correctly (we need the full API list, not just filtered cache)
            // Fetch from API in background to populate the full category list
            fetchTopHeadlines(categoryKey, false).then(() => {
                // After fetching, update hasMore based on actual API results
                const apiArticles = articlesByCategory[categoryKey] || [];
                if (apiArticles.length < 10) {
                    setHasMoreByCategory(prev => ({
                        ...prev,
                        [categoryKey]: false
                    }));
                }
            }).catch(err => {
                console.error('Error fetching category articles:', err);
            });
        } else {
            // No Explore articles yet, fetch from API
            // But don't show full-screen loader - keep the screen visible
            setSelectedCategory(categoryKey);
            setLoading(false); // Don't set loading=true - this would hide the screen
            setFilteringCategory(true); // Show bottom loader instead
            
            // Fetch articles for the selected category
            await fetchTopHeadlines(categoryKey, false);
        }
    };

    const refreshArticlesScreen = async () => {
        setRefreshing(true);
        try {
            const limit = 10; // Initial load is 10 articles
            
            if (selectedCategory === 'Explore') {
                // Refresh Explore - fetch all articles
                const endpoint = `articles/home?page=1&limit=${limit}`;
                const response = await SikiyaAPI.get(endpoint);
                
                // Filter out headline articles
                const filteredArticles = response.data.filter(article => 
                    !headlineArticleIds.current.has(article._id)
                );
                
                // Update articles cache for Explore
                setArticlesByCategory(prev => ({
                    ...prev,
                    'Explore': filteredArticles
                }));
                
                // Reset pagination
                setCategoryPages(prev => ({
                    ...prev,
                    'Explore': 1
                }));
                
                // Reset hasMore
                const hasMore = filteredArticles.length >= limit;
                setHasMoreByCategory(prev => ({
                    ...prev,
                    'Explore': hasMore
                }));
            } else {
                // For specific categories, refresh from API
                const endpoint = `articles/home?article_group=${selectedCategory}&page=1&limit=${limit}`;
                const response = await SikiyaAPI.get(endpoint);
                
                // Filter out headline articles
                const filteredArticles = response.data.filter(article => 
                    !headlineArticleIds.current.has(article._id)
                );
                
                // Update articles cache for this category
                setArticlesByCategory(prev => ({
                    ...prev,
                    [selectedCategory]: filteredArticles
                }));
                
                // Reset pagination
                setCategoryPages(prev => ({
                    ...prev,
                    [selectedCategory]: 1
                }));
                
                // Reset hasMore
                const hasMore = filteredArticles.length >= limit;
                setHasMoreByCategory(prev => ({
                    ...prev,
                    [selectedCategory]: hasMore
                }));
            }
        } catch (error) {
            console.error('Error fetching top headlines:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Get articles for selected category (excluding headline articles)
    const getCategoryArticles = useCallback(() => {
        // Get articles from cache for the selected category
        const categoryArticles = articlesByCategory[selectedCategory] || [];
        
        // Exclude articles that are in headlines
        return categoryArticles.filter(article => {
            return !headlineArticleIds.current.has(article._id);
        });
    }, [articlesByCategory, selectedCategory]);

    // Handle infinite scroll
    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMoreByCategory[selectedCategory] && !loading) {
            fetchMoreArticles(selectedCategory);
        }
    }, [loadingMore, hasMoreByCategory, selectedCategory, loading, fetchMoreArticles]);

    // Render article item
    const renderArticleItem = useCallback(({ item }) => (
        <NewsCartv2 article={item} />
    ), []);

    // Render list footer (loading indicator for infinite scroll)
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={MainSecondaryBlueColor} />
            </View>
        );
    };

    // Render empty state
    const renderEmptyState = () => {
        // Don't show empty state if we're filtering (show loader instead)
        if (filteringCategory) return null;
        
        // Show empty state if no articles and not loading
        const currentArticles = getCategoryArticles();
        if (currentArticles.length === 0 && !loading && !loadingMore) {
            // Get the category label for display
            const category = categories.find(c => c.key === selectedCategory);
            const categoryLabel = category 
                ? (category.key === 'Explore' 
                    ? t(`navigation.${category.name}`)
                    : t(`articleCategories.${category.name}`))
                : selectedCategory;
            
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="newspaper-outline" size={64} color={PrimBtnColor} style={{ opacity: 0.35 }} />
                    <Text style={styles.emptyText}>{t('article.noArticles')}</Text>
                    <Text style={styles.emptySubtext}>
                        {t('categories.noArticlesInCategory', { category: categoryLabel })}
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    // Render list header (section label + category chips; highlights & banner rendered outside FlatList)
    const renderListHeader = useCallback(() => (
        <>
            <View style={styles.listSectionHeaderRow}>
                <View style={styles.listSectionAccent} />
                <Text style={styles.listSectionTitle}>{t('homeFeed.latestStories')}</Text>
            </View>
            <View style={styles.categoriesScrollWrap}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((cat, index) => {
                        const isSelected = selectedCategory === cat.key;
                        const isExplore = cat.key === 'Explore';
                        const categoryLabel = isExplore 
                            ? t(`navigation.${cat.name}`)
                            : t(`articleCategories.${cat.name}`);
                        const selectedBg = isExplore ? MainSecondaryBlueColor : cat.color;
                        
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.categoryButton}
                                onPress={() => handleCategoryPress(cat.key)}
                                activeOpacity={generalActiveOpacity}
                                accessibilityRole="button"
                                accessibilityLabel={`${categoryLabel} ${t('categories.category')}`}
                                accessibilityState={{ selected: isSelected }}
                                accessibilityHint={`${t('categories.filterBy')} ${categoryLabel}`}
                            >
                                <View style={[
                                    styles.categoryIconContainer,
                                    isSelected ? { backgroundColor: selectedBg } : styles.categoryChipInactive,
                                ]}>
                                    <Ionicons 
                                        name={cat.icon} 
                                        size={20} 
                                        color={isSelected ? '#fff' : cat.color} 
                                    />
                                    <Text 
                                        style={[
                                            styles.categoryText,
                                            isSelected ? styles.categoryTextSelected : styles.categoryTextIdle,
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {categoryLabel}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            
            {filteringCategory && (
                <View style={styles.filteringLoader}>
                    <BigLoaderAnim />
                </View>
            )}
        </>
    ), [selectedCategory, categories, handleCategoryPress, filteringCategory, t]);

    // Get current category info for sticky bar
    const currentCategory = useMemo(() => 
        categories.find(c => c.key === selectedCategory),
        [selectedCategory]
    );

    const currentCategoryLabel = useMemo(() => {
        if (!currentCategory) return '';
        return currentCategory.key === 'Explore' 
            ? t(`navigation.${currentCategory.name}`)
            : t(`articleCategories.${currentCategory.name}`);
    }, [currentCategory, t]);

    return (
        <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <StaticLogo 
                onNotificationPress={handleNotificationPress} 
                unreadCount={unreadNotificationCount}
            />
            <BannerAdComponent position="top" />

            <StableHighlightsWrapper 
                preloadedHeadlines={stablePreloadedHeadlines.current} 
                headerHeight={HomeHeaderHeight}
            />
            
            {/* Minimal scroll context: accent + label (chips below remain the primary control) */}
            <View
                style={styles.stickyCategory}
                accessibilityRole="text"
                accessibilityLabel={t('homeFeed.stickyContext', { category: currentCategoryLabel })}
            >
                <View
                    style={[
                        styles.stickyLeftRule,
                        { backgroundColor: currentCategory?.color || MainSecondaryBlueColor },
                    ]}
                />
                <Text
                    style={[
                        styles.stickyContextTextLarge,
                        { color: currentCategory?.color || MainSecondaryBlueColor },
                    ]}
                    numberOfLines={1}
                >
                    {t('homeFeed.stickyContext', { category: currentCategoryLabel })}
                </Text>
            </View>
            
            <Animated.FlatList
                data={getCategoryArticles()}
                renderItem={renderArticleItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                style={styles.homeArticleList}
                contentContainerStyle={styles.homeListContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={10}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={refreshArticlesScreen}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    logoStaticContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: homeScreenPadding,
        marginTop: 4,
        marginBottom: 4,
        paddingVertical: 0,
    },
    notificationPlaceholder: {
        width: 40, // Same width as notification button for centering
    },
    logoStatic: {
        width: 160,
        height: 50,
        resizeMode: 'contain',
        opacity: 0.9,
        position: 'absolute',
        left: '50%',
        marginLeft: -80, // Half of width (160/2) to center
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: AppScreenBackgroundColor,
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: articleTitleFont,
    },
    homeArticleList: {
        backgroundColor: homeFeedBackgroundColor,
    },
    homeListContent: {
        paddingBottom: homeScreenPadding + 4,
        flexGrow: 1,
    },
    listSectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: homeScreenPadding,
        paddingTop: 6,
        paddingBottom: 4,
        gap: 10,
    },
    listSectionAccent: {
        width: 3,
        height: 18,
        borderRadius: 2,
        backgroundColor: PrimBtnColor,
    },
    listSectionTitle: {
        fontSize: 12,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: mainTitleColor,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    categoriesScrollWrap: {
        marginTop: 4,
    },
    categoriesContainer: {
        paddingHorizontal: homeScreenPadding,
        paddingVertical: homeCardVerticalGap,
        gap: homeCardVerticalGap + 4,
    },
    categoryButton: {
        marginRight: homeCardVerticalGap,
    },
    categoryIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: homeChipBorderRadius,
        gap: 8,
        minWidth: 104,
    },
    categoryChipInactive: {
        backgroundColor: '#FDFCFA',
        borderWidth: 1,
        borderColor: 'rgba(122, 122, 122, 0.32)',
    },
    categoryText: {
        fontSize: 13,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        maxWidth: 120,
    },
    categoryTextIdle: {
        color: generalTextColor,
        letterSpacing: 0.15,
    },
    categoryTextSelected: {
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    loadMoreContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    loadMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        fontFamily: generalTextFont,
    },
    noMoreContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    noMoreText: {
        fontSize: 13,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
        opacity: 0.7,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        paddingVertical: homeSectionGap + 8,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: homeScreenPadding + 4,
        backgroundColor: homeFeedBackgroundColor,
    },
    emptyText: {
        fontSize: 18,
        color: mainTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        marginTop: homeSectionGap,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '400',
        marginTop: homeCardVerticalGap,
        textAlign: 'center',
        opacity: 0.65,
    },
    filteringLoader: {
        paddingVertical: homeSectionGap + 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: homeFeedBackgroundColor,
    },
    stickyCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: homeFeedBackgroundColor,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(44, 36, 22, 0.08)',
        paddingHorizontal: homeScreenPadding,
        paddingVertical: 8,
        gap: 12,
    },
    stickyLeftRule: {
        width: 4,
        alignSelf: 'stretch',
        minHeight: 18,
        borderRadius: 2,
    },
    stickyContextTextLarge: {
        flex: 1,
        fontSize: 15,
        fontFamily: generalTitleFont,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});

export default HomeScreen;