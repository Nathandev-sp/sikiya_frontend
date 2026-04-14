import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, useWindowDimensions, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, PanResponder, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleLineHeight, articleTextSize, articleTitleFont, articleTitleSize, bannerBackgroundColor, cardBackgroundColor, commentTextSize, defaultButtonHitslop, genBtnBackgroundColor, generalActiveOpacity, generalLineHeight, generalSmallLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, lightBannerBackgroundColor, main_Style, mainBrownColor, MainBrownSecondaryColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import DateConverter from '../../Helpers/DateConverter';
import StarRating from '../../Components/StarRating';
import FeedbackContainer from '../../../FeedbackComponent/FeedbackContainer';
import LikeButton from '../../Components/LikeButton';
import TrustScoreRing from '../../Components/TrustScoreRing';
import { useNavigation } from '@react-navigation/native';
import SikiyaAPI from '../../../API/SikiyaAPI';
import CommentInputModal from '../../../FeedbackComponent/CommentInputModal';
import BookmarkIcon from '../../Components/BookmarkIcon';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../utils/imageUrl';
import BannerAdComponent from '../../Components/Ads/BannerAd';
import { useInterstitialAd } from '../../Components/Ads/InterstitialAd';
import { Context as AuthContext } from '../../Context/AuthContext';
import i18n from '../../utils/i18n';
import { useRewardedAd } from '../../Components/Ads/RewardedAd';
import { useLanguage } from '../../Context/LanguageContext';
import DiscussionLaneCard from '../../Components/DiscussionLanes/DiscussionLaneCard';
import { getDiscussionLanePalette } from '../../theme/discussionLanePalette';
import { getHomeCategoryChipColor } from '../../theme/homeCategoryColors';

let articlesReadCount = 0;

const mergeDiscussionLanesPreserveVotes = (detailLanes, baseLanes) => {
    if (detailLanes == null || detailLanes.length === 0) {
        return baseLanes ?? [];
    }
    const baseByKey = Object.fromEntries((baseLanes || []).map((l) => [l.key, l]));
    return detailLanes.map((d) => ({
        ...d,
        voteSummary: d.voteSummary ?? baseByKey[d.key]?.voteSummary,
    }));
};

/** Stable Mongo-style id string for API URLs (handles string, id, or rare {$oid} shapes). */
const getArticleIdString = (articleOrId) => {
    if (articleOrId == null) return '';
    const raw = typeof articleOrId === 'object' && articleOrId !== null
        ? (articleOrId._id ?? articleOrId.id)
        : articleOrId;
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object' && raw.$oid) return String(raw.$oid);
    return String(raw);
};

/** Merge GET /articles/:id into list/search payloads so discussion lanes & category always resolve. */
const mergeArticleDetail = (prev, detail) => {
    if (!detail) return prev;
    const j = detail.journalist_id;
    const builtJournalist =
        j && typeof j === 'object' && j._id
            ? {
                _id: j._id,
                displayName: j.displayName,
                firstname: j.firstname,
                lastname: j.lastname,
                profile_picture: j.profile_picture,
                affiliation: j.journalist_affiliation,
                journalist_affiliation: j.journalist_affiliation,
                trust_score: j.trust_score,
            }
            : null;
    const base = prev || {};
    return {
        ...base,
        ...detail,
        journalist: base.journalist ?? builtJournalist ?? detail.journalist,
        discussionLanes:
            detail.discussionLanes !== undefined
                ? mergeDiscussionLanesPreserveVotes(detail.discussionLanes, base.discussionLanes)
                : base.discussionLanes ?? [],
        category: detail.article_group || base.category || detail.category,
        article_group: detail.article_group ?? base.article_group,
        saved: base.saved ?? detail.saved,
    };
};

function getJournalistTrustScore(article) {
    const j = article?.journalist;
    if (!j) return null;
    const raw = j.trust_score ?? j.journalist?.trust_score;
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
}

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
    headerTopBlurStrip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 4,
        backgroundColor: '#1a1510',
        // Hairline inside the clip so no sharp carousel peeks through at the seam
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    headerTopBlurImageClip: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    headerTopBlurBottomMask: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 2,
        backgroundColor: 'rgba(245,245,245,0.35)',
    },
    headerTopGlassVeil: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    headerCarouselWrap: {
        width: '100%',
    },
    headerImage: {
        width: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.12)',
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
        paddingBottom: 4,
        zIndex: 15,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        overflow: 'hidden',
    },
    topBarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        // Darker glass reads on bright/white hero frames; white icons stay legible
        backgroundColor: 'rgba(0,0,0,0.34)',
        borderWidth: 0.8,
        borderColor: 'rgba(255,255,255,0.32)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    topBarRight: {
        flexDirection: 'row',
        gap: 8,
    },
    bookmarkButtonWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.34)',
        borderWidth: 0.8,
        borderColor: 'rgba(255,255,255,0.32)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
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
        bottom: 28,
        left: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 12,
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
        textShadowColor: 'rgba(0,0,0,1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    locationDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 0,
        marginBottom: 16,
        width: '100%',
        borderBottomWidth: 0.4,
        borderBottomColor: MainBrownSecondaryColor,
        paddingBottom: 12,
    },
    locationDateLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexShrink: 1,
        marginRight: 8,
        gap: 6,
        minWidth: 0,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 1,
        minWidth: 0,
    },
    dateInlineWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
    },
    metaSeparator: {
        color: withdrawnTitleColor,
        fontSize: commentTextSize,
        fontWeight: '600',
        opacity: 0.45,
    },
    locationTextOverlay: {
        color: '#fff',
        fontWeight: generalTextFontWeight,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        opacity: 1,
        textShadowColor: 'rgba(0,0,0,1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    dateTextOverlay: {
        color: '#fff',
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        opacity: 1,
        fontWeight: generalTextFontWeight,
        textShadowColor: 'rgba(0,0,0,1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    articleTitleInContent: {
        fontSize: articleTitleSize,
        color: generalTextColor,
        fontFamily: articleTitleFont,
        lineHeight: 28,
        marginBottom: 12,
    },
    locationTextInContent: {
        color: withdrawnTitleColor,
        fontWeight: generalTextFontWeight,
        fontSize: commentTextSize,
        fontFamily: generalTextFont,
        flexShrink: 1,
    },
    dateTextInContent: {
        color: withdrawnTitleColor,
        fontSize: commentTextSize,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
    },
    contentSection: {
        backgroundColor: AppScreenBackgroundColor,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: -18,
        paddingTop: 26,
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
        marginBottom: 12,
        paddingBottom: 18,
        borderBottomWidth: 0.4,
        borderBottomColor: MainBrownSecondaryColor,
    },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sourceLogoContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: cardBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        padding: 2,
    },
    sourceLogo: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: lightBannerBackgroundColor,
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
    trustScoreBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        paddingLeft: 4,
    },
    trustScoreCaption: {
        marginTop: 3,
        fontSize: 9,
        fontFamily: generalTextFont,
        fontWeight: '600',
        color: withdrawnTitleColor,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sourceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    sourceName: {
        fontSize: commentTextSize + 0.5,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    authorName: {
        fontSize: withdrawnTitleSize - 0.5,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    highlightSection: {
        backgroundColor: '#FBFAF6',
        borderRadius: 16,
        padding: 18,
        marginTop: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: MainBrownSecondaryColor,
    },
    highlightLabel: {
        fontSize: commentTextSize,
        fontWeight: generalTitleFontWeight,
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
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
        width: '100%',
        alignSelf: 'center',
        maxWidth: 680,
    },
    fullContentLabel: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: MainBrownSecondaryColor,
        fontFamily: articleTitleFont,
        marginBottom: 12,
    },
    articleContent: {
        fontSize: articleTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: articleLineHeight + 4,
        textAlign: 'left',
    },
    commentsSection: {
        paddingTop: 4,
        width: '100%',
        alignSelf: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        height: height * 0.8,
        backgroundColor: AppScreenBackgroundColor,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        //paddingHorizontal: 4,
        //paddingTop: 12,
        paddingBottom: 0,
    },
    modalHandle: {
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignSelf: 'center',
        //marginBottom: 12,
    },
    modalHandleContainer: {
        paddingVertical: 8,
        paddingHorizontal: 0,
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        //marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
        
    },
    modalHeaderImage: {
        width: 80,
        height: 52,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalHeaderText: {
        flex: 1,
    },
    modalTitle: {
        fontSize: commentTextSize-0.5,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: articleTitleFont,
        lineHeight: 20,
    },
    modalAuthor: {
        fontSize: commentTextSize,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 0,
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
    modalCloseButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    discussionLanesSection: {
        borderRadius: 16,
        paddingTop: 14,
        paddingHorizontal: 12,
        paddingBottom: 16,
        marginTop: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        backgroundColor: '#FFFFFF',
    },
    discussionLanesSectionTitle: {
        fontSize: commentTextSize,
        fontWeight: generalTitleFontWeight,
        fontFamily: generalTitleFont,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    discussionLanesSectionHint: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: withdrawnTitleColor,
        marginBottom: 12,
        lineHeight: generalSmallLineHeight,
    },
    discussionLanesContainer: {
        gap: 12,
    },
    horizontalRule: {
        height: 0.2,
        backgroundColor: MainBrownSecondaryColor,
        //width: '100%',
        marginVertical: 16,
        marginHorizontal: 4,
    },
    /** No spinner: brief blank shell only when opening by id with no preloaded article */
    articleShellMinimal: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorText: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
    },
    modalCommentContainer: {
        flex: 1,
        backgroundColor: lightBannerBackgroundColor,
    },
    modalScrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        minHeight: 200,
    },
    modalContentWrapper: {
        flex: 1,
    },
});

const NewsHome = ({ route }) => {
    const { article: articleParam, articleId } = route.params || {};
    const { t, appLanguage } = useLanguage();
    // Log article journalist data to debug trust score
    //console.log('Article journalist data:', article);
    const [article, setArticle] = useState(articleParam);
    /** True only when navigating with articleId and no preloaded article (e.g. notification deep link). */
    const [pendingInitialArticle, setPendingInitialArticle] = useState(
        () => Boolean(articleId && articleParam == null)
    );
    const [commentLoading, setCommentLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [commentQuota, setCommentQuota] = useState(null);
    const [quotaLoading, setQuotaLoading] = useState(false);
    const flatListRef = useRef(null);
    const [refreshCommentsKey, setRefreshCommentsKey] = useState(0); // Key to force re-render of comments
    const startTimeRef = useRef(null); // Track when user started reading
    const readTimeIntervalRef = useRef(null); // Interval for tracking read time
    const [discussionModalVisible, setDiscussionModalVisible] = useState(false);
    const [selectedLane, setSelectedLane] = useState(null);
    const [replyingToComment, setReplyingToComment] = useState(null); // { commentId, authorName }
    const [laneCounts, setLaneCounts] = useState({});
    const [laneVotingKey, setLaneVotingKey] = useState(null);

    // Pan responder for swipe-to-dismiss
    const modalTranslateY = useRef(new Animated.Value(0)).current;
    const panResponderRef = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to vertical swipes
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow dragging down
                if (gestureState.dy > 0) {
                    modalTranslateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    // Close modal if dragged down enough
                    Animated.timing(modalTranslateY, {
                        toValue: height,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        closeDiscussionLane();
                        modalTranslateY.setValue(0);
                    });
                } else {
                    // Snap back
                    Animated.spring(modalTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;
    
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const styles = createStyles(height);
    // Extend the frosted band so the top actions sit "inside" the blur.
    const topActionRowHeight = 30;
    const topActionRowExtra = 10; // breathing room under buttons
    const topBarTopInset = 2; // move buttons slightly higher into the blur band
    const topBlurBandHeight = Math.max(insets.top + topBarTopInset + topActionRowHeight + topActionRowExtra, 84);
    const mainHeroHeight = height * 0.46;
    const headerTotalHeight = topBlurBandHeight + mainHeroHeight;
    const topBarPaddingTop = insets.top + topBarTopInset;
    const navigation = useNavigation();
    const { state: authState } = useContext(AuthContext);
    const userRole = authState?.role || '';
    const rewardedAdUnitId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID;
    const { showRewardedAd, isLoaded: isAdLoaded } = useRewardedAd(rewardedAdUnitId);
    const { showAd: showInterstitial, isLoaded: interstitialReady } = useInterstitialAd();

    const AD_FREE_ROLES = ['journalist', 'contributor', 'admin', 'publisher'];
    const shouldShowAds = !AD_FREE_ROLES.includes(userRole);

    useEffect(() => {
        articlesReadCount += 1;
    }, []);

    // Same NewsHome instance can get new params (e.g. open another article from Author Profile); keep state in sync.
    useEffect(() => {
        const { article: nextArticle, articleId: nextArticleId } = route.params || {};
        if (nextArticle != null) {
            setArticle(nextArticle);
            setPendingInitialArticle(false);
        } else if (nextArticleId != null && String(nextArticleId).length > 0) {
            setArticle(null);
            setPendingInitialArticle(true);
        }
    }, [route.params?.article, route.params?.articleId]);

    const handleGoBack = useCallback(async () => {
        if (shouldShowAds && interstitialReady && articlesReadCount % 3 === 0) {
            await showInterstitial();
        }
        navigation.goBack();
    }, [shouldShowAds, interstitialReady, showInterstitial, navigation]);

    // Cooldown timer for ads
    const [adCooldownSeconds, setAdCooldownSeconds] = useState(0);
    const adCooldownTimerRef = useRef(null);

    // Discussion lanes from API, with title/description resolved for current language
    const lang = appLanguage === 'fr' ? 'fr' : 'en';
    const displayDiscussionLanes = React.useMemo(() => {
        const lanes = article?.discussionLanes || [];
        return lanes.map((lane) => {
            const tEn = lane.translations?.en;
            const tFr = lane.translations?.fr;
            const title = (lang === 'fr' ? tFr?.title : tEn?.title) || tEn?.title || tFr?.title || lane.key || '';
            const description = (lang === 'fr' ? tFr?.description : tEn?.description) || tEn?.description || tFr?.description || '';
            const laneType = lane.laneType === 'binary' ? 'binary' : 'open';
            return {
                ...lane,
                laneType,
                polarizing: Boolean(lane.polarizing) || laneType === 'binary',
                id: lane._id || lane.key,
                title,
                description,
                commentCount: laneCounts[lane.key] ?? lane.commentCount ?? 0,
            };
        });
    }, [article?.discussionLanes, lang, laneCounts]);

    const fetchLaneCounts = useCallback(async () => {
        if (!article?._id) return;
        try {
            const response = await SikiyaAPI.get(`/comments/article/${article._id}/lane-counts`);
            if (response.data?.laneCounts) {
                setLaneCounts(response.data.laneCounts);
            }
        } catch (err) {
            // Non-critical — lane counts from the article payload are the fallback
        }
    }, [article?._id]);

    useEffect(() => {
        if (article?._id && displayDiscussionLanes.length > 0) {
            fetchLaneCounts();
        }
    }, [article?._id, displayDiscussionLanes.length, fetchLaneCounts]);

    const getJournalistName = useCallback(() => {
        if (!article?.journalist) return i18n.t('article.unknownAuthor');

        if (article.journalist.displayName) {
            return article.journalist.displayName;
        }

        if (article.journalist.journalist?.displayName) {
            return article.journalist.journalist.displayName;
        }

        const firstname = article.journalist.firstname || article.journalist.journalist?.firstname || '';
        const lastname = article.journalist.lastname || article.journalist.journalist?.lastname || '';

        if (firstname || lastname) {
            return `${firstname} ${lastname}`.trim();
        }

        return i18n.t('article.unknownAuthor');
    }, [article]);

    const openDiscussionLane = useCallback((lane) => {
        setSelectedLane(lane);
        setDiscussionModalVisible(true);
    }, []);

    /** Same resolution as category chip so lane UI matches when one of group/category is missing on payload */
    const articleGroupForTheming = article?.article_group || article?.category;

    const discussionPalette = React.useMemo(
        () => getDiscussionLanePalette(articleGroupForTheming),
        [articleGroupForTheming]
    );

    const handleBinaryLaneVote = useCallback(
        async (lane, side) => {
            const id = getArticleIdString(article);
            if (!id) return;
            const hadUserVote = Boolean(lane.voteSummary?.userSide);
            if (hadUserVote && lane.voteSummary?.userSide === side) {
                openDiscussionLane(lane);
                return;
            }
            setLaneVotingKey(lane.key);
            try {
                const res = await SikiyaAPI.put(
                    `/articles/${id}/lanes/${encodeURIComponent(lane.key)}/vote`,
                    { side }
                );
                const vs = res.data?.voteSummary;
                if (!vs) return;
                setArticle((prev) => ({
                    ...prev,
                    discussionLanes: (prev.discussionLanes || []).map((l) =>
                        l.key === lane.key ? { ...l, voteSummary: vs } : l
                    ),
                }));
                if (!hadUserVote) {
                    openDiscussionLane({ ...lane, voteSummary: vs });
                }
            } catch (err) {
                Alert.alert(
                    'Error',
                    err?.response?.data?.error || err.message || 'Could not save your vote.'
                );
            } finally {
                setLaneVotingKey(null);
            }
        },
        [article, openDiscussionLane]
    );

    const closeDiscussionLane = useCallback(() => {
        setDiscussionModalVisible(false);
        setSelectedLane(null);
    }, []);

    /** Prefer route params so id is correct on first paint when the screen is reused (state may still hold the previous article). */
    const activeArticleId = React.useMemo(() => {
        const p = route.params || {};
        if (p.articleId != null && String(p.articleId).length > 0) {
            return String(p.articleId);
        }
        const fromParamArticle = getArticleIdString(p.article);
        if (fromParamArticle) return fromParamArticle;
        return getArticleIdString(article);
    }, [route.params?.articleId, route.params?.article, article?._id, article?.id]);

    // Fetch full article when we only have an id, or when the payload has no discussion lanes
    // (e.g. search / saved / profile lists omit them; home feed includes them).
    useEffect(() => {
        const id = activeArticleId;
        if (!id) return;

        // Only enrich when lanes were never loaded (omit key). Empty [] means "no lanes for category" — do not refetch.
        // Require article id to match resolved id so we don't skip fetch after params swap on a reused screen.
        const articleMatches =
            article != null && getArticleIdString(article) === String(id);
        const lanesWereLoaded =
            articleMatches && article.discussionLanes !== undefined;
        if (lanesWereLoaded) return;

        let cancelled = false;
        const load = async () => {
            try {
                const response = await SikiyaAPI.get(`/articles/${id}`);
                if (cancelled) return;
                setArticle((prev) => mergeArticleDetail(prev, response.data));
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                if (!cancelled) setPendingInitialArticle(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeArticleId, article?.discussionLanes, article?._id, article?.id]);

    // Get article_other_images directly from the article prop
    const articleOtherImages = article?.article_other_images || [];

    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    // Fetch comment quota for main comments (general users)
    const fetchCommentQuota = useCallback(async () => {
        try {
            setQuotaLoading(true);
            const res = await SikiyaAPI.get('/user/comments/quota');
            setCommentQuota(res.data);
        } catch (err) {
            console.error('Error fetching comment quota:', err?.response?.data || err.message);
            setCommentQuota(null);
        } finally {
            setQuotaLoading(false);
        }
    }, []);

    const handleUnlockComment = useCallback(() => {
        if (userRole !== 'general') return;
        
        // Check cooldown
        if (adCooldownSeconds > 0) {
            Alert.alert(
                'Please Wait',
                `You just watched an ad! The next ad will be ready in ${adCooldownSeconds} seconds.\n\nThis cooldown ensures the next ad has time to load properly.`,
                [{ text: 'OK' }]
            );
            return;
        }
        
        handleWatchAd();
    }, [handleWatchAd, userRole, adCooldownSeconds]);

    const handleUpgrade = useCallback(() => {
        navigation.navigate('UserProfileGroup', {
            screen: 'SubscriptionSettings',
            params: {
                screen: 'MembershipSettings'
            }
        });
    }, [navigation]);

    const handleWatchAd = useCallback(async () => {
        if (!isAdLoaded) {
            Alert.alert(
                'Ad Still Loading', 
                'Rewarded ads can take 30-60 seconds to fully load and be ready to show.\n\nPlease wait a bit longer and try again in 15-20 seconds.',
                [{ text: 'OK' }]
            );
            return;
        }

        let earned = false;
        try {
            earned = await showRewardedAd();
        } catch (error) {
            console.error('Error showing rewarded ad:', error);
        }

        if (!earned) {
            return;
        }

        try {
            setQuotaLoading(true);
            await SikiyaAPI.post('/user/comments/unlock');
            await fetchCommentQuota();
            
            // Start cooldown timer (60 seconds)
            startAdCooldown(60);
        } catch (err) {
            console.error('Error unlocking comment:', err?.response?.data || err.message);
            Alert.alert('Unlock failed', err?.response?.data?.error || 'Please try again.');
        } finally {
            setQuotaLoading(false);
        }
    }, [isAdLoaded, showRewardedAd, fetchCommentQuota]);
    
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

    const onSendComment = async (text) => {
        // Handle sending the comment
        if (!text || !article._id) return;
        if (userRole === 'general' && commentQuota && (commentQuota.remaining ?? 0) <= 0) {
            Alert.alert('Limit reached', 'You reached your free main comments limit for today.');
            return;
        }

        try {
            setCommentLoading(true); // Set loading state to true
            
            const payload = {
                comment_article_id: article._id,
                comment_content: text,
                mainComment: true,
            };
            if (selectedLane?.key) {
                payload.discussion_lane_key = selectedLane.key;
            }

            const response = await SikiyaAPI.post('/comment/main/new', payload);

            if (response.status === 201) {
                setRefreshCommentsKey(prevKey => prevKey + 1);
                setModalVisible(false);
                setCommentQuota(prev => prev ? {
                    ...prev,
                    remaining: prev.remaining !== undefined ? Math.max(0, prev.remaining - 1) : prev.remaining,
                    used: prev.used !== undefined ? prev.used + 1 : prev.used,
                } : prev);
                setArticle(prev => ({
                    ...prev,
                    number_of_comments: (prev.number_of_comments || 0) + 1
                }));
                if (selectedLane?.key) {
                    setLaneCounts(prev => ({
                        ...prev,
                        [selectedLane.key]: (prev[selectedLane.key] || 0) + 1
                    }));
                }
                await fetchCommentQuota();
            } else {
                console.error('Error sending comment:', response);
            }

        } catch (error) {
            if (error?.response?.status === 403) {
                Alert.alert(
                    'Limit reached',
                    error?.response?.data?.error || 'Main comment limit reached for today.'
                );
            } else {
                console.error('Error sending comment:', error);
            }
        } finally {
            // We don't set commentLoading to false here because FeedbackContainer will do it
            // after it's done refreshing the comments
        }
    };

    const onSendReply = async (text) => {
        if (!text || !replyingToComment?.commentId || !article._id) return;
        try {
            setCommentLoading(true);
            const payload = {
                comment_article_id: article._id,
                comment_content: text,
                reply_to_comment_id: replyingToComment.commentId,
            };
            if (selectedLane?.key) {
                payload.discussion_lane_key = selectedLane.key;
            }
            const response = await SikiyaAPI.post('/comment/reply', payload);
            if (response.status === 201 || response.status === 200) {
                setReplyingToComment(null);
                setRefreshCommentsKey(prevKey => prevKey + 1);
                setArticle(prev => ({
                    ...prev,
                    number_of_comments: (prev.number_of_comments || 0) + 1
                }));
                if (selectedLane?.key) {
                    setLaneCounts(prev => ({
                        ...prev,
                        [selectedLane.key]: (prev[selectedLane.key] || 0) + 1
                    }));
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

    const images = article && articleOtherImages && articleOtherImages.length > 0
        ? [article.article_front_image, ...articleOtherImages]
        : [article?.article_front_image].filter(Boolean);

    const activeHeaderImageUri =
        images.length > 0
            ? getImageUrl(images[Math.min(currentImageIndex, images.length - 1)])
            : null;

    const getJournalistDisplayNameForNav = () => {
        const j = article?.journalist;
        if (!j) return undefined;
        const nested = j.journalist;
        const dn = (j.displayName || nested?.displayName || '').trim();
        if (dn) return dn;
        const fn = j.firstname || nested?.firstname;
        const ln = j.lastname || nested?.lastname;
        const combined = [fn, ln].filter(Boolean).join(' ').trim();
        return combined || undefined;
    };

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
            const displayName = getJournalistDisplayNameForNav();
            navigation.navigate('AuthorProfile', {
                userId: journalistId,
                ...(displayName ? { displayName } : {}),
            });
            console.log('Navigating to author profile:', journalistId);
        } else {
            console.warn('Could not find journalist ID for navigation');
        }
    };

    // Track article view and reading time (per activeArticleId — ref no longer blocks a second article on a reused screen)
    useEffect(() => {
        if (!activeArticleId) return;

        const trackView = async () => {
            try {
                await SikiyaAPI.post(`/article/${activeArticleId}/track/view`);
            } catch (error) {
                console.error('Error tracking article view:', error);
            }
        };
        trackView();

        startTimeRef.current = Date.now();

        const contentMatchesId = getArticleIdString(article) === activeArticleId;
        const contentForEstimate = contentMatchesId ? article?.article_content || '' : '';
        const wordCount = contentForEstimate.split(/\s+/).filter(Boolean).length;
        // Floor so list/deep-link payloads without content yet still credit reading until merge fills body
        const estimatedMinutes = Math.max(10, Math.ceil(wordCount / 200));

        readTimeIntervalRef.current = setInterval(async () => {
            try {
                const timeSpent = (Date.now() - startTimeRef.current) / (1000 * 60);
                if (timeSpent >= 0.5) {
                    await SikiyaAPI.post(`/article/${activeArticleId}/track/read`, {
                        minutes_read: Math.min(timeSpent, estimatedMinutes),
                    });
                    startTimeRef.current = Date.now();
                }
            } catch (error) {
                console.error('Error tracking article read time:', error);
            }
        }, 30000);

        return () => {
            if (readTimeIntervalRef.current) {
                clearInterval(readTimeIntervalRef.current);
                readTimeIntervalRef.current = null;
            }
            if (startTimeRef.current) {
                const finalTimeSpent = (Date.now() - startTimeRef.current) / (1000 * 60);
                if (finalTimeSpent >= 0.5) {
                    SikiyaAPI.post(`/article/${activeArticleId}/track/read`, {
                        minutes_read: Math.min(finalTimeSpent, estimatedMinutes),
                    }).catch((err) => console.error('Error tracking final read time:', err));
                }
            }
        };
    }, [activeArticleId]);

    //console.log('Fetched article:', article);

    if (!article) {
        if (pendingInitialArticle) {
            return (
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={styles.articleShellMinimal}>
                        <TouchableOpacity
                            onPress={handleGoBack}
                            style={[styles.topBarButton, main_Style.genButtonElevation, { backgroundColor: 'rgba(0,0,0,0.48)' }]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="arrow-back" size={24} color={generalTextColor} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }
        return (
            <SafeAreaView style={main_Style.safeArea}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons name="document-text-outline" size={40} color={withdrawnTitleColor} />
                    </View>
                    <Text style={styles.errorText}>
                        {i18n.t('article.articleNotFound')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const articleCategory = article.article_group || article.category;
    const categoryColor = getHomeCategoryChipColor(articleCategory);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Persistent frosted safe-area strip (stays while scrolling) */}
            <View style={[styles.headerTopBlurStrip, { height: topBlurBandHeight, width }]} pointerEvents="none">
                {/* Clip image strictly to strip bounds (avoids subpixel “leak” under blur) */}
                <View style={styles.headerTopBlurImageClip} pointerEvents="none">
                    {activeHeaderImageUri ? (
                        <Image
                            defaultSource={require('../../../assets/functionalImages/FrontImagePlaceholder.png')}
                            source={{ uri: activeHeaderImageUri }}
                            resizeMode="cover"
                            style={StyleSheet.absoluteFillObject}
                        />
                    ) : (
                        <View
                            style={[
                                StyleSheet.absoluteFillObject,
                                { backgroundColor: '#2a2420' },
                            ]}
                        />
                    )}
                </View>
                <BlurView
                    intensity={Platform.OS === 'ios' ? 52 : 48}
                    tint="light"
                    style={StyleSheet.absoluteFillObject}
                    experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
                />
                <View style={styles.headerTopGlassVeil} pointerEvents="none" />
                <View style={styles.headerTopBlurBottomMask} pointerEvents="none" />
            </View>

            {/* Persistent top bar */}
            <View style={[styles.topBar, { paddingTop: topBarPaddingTop }]} pointerEvents="box-none">
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={[styles.topBarButton, main_Style.genButtonElevation]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={generalActiveOpacity}
                >
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.topBarRight} pointerEvents="auto">
                    <View style={styles.bookmarkButtonWrapper}>
                        <BookmarkIcon
                            articleId={article._id}
                            savedStatus={article.saved}
                            size={22}
                            centered
                            heroHeader
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.topBarButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="share-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView
                style={styles.scrollViewContainer}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Header Section */}
                <View style={[styles.headerContainer, { minHeight: headerTotalHeight }]}>
                    <View style={[styles.headerCarouselWrap, { paddingTop: topBlurBandHeight }]}>
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
                            style={{ height: mainHeroHeight }}
                            renderItem={({ item }) => (
                                <Image
                                    style={[styles.headerImage, { width, height: mainHeroHeight }, main_Style.genContentElevation]}
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
                    </View>

                    <View
                        style={[
                            styles.imageOverlay,
                            {
                                top: topBlurBandHeight,
                                height: mainHeroHeight,
                            },
                        ]}
                        pointerEvents="none"
                    />

                    {/* Category Tag */}
                    {articleCategory && (
                        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
                            <Text style={styles.categoryText}>{articleCategory}</Text>
                        </View>
                    )}

                    {/* Meta Info (slider dots only in header) */}
                    <View style={styles.headerContent}>
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
                    {/* Title and post time / location */}
                    <Text style={styles.articleTitleInContent}>{article.article_title}</Text>
                    <View style={styles.locationDateRow}>
                        <View style={styles.locationDateLeft}>
                            <View style={styles.locationInfo}>
                                <Ionicons name="location" size={14} color={withdrawnTitleColor} />
                                <Text style={styles.locationTextInContent} numberOfLines={1}>
                                    {article.location || i18n.t('flashNews.defaultLocation')}
                                </Text>
                            </View>
                            <Text style={styles.metaSeparator}>·</Text>
                            <View style={styles.dateInlineWrap}>
                                <Ionicons name="time-outline" size={14} color={withdrawnTitleColor} />
                                <Text style={styles.dateTextInContent}>
                                    {(() => {
                                        if (!article.published_on) return '';
                                        const date = new Date(article.published_on);
                                        const day = date.getDate();
                                        const month = date.toLocaleString('en-US', { month: 'short' });
                                        return `${day} ${month}`;
                                    })()}
                                </Text>
                            </View>
                        </View>
                        <LikeButton articleId={article._id} initialLikes={article.number_of_likes || 0} />
                    </View>

                    {/* Source/Author Info */}
                    <View style={styles.sourceContainer}>
                        <TouchableOpacity
                            onPress={goToAuthorProfile}
                            activeOpacity={0.7}
                            style={styles.sourceInfo}
                        >
                            <View style={[styles.sourceLogoContainer, main_Style.genContentElevation]}>
                                <Image
                                    source={article.journalist?.profile_picture 
                                        ? { uri: getImageUrl(article.journalist.profile_picture)  } 
                                        : require('../../../assets/functionalImages/ProfilePic.png')}
                                    style={styles.sourceLogo}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.sourceDetails}>
                                <View style={styles.sourceNameRow}>
                                    <Text style={styles.sourceName}>
                                        {(() => {
                                            if (!article.journalist) return i18n.t('article.unknownAuthor');
                                            
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
                                            
                                            return i18n.t('article.unknownAuthor');
                                        })()}
                                    </Text>
                                </View>
                                
                                <Text style={styles.authorName}>
                                    {article.journalist?.journalist_affiliation || 
                                     article.journalist?.affiliation || 
                                     article.journalist?.journalist?.journalist_affiliation ||
                                     article.journalist?.journalist?.affiliation ||
                                     i18n.t('article.defaultAffiliation')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.trustScoreBlock}>
                            <TrustScoreRing score={getJournalistTrustScore(article)} />
                            <Text style={styles.trustScoreCaption}>{i18n.t('profile.trust')}</Text>
                        </View>
                    </View>

                    {/* Article Highlight (Summary/Major Idea) */}
                    <BannerAdComponent position="bottom" />
                    
                    <View
                        style={[
                            styles.highlightSection,
                            main_Style.genButtonElevation,
                            { borderLeftColor: discussionPalette.accent },
                        ]}
                    >
                        <Text style={[styles.highlightLabel, { color: discussionPalette.accent }]}>
                            {i18n.t('article.highlights')}
                        </Text>
                        <Text style={styles.highlightText}>{article.article_highlight}</Text>
                    </View>

                    {/* Full Article Content */}
                    <View style={styles.fullContentSection}>
                        <Text style={styles.fullContentLabel}>{i18n.t('article.fullArticle')}</Text>
                        <Text style={styles.articleContent}>{article.article_content}</Text>
                    </View>
                    <View style={styles.horizontalRule} />
                    
                    {/* Discussion lanes (section + cards) */}
                    <View style={styles.commentsSection}>
                        {displayDiscussionLanes.length > 0 && (
                            <View
                                style={[
                                    styles.discussionLanesSection,
                                    main_Style.genContentElevation,
                                    {
                                        borderLeftColor: discussionPalette.accent,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.discussionLanesSectionTitle,
                                        { color: discussionPalette.accent },
                                    ]}
                                >
                                    {t('article.discussionLanes')}
                                </Text>
                                <Text style={styles.discussionLanesSectionHint}>
                                    {t('article.discussionLanesHint')}
                                </Text>
                                <View style={styles.discussionLanesContainer}>
                                    {displayDiscussionLanes.map((lane) => (
                                        <DiscussionLaneCard
                                            key={lane.id}
                                            lane={lane}
                                            palette={discussionPalette}
                                            lang={lang}
                                            commentCount={lane.commentCount ?? 0}
                                            onOpenOpenLane={openDiscussionLane}
                                            onBinaryVote={handleBinaryLaneVote}
                                            onJoinBinaryLane={openDiscussionLane}
                                            voting={laneVotingKey === lane.key}
                                            joinDiscussionLabel={t('comments.joinDiscussion')}
                                            oneCommentLabel={t('comments.oneComment') || 'comment'}
                                            manyCommentsLabel={t('comments.manyComments') || 'comments'}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                transparent
                visible={discussionModalVisible}
                animationType="none"
                onRequestClose={closeDiscussionLane}
            >
                <View style={styles.modalBackdrop}>
                    <Animated.View 
                        style={[
                            styles.modalSheet,
                            {
                                transform: [{ translateY: modalTranslateY }],
                            },
                        ]}
                    >
                        {selectedLane && (
                            <View>
                                

                                {/* Lane flag with close button */}
                                <View
                                    style={[
                                        styles.modalLaneFlag,
                                        // keep lane identity via accent + icon; avoid heavy saturated header fill
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
                                        onPress={closeDiscussionLane}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="close" size={20} color={withdrawnTitleColor} />
                                    </TouchableOpacity>
                                </View>

                                {/* Article header with image and title 
                                <View style={[styles.modalHeaderRow, { borderBottomColor: selectedLane.backgroundColor, borderBottomWidth: 1.2 }]}>
                                    <Image
                                        style={styles.modalHeaderImage}
                                        defaultSource={require('../../../assets/functionalImages/FrontImagePlaceholder.png')}
                                        source={{ uri: getImageUrl(article.article_front_image) }}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.modalHeaderText}>
                                        <Text style={styles.modalTitle}>{article.article_title}</Text>
                                        {/*<Text style={styles.modalAuthor}>{getJournalistName()}</Text>
                                    </View>
                                </View>
                                */}
                            </View>
                        )}

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
                                    articleId={article._id}
                                    discussionLaneId={selectedLane?.key}
                                    refreshKey={refreshCommentsKey}
                                    commentLoading={commentLoading}
                                    setCommentLoading={setCommentLoading}
                                    onAddCommentPress={() => setModalVisible(true)}
                                    onReplyToComment={(commentId, authorName) => setReplyingToComment({ commentId, authorName })}
                                    onBeforeNavigate={closeDiscussionLane}
                                />
                            </ScrollView>
                            
                            <CommentInputModal
                                onSend={handleSendCommentOrReply}
                                placeholder={t('comments.shareYourPerspective') || t('comments.writeComment') || "Write a comment..."}
                                isLoading={commentLoading}
                                quota={commentQuota}
                                quotaLoading={quotaLoading}
                                onUnlock={handleUnlockComment}
                                onUpgrade={handleUpgrade}
                                userRole={userRole}
                                modalTitle={replyingToComment ? null : selectedLane?.title}
                                titleColor={discussionPalette.accent}
                                replyToName={replyingToComment?.authorName ?? null}
                                onCancelReply={replyingToComment ? () => setReplyingToComment(null) : undefined}
                            />
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
            
        </SafeAreaView>
    );
};

export default NewsHome;

