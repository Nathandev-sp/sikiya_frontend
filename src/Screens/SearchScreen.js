import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Keyboard, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { 
    main_Style, 
    secCardBackgroundColor, 
    generalTextColor, 
    generalTextFont, 
    generalTextSize,
    generalTextFontWeight,
    generalLineHeight,
    lightBannerBackgroundColor, 
    MainSecondaryBlueColor, 
    MainBrownSecondaryColor,
    genBtnBackgroundColor,
    withdrawnTitleColor,
    generalActiveOpacity
} from '../styles/GeneralAppStyle';
import { mainBrownColor } from '../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import ToggleBlock from '../../NavComponents/ToggleBlock';
import PeopleDisplay from '../Components/PeopleDisplay';
import SecondaryNewsCart from '../Components/SecondaryNewscart';
import SikiyaAPI from '../../API/SikiyaAPI';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';

const SearchScreenHello = ({ preloadedSearchJournalist, preloadedSearchArticles }) => {
    const insets = useSafeAreaInsets();
    const searchInputRef = useRef(null);
    const [selected, setSelected] = useState('People');
    const [peopleArray, setPeopleArray] = useState([]);
    const [articlesArray, setArticlesArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState({ People: 1, Articles: 1 });
    const [hasMore, setHasMore] = useState({ People: true, Articles: true });

    // Function to check if current user follows a specific user
    const checkFollowStatus = async (userId) => {
        try {
            const response = await SikiyaAPI.get(`/follow/check/${userId}`);
            return response.data.isFollowing || false;
        } catch (err) {
            console.log('Error checking follow status:', err);
            return false;
        }
    };

    // Function to fetch random journalists
    const fetchRandomJournalists = async (page = 1, append = false) => {
        if (!append) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);
        try {
            let response;
            if (!preloadedSearchJournalist && page === 1) {
                response = await SikiyaAPI.get(`/journalists/random?page=${page}&limit=10`);
            } else if (preloadedSearchJournalist && page === 1) {
                // Use preloaded data structure
                const preloadedData = Array.isArray(preloadedSearchJournalist) 
                    ? { journalists: preloadedSearchJournalist, pagination: { currentPage: 1, totalPages: 1, totalJournalists: preloadedSearchJournalist.length, limit: 10 } }
                    : preloadedSearchJournalist;
                response = { data: preloadedData };
            } else {
                response = await SikiyaAPI.get(`/journalists/random?page=${page}&limit=10`);
            }
            
            const data = response.data;
            const journalists = data.journalists || data || [];
            
            // Check follow status for each journalist (they should already be filtered, but double-check)
            const journalistsWithFollowStatus = await Promise.all(journalists.map(async (journalist) => {
                const userId = journalist._id;
                if (!userId) return { ...journalist, isFollowing: false, role: 'journalist' };
                
                const isFollowing = await checkFollowStatus(userId);
                return {
                    ...journalist,
                    isFollowing: isFollowing,
                    role: 'journalist'
                };
            }));
            
            if (append) {
                setPeopleArray(prev => [...prev, ...journalistsWithFollowStatus]);
            } else {
                setPeopleArray(journalistsWithFollowStatus);
            }
            
            // Update pagination state
            if (data.pagination) {
                setCurrentPage(prev => ({ ...prev, People: data.pagination.currentPage }));
                setHasMore(prev => ({ ...prev, People: data.pagination.currentPage < data.pagination.totalPages }));
            }
        } catch (err) {
            console.error('Error fetching journalists:', err);
            if (!append) {
                setError('Failed to load journalists');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Function to fetch random articles
    const fetchRandomArticles = async (page = 1, append = false) => {
        if (!append) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);
        try {
            let response;
            if (!preloadedSearchArticles && page === 1) {
                response = await SikiyaAPI.get(`/article/search?page=${page}&limit=10`);
            } else if (preloadedSearchArticles && page === 1) {
                // Use preloaded data structure
                const preloadedData = Array.isArray(preloadedSearchArticles)
                    ? { articles: preloadedSearchArticles, pagination: { currentPage: 1, totalPages: 1, totalArticles: preloadedSearchArticles.length, limit: 10 } }
                    : preloadedSearchArticles;
                response = { data: preloadedData };
            } else {
                response = await SikiyaAPI.get(`/article/search?page=${page}&limit=10`);
            }
            
            const data = response.data;
            const articles = data.articles || data || [];
            
            if (append) {
                setArticlesArray(prev => [...prev, ...articles]);
            } else {
                setArticlesArray(articles);
            }
            
            // Update pagination state
            if (data.pagination) {
                setCurrentPage(prev => ({ ...prev, Articles: data.pagination.currentPage }));
                setHasMore(prev => ({ ...prev, Articles: data.pagination.currentPage < data.pagination.totalPages }));
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
            if (!append) {
                setError('Failed to load articles');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Function to search articles
    const searchArticles = async (query, page = 1, append = false) => {
        if (!append) {
            setIsSearching(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);
        try {
            const response = await SikiyaAPI.get(`/article/search/query?q=${encodeURIComponent(query)}&page=${page}&limit=10`);
            const data = response.data;
            const articles = data.articles || data || [];
            
            if (append) {
                setArticlesArray(prev => [...prev, ...articles]);
            } else {
                setArticlesArray(articles);
                setHasSearched(true);
            }
            
            // Update pagination state
            if (data.pagination) {
                setCurrentPage(prev => ({ ...prev, Articles: data.pagination.currentPage }));
                setHasMore(prev => ({ ...prev, Articles: data.pagination.currentPage < data.pagination.totalPages }));
            }
        } catch (err) {
            console.error('Error searching articles:', err);
            if (!append) {
                setError('Failed to search articles');
                setArticlesArray([]);
            }
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    };

    // Function to search journalists
    const searchJournalists = async (query, page = 1, append = false) => {
        if (!append) {
            setIsSearching(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);
        try {
            const response = await SikiyaAPI.get(`/journalists/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`);
            const data = response.data;
            const journalists = data.journalists || data || [];
            
            // Check follow status for each journalist (they should already be filtered, but double-check)
            const journalistsWithFollowStatus = await Promise.all(journalists.map(async (journalist) => {
                const userId = journalist._id;
                if (!userId) return { ...journalist, isFollowing: false, role: 'journalist' };
                
                const isFollowing = await checkFollowStatus(userId);
                return {
                    ...journalist,
                    isFollowing: isFollowing,
                    role: 'journalist'
                };
            }));
            
            if (append) {
                setPeopleArray(prev => [...prev, ...journalistsWithFollowStatus]);
            } else {
                setPeopleArray(journalistsWithFollowStatus);
                setHasSearched(true);
            }
            
            // Update pagination state
            if (data.pagination) {
                setCurrentPage(prev => ({ ...prev, People: data.pagination.currentPage }));
                setHasMore(prev => ({ ...prev, People: data.pagination.currentPage < data.pagination.totalPages }));
            }
        } catch (err) {
            console.error('Error searching journalists:', err);
            if (!append) {
                setError('Failed to search journalists');
                setPeopleArray([]);
            }
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    };

    // Function to handle search button press
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            return;
        }
        
        // Dismiss keyboard after search
        Keyboard.dismiss();
        
        // Reset pagination
        setCurrentPage(prev => ({ ...prev, [selected]: 1 }));
        setHasMore(prev => ({ ...prev, [selected]: true }));
        
        if (selected === 'People') {
            searchJournalists(searchQuery.trim(), 1, false);
        } else if (selected === 'Articles') {
            searchArticles(searchQuery.trim(), 1, false);
        }
    };
    
    // Load more function
    const loadMore = () => {
        if (loadingMore || !hasMore[selected]) return;
        
        const nextPage = currentPage[selected] + 1;
        
        if (hasSearched && searchQuery.trim()) {
            // Load more search results
            if (selected === 'People') {
                searchJournalists(searchQuery.trim(), nextPage, true);
            } else if (selected === 'Articles') {
                searchArticles(searchQuery.trim(), nextPage, true);
            }
        } else {
            // Load more random results
            if (selected === 'People') {
                fetchRandomJournalists(nextPage, true);
            } else if (selected === 'Articles') {
                fetchRandomArticles(nextPage, true);
            }
        }
    };

    // Function to handle follow/unfollow action
    const handleFollowToggle = async (userId, currentFollowStatus) => {
        try {
            if (currentFollowStatus) {
                // Unfollow
                await SikiyaAPI.delete(`/follow/${userId}`);
            } else {
                // Follow
                await SikiyaAPI.post(`/follow/${userId}`);
            }
            
            // Update the local state
            setPeopleArray(prevArray => 
                prevArray.map(person => {
                    const personId = person._id;
                    if (personId === userId) {
                        return { ...person, isFollowing: !currentFollowStatus };
                    }
                    return person;
                })
            );
        } catch (err) {
            console.log('Error toggling follow status:', err);
            // Optionally show an error message to the user
        }
    };

    //console.log("People Array:", peopleArray);
    //console.log("Articles Array:", articlesArray);

    // Load data when component mounts or when tab is selected (only if not searching)
    useEffect(() => {
        // Only fetch random data if we haven't searched or if search query is empty
        if (!hasSearched || !searchQuery.trim()) {
            if (selected === 'People') {
                fetchRandomJournalists();
            } else if (selected === 'Articles') {
                fetchRandomArticles();
            }
            setHasSearched(false);
        }
    }, [selected]);

    // Reset search when tab changes
    useEffect(() => {
        setSearchQuery('');
        setHasSearched(false);
    }, [selected]);

    return (
        <SafeAreaView style={main_Style.safeArea} edges={['left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={[styles.searchSectionContainer, { paddingTop: insets.top }]}>
                <View style={styles.toggleBlockContainer}>
                    <ToggleBlock selected={selected} setSelected={setSelected} />
                </View>
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchRow}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                // Focus the input when container is pressed
                                if (searchInputRef.current) {
                                    searchInputRef.current.focus();
                                }
                            }}
                            style={[styles.searchInputContainer, isSearchFocused && styles.searchInputFocused]}
                        >
                            <Ionicons 
                                name="search" 
                                size={18} 
                                color={isSearchFocused ? '#2BA1E6' : withdrawnTitleColor} 
                                style={styles.searchIcon}
                            />
                            <TextInput
                                ref={searchInputRef}
                                style={styles.searchInput}
                                placeholder="Search here..."
                                placeholderTextColor={withdrawnTitleColor}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                                onFocus={() => {
                                    setIsSearchFocused(true);
                                }}
                                onBlur={() => {
                                    setIsSearchFocused(false);
                                }}
                                blurOnSubmit={false}
                                autoCorrect={false}
                                autoCapitalize="none"
                                editable={!isSearching}
                                selectTextOnFocus={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setSearchQuery('');
                                        setHasSearched(false);
                                        // Reload random data when clearing search
                                        if (selected === 'People') {
                                            fetchRandomJournalists();
                                        } else if (selected === 'Articles') {
                                            fetchRandomArticles();
                                        }
                                    }}
                                    style={styles.clearButton}
                                    activeOpacity={generalActiveOpacity}
                                >
                                    <Ionicons name="close-circle" size={18} color={withdrawnTitleColor} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.searchButton, main_Style.genButtonElevation]}
                            activeOpacity={generalActiveOpacity}
                            onPress={handleSearch}
                            onPressIn={(e) => {
                                // Prevent the TextInput from losing focus
                                e.stopPropagation();
                            }}
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            {isSearching ? (
                                <ActivityIndicator size="small" color={AppScreenBackgroundColor} />
                            ) : (
                                <Ionicons name="search" size={20} color={AppScreenBackgroundColor} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            {(loading || isSearching) ? (
                <View style={styles.loadingContainer}>
                    <MediumLoadingState />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollViewContainer}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    onScroll={({ nativeEvent }) => {
                        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                        const paddingToBottom = 20;
                        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                            loadMore();
                        }
                    }}
                    scrollEventThrottle={400}
                >
                    {selected === 'People' ? (
                        peopleArray.length > 0 ? (
                            peopleArray.map((journalist, idx) => (
                                <PeopleDisplay 
                                    key={journalist._id || idx}
                                    journalist={journalist}
                                    onFollowToggle={handleFollowToggle}
                                />
                            ))
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>No journalists found</Text>
                            </View>
                        )
                    ) : (
                        articlesArray.length > 0 ? (
                            articlesArray.map((article, idx) => (
                                <SecondaryNewsCart 
                                    key={article._id || idx} 
                                    article={article} 
                                />
                            ))
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>No articles found</Text>
                            </View>
                        )
                    )}
                    {loadingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                            <Text style={styles.loadingMoreText}>Loading more...</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchSectionContainer: {
        //backgroundColor: '#F0EBE5',
        paddingBottom: 0,
        width: '100%',
        alignSelf: 'center',
        borderBottomWidth: 0.4,
        borderBottomColor: '#E0E0E0',
    },
    searchBarContainer: {
        paddingHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 8,
    },
    toggleBlockContainer: {
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: secCardBackgroundColor,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
       
    },
    searchInputFocused: {
        borderColor: '#2BA1E6',
        borderWidth: 1.5,
        backgroundColor: '#F0F6FA',
        shadowColor: '#2BA1E6',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        paddingVertical: 0,
        lineHeight: generalLineHeight,
    },
    searchButton: {
        width: 52,
        height: 42,
        borderRadius: 12,
        backgroundColor: MainBrownSecondaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: MainBrownSecondaryColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    scrollViewContainer: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: 4,
        paddingBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: mainBrownColor,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        fontFamily: generalTextFont,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    noResultsText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingMoreText: {
        marginTop: 8,
        fontSize: 14,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
})

export default SearchScreenHello;