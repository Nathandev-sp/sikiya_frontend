import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, useWindowDimensions, ActivityIndicator, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NewsCategory from '../Components/NewsCategory';
import HighLight from '../Components/Highlights';
import AppScreenBackgroundColor, { generalActiveOpacity, generalTextColor, generalTextFont, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor } from '../styles/GeneralAppStyle';
import NewsAPI from '../../API/NewsAPI';
import SikiyaAPI from '../../API/SikiyaAPI';
import VerticalSpacer from '../Components/UI/VerticalSpacer';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import NewsCartv2 from '../Components/NewsCartv2';
import sleep from '../Helpers/Sleep';
import BannerAdComponent from '../Components/Ads/BannerAd';

// Create a completely stable Highlights wrapper component outside HomeScreen
// This ensures it's never recreated and never rerenders
const StableHighlightsWrapper = React.memo(({ preloadedHeadlines, headerHeight }) => {
    return (
        <Animated.View style={{ height: headerHeight }}>
            <HighLight preloadedHeadlines={preloadedHeadlines} />
        </Animated.View>
    );
}, () => true); // Always return true = never rerender

StableHighlightsWrapper.displayName = 'StableHighlightsWrapper';

const HomeScreen = ({route}) => {

    // Import the preloaded data
    const preloadedHomeArticles = route?.params?.preloadedHomeArticles;
    const preloadedHeadlines = route?.params?.preloadedHeadlines;

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
        'World': true,
    });
    const scrollY = useRef(new Animated.Value(0)).current;

    //scrollview snap interval
    const {width, height} = useWindowDimensions();
    const snapsize = height * 0.22 + 30;

    useEffect(() => {
        // Only fetch if we do not have preloaded articles
        if (!preloadedHomeArticles) {
            fetchTopHeadlines('Explore', true);
        }
        
        // Cleanup timeout on unmount
        return () => {
            if (loaderTimeoutRef.current) {
                clearTimeout(loaderTimeoutRef.current);
            }
        };
    }, [preloadedHomeArticles]);

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

    const HomeHeaderHeight = scrollY.interpolate({
        inputRange: [20, 200],
        outputRange: [320, 0],
        extrapolate: 'clamp',
    });

    const categories = [
        { name: 'Explore', icon: 'compass', color: MainSecondaryBlueColor },
        { name: 'Politics', icon: 'flag', color: '#FE5F55' },
        { name: 'Economy', icon: 'trending-up', color: '#7FB069' },
        { name: 'Social', icon: 'people', color: '#7C3AED' },
        { name: 'Tech', icon: 'hardware-chip', color: '#2563EB' },
        { name: 'Business', icon: 'briefcase', color: '#562C2C' },
        { name: 'Sports', icon: 'football', color: '#EA580C' },
        { name: 'Culture', icon: 'library', color: '#F4D35E' },
        { name: 'World', icon: 'globe', color: '#28AFB0' },
    ];

    const handleCategoryPress = async (categoryName) => {
        if (categoryName === selectedCategory) return; // Prevent re-fetching same category
        
        // Clear any existing timeout
        if (loaderTimeoutRef.current) {
            clearTimeout(loaderTimeoutRef.current);
        }
        
        // IMPORTANT: Never set loading=true when switching categories
        // This prevents the full-screen loader from appearing and hiding the logo
        
        // For Explore, just switch - no filtering needed
        if (categoryName === 'Explore') {
            setSelectedCategory(categoryName);
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
                article.article_group === categoryName
            );
            
            // Update category immediately with filtered articles
            setSelectedCategory(categoryName);
            
            // Update cache for this category with filtered articles
            setArticlesByCategory(prev => ({
                ...prev,
                [categoryName]: filteredArticles
            }));
            
            // Reset pagination for this category
            setCategoryPages(prev => ({
                ...prev,
                [categoryName]: 1
            }));
            
            // If we have filtered articles, allow pagination
            // If no filtered articles, still allow pagination to fetch from API
            setHasMoreByCategory(prev => ({
                ...prev,
                [categoryName]: true // Always true initially, will be updated by pagination
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
            fetchTopHeadlines(categoryName, false).then(() => {
                // After fetching, update hasMore based on actual API results
                const apiArticles = articlesByCategory[categoryName] || [];
                if (apiArticles.length < 10) {
                    setHasMoreByCategory(prev => ({
                        ...prev,
                        [categoryName]: false
                    }));
                }
            }).catch(err => {
                console.error('Error fetching category articles:', err);
            });
        } else {
            // No Explore articles yet, fetch from API
            // But don't show full-screen loader - keep the screen visible
            setSelectedCategory(categoryName);
            setLoading(false); // Don't set loading=true - this would hide the screen
            setFilteringCategory(true); // Show bottom loader instead
            
            // Fetch articles for the selected category
            await fetchTopHeadlines(categoryName, false);
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
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="newspaper-outline" size={64} color={generalTextColor} style={{ opacity: 0.3 }} />
                    <Text style={styles.emptyText}>No articles found</Text>
                    <Text style={styles.emptySubtext}>
                        {`No ${selectedCategory} articles available at the moment`}
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    // Render list header (categories only; highlights & banner rendered outside FlatList)
    const renderListHeader = useCallback(() => (
        <>
            {/* Category Selection Buttons */}
            <View style={{ marginTop: 16 }}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === cat.name && styles.selectedCategoryButton
                            ]}
                            onPress={() => handleCategoryPress(cat.name)}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={[
                                styles.categoryIconContainer,main_Style.genButtonElevation,
                                selectedCategory === cat.name && styles.selectedCategoryIconContainer,
                                selectedCategory === cat.name && { 
                                    backgroundColor: cat.color
                                }
                            ]}>
                            <Ionicons 
                                name={cat.icon} 
                                size={26} 
                                color={selectedCategory === cat.name ? '#fff' : cat.color} 
                            />
                            </View>
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat.name && [styles.selectedCategoryText, { color: cat.color }]
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            
            {/* Filtering loader - only shows in bottom half */}
            {filteringCategory && (
                <View style={styles.filteringLoader}>
                    <ActivityIndicator size="small" color={MainSecondaryBlueColor} />
                </View>
            )}
        </>
    ), [selectedCategory, categories, handleCategoryPress, filteringCategory]);

    // Show BigLoaderAnim ONLY during initial app load (first time, no preloaded data)
    // NEVER show full screen loader when switching categories - always show the screen with empty state if needed
    const isInitialLoad = loading && !preloadedHomeArticles && articlesByCategory['Explore'].length === 0;
    
    if (isInitialLoad) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.loadingContainer]} edges={['top', 'left', 'right']}>
                <BigLoaderAnim />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            {/* Highlights at top, completely stable and not tied to category changes */}
            <StableHighlightsWrapper 
                preloadedHeadlines={stablePreloadedHeadlines.current} 
                headerHeight={HomeHeaderHeight}
            />
            {/* Banner directly under the logo/flash news */}
            <BannerAdComponent position="top" />
            {refreshing && <MediumLoadingState />}
            <Animated.FlatList
                data={getCategoryArticles()}
                renderItem={renderArticleItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
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
    categoriesContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: 12,
    },
    categoryButton: {
        width: 90,
        alignItems: 'center',
        marginHorizontal: 0,
        paddingVertical: 8,
        paddingHorizontal: 4,
       
    },
    selectedCategoryButton: {
        backgroundColor: 'transparent',
    },
    categoryIconContainer: {
        width: 64,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        backgroundColor: secCardBackgroundColor,
    },
    selectedCategoryIconContainer: {
        opacity: 1,
    },
    categoryText: {
        fontSize: 12,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedCategoryText: {
        fontWeight: '600',
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
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '400',
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.6,
    },
    filteringLoader: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HomeScreen;