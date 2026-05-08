import React, {useState, useEffect, useRef, useCallback, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, FlatList, Image, ActivityIndicator, ScrollView, StatusBar, Alert, Platform, Modal, KeyboardAvoidingView, TouchableWithoutFeedback} from 'react-native';
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
    generalLineHeight,
    secCardBackgroundColor,
    cardBackgroundColor,
    commentTextSize
} from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import CommentInputModal from '../../FeedbackComponent/CommentInputModal';
import FeedbackContainer from '../../FeedbackComponent/FeedbackContainer';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { formatNumber } from '../utils/numberFormatter';
import { Context as AuthContext } from '../Context/AuthContext';
import { useRewardedAd } from '../Components/Ads/RewardedAd';
import { useInterstitialAd } from '../Components/Ads/InterstitialAd';
import RewardedAdModal from '../Components/Ads/RewardedAdModal';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import { useLanguage } from '../Context/LanguageContext';
import DiscussionLaneCard from '../Components/DiscussionLanes/DiscussionLaneCard';
import { getDiscussionLanePalette } from '../theme/discussionLanePalette';

const LiveNews = ({ preloadedVideos, route }) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { videoId } = route?.params || {};
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const videoPlayersRef = useRef({});
    const scrollToVideoIdRef = useRef(null); // Track if we need to scroll to a specific video
    const isScreenFocused = useIsFocused();
    const { t, appLanguage } = useLanguage();
    const lang = appLanguage === 'fr' ? 'fr' : 'en';
    
    // Auth context for user role
    const { state } = useContext(AuthContext);
    const userRole = state?.role || 'general';
    const isGeneralUser = userRole === 'general';
    
    // Rewarded ad hook (only for general users)
    const rewardedAdUnitId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID;
    const { showRewardedAd, isLoaded: isAdLoaded } = useRewardedAd(rewardedAdUnitId);

    const { showAd: showInterstitial, isLoaded: interstitialReady, isShowing: isInterstitialShowing } = useInterstitialAd();
    const videosSwipedRef = useRef(0);
    const interstitialRef = useRef({ showAd: showInterstitial, isLoaded: interstitialReady });
    useEffect(() => {
        interstitialRef.current = { showAd: showInterstitial, isLoaded: interstitialReady };
    }, [showInterstitial, interstitialReady]);
    
    // State management
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);
    const [isLoading, setIsLoading] = useState(!preloadedVideos); // Don't show loading if we have preloaded videos !preloadedVideos
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
    const [selectedLaneVideo, setSelectedLaneVideo] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    const [replyingToComment, setReplyingToComment] = useState(null);
    const [videoDiscussionLanes, setVideoDiscussionLanes] = useState([]);
    const [lanesLoading, setLanesLoading] = useState(false);
    const [lanePickerVisible, setLanePickerVisible] = useState(false);
    const [laneVotingKey, setLaneVotingKey] = useState(null);
    const lanesCacheRef = useRef({}); // videoId -> { video, lanes }
    
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
    const discussionPalette = React.useMemo(
        () => getDiscussionLanePalette(selectedLaneVideo?.video_group),
        [selectedLaneVideo?.video_group]
    );

    const getVideoIdString = useCallback((videoOrId) => {
        if (videoOrId == null) return '';
        const raw = typeof videoOrId === 'object' && videoOrId !== null
            ? (videoOrId._id ?? videoOrId.id)
            : videoOrId;
        if (raw == null) return '';
        if (typeof raw === 'string') return raw;
        if (typeof raw === 'object' && raw.$oid) return String(raw.$oid);
        return String(raw);
    }, []);

    const mergeVideoDetailIntoList = useCallback((detail) => {
        const id = getVideoIdString(detail);
        if (!id) return;
        setVideos((prev) => (prev || []).map((v) => (getVideoIdString(v) === id ? { ...v, ...detail } : v)));
    }, [getVideoIdString]);

    const prefetchVideoDiscussionLanes = useCallback(async (videoOrId) => {
        const id = getVideoIdString(videoOrId);
        if (!id) return null;
        if (lanesCacheRef.current[id]?.lanes) {
            return lanesCacheRef.current[id];
        }
        try {
            const res = await SikiyaAPI.get(`/video/${id}`);
            const lanes = res.data?.discussionLanes || [];
            lanesCacheRef.current[id] = { video: res.data, lanes };
            if (res.data) {
                mergeVideoDetailIntoList(res.data);
            }
            return lanesCacheRef.current[id];
        } catch (err) {
            // Silent: this is prefetch; UI will still fetch on demand
            return null;
        }
    }, [getVideoIdString, mergeVideoDetailIntoList]);
    
    // Preload next videos + discussion lanes for smoother experience
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
                // Prefetch lanes so lane picker is instant
                if (video?._id) {
                    prefetchVideoDiscussionLanes(video._id);
                }
            });
        }
        // Also prefetch lanes for the currently visible video
        if (videos[currentVideoIndex]?._id) {
            prefetchVideoDiscussionLanes(videos[currentVideoIndex]._id);
        }
    }, [currentVideoIndex, videos, prefetchVideoDiscussionLanes]);

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
        // Hide overlay first so navigation feels clean (this workflow only)
        setVideoLimitReached(false);
        setPendingRewardAction(null);

        // Let overlay fade out before navigating
        setTimeout(() => {
            navigation.navigate('UserProfileGroup', {
                screen: 'SubscriptionSettings',
                params: {
                    screen: 'MembershipSettings',
                    params: { returnTab: 'Live' },
                }
            });
        }, 220);
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
        // Close comments sheet first so the navigation doesn't feel stacked.
        closeCommentSheet();

        // Let the modal close animation finish before navigating.
        setTimeout(() => {
            navigation.navigate('UserProfileGroup', {
                screen: 'SubscriptionSettings',
                params: {
                    screen: 'MembershipSettings',
                    params: { returnTab: 'Live' },
                }
            });
        }, 220);
    }, [navigation, closeCommentSheet]);

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
                    if (videosSinceLastAdRef.current >= 10) {
                        handleVideoQuotaExceeded();
                    }
                }
            }
            
            setCurrentVideoIndex(visibleIndex);

            // Show interstitial ad every 5th video for general users
            if (isGeneralUser) {
                videosSwipedRef.current += 1;
                if (videosSwipedRef.current % 5 === 0 && interstitialRef.current.isLoaded) {
                    interstitialRef.current.showAd();
                }
            }

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


    const openLanePicker = useCallback(async () => {
        const videoToShow = currentVideo ?? (videos[0] ?? null);
        if (!videoToShow) return;
        if (isGeneralUser) {
            fetchCommentQuota();
        }
        // Open immediately; populate lanes async (cache/network)
        setLanePickerVisible(true);
        setLanesLoading(true);
        setSelectedLaneVideo(videoToShow);
        setSelectedLane(null);
        setVideoDiscussionLanes([]); // avoid showing stale lanes from previous video

        try {
            const cached = lanesCacheRef.current[videoToShow._id];
            let responseData = cached?.video;
            let rawLanes = cached?.lanes;

            if (!rawLanes) {
                const prefetched = await prefetchVideoDiscussionLanes(videoToShow._id);
                responseData = prefetched?.video;
                rawLanes = prefetched?.lanes || [];
            }

            // keep enriched video payload so theming (video_group) is available
            if (responseData) {
                setSelectedLaneVideo(responseData);
            }
            const mapped = rawLanes.map((lane) => {
                const tEn = lane.translations?.en;
                const tFr = lane.translations?.fr;
                const title = (lang === 'fr' ? tFr?.title : tEn?.title) || tEn?.title || tFr?.title || lane.key || '';
                return {
                    ...lane,
                    id: lane._id || lane.key,
                    title,
                    commentCount: lane.commentCount ?? 0,
                };
            });
            setVideoDiscussionLanes(mapped);
        } catch (err) {
            console.error('Error fetching video discussion lanes:', err);
            setVideoDiscussionLanes([]);
        } finally {
            setLanesLoading(false);
        }
    }, [fetchCommentQuota, isGeneralUser, currentVideo, videos, lang, prefetchVideoDiscussionLanes]);

    const closeLanePicker = useCallback(() => {
        setLanePickerVisible(false);
    }, []);

    const openCommentsForLane = useCallback((lane) => {
        if (!lane) return;
        setSelectedLane(lane);
        setLanePickerVisible(false);
        setModalVisible(true);
    }, []);

    const handleBinaryLaneVote = useCallback(async (lane, side) => {
        const vid = selectedLaneVideo?._id;
        if (!vid || !lane?.key) return;
        const hadUserVote = Boolean(lane.voteSummary?.userSide);
        if (hadUserVote && lane.voteSummary?.userSide === side) {
            openCommentsForLane(lane);
            return;
        }
        setLaneVotingKey(lane.key);
        try {
            const res = await SikiyaAPI.put(
                `/video/${vid}/lanes/${encodeURIComponent(lane.key)}/vote`,
                { side }
            );
            const vs = res.data?.voteSummary;
            if (!vs) return;
            setVideoDiscussionLanes((prev) =>
                (prev || []).map((l) => (l.key === lane.key ? { ...l, voteSummary: vs } : l))
            );
            // keep cache in sync
            if (lanesCacheRef.current[vid]?.lanes) {
                lanesCacheRef.current[vid].lanes = (lanesCacheRef.current[vid].lanes || []).map((l) =>
                    l.key === lane.key ? { ...l, voteSummary: vs } : l
                );
            }
        } catch (err) {
            Alert.alert(
                'Error',
                err?.response?.data?.error || err.message || 'Could not save your vote.'
            );
        } finally {
            setLaneVotingKey(null);
        }
    }, [selectedLaneVideo, openCommentsForLane]);

    const closeCommentSheet = useCallback(() => {
        setModalVisible(false);
        setSelectedLaneVideo(null);
        setSelectedLane(null);
        setReplyingToComment(null);
        setVideoDiscussionLanes([]);
    }, []);

    const getCommentVideoId = useCallback(() => {
        if (modalVisible && selectedLaneVideo?._id) return selectedLaneVideo._id;
        return currentVideo?._id;
    }, [modalVisible, selectedLaneVideo, currentVideo]);

    const onSendComment = async (text) => {
        const videoId = getCommentVideoId();
        if (!text || !videoId) return;
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
            if (selectedLane?.key) {
                payload.discussion_lane_key = selectedLane.key;
            }

            const response = await SikiyaAPI.post(`/video/${videoId}/comment`, payload);

            if (response.status === 201) {
                setRefreshCommentsKey(prevKey => prevKey + 1);
                setCommentQuota(prev => prev ? {
                    ...prev,
                    remaining: prev.remaining !== undefined ? Math.max(0, prev.remaining - 1) : prev.remaining,
                    used: prev.used !== undefined ? prev.used + 1 : prev.used,
                } : prev);
                setVideos(prev => prev.map(v => v._id === videoId
                    ? { ...v, number_of_comments: (v.number_of_comments || 0) + 1 }
                    : v
                ));
                if (selectedLane?.key) {
                    setVideoDiscussionLanes(prev => prev.map(l =>
                        l.key === selectedLane.key ? { ...l, commentCount: (l.commentCount || 0) + 1 } : l
                    ));
                }
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

    const onSendReply = async (text) => {
        const videoId = getCommentVideoId();
        if (!text || !replyingToComment?.commentId || !videoId) return;
        try {
            setCommentLoading(true);
            const payload = {
                comment_content: text,
                mainComment: false,
                reply_to_comment_id: replyingToComment.commentId,
            };
            if (selectedLane?.key) {
                payload.discussion_lane_key = selectedLane.key;
            }
            const response = await SikiyaAPI.post(`/video/${videoId}/comment`, payload);
            if (response.status === 201 || response.status === 200) {
                setReplyingToComment(null);
                setRefreshCommentsKey(prevKey => prevKey + 1);
                setVideos(prev => prev.map(v => v._id === videoId
                    ? { ...v, number_of_comments: (v.number_of_comments || 0) + 1 }
                    : v
                ));
                if (selectedLane?.key) {
                    setVideoDiscussionLanes(prev => prev.map(l =>
                        l.key === selectedLane.key ? { ...l, commentCount: (l.commentCount || 0) + 1 } : l
                    ));
                }
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleSendCommentOrReply = (text) => {
        if (replyingToComment) {
            onSendReply(text);
        } else {
            onSendComment(text);
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
        const j = currentVideo?.journalist_id;
        if (j?._id) {
            const displayName =
                (j.displayName && String(j.displayName).trim()) ||
                [j.firstname, j.lastname].filter(Boolean).join(' ').trim() ||
                undefined;
            navigation.navigate('AuthorProfile', {
                userId: j._id,
                ...(displayName ? { displayName } : {}),
            });
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
                modalVisible={modalVisible}
                refreshCommentsKey={refreshCommentsKey}
                handleShare={handleShare}
                handleProfile={handleProfile}
                onSendComment={onSendComment}
                setModalVisible={setModalVisible}
                videoPlayersRef={videoPlayersRef}
                onVideoQuotaExceeded={handleVideoQuotaExceeded}
                openCommentModal={openLanePicker}
                setVideos={setVideos}
                videoLimitReached={videoLimitReached}
                isInterstitialShowing={isInterstitialShowing}
                isScreenFocused={isScreenFocused}
            />
        );
    };
    
    // Handle cancel ad modal
    const handleCancelAd = () => {
        setShowAdModal(false);
    };
    
    // Disable FlatList scrolling when ad modal is showing or video limit reached
    const isScrollingEnabled = !showAdModal && !videoLimitReached;

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

            {/* Discussion lanes picker (step 1) */}
            <Modal
                transparent
                visible={lanePickerVisible}
                animationType="fade"
                onRequestClose={closeLanePicker}
            >
                <View style={styles.lanePickerBackdrop}>
                    <View
                        style={[
                            styles.lanePickerSheet,
                            main_Style.genContentElevation,
                            {
                                marginBottom: 16 + (insets?.bottom || 0),
                                height: Math.min(height * 0.62, 520),
                            },
                        ]}
                    >
                        <View style={styles.lanePickerHeader}>
                            <View style={styles.lanePickerHeaderText}>
                                <Text style={styles.lanePickerTitle}>{t('article.discussionLanes')}</Text>
                                <Text style={styles.lanePickerHint}>{t('article.discussionLanesHint')}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.lanePickerCloseButton}
                                onPress={closeLanePicker}
                                activeOpacity={0.8}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={20} color={withdrawnTitleColor} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.lanePickerScroll}
                            contentContainerStyle={styles.lanePickerContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {lanesLoading ? (
                                <View style={styles.lanePickerLoading}>
                                    <MediumLoadingState />
                                </View>
                            ) : (
                                <>
                                    {videoDiscussionLanes.map((lane) => (
                                        <DiscussionLaneCard
                                            key={lane.key || lane.id}
                                            lane={lane}
                                            palette={discussionPalette}
                                            lang={lang}
                                            commentCount={lane.commentCount ?? 0}
                                            onOpenOpenLane={openCommentsForLane}
                                            onBinaryVote={handleBinaryLaneVote}
                                            onJoinBinaryLane={openCommentsForLane}
                                            voting={laneVotingKey === lane.key}
                                            alwaysShowJoinBinary={true}
                                            joinDiscussionLabel={t('comments.joinDiscussion')}
                                            oneCommentLabel={t('comments.oneComment') || 'comment'}
                                            manyCommentsLabel={t('comments.manyComments') || 'comments'}
                                        />
                                    ))}
                                    {videoDiscussionLanes.length === 0 && (
                                        <View style={styles.lanePickerEmpty}>
                                            <Text style={styles.lanePickerEmptyText}>{t('video.noDiscussionLanes') || t('video.noVideosAvailable')}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            
            {/* Comment sheet modal (roll-up) with FeedbackContainer + CommentInputModal + lane switcher */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="none"
                onRequestClose={closeCommentSheet}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableWithoutFeedback onPress={closeCommentSheet}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                    <View
                        style={[
                            styles.modalSheet,
                            { height: height * 0.78 },
                        ]}
                    >
                        {selectedLaneVideo && (
                            <>
                                {selectedLane && (
                                    <View
                                        style={[
                                            styles.modalLaneFlag,
                                            { borderBottomColor: 'rgba(0,0,0,0.08)' },
                                        ]}
                                    >
                                        <View style={[styles.modalLaneAccent, { backgroundColor: discussionPalette.accent }]} />
                                        <View style={styles.modalLaneIconWrap}>
                                            <Ionicons name={selectedLane.icon} size={18} color={discussionPalette.accent} />
                                        </View>
                                        <Text style={[styles.modalLaneFlagText, { color: discussionPalette.accent }]} numberOfLines={1}>
                                            {selectedLane.title}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.modalLaneCloseButton}
                                            onPress={closeCommentSheet}
                                            activeOpacity={0.7}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="close" size={20} color={withdrawnTitleColor} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {selectedLane && (
                                    <KeyboardAvoidingView
                                        style={styles.modalContentWrapper}
                                        behavior="padding"
                                        keyboardVerticalOffset={Platform.OS === 'ios' ? height * 0.2 : 0}
                                    >
                                        <ScrollView
                                            contentContainerStyle={styles.modalScrollContent}
                                            style={styles.modalCommentContainer}
                                            showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps="handled"
                                            keyboardDismissMode="interactive"
                                            bounces={true}
                                            overScrollMode="never"
                                        >
                                            <FeedbackContainer
                                                videoId={selectedLaneVideo._id}
                                                discussionLaneId={selectedLane.key}
                                                refreshKey={refreshCommentsKey}
                                                commentLoading={commentLoading}
                                                setCommentLoading={setCommentLoading}
                                                onAddCommentPress={() => {}}
                                                onReplyToComment={(commentId, authorName) => setReplyingToComment({ commentId, authorName })}
                                                onBeforeNavigate={closeCommentSheet}
                                                hideHeader={true}
                                                totalCommentCount={selectedLane.commentCount}
                                            />
                                        </ScrollView>

                                    <CommentInputModal
                                        onSend={handleSendCommentOrReply}
                                        placeholder={t('comment.writeCommentPlaceholder') || t('comments.writeCommentPlaceholder')}
                                        isLoading={commentLoading}
                                        quota={isGeneralUser ? commentQuota : null}
                                        quotaLoading={commentQuotaLoading}
                                        onUnlock={handleUnlockComment}
                                        onUpgrade={handleUpgradeComment}
                                        userRole={userRole}
                                        modalTitle={replyingToComment ? null : selectedLane.title}
                                        titleColor={discussionPalette.accent}
                                        replyToName={replyingToComment?.authorName ?? null}
                                        onCancelReply={replyingToComment ? () => setReplyingToComment(null) : undefined}
                                    />
                                </KeyboardAvoidingView>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

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
                                onPress={handleUpgradeVideos}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={[styles.quotaButtonText, styles.quotaPrimaryText]}>{t('comments.upgrade')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.quotaButton, styles.quotaSecondary, main_Style.genButtonElevation]}
                                onPress={handleUnlockVideos}
                                disabled={videoQuotaLoading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="play-outline" size={18} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                                <Text style={[styles.quotaButtonText, styles.quotaSecondaryText]}>{t('comments.watchAd')}</Text>
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
    modalVisible,
    refreshCommentsKey,
    handleShare,
    handleProfile,
    onSendComment,
    setModalVisible,
    videoPlayersRef,
    onVideoQuotaExceeded,
    openCommentModal,
    setVideos: setVideosProp,
    videoLimitReached,
    isInterstitialShowing,
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
        const shouldPlay = isActive && !videoLimitReached && isScreenFocused && !isInterstitialShowing;
        
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
                            {likeCount > 0 && (
                            <Text style={styles.actionCount}>{formatNumber(likeCount)}</Text>
                        )}
                        </TouchableOpacity>
                    </View>
                    
                    {/* Comments Button - opens slide-up comment modal */}
                    <View style={styles.actionButtonGroup}>
                        <TouchableOpacity 
                            style={[styles.actionButton, main_Style.genButtonElevation]} 
                            onPress={openCommentModal}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color={iconColor} />
                        </TouchableOpacity>
                        
                    </View>
                    
                    {/* Share Button (match Article share UI) */}
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonShare, main_Style.genButtonElevation]} 
                        onPress={handleShare}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="share-outline" size={22} color="#fff" />
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
        bottom: 75,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 28,
        paddingTop: 18,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
        backgroundColor:  'rgba(0, 0, 0, 0.85)', //'rgba(0, 0, 0, 0.85)'
        padding: 12,
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    articleTitle: {
        fontSize: articleTitleSize - 3,
        fontWeight: articleTitleFontWeight,
        color: '#FFFFFF',
        fontFamily: articleTitleFont,
        lineHeight: generalLineHeight,
        marginBottom: 4,
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
        gap: 12,
    },
    actionButtonGroup: {
        alignItems: 'center',
        gap: 4,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
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
    actionButtonShare: {
        backgroundColor: 'rgba(0,0,0,0.34)',
        borderWidth: 0.8,
        borderColor: 'rgba(255,255,255,0.32)',
    },
    actionCount: {
        fontSize: generalSmallTextSize - 2,
        color: '#FFFFFF',
        fontFamily: generalTextFont,
        fontWeight: '700',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    lanePickerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
        paddingHorizontal: 14,
    },
    lanePickerSheet: {
        backgroundColor: '#F6F4EF',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    lanePickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    lanePickerHeaderText: {
        flex: 1,
        paddingRight: 12,
    },
    lanePickerTitle: {
        fontSize: generalTitleSize - 2,
        fontFamily: generalTitleFont,
        fontWeight: '800',
        color: '#8B1C13',
        letterSpacing: 0.4,
    },
    lanePickerHint: {
        marginTop: 6,
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        lineHeight: generalSmallTextSize + 6,
    },
    lanePickerCloseButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lanePickerScroll: {
        flex: 1,
    },
    lanePickerContent: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 14,
    },
    lanePickerLoading: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lanePickerEmpty: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lanePickerEmptyText: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: withdrawnTitleColor,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalSheet: {
        backgroundColor: AppScreenBackgroundColor,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 0,
        overflow: 'hidden',
    },
    modalLaneFlag: {
        minHeight: 44,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        position: 'relative',
        backgroundColor: '#FBFAF6',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    modalLaneAccent: {
        width: 4,
        alignSelf: 'stretch',
        borderRadius: 2,
        backgroundColor: MainBrownSecondaryColor,
        marginRight: 2,
    },
    modalLaneIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    modalLaneFlagText: {
        fontSize: commentTextSize + 1,
        fontWeight: '800',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        flex: 1,
        textAlign: 'left',
    },
    modalLaneCloseButton: {
        position: 'absolute',
        right: 16,
        top: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Lane switcher styles removed: lane is chosen in step-1 picker
    modalContentWrapper: {
        flex: 1,
    },
    modalCommentContainer: {
        flex: 1,
        backgroundColor: cardBackgroundColor,
    },
    modalScrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        minHeight: 200,
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
        backgroundColor: '#FFF4E5',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.55)',
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
        color: '#66101F',
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
        gap: 10,
        marginBottom: 8,
    },
    quotaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
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
        backgroundColor: '#419D78',
    },
    quotaSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#419D78',
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
    quotaSecondaryText: {
        color: MainBrownSecondaryColor,
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 12,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 180,
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