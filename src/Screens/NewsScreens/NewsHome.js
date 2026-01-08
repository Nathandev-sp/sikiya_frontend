import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, useWindowDimensions, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleLineHeight, articleTextSize, articleTitleFont, bannerBackgroundColor, cardBackgroundColor, defaultButtonHitslop, genBtnBackgroundColor, generalActiveOpacity, generalLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, lightBannerBackgroundColor, main_Style, mainBrownColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import DateConverter from '../../Helpers/DateConverter';
import StarRating from '../../Components/StarRating';
import FeedbackContainer from '../../../FeedbackComponent/FeedbackContainer';
import LikeButton from '../../Components/LikeButton';
import { useNavigation } from '@react-navigation/native';
import SikiyaAPI from '../../../API/SikiyaAPI';
import CommentInputModal from '../../../FeedbackComponent/CommentInputModal';
import ArticleLoadingState from '../../Components/LoadingComps/ArticleLoading';
import BookmarkIcon from '../../Components/BookmarkIcon';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../utils/imageUrl';
import BannerAdComponent from '../../Components/Ads/BannerAd';

const createStyles = (height) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    scrollViewContainer: {
        flex: 1,
    },
    headerContainer: {
        position: 'relative',
        width: '100%',
    },
    headerImage: {
        width: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 1,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        zIndex: 15,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        overflow: 'hidden',
    },
    topBarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: AppScreenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBarRight: {
        flexDirection: 'row',
        gap: 8,
    },
    bookmarkButtonWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: AppScreenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    sliderDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    sliderDot: {
        width: 24,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 3,
    },
    sliderDotActive: {
        backgroundColor: '#fff',
        width: 32,
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        zIndex: 10,
    },
    categoryTag: {
        position: 'absolute',
        bottom: 80,
        left: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 5,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: generalTextFont,
    },
    articleTitle: {
        fontSize: 19.5,
        //fontWeight: '700',
        color: '#fff',
        fontFamily: articleTitleFont,
        lineHeight: 26,
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    locationDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 0,
        marginBottom: 8,
        width: '100%',
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTextOverlay: {
        color: '#fff',
        fontWeight: generalTextFontWeight,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        opacity: 0.8,
    },
    dateTextOverlay: {
        color: '#fff',
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        opacity: 0.8,
        fontWeight: generalTextFontWeight,
    },
    contentSection: {
        backgroundColor: AppScreenBackgroundColor,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -30,
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 20,
        minHeight: height * 0.6,
        zIndex: 2,
        position: 'relative',
    },
    sourceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sourceLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: MainSecondaryBlueColor,
        marginRight: 12,
    },
    sourceLogoText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: generalTextFont,
    },
    sourceDetails: {
        flex: 1,
    },
    sourceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    sourceName: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    authorName: {
        fontSize: generalTitleSize,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    highlightSection: {
        backgroundColor: lightBannerBackgroundColor,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: MainSecondaryBlueColor,
    },
    highlightLabel: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: MainSecondaryBlueColor,
        fontFamily: generalTitleFont,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    highlightText: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: generalLineHeight,
        textAlign: 'left',
    },
    fullContentSection: {
        //marginBottom: 20,
    },
    fullContentLabel: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 12,
    },
    articleContent: {
        fontSize: articleTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: articleLineHeight,
        textAlign: 'left',
    },
    commentsSection: {
        paddingTop: 4,
        width: '105%',
        alignSelf: 'center',
    },
    horizontalRule: {
        height: 1,
        backgroundColor: '#F0F0F0',
        width: '100%',
        marginVertical: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'red',
    },
});

const NewsHome = ({ route }) => {
    const { article: articleParam, articleId } = route.params || {};
    // Log article journalist data to debug trust score
    //console.log('Article journalist data:', article);
    const [article, setArticle] = useState(articleParam);
    const [isLoadingArticle, setIsLoadingArticle] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const flatListRef = useRef(null);
    const [refreshCommentsKey, setRefreshCommentsKey] = useState(0); // Key to force re-render of comments
    const viewTrackedRef = useRef(false); // Track if view has been recorded
    const startTimeRef = useRef(null); // Track when user started reading
    const readTimeIntervalRef = useRef(null); // Interval for tracking read time
    
    const { width, height } = useWindowDimensions();
    const styles = createStyles(height);
    const navigation = useNavigation();

    // Fetch article by ID if articleId is provided but article is not
    useEffect(() => {
        const fetchArticleById = async () => {
            if (articleId && !article) {
                setIsLoadingArticle(true);
                try {
                    const response = await SikiyaAPI.get(`/articles/${articleId}`);
                    setArticle(response.data);
                } catch (error) {
                    console.error('Error fetching article:', error);
                    // Optionally show error message or navigate back
                } finally {
                    setIsLoadingArticle(false);
                }
            }
        };

        fetchArticleById();
    }, [articleId, article]);

    // Get article_other_images directly from the article prop
    const articleOtherImages = article?.article_other_images || [];

    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const onSendComment = async (text) => {
        // Handle sending the comment
        if (!text || !article._id) return;

        try {
            setCommentLoading(true); // Set loading state to true
            
            const payload = {
                comment_article_id: article._id,
                comment_content: text,
                mainComment: true,
            };

            const response = await SikiyaAPI.post('/comment/main/new', payload);

            if (response.status === 201) {
                //console.log('Comment sent successfully:', response.data);
                setRefreshCommentsKey(prevKey => prevKey + 1); // Increment key to force re-render of comments
                setModalVisible(false);
            } else {
                console.error('Error sending comment:', response);
            }

        } catch (error) {
            console.error('Error sending comment:', error);
        } finally {
            // We don't set commentLoading to false here because FeedbackContainer will do it
            // after it's done refreshing the comments
        }
    };

    const images = article && articleOtherImages && articleOtherImages.length > 0
        ? [article.article_front_image, ...articleOtherImages]
        : [article?.article_front_image].filter(Boolean);

    const goToAuthorProfile = () => {
        // Try different possible structures for journalist ID
        let journalistId = null;
        
        if (article.journalist) {
            // Check if journalist has a nested journalist object
            if (article.journalist.journalist?._id) {
                journalistId = article.journalist.journalist._id;
            } 
            // Check if journalist has _id directly
            else if (article.journalist._id) {
                journalistId = article.journalist._id;
            }
            // Check if journalist has journalistId
            else if (article.journalist.journalistId) {
                journalistId = article.journalist.journalistId;
            }
        }
        
        if (journalistId) {
            navigation.navigate('AuthorProfile', {userId: journalistId});
            console.log('Navigating to author profile:', journalistId);
        } else {
            console.warn('Could not find journalist ID for navigation');
        }
    };

    // Track article view and reading time
    useEffect(() => {
        if (!article?._id || viewTrackedRef.current) return;

        // Track view when article loads
        const trackView = async () => {
            try {
                await SikiyaAPI.post(`/article/${article._id}/track/view`);
                viewTrackedRef.current = true;
            } catch (error) {
                console.error('Error tracking article view:', error);
            }
        };

        trackView();

        // Start tracking reading time
        startTimeRef.current = Date.now();

        // Calculate estimated reading time based on content length
        // Average reading speed: ~200 words per minute
        const wordCount = (article.article_content || '').split(/\s+/).length;
        const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200)); // At least 1 minute

        // Track read time every 30 seconds or when component unmounts
        readTimeIntervalRef.current = setInterval(async () => {
            try {
                const timeSpent = (Date.now() - startTimeRef.current) / (1000 * 60); // Convert to minutes
                if (timeSpent >= 0.5) { // Track if at least 30 seconds
                    await SikiyaAPI.post(`/article/${article._id}/track/read`, {
                        minutes_read: Math.min(timeSpent, estimatedMinutes) // Cap at estimated time
                    });
                    startTimeRef.current = Date.now(); // Reset timer
                }
            } catch (error) {
                console.error('Error tracking article read time:', error);
            }
        }, 30000); // Every 30 seconds

        // Cleanup: Track final read time on unmount
        return () => {
            if (readTimeIntervalRef.current) {
                clearInterval(readTimeIntervalRef.current);
            }
            if (startTimeRef.current) {
                const finalTimeSpent = (Date.now() - startTimeRef.current) / (1000 * 60);
                if (finalTimeSpent >= 0.5) {
                    SikiyaAPI.post(`/article/${article._id}/track/read`, {
                        minutes_read: Math.min(finalTimeSpent, estimatedMinutes)
                    }).catch(err => console.error('Error tracking final read time:', err));
                }
            }
        };
    }, [article?._id]);

    //console.log('Fetched article:', article);

    // Show loading state while fetching article
    if (isLoadingArticle) {
        return (
            <SafeAreaView style={main_Style.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={MainBrownSecondaryColor} />
                    <Text style={{ marginTop: 16, fontSize: 16, color: generalTextColor }}>
                        Loading article...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!article) {
        return (
            <SafeAreaView style={main_Style.safeArea}>
                <Text>Article not found.</Text>
            </SafeAreaView>
        );
    }

    const categoryColors = {
        'Sports': '#2563EB',
        'Politics': '#FE5F55',
        'Economy': '#7FB069',
        'Social': '#7C3AED',
        'Tech': '#2563EB',
        'Business': '#562C2C',
        'Culture': '#F4D35E',
        'World': '#28AFB0',
        'Explore': MainSecondaryBlueColor,
    };

    const categoryColor = categoryColors[article.category] || MainSecondaryBlueColor;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView
                style={styles.scrollViewContainer}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Header Section */}
                <View style={styles.headerContainer}>
                    {/* Image Carousel */}
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        keyExtractor={(_, idx) => idx.toString()}
                        horizontal
                        pagingEnabled
                        snapToInterval={width}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Image
                                style={[styles.headerImage, { width, height: height * 0.5 }]}
                                defaultSource={require('../../../assets/functionalImages/FrontImagePlaceholder.png')}
                                source={{ uri: getImageUrl(item) }}
                                resizeMode="cover"
                            />
                        )}
                        onViewableItemsChanged={onViewRef.current}
                        viewabilityConfig={viewConfigRef.current}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                    />
                    
                    {/* Dark Overlay over entire image */}
                    <View style={[styles.imageOverlay, { height: height * 0.5 }]} pointerEvents="none" />

                    {/* Top Bar with Back, Bookmark, Menu */}
                    <SafeAreaView style={styles.topBar} edges={['top']}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[styles.topBarButton, main_Style.genButtonElevation]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="arrow-back" size={24} color={MainBrownSecondaryColor} />
                        </TouchableOpacity>
                        <View style={styles.topBarRight}>
                            <View style={styles.bookmarkButtonWrapper}>
                                <BookmarkIcon articleId={article._id} savedStatus={article.saved} size={24} centered={true} />
                            </View>
                            <TouchableOpacity
                                style={styles.topBarButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="share-outline" size={24} color={generalTextColor} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Category Tag */}
                    {article.category && (
                        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
                            <Text style={styles.categoryText}>{article.category}</Text>
                        </View>
                    )}

                    {/* Title and Meta Info */}
                    <View style={styles.headerContent}>
                        <Text style={styles.articleTitle}>{article.article_title}</Text>
                        <View style={styles.locationDateRow}>
                            <View style={styles.locationInfo}>
                                <Ionicons name="location" size={14} color="#fff" />
                                <Text style={styles.locationTextOverlay}>{article.location || "Bukavu, RDC"}</Text>
                            </View>
                            <Text style={styles.dateTextOverlay}>
                                {(() => {
                                    if (!article.published_on) return '';
                                    const date = new Date(article.published_on);
                                    const day = date.getDate();
                                    const month = date.toLocaleString('en-US', { month: 'short' });
                                    return `${day} ${month}`;
                                })()}
                            </Text>
                        </View>
                        {/* Slider dots */}
                        {images.length > 1 && (
                            <View style={styles.sliderDotsContainer}>
                                {images.map((_, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.sliderDot,
                                            currentImageIndex === idx && styles.sliderDotActive
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Content Section with Rounded Top */}
                <View style={styles.contentSection}>
                    
                    {/* Source/Author Info */}
                    <View style={styles.sourceContainer}>
                        <TouchableOpacity
                            onPress={goToAuthorProfile}
                            activeOpacity={0.7}
                            style={styles.sourceInfo}
                        >
                            <Image
                                source={article.journalist?.profile_picture 
                                    ? { uri: getImageUrl(article.journalist.profile_picture)  } 
                                    : require('../../../assets/functionalImages/ProfilePic.png')}
                                style={styles.sourceLogo}
                                resizeMode="cover"
                            />
                            <View style={styles.sourceDetails}>
                                <View style={styles.sourceNameRow}>
                                    <Text style={styles.sourceName}>
                                        {(() => {
                                            if (!article.journalist) return 'Unknown Author';
                                            
                                            // Try different possible structures for displayName
                                            if (article.journalist.displayName) {
                                                return article.journalist.displayName;
                                            }
                                            
                                            // Check nested structure
                                            if (article.journalist.journalist?.displayName) {
                                                return article.journalist.journalist.displayName;
                                            }
                                            
                                            // Fallback to firstname + lastname
                                            const firstname = article.journalist.firstname || article.journalist.journalist?.firstname || '';
                                            const lastname = article.journalist.lastname || article.journalist.journalist?.lastname || '';
                                            
                                            if (firstname || lastname) {
                                                return `${firstname} ${lastname}`.trim();
                                            }
                                            
                                            return 'Unknown Author';
                                        })()}
                                    </Text>
                                </View>
                                <Text style={styles.authorName}>
                                    {article.journalist?.journalist_affiliation || 
                                     article.journalist?.affiliation || 
                                     article.journalist?.journalist?.journalist_affiliation ||
                                     article.journalist?.journalist?.affiliation ||
                                     'Sikiya'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <LikeButton articleId={article._id} initialLikes={article.number_of_likes || 0} />
                    </View>

                    {/* Article Highlight (Summary/Major Idea) */}
                    
                    <View style={styles.highlightSection}>
                        <Text style={styles.highlightLabel}>Highlights</Text>
                        <Text style={styles.highlightText}>{article.article_highlight}</Text>
                    </View>

                    {/* Full Article Content */}
                    <View style={styles.fullContentSection}>
                        <Text style={styles.fullContentLabel}>Full Article</Text>
                        <Text style={styles.articleContent}>{article.article_content}</Text>
                    </View>
                    
                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <View style={styles.horizontalRule} />
                        <FeedbackContainer 
                            articleId={article._id} 
                            refreshKey={refreshCommentsKey} 
                            commentLoading={commentLoading} 
                            setCommentLoading={setCommentLoading}
                            onAddCommentPress={() => setModalVisible(true)}
                        />
                        <CommentInputModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            onSend={onSendComment}
                            placeholder="Write your comment..."
                            isLoading={commentLoading}
                        />
                    </View>
                </View>
            </ScrollView>
            <BannerAdComponent position="bottom" />
        </View>
    );
};

export default NewsHome;

