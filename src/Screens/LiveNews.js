import React, {useState, useEffect, useRef, useCallback, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, FlatList, Image, ActivityIndicator, ScrollView, StatusBar, Alert} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
    generalLineHeight
} from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import CommentInputModal from '../../FeedbackComponent/CommentInputModal';
import FeedbackContainer from '../../FeedbackComponent/FeedbackContainer';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatNumber } from '../utils/numberFormatter';
import { Context as AuthContext } from '../Context/AuthContext';
import { useRewardedAd } from '../Components/Ads/RewardedAd';
import RewardedAdModal from '../Components/Ads/RewardedAdModal';

const LiveNews = ({ preloadedVideos, route }) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { videoId } = route?.params || {};
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const videoPlayersRef = useRef({});
    const scrollToVideoIdRef = useRef(null); // Track if we need to scroll to a specific video
    
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
    
    const iconColor = AppScreenBackgroundColor;

    const rewardedModalCopy = pendingRewardAction === 'comments'
        ? {
            title: 'Watch an Ad to Comment',
            message: 'Watch a quick ad to unlock another main comment for today.',
        }
        : {
            title: 'Watch an Ad to Continue',
            message: 'Watch a short ad to unlock 10 more videos.',
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
                setError('Failed to load videos. Please try again.');
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
        handleWatchAd('videos');
    }, [handleWatchAd, isGeneralUser]);

    const handleUpgradeVideos = useCallback(() => {
        Alert.alert(
            'Upgrade',
            'Upgrade to Contributor for unlimited videos.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' }
            ]
        );
    }, []);

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

    const handleUnlockComment = useCallback(() => {
        if (!isGeneralUser) return;
        setPendingRewardAction('comments');
        setShowAdModal(true);
    }, [isGeneralUser]);

    const handleUpgradeComment = useCallback(() => {
        Alert.alert(
            'Upgrade',
            'Upgrade to unlock unlimited main comments.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' }
            ]
        );
    }, []);

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

    const openCommentModal = useCallback(async () => {
        if (isGeneralUser) {
            await fetchCommentQuota();
        }
        setModalVisible(true);
    }, [fetchCommentQuota, isGeneralUser]);

    const onSendComment = async (text) => {
        if (!text || !currentVideo?._id) return;
        if (isGeneralUser && commentQuota && (commentQuota.remaining ?? 0) <= 0) {
            Alert.alert('Limit reached', 'You reached your free main comments limit for today.');
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
                    'Limit reached',
                    error?.response?.data?.error || 'Main comment limit reached for today.'
                );
            }
        } finally {
            setCommentLoading(false);
        }
    };

    // Pause all videos when screen loses focus
    useFocusEffect(
        useCallback(() => {
            // Screen is focused - videos will be played by VideoItemComponent based on isActive
            return () => {
                // Screen is unfocused - pause all videos
                Object.values(videoPlayersRef.current).forEach(player => {
                    if (player) {
                        player.pause();
                    }
                });
            };
        }, [])
    );

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
                refreshCommentsKey={refreshCommentsKey}
                handleComments={handleComments}
                handleShare={handleShare}
                handleProfile={handleProfile}
                onSendComment={onSendComment}
                setModalVisible={setModalVisible}
                videoPlayersRef={videoPlayersRef}
            onVideoQuotaExceeded={handleVideoQuotaExceeded}
            openCommentModal={openCommentModal}
            />
        );
    };

    // Handle rewarded ad watch
    const handleWatchAd = async (actionOverride = null) => {
        const action = actionOverride || pendingRewardAction;
        if (!action) return;

        if (!isAdLoaded) {
            console.warn('Ad not loaded yet');
            Alert.alert('Please wait', 'Ad is still loading. Try again in a moment.');
            return;
        }
        
        setIsShowingAd(true);
        if (!actionOverride) {
            setShowAdModal(false);
        }
        
        let earned = false;
        try {
            earned = await showRewardedAd();
        } catch (error) {
            console.error('Error showing rewarded ad:', error);
        }

        if (!earned) {
            setIsShowingAd(false);
            if (!actionOverride) {
                setShowAdModal(true);
            }
            return;
        }

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
        } catch (error) {
            console.error('Error unlocking after rewarded ad:', error?.response?.data || error.message);
            Alert.alert('Unlock failed', error?.response?.data?.error || 'Please try again.');
            if (!actionOverride) {
                setShowAdModal(true);
            }
        } finally {
            setVideoQuotaLoading(false);
            setCommentQuotaLoading(false);
            setIsShowingAd(false);
        }
    };
    
    // Handle cancel ad modal
    const handleCancelAd = () => {
        setShowAdModal(false);
    };
    
    // Disable FlatList scrolling when comments are open or ad modal is showing
    const isScrollingEnabled = !showComments && !showAdModal && !videoLimitReached;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <MediumLoadingState />
            </SafeAreaView>
        );
    }

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
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return(
        <SafeAreaView style={styles.safeArea} edges={['right']}>
            <StatusBar barStyle="light-content" />
            <FlatList
                ref={flatListRef}
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item, index) => item._id || index.toString()}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToAlignment="center"
                snapToInterval={height}
                decelerationRate="fast"
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
                        <Text style={styles.emptyText}>No videos available</Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                            <Text style={styles.loadingMoreText}>Loading more videos...</Text>
                        </View>
                    ) : null
                }
            />
            
            {/* Comment Input Modal - moved outside FlatList like NewsHome */}
            <CommentInputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSend={onSendComment}
                placeholder="Write your comment..."
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

            {/* Video quota overlay */}
            {videoLimitReached && (
                <View style={styles.videoQuotaOverlay}>
                    <Text style={styles.quotaTitle}>You reached your free video limit.</Text>
                    <Text style={styles.quotaSub}>
                        Watch an ad to unlock 10 more, or upgrade for unlimited videos.
                    </Text>
                    <View style={styles.quotaActions}>
                        <TouchableOpacity 
                            style={[styles.quotaButton, styles.quotaPrimary]}
                            onPress={handleUnlockVideos}
                            disabled={videoQuotaLoading}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="play-outline" size={18} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                            <Text style={[styles.quotaButtonText, styles.quotaPrimaryText]}>Watch an ad</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.quotaButton, styles.quotaSecondary]}
                            onPress={handleUpgradeVideos}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.quotaButtonText}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.quotaRemaining}>
                        Remaining today: {videoQuotaLoading ? '...' : videoQuota?.remaining ?? 0} of {videoQuota?.dailyLimit ?? 10} (+{videoQuota?.unlocked ?? 0} unlocked)
                    </Text>
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
    refreshCommentsKey,
    handleComments,
    handleShare,
    handleProfile,
    onSendComment,
    setModalVisible,
    videoPlayersRef,
    onVideoQuotaExceeded,
    openCommentModal,
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
    const viewTrackedRef = useRef(false); // Track if view has been recorded
    const watchTimeStartRef = useRef(null); // Track when video started playing
    const watchTimeIntervalRef = useRef(null); // Interval for tracking watch time

    const videoPlayer = useVideoPlayer(
        item?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
        player => {
            player.loop = true;
            // Store player reference
            if (item?._id) {
                videoPlayersRef.current[item._id] = player;
            }
            if (isActive) {
                player.play();
            } else {
                player.pause();
            }
        }
    );

    useEffect(() => {
        if (isActive) {
            videoPlayer.play();
            
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
            if (videoPlayer && typeof videoPlayer.pause === 'function') {
                try {
                    videoPlayer.pause();
                } catch (err) {
                    console.warn('Video pause failed', err);
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
    }, [isActive, videoPlayer, item?._id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const player = item?._id ? videoPlayersRef?.current?.[item._id] : null;
            if (player && typeof player.pause === 'function') {
                try {
                    player.pause();
                } catch (err) {
                    console.warn('Video pause on unmount failed', err);
                }
            }
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
                    setVideos(prev => prev.map(v => v._id === item._id ? { ...v, number_of_likes: response.data.number_of_likes } : v));
                }
            }
        } catch (error) {
            console.error('Error checking like status:', error);
            setLiked(false);
        }
    };

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
                    setVideos(prev => prev.map(v => v._id === item._id ? { ...v, number_of_likes: response.data.number_of_likes } : v));
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
            <VideoView 
                style={[styles.fullScreenVideo, { width, height }]} 
                player={videoPlayer} 
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                nativeControls={false}
                contentFit="cover"
            />
            
            {/* Bottom Info Section */}
            <View style={styles.bottomInfoSection}>
                {/* Title on the left */}
                <View style={styles.titleContainer}>
                    <Text style={styles.articleTitle} numberOfLines={3}>
                        {item?.video_title || "Live News Video"}
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
                                        {item.location || item.concerned_city || item.concerned_country || 'Location'}
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
                                size={24} 
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
                            <Ionicons name="chatbubble-outline" size={24} color={iconColor} />
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
                        <Ionicons name="share-social-outline" size={24} color={iconColor} />
                    </TouchableOpacity>
                    
                    {/* Profile Button */}
                    <TouchableOpacity 
                        style={[styles.actionButton, main_Style.genButtonElevation]} 
                        onPress={handleProfile}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="person-outline" size={24} color={iconColor} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comments Island Overlay */}
            {showComments && (
                <View style={[styles.commentsIsland, main_Style.genButtonElevation]}>
                    <View style={styles.commentsHeader}>
                        <Text style={styles.commentsTitle}>Comments</Text>
                        <View style={styles.commentsHeaderRight}>
                            <TouchableOpacity 
                                onPress={openCommentModal || (() => setModalVisible(true))}
                                style={[styles.addCommentButton, main_Style.genButtonElevation]}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="add" size={24} color={MainBrownSecondaryColor} />
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
        backgroundColor: '#000',
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
    },
    retryButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    emptyText: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 16,
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
    },
    fullScreenVideo: {
        backgroundColor: '#000',
    },
    bottomInfoSection: {
        position: 'absolute',
        bottom: 0,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 14,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    articleTitle: {
        fontSize: articleTitleSize,
        fontWeight: articleTitleFontWeight,
        color: AppScreenBackgroundColor,
        fontFamily: articleTitleFont,
        lineHeight: generalLineHeight,
        marginBottom: 6,
    },
    authorInfo: {
        marginTop: 4,
    },
    authorName: {
        fontSize: generalSmallTextSize,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
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
    },
    locationTextOverlay: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: generalTextFontWeight,
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
    },
    dateTextOverlay: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: generalTextFontWeight,
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        marginLeft: 12,
    },
    verticalActionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    actionButtonGroup: {
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    actionCount: {
        fontSize: generalSmallTextSize,
        color: AppScreenBackgroundColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        marginTop: 4,
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
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 4,
        //backgroundColor: 'red',
    },
    commentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingHorizontal: 16,
    },
    commentsHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addCommentButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: genBtnBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentsTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
    },
    commentsCount: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
    },
    closeButton: {
        padding: 4,
    },
    commentsContent: {
        flex: 1,
        width: '100%',
        //backgroundColor: 'red',
    },
    commentsContentContainer: {
        paddingRight: '0%',
        //backgroundColor: 'blue',
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingMoreText: {
        marginTop: 8,
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    videoQuotaOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 16,
        right: 16,
        backgroundColor: MainSecondaryBlueColor,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: lightBannerBackgroundColor,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    quotaTitle: {
        fontSize: generalTextSize,
        fontFamily: generalTitleFont,
        fontWeight: generalTitleFontWeight,
        color: '#fff',
        marginBottom: 4,
    },
    quotaSub: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 10,
    },
    quotaActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    quotaButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    quotaPrimary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
    },
    quotaSecondary: {
        backgroundColor: MainBrownSecondaryColor,
    },
    quotaButtonText: {
        fontSize: generalTextSize,
        fontFamily: generalTitleFont,
        fontWeight: generalTitleFontWeight,
        color: '#fff',
    },
    quotaPrimaryText: {
        color: MainBrownSecondaryColor,
    },
    quotaRemaining: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: '#fff',
    },
});

export default LiveNews;