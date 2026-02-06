import React, {useState, useEffect, useRef, useCallback, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, FlatList, Image, ActivityIndicator, ScrollView, StatusBar, Alert, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { 
    main_Style, 
    articleTitleFont, 
    articleTitleSize,
    articleTitleFontWeight,
    articleTitleColor,
    generalTitleColor,
    generalTitleFont,
    generalTitleSize,
    generalTitleFontWeight,
    generalTextColor,
    generalTextSize,
    generalTextFont,
    generalTextFontWeight,
    generalSmallTextSize,
    withdrawnTitleColor,
    genBtnBackgroundColor,
    MainBrownSecondaryColor,
    MainSecondaryBlueColor,
    lightBannerBackgroundColor,
    generalActiveOpacity,
    generalLineHeight,
    secCardBackgroundColor
} from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import CommentInputModal from '../../FeedbackComponent/CommentInputModal';
import FeedbackContainer from '../../FeedbackComponent/FeedbackContainer';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { formatNumber } from '../utils/numberFormatter';
import { Context as AuthContext } from '../Context/AuthContext';
import { useRewardedAd } from '../Components/Ads/RewardedAd';
import RewardedAdModal from '../Components/Ads/RewardedAdModal';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import { useLanguage } from '../Context/LanguageContext';

const LiveNews = ({ preloadedVideos, route }) => {
    const { width, height } = useWindowDimensions();
    const { videoId } = route?.params || {};
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const videoPlayersRef = useRef({});
    const scrollToVideoIdRef = useRef(null); // Track if we need to scroll to a specific video
    const isScreenFocused = useIsFocused();
    const { t } = useLanguage();
    
    // Auth context for user role
    const { state } = useContext(AuthContext);
    const userRole = state?.role || 'general';
    const isGeneralUser = userRole === 'general';
    
    // Rewarded ad hook (only for general users)
    const rewardedAdUnitId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID;
    const { showRewardedAd, isLoaded: isAdLoaded } = useRewardedAd(rewardedAdUnitId);
    
    // State management
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);
    const [isLoading, setIsLoading] = useState(!preloadedVideos); // Don't show loading if we have preloaded videos
    const [error, setError] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreVideos, setHasMoreVideos] = useState(true);
    const [videoLimitReached, setVideoLimitReached] = useState(false);
    const [videoQuota, setVideoQuota] = useState(null);
    const [videoQuotaLoading, setVideoQuotaLoading] = useState(false);
    const [commentQuota, setCommentQuota] = useState(null);
    const [commentQuotaLoading, setCommentQuotaLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    
    // Ad-related state (only for general users)
    const watchedVideosRef = useRef(new Set()); // Track unique videos watched
    const [showAdModal, setShowAdModal] = useState(false);
    const [isShowingAd, setIsShowingAd] = useState(false);
    const [pendingRewardAction, setPendingRewardAction] = useState(null); // 'videos' | 'comments'
    const videosSinceLastAdRef = useRef(0); // Track videos watched since last ad
    
    // Cooldown timer for ads
    const [adCooldownSeconds, setAdCooldownSeconds] = useState(0);
    const adCooldownTimerRef = useRef(null);
    
    const iconColor = AppScreenBackgroundColor;
    
    // Preload next videos for smoother experience
    useEffect(() => {
        if (videos.length > 0 && currentVideoIndex < videos.length - 1) {
            // Preload next 2 videos
            const videosToPreload = videos.slice(currentVideoIndex + 1, currentVideoIndex + 3);
            videosToPreload.forEach(video => {
                if (video?.video_url) {
                    // Create a prefetch request to cache the video
                    fetch(video.video_url, { 
                        method: 'HEAD',
                        mode: 'no-cors'
                    }).catch(() => {
                        // Silent fail - just optimization
                    });
                }
            });
        }
    }, [currentVideoIndex, videos]);

    const rewardedModalCopy = pendingRewardAction === 'comments'
        ? {
            title: t('video.watchAdToComment'),
            message: t('video.watchAdCommentMessage'),
        }
        : {
            title: t('video.watchAdToUnlock'),
            message: t('video.watchAdMessage'),
        };

    // Get current video data
    const currentVideo = videos[currentVideoIndex];

    // Fetch videos with pagination
    const fetchVideos = useCallback(async (page = 1, append = false) => {
        try {
            if (!append) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            setError(null);
            const response = await SikiyaAPI.get(`videos/home?page=${page}&limit=20`);
            // The API returns { videos: [...], pagination: {...} }
            const newVideos = response.data.videos || [];
            
            if (append) {
                // Filter out duplicates based on _id before appending
                setVideos(prevVideos => {
                    const existingIds = new Set(prevVideos.map(v => v._id));
                    const uniqueVideos = newVideos.filter(v => v._id && !existingIds.has(v._id));
                    return [...prevVideos, ...uniqueVideos];
                });
            } else {
                setVideos(newVideos);
            }
            
            // Update pagination state
            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage);
                setHasMoreVideos(response.data.pagination.currentPage < response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            if (!append) {
                setError(t('video.failedToLoad'));
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Load more videos when user is near the end
    const loadMoreVideos = useCallback(() => {
        if (!isLoadingMore && hasMoreVideos && videos.length > 0) {
            const nextPage = currentPage + 1;
            fetchVideos(nextPage, true); // Append to existing videos
        }
    }, [isLoadingMore, hasMoreVideos, currentPage, videos.length, fetchVideos]);

    // Video quota handlers (general users)
    const fetchVideoQuota = useCallback(async () => {
        try {
            setVideoQuotaLoading(true);
            const res = await SikiyaAPI.get('/user/videos/quota');
            setVideoQuota(res.data);
        } catch (err) {
            console.error('Error fetching video quota:', err?.response?.data || err.message);
        } finally {
            setVideoQuotaLoading(false);
        }
    }, []);

    const handleVideoQuotaExceeded = useCallback((data) => {
        setVideoLimitReached(true);
        setPendingRewardAction('videos');
        if (data) setVideoQuota(data);
        fetchVideoQuota();
    }, [fetchVideoQuota]);

    const handleUnlockVideos = useCallback(() => {
        if (!isGeneralUser) return;
        
        // Check cooldown
        if (adCooldownSeconds > 0) {
            Alert.alert(
                'Almost There',
                `You’ve just unlocked free content.You can unlock more in ${adCooldownSeconds} seconds.`,
                [{ text: 'OK' }]
            );
            return;
        }
        
        handleWatchAd('videos');
    }, [handleWatchAd, isGeneralUser, adCooldownSeconds]);

    const handleUpgradeVideos = useCallback(() => {
        navigation.navigate('UserProfileGroup', {
            screen: 'SubscriptionSettings',
            params: {
                screen: 'MembershipSettings'
            }
        });
    }, [navigation]);

    // Comment quota handlers (general users)
    const fetchCommentQuota = useCallback(async () => {
        if (!isGeneralUser) return;
        try {
            setCommentQuotaLoading(true);
            const res = await SikiyaAPI.get('/user/comments/quota');
            setCommentQuota(res.data);
        } catch (err) {
            console.error('Error fetching comment quota:', err?.response?.data || err.message);
            setCommentQuota(null);
        } finally {
            setCommentQuotaLoading(false);
        }
    }, [isGeneralUser]);

    // Handle rewarded ad watch - needs to be defined before handleUnlockVideos
    const handleWatchAd = useCallback(async (actionOverride = null) => {
        const action = actionOverride || pendingRewardAction;
        console.log('🎬 handleWatchAd called with action:', action);
        if (!action) {
            console.warn('❌ No action specified for ad');
            return;
        }

        if (!isAdLoaded) {
            console.warn('❌ Ad not loaded yet');
            Alert.alert(
                t('video.adStillLoading'), 
                t('video.adLoadingMessage'),
                [{ text: t('common.ok') }]
            );
            return;
        }
        
        console.log('✅ Ad is loaded, preparing to show...');
        setIsShowingAd(true);
        if (!actionOverride) {
            setShowAdModal(false);
        }
        
        let earned = false;
        try {
            console.log('🎬 Calling showRewardedAd()...');
            earned = await showRewardedAd();
            console.log('🎬 showRewardedAd() returned, earned:', earned);
        } catch (error) {
            console.error('❌ Error showing rewarded ad:', error);
            Alert.alert('Error', 'Failed to show ad. Please try again.');
        }

        if (!earned) {
            console.log('❌ User did not earn reward (dismissed or error)');
            setIsShowingAd(false);
            if (!actionOverride) {
                setShowAdModal(true);
            }
            return;
        }
        
        console.log('✅ User earned reward!');

        try {
            if (action === 'videos') {
                setVideoQuotaLoading(true);
                await SikiyaAPI.post('/user/videos/unlock');
                await fetchVideoQuota();
                // Reset local counters and unlock the feed
                watchedVideosRef.current = new Set();
                videosSinceLastAdRef.current = 0;
                setVideoLimitReached(false);
            } else if (action === 'comments') {
                setCommentQuotaLoading(true);
                await SikiyaAPI.post('/user/comments/unlock');
                await fetchCommentQuota();
            }
            setPendingRewardAction(null);
            setShowAdModal(false);
            
            // Start cooldown timer (60 seconds)
            startAdCooldown(60);
        } catch (error) {
            console.error('Error unlocking after rewarded ad:', error?.response?.data || error.message);
            Alert.alert(t('video.unlockFailed'), error?.response?.data?.error || t('video.tryAgain'));
            if (!actionOverride) {
                setShowAdModal(true);
            }
        } finally {
            setVideoQuotaLoading(false);
            setCommentQuotaLoading(false);
            setIsShowingAd(false);
        }
    }, [isAdLoaded, showRewardedAd, pendingRewardAction, fetchVideoQuota, fetchCommentQuota]);
    
    // Start ad cooldown timer
    const startAdCooldown = useCallback((seconds) => {
        // Clear any existing timer
        if (adCooldownTimerRef.current) {
            clearInterval(adCooldownTimerRef.current);
        }
        
        setAdCooldownSeconds(seconds);
        console.log(`⏱️  Ad cooldown started: ${seconds} seconds`);
        
        adCooldownTimerRef.current = setInterval(() => {
            setAdCooldownSeconds(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                    clearInterval(adCooldownTimerRef.current);
                    adCooldownTimerRef.current = null;
                    console.log('✅ Ad cooldown finished - next ad should be ready!');
                    return 0;
                }
                return newValue;
            });
        }, 1000);
    }, []);

    const handleUnlockComment = useCallback(() => {
        if (!isGeneralUser) return;
        
        // Check cooldown
        if (adCooldownSeconds > 0) {
            Alert.alert(
                t('video.pleaseWait'),
                t('video.adCooldownMessage').replace('{{seconds}}', adCooldownSeconds),
                [{ text: t('common.ok') }]
            );
            return;
        }
        
        setPendingRewardAction('comments');
        setShowAdModal(true);
    }, [isGeneralUser, adCooldownSeconds]);

    const handleUpgradeComment = useCallback(() => {
        navigation.navigate('UserProfileGroup', {
            screen: 'SubscriptionSettings',
            params: {
                screen: 'MembershipSettings'
            }
        });
    }, [navigation]);

    // Initialize with preloaded videos
    useEffect(() => {
        if (preloadedVideos && preloadedVideos.videos) {
            setVideos(preloadedVideos.videos || []);
            // Since we preloaded 5 videos from page 1, we're still on page 1
            // Next load should be page 2 (or continue from page 1 if we want to get the remaining 15)
            // For simplicity, we'll start loading from page 2 next
            setCurrentPage(1);
            // Check if there are more videos to load
            if (preloadedVideos.pagination) {
                setHasMoreVideos(preloadedVideos.pagination.currentPage < preloadedVideos.pagination.totalPages);
            }
            setIsLoading(false);
        } else if (!preloadedVideos) {
            // If no preloaded videos, fetch first page
            fetchVideos(1, false);
        }
    }, [preloadedVideos, fetchVideos]);

    // Preload comment quota for general users
    useEffect(() => {
        if (isGeneralUser) {
            fetchCommentQuota();
        }
    }, [isGeneralUser, fetchCommentQuota]);
    
    // Cleanup when entire screen unmounts
    useEffect(() => {
        return () => {
            console.log('LiveNews component unmounting - final cleanup');
            // Pause all videos
            Object.values(videoPlayersRef.current).forEach(player => {
                if (player && typeof player.pause === 'function') {
                    try {
                        player.pause();
                    } catch (err) {
                        // Ignore errors
                    }
                }
            });
            // Clear the ref
            videoPlayersRef.current = {};
        };
    }, []);

    // Handle scrolling to specific video when videoId is provided (from notification)
    useEffect(() => {
        const scrollToVideo = async () => {
            if (!videoId || videos.length === 0 || !flatListRef.current) return;

            // First, try to find the video in the current list
            const videoIndex = videos.findIndex(v => v._id === videoId);
            
            if (videoIndex !== -1) {
                // Video is already in the list, scroll to it
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index: videoIndex, animated: true });
                    setCurrentVideoIndex(videoIndex);
                }, 500); // Small delay to ensure list is rendered
            } else {
                // Video not in list, fetch it and add to the beginning
                try {
                    const response = await SikiyaAPI.get(`/video/${videoId}`);
                    const video = response.data;
                    // Add video to the beginning of the list
                    setVideos(prev => [video, ...prev]);
                    // Scroll to index 0
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
                        setCurrentVideoIndex(0);
                    }, 500);
                } catch (error) {
                    console.error('Error fetching video:', error);
                }
            }
        };

        scrollToVideo();
    }, [videoId, videos]);

    // Handle scroll to change current video and load more when near end
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const visibleIndex = viewableItems[0].index;
            const currentVideo = videos[visibleIndex];
            
            // Don't track if modal is showing or if not a general user
            if (currentVideo && isGeneralUser && !showAdModal && !videoLimitReached) {
                const videoId = currentVideo._id;
                
                // Track unique videos watched
                if (!watchedVideosRef.current.has(videoId)) {
                    watchedVideosRef.current.add(videoId);
                    videosSinceLastAdRef.current += 1;

                    // Stop feed after 10 videos for general users
                    if (videosSinceLastAdRef.current > 10) {
                        setVideoLimitReached(true);
                        setPendingRewardAction('videos');
                        setShowAdModal(true);
                    }
                }
            }
            
            setCurrentVideoIndex(visibleIndex);
            setShowComments(false); // Close comments when switching videos
            
            // Load more videos when user is within 3 videos of the end (only if not blocked by ad)
            if (visibleIndex >= videos.length - 3 && hasMoreVideos && !isLoadingMore && !showAdModal && !videoLimitReached) {
                loadMoreVideos();
            }
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80
    }).current;

    // Handler functions
    const handleShare = async () => {
        console.log('Share button pressed');
        // Implement share functionality
    };


    const handleComments = () => {
        setShowComments(!showComments);
    };

    const openCommentModal = useCallback(() => {
        if (isGeneralUser) {
            fetchCommentQuota();
        }
        setShowComments(false); // Close comments section when opening modal
        setModalVisible(true);
    }, [fetchCommentQuota, isGeneralUser]);

    const onSendComment = async (text) => {
        if (!text || !currentVideo?._id) return;
        if (isGeneralUser && commentQuota && (commentQuota.remaining ?? 0) <= 0) {
            Alert.alert(t('video.limitReached'), t('video.commentLimitMessage'));
            return;
        }

        try {
            setCommentLoading(true);
            const payload = {
                comment_content: text,
                mainComment: true,
            };

            const response = await SikiyaAPI.post(`/video/${currentVideo._id}/comment`, payload);

            if (response.status === 201) {
                console.log('Comment sent successfully:', response.data);
                setRefreshCommentsKey(prevKey => prevKey + 1);
                setModalVisible(false);
                // Optimistically decrement quota and increment comment count on the current video
                setCommentQuota(prev => prev ? {
                    ...prev,
                    remaining: prev.remaining !== undefined ? Math.max(0, prev.remaining - 1) : prev.remaining,
                    used: prev.used !== undefined ? prev.used + 1 : prev.used,
                } : prev);
                setVideos(prev => prev.map(v => v._id === currentVideo._id
                    ? { ...v, number_of_comments: (v.number_of_comments || 0) + 1 }
                    : v
                ));
                await fetchCommentQuota();
            } else {
                console.error('Error sending comment:', response);
            }
        } catch (error) {
            console.error('Error sending comment:', error);
            if (error?.response?.status === 403) {
                Alert.alert(
                    t('video.limitReached'),
                    error?.response?.data?.error || t('video.commentLimitMessage')
                );
            }
        } finally {
            setCommentLoading(false);
        }
    };

    // Pause video when quota overlay appears
    useEffect(() => {
        if (videoLimitReached) {
            // Pause all videos when quota limit is reached
            Object.values(videoPlayersRef.current).forEach(player => {
                if (player && typeof player.pause === 'function') {
                    try {
                        player.pause();
                    } catch (err) {
                        // Silently ignore native player disposal errors
                    }
                }
            });
        }
    }, [videoLimitReached]);

    // Pause all videos when screen loses focus
    useEffect(() => {
        if (!isScreenFocused) {
            console.log('LiveNews screen unfocused - pausing videos');
            const players = Object.values(videoPlayersRef.current);
            console.log(`Attempting to pause ${players.length} videos`);
            players.forEach((player, index) => {
                if (player && typeof player.pause === 'function') {
                    try {
                        player.pause();
                        console.log(`Paused video ${index + 1}`);
                    } catch (err) {
                        console.warn(`Failed to pause video ${index + 1}:`, err.message);
                    }
                }
            });
            // Clear cooldown timer
            if (adCooldownTimerRef.current) {
                clearInterval(adCooldownTimerRef.current);
                adCooldownTimerRef.current = null;
            }
        }
    }, [isScreenFocused]);

    const handleProfile = () => {
        if (currentVideo?.journalist_id?._id) {
            navigation.navigate('AuthorProfile', { userId: currentVideo.journalist_id._id });
        }
    };

    // Render individual video item
    const renderVideoItem = ({ item, index }) => {
        const isActive = index === currentVideoIndex;
        
        return (
            <VideoItemComponent 
                item={item}
                isActive={isActive}
                width={width}
                height={height}
                iconColor={iconColor}
                showComments={showComments && isActive}
                modalVisible={modalVisible}
                refreshCommentsKey={refreshCommentsKey}
                handleComments={handleComments}
                handleShare={handleShare}
                handleProfile={handleProfile}
                onSendComment={onSendComment}
                setModalVisible={setModalVisible}
                videoPlayersRef={videoPlayersRef}
                onVideoQuotaExceeded={handleVideoQuotaExceeded}
                openCommentModal={openCommentModal}
                setVideos={setVideos}
                videoLimitReached={videoLimitReached}
                isScreenFocused={isScreenFocused}
            />
        );
    };
    
    // Handle cancel ad modal
    const handleCancelAd = () => {
        setShowAdModal(false);
    };
    
    // Disable FlatList scrolling when comments are open or ad modal is showing
    const isScrollingEnabled = !showComments && !showAdModal && !videoLimitReached;

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={withdrawnTitleColor} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            fetchVideos(1, false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t('video.retry')}
                    >
                        <Text style={styles.retryButtonText}>{t('video.retry')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return(
        <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                ref={flatListRef}
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item, index) => item._id || index.toString()}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={height}
                decelerationRate="fast"
                initialScrollIndex={0}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
                removeClippedSubviews={false}
                scrollEnabled={isScrollingEnabled}
                onEndReached={loadMoreVideos}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="videocam-off-outline" size={64} color={withdrawnTitleColor} />
                        <Text style={styles.emptyText}>{t('video.noVideosAvailable')}</Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.loadingMoreContainer}>
                            <BigLoaderAnim />
                            <Text style={styles.loadingMoreText}>{t('video.loadingMoreVideos')}</Text>
                        </View>
                    ) : null
                }
            />
            
            {/* Comment Input Modal - moved outside FlatList like NewsHome */}
            <CommentInputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSend={onSendComment}
                placeholder={t('comment.writeCommentPlaceholder')}
                mode="video"
                isLoading={commentLoading}
                quota={isGeneralUser ? commentQuota : null}
                quotaLoading={commentQuotaLoading}
                onUnlock={handleUnlockComment}
                onUpgrade={handleUpgradeComment}
                userRole={userRole}
            />
            
            {/* Rewarded Ad Modal - only for general users and only for comment unlocks */}
            {isGeneralUser && pendingRewardAction === 'comments' && (
                <RewardedAdModal
                    visible={showAdModal}
                    onWatchAd={handleWatchAd}
                    onCancel={handleCancelAd}
                    isShowingAd={isShowingAd}
                    isAdLoaded={isAdLoaded}
                    title={rewardedModalCopy.title}
                    message={rewardedModalCopy.message}
                />
            )}

            {/* Video quota overlay - hide when showing ad */}
            {videoLimitReached && !isShowingAd && (
                <View style={[styles.videoQuotaOverlayContainer, main_Style.genContentElevation]}>
                    <View style={styles.videoQuotaOverlay}>
                        <Text style={styles.quotaTitle}>{t('video.quotaReached')}</Text>
                        <Text style={styles.quotaSub}>
                            {t('video.quotaMessage')}
                        </Text>
                        <View style={styles.quotaActions}>
                            <TouchableOpacity 
                                style={[styles.quotaButton, styles.quotaPrimary, main_Style.genButtonElevation]}
                                onPress={handleUnlockVideos}
                                disabled={videoQuotaLoading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="play-outline" size={18} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                                <Text style={[styles.quotaButtonText, styles.quotaPrimaryText]}>{t('comments.watchAd')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.quotaButton, styles.quotaSecondary, main_Style.genButtonElevation]}
                                onPress={handleUpgradeVideos}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.quotaButtonText}>{t('comments.upgrade')}</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                </View>
            )}

            {/* Initial loading overlay */}
            {isLoading && videos.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <BigLoaderAnim />
                </View>
            )}
        </SafeAreaView>
    );
}

// Separate component for each video item
const VideoItemComponent = ({ 
    item, 
    isActive, 
    width, 
    height, 
    iconColor,
    showComments,
    modalVisible,
    refreshCommentsKey,
    handleComments,
    handleShare,
    handleProfile,
    onSendComment,
    setModalVisible,
    videoPlayersRef,
    onVideoQuotaExceeded,
    openCommentModal,
    setVideos: setVideosProp,
    videoLimitReached,
    isScreenFocused,
}) => {
    const resolveJournalistName = (journalist) => {
        if (!journalist) return '';
        return (
            journalist.displayName ||
            journalist.displayname ||
            journalist.display_name ||
            journalist.name ||
            journalist.username ||
            `${journalist.firstname || ''} ${journalist.lastname || ''}`.trim()
        ).trim();
    };

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item?.number_of_likes || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const viewTrackedRef = useRef(false); // Track if view has been recorded
    const watchTimeStartRef = useRef(null); // Track when video started playing
    const watchTimeIntervalRef = useRef(null); // Interval for tracking watch time
    const { t } = useLanguage();

    const videoPlayer = useVideoPlayer(
        item?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
        player => {
            player.loop = true;
            
            // Store player reference immediately
            if (item?._id && videoPlayersRef.current) {
                videoPlayersRef.current[item._id] = player;
                console.log(`Stored player reference for video ${item._id}`);
            }
            
            // Set up status listener for loading states
            player.addListener('statusChange', (status) => {
                const statusValue = status?.status || '';
                
                if (statusValue === 'loading' || statusValue === 'idle') {
                    setIsVideoLoading(true);
                    setVideoError(false);
                } else if (statusValue === 'readyToPlay') {
                    setIsVideoLoading(false);
                    setVideoError(false);
                } else if (statusValue === 'error') {
                    setIsVideoLoading(false);
                    setVideoError(true);
                }
            });
        }
    );

    useEffect(() => {
        // Only play video if it's active AND quota limit hasn't been reached AND screen is focused
        const shouldPlay = isActive && !videoLimitReached && isScreenFocused;
        
        if (shouldPlay && videoPlayer && typeof videoPlayer.play === 'function') {
            const playPromise = videoPlayer.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(err => {
                    console.error('Error playing video:', err);
                    setVideoError(true);
                    setIsVideoLoading(false);
                });
            }
            
            // Track video view when it becomes active (first time)
            if (!viewTrackedRef.current && item?._id) {
                const trackView = async () => {
                    try {
                        await SikiyaAPI.post(`/video/${item._id}/track/view`);
                        viewTrackedRef.current = true;
                    } catch (error) {
                        if (error?.response?.status === 403) {
                            onVideoQuotaExceeded && onVideoQuotaExceeded(error?.response?.data);
                        } else {
                            console.error('Error tracking video view:', error);
                        }
                    }
                };
                trackView();
            }

            // Start tracking watch time
            if (item?._id) {
                watchTimeStartRef.current = Date.now();
                
                // Track watch time every 30 seconds
                watchTimeIntervalRef.current = setInterval(async () => {
                    try {
                        if (watchTimeStartRef.current) {
                            const timeSpent = (Date.now() - watchTimeStartRef.current) / (1000 * 60 * 60); // Convert to hours
                            if (timeSpent >= 0.0083) { // Track if at least 30 seconds (0.0083 hours)
                                await SikiyaAPI.post(`/video/${item._id}/track/watch`, {
                                    hours_watched: timeSpent
                                });
                                watchTimeStartRef.current = Date.now(); // Reset timer
                            }
                        }
                    } catch (error) {
                        console.error('Error tracking video watch time:', error);
                    }
                }, 30000); // Every 30 seconds
            }
        } else {
            // Pause video if not active OR quota limit reached
            if (videoPlayer && typeof videoPlayer.pause === 'function') {
                try {
                    videoPlayer.pause();
                } catch (err) {
                    // Silently ignore native player disposal errors
                }
            }
            
            // Stop tracking watch time when video becomes inactive
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
                watchTimeIntervalRef.current = null;
            }
            
            // Track final watch time before switching videos
            if (watchTimeStartRef.current && item?._id) {
                const finalTimeSpent = (Date.now() - watchTimeStartRef.current) / (1000 * 60 * 60);
                if (finalTimeSpent >= 0.0083) { // At least 30 seconds
                    SikiyaAPI.post(`/video/${item._id}/track/watch`, {
                        hours_watched: finalTimeSpent
                    }).catch(err => console.error('Error tracking final watch time:', err));
                }
                watchTimeStartRef.current = null;
            }
        }
    }, [isActive, videoPlayer, item?._id, videoLimitReached, isScreenFocused]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const player = item?._id ? videoPlayersRef?.current?.[item._id] : null;
            if (player && typeof player.pause === 'function') {
                try {
                    player.pause();
                } catch (err) {
                    // Silently ignore native player disposal errors
                    // This is expected when React unmounts components quickly
                }
            }
            // Clean up the ref entry
            if (item?._id && videoPlayersRef?.current?.[item._id]) {
                delete videoPlayersRef.current[item._id];
            }
            
            // Track final watch time on unmount
            if (watchTimeStartRef.current && item?._id) {
                const finalTimeSpent = (Date.now() - watchTimeStartRef.current) / (1000 * 60 * 60);
                if (finalTimeSpent >= 0.0083) { // At least 30 seconds
                    SikiyaAPI.post(`/video/${item._id}/track/watch`, {
                        hours_watched: finalTimeSpent
                    }).catch(err => console.error('Error tracking final watch time on unmount:', err));
                }
            }
            
            // Clear intervals
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
            }
            
            // Reset tracking refs
            viewTrackedRef.current = false;
            watchTimeStartRef.current = null;
        };
    }, [item?._id]);

    // Check like status when component mounts and reset tracking when video changes
    useEffect(() => {
        if (item?._id) {
            checkLikeStatus();
            // Reset tracking refs when video changes
            viewTrackedRef.current = false;
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
                watchTimeIntervalRef.current = null;
            }
            watchTimeStartRef.current = null;
        }
    }, [item?._id]);

    const checkLikeStatus = async () => {
        if (!item?._id) return;
        try {
            const response = await SikiyaAPI.get(`/like/video/${item._id}/check`);
            if (response.data) {
                setLiked(response.data.isLiked || false);
                if (response.data.number_of_likes !== undefined) {
                    setLikeCount(response.data.number_of_likes);
                    // Keep parent list in sync
                    if (setVideosProp) {
                        setVideosProp(prev => prev.map(v => v._id === item._id ? { ...v, number_of_likes: response.data.number_of_likes } : v));
                    }
                }
            }
        } catch (error) {
            console.error('Error checking like status:', error);
            setLiked(false);
        }
    };

    const handleRetryVideo = useCallback(() => {
        setVideoError(false);
        setIsVideoLoading(true);
        
        // Attempt to replay
        if (videoPlayer && typeof videoPlayer.play === 'function') {
            const playPromise = videoPlayer.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(err => {
                    console.error('Retry failed:', err);
                    setVideoError(true);
                    setIsVideoLoading(false);
                });
            }
        } else {
            console.warn('Video player not ready for retry');
            setIsVideoLoading(false);
        }
    }, [videoPlayer]);

    const handleLike = async () => {
        if (isLiking || !item?._id) return;
        
        setIsLiking(true);
        const previousLiked = liked;
        const previousCount = likeCount;
        
        // Optimistic update
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        
        try {
            let response;
            if (liked) {
                // Unlike the video
                response = await SikiyaAPI.delete(`/like/video/${item._id}`);
            } else {
                // Like the video
                response = await SikiyaAPI.post(`/like/video/${item._id}`);
            }
            
            // Update state from backend response
            if (response.data) {
                setLiked(response.data.liked !== undefined ? response.data.liked : !liked);
                    if (response.data.number_of_likes !== undefined && response.data.number_of_likes !== null) {
                    setLikeCount(response.data.number_of_likes);
                        if (setVideosProp) {
                            setVideosProp(prev => prev.map(v => v._id === item._id ? { ...v, number_of_likes: response.data.number_of_likes } : v));
                        }
                } else {
                    // If count not in response, refresh status
                    checkLikeStatus();
                }
            } else {
                // If no data in response, refresh status
                checkLikeStatus();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <View style={[styles.videoContainer, { height }]}>
            <View style={[styles.videoFrame, { width: width * 0.96, height: height * 0.84 }]}>
                <VideoView 
                    style={styles.videoContent} 
                    player={videoPlayer} 
                    fullscreenOptions={{ allowsFullscreen: false }}
                    allowsPictureInPicture={false}
                    nativeControls={false}
                    contentFit="contain"
                />
                
                {/* Loading Overlay */}
                {isVideoLoading && !videoError && (
                    <View style={styles.videoLoadingOverlay}>
                        <View style={[styles.loadingContainer, main_Style.genContentElevation]}>
                            <BigLoaderAnim />
                            <Text style={styles.loadingText}>{t('video.loadingVideo')}</Text>
                        </View>
                    </View>
                )}
                
                {/* Error Overlay */}
                {videoError && (
                    <TouchableOpacity 
                        style={styles.videoErrorOverlay} 
                        onPress={handleRetryVideo}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.errorContainer, main_Style.genContentElevation]}>
                            <Ionicons name="alert-circle-outline" size={56} color={MainBrownSecondaryColor} />
                            <Text style={styles.errorTitle}>{t('video.videoLoadError')}</Text>
                            <Text style={styles.errorSubtext}>{t('video.tapToRetry')}</Text>
                            <View style={[styles.retryButton, main_Style.genButtonElevation]}>
                                <Ionicons name="refresh-outline" size={20} color={MainBrownSecondaryColor} />
                                <Text style={styles.retryButtonText}>{t('video.retry')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Bottom Info Section */}
            <View style={styles.bottomInfoSection}>
                {/* Title on the left */}
                <View style={styles.titleContainer}>
                    <Text style={styles.articleTitle} numberOfLines={3}>
                        {item?.video_title || t('video.liveNewsVideo')}
                    </Text>
                    {item?.journalist_id && (
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorName}>
                                {resolveJournalistName(item.journalist_id)}
                            </Text>
                            <View style={styles.locationDateRow}>
                                <View style={styles.locationInfo}>
                                    <Ionicons name="location" size={14} color="#fff" />
                                    <Text style={styles.locationTextOverlay}>
                                        {item.location || item.concerned_city || item.concerned_country || t('video.location')}
                                    </Text>
                                </View>
                                <Text style={styles.dateTextOverlay}>
                                    {(() => {
                                        if (!item?.published_on) return '';
                                        const date = new Date(item.published_on);
                                        const day = date.getDate();
                                        const month = date.toLocaleString('en-US', { month: 'short' });
                                        return `${day} ${month}`;
                                    })()}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
                
                {/* Vertical Action Buttons on the right */}
                <View style={styles.verticalActionButtons}>
                    {/* Like Button */}
                    <View style={styles.actionButtonGroup}>
                        <TouchableOpacity 
                            style={[styles.actionButton, main_Style.genButtonElevation]} 
                            onPress={handleLike}
                            activeOpacity={generalActiveOpacity}
                            disabled={isLiking}
                        >
                            <Ionicons 
                                name={liked ? "heart" : "heart-outline"} 
                                size={20} 
                                color={liked ? "#FF3040" : iconColor} 
                            />
                        </TouchableOpacity>
                        {likeCount > 0 && (
                            <Text style={styles.actionCount}>{formatNumber(likeCount)}</Text>
                        )}
                    </View>
                    
                    {/* Comments Button */}
                    <View style={styles.actionButtonGroup}>
                        <TouchableOpacity 
                            style={[styles.actionButton, main_Style.genButtonElevation]} 
                            onPress={handleComments}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color={iconColor} />
                        </TouchableOpacity>
                        {item?.number_of_comments > 0 && (
                            <Text style={styles.actionCount}>{formatNumber(item.number_of_comments)}</Text>
                        )}
                    </View>
                    
                    {/* Share Button */}
                    <TouchableOpacity 
                        style={[styles.actionButton, main_Style.genButtonElevation]} 
                        onPress={handleShare}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="share-social-outline" size={20} color={iconColor} />
                    </TouchableOpacity>
                    
                    {/* Profile Button */}
                    <TouchableOpacity 
                        style={[styles.actionButton, main_Style.genButtonElevation]} 
                        onPress={handleProfile}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="person-outline" size={20} color={iconColor} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comments Island Overlay */}
            {showComments && (
                <View style={[styles.commentsIsland, main_Style.genButtonElevation]}>
                    <View style={styles.commentsHeader}>
                        <View style={styles.commentsHeaderLeft}>
                            <Ionicons name="chatbox-ellipses-outline" size={20} color={MainBrownSecondaryColor} />
                            <Text style={styles.commentsCountText}>
                                {item?.number_of_comments ? formatNumber(item.number_of_comments) : '0'} {t('comments.comments')}
                            </Text>
                        </View>
                        <View style={styles.commentsHeaderRight}>
                            <TouchableOpacity 
                                onPress={openCommentModal || (() => setModalVisible(true))}
                                style={[styles.addCommentButton, main_Style.genButtonElevation]}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="chatbubbles" size={20} color={MainBrownSecondaryColor} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleComments}
                                style={styles.closeButton}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="close" size={24} color={generalTitleColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <ScrollView 
                        style={styles.commentsContent}
                        contentContainerStyle={styles.commentsContentContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        <View style = {{ paddingTop: 8}}></View>
                        <FeedbackContainer 
                            videoId={item?._id} 
                            refreshKey={refreshCommentsKey}
                            hideHeader={true}
                            totalCommentCount={item?.number_of_comments || 0}
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0908',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        backgroundColor: AppScreenBackgroundColor,
    },
    errorText: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        lineHeight: generalLineHeight,
    },
    retryButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: MainBrownSecondaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: generalTextSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 16,
        textAlign: 'center',
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoFrame: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 12,
        backgroundColor: '#000',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    videoContent: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    bottomInfoSection: {
        position: 'absolute',
        bottom: 26,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 60,
        paddingTop: 40,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 16,
        borderRadius: 16,
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    articleTitle: {
        fontSize: articleTitleSize,
        fontWeight: articleTitleFontWeight,
        color: '#FFFFFF',
        fontFamily: articleTitleFont,
        lineHeight: generalLineHeight,
        marginBottom: 8,
    },
    authorInfo: {
        marginTop: 6,
    },
    authorName: {
        fontSize: generalSmallTextSize,
        color: '#FFFFFF',
        fontFamily: generalTextFont,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        width: '100%',
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    locationTextOverlay: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: generalSmallTextSize - 1,
        fontFamily: generalTextFont,
    },
    dateTextOverlay: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        fontSize: generalSmallTextSize - 1,
        fontFamily: generalTextFont,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    verticalActionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
    },
    actionButtonGroup: {
        alignItems: 'center',
        gap: 4,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    actionCount: {
        fontSize: generalSmallTextSize - 1,
        color: '#FFFFFF',
        fontFamily: generalTextFont,
        fontWeight: '700',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    commentsIsland: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: AppScreenBackgroundColor,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    commentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        paddingHorizontal: 16,
    },
    commentsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    commentsCountText: {
        fontSize: generalTextSize + 1,
        fontWeight: '700',
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
    },
    commentsHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    addCommentButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(157, 115, 64, 0.1)',
        borderWidth: 1.5,
        borderColor: MainBrownSecondaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    commentsContent: {
        flex: 1,
        width: '100%',
    },
    commentsContentContainer: {
        paddingRight: '0%',
    },
    loadingMoreContainer: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppScreenBackgroundColor,
    },
    loadingMoreText: {
        marginTop: 12,
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    videoQuotaOverlayContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
    },
    videoQuotaOverlay: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    quotaTitle: {
        fontSize: generalTitleSize + 2,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        textAlign: 'center',
        color: MainBrownSecondaryColor,
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    quotaSub: {
        fontSize: generalTextSize - 1,
        fontFamily: generalTextFont,
        color: generalTextColor,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    quotaActions: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 8,
    },
    quotaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    quotaPrimary: {
        backgroundColor: MainBrownSecondaryColor,
    },
    quotaSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: MainBrownSecondaryColor,
    },
    quotaButtonText: {
        fontSize: generalTextSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    quotaPrimaryText: {
        color: '#FFFFFF',
    },
    quotaRemaining: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: withdrawnTitleColor,
        textAlign: 'center',
        marginTop: 12,
    },
    videoLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        zIndex: 10,
    },
    loadingContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    loadingText: {
        color: generalTitleColor,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    videoErrorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        padding: 24,
        zIndex: 10,
    },
    errorContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        maxWidth: 340,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    errorTitle: {
        fontSize: generalTitleSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: generalTitleColor,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: withdrawnTitleColor,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: MainBrownSecondaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    retryButtonText: {
        fontSize: generalTextSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default LiveNews;