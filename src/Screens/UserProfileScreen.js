import React, {useState, useEffect, useCallback, useRef, useContext, useMemo} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, StatusBar, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import AppScreenBackgroundColor, { generalTextFont, generalTextColor, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, genBtnBackgroundColor, withdrawnTitleColor, generalSmallTextSize, generalTextFontWeight, articleTitleSize, PrimBtnColor, mainTitleColor, articleTitleFont, withdrawnTitleSize, homeFeedBackgroundColor, homeScreenPadding, homeCardVerticalGap } from '../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../Components/UI/VerticalSpacer';
import SecondaryNewsCart from '../Components/SecondaryNewscart';
import TrustScoreRing from '../Components/TrustScoreRing';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SikiyaAPI from '../../API/SikiyaAPI';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { getImageUrl } from '../utils/imageUrl';
import i18n from '../utils/i18n';
import { Context as AuthContext } from '../Context/AuthContext';
import BannerAd from '../Components/Ads/BannerAd';

const UserProfileScreen = ({route}) => {
    const navigation = useNavigation();
    const { state: authState, fetchTrialStatus } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isFirstMount = useRef(true);
    const [trialInfo, setTrialInfo] = useState({
        isOnTrial: false,
        daysRemaining: 0
    });

    const preloadedUserProfile = route?.params?.preloadedUserProfile;

    const roleLabel = useMemo(() => {
        const role = authState?.role;
        if (!role) return i18n.t('profile.generalUser');
        const map = {
            journalist: i18n.t('profile.journalist'),
            contributor: i18n.t('profile.contributor'),
            thoughtleader: i18n.t('profile.thoughtLeader'),
            general: i18n.t('profile.generalUser'),
            admin: 'Admin',
            publisher: 'Publisher',
        };
        return map[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }, [authState?.role]);

    const scoreForRing = userProfile
        ? (userProfile.trust_score ?? userProfile.respect_score ?? 0)
        : 0;
    const scoreRingCaption =
        authState?.role === 'journalist' || authState?.role === 'contributor'
            ? i18n.t('profile.trustScore')
            : i18n.t('profile.respectScore');

    const trialTotalDays = 7;
    const trialRemainingPct = useMemo(() => {
        if (!trialInfo?.isOnTrial) return 0;
        const remaining = Number(trialInfo?.daysRemaining ?? 0);
        if (!Number.isFinite(remaining)) return 0;
        const pct = remaining / trialTotalDays;
        return Math.max(0, Math.min(1, pct));
    }, [trialInfo?.isOnTrial, trialInfo?.daysRemaining]);

    const fetchUserProfile = useCallback(async () => {
        try {
            if (!preloadedUserProfile) {
                setIsLoading(true);
                const response = await SikiyaAPI.get('/user/profile/');
                setUserProfile(response.data);
            } else {
                console.log("Using preloaded user profile");
                setUserProfile(preloadedUserProfile);
            }
            
            const trialStatus = await fetchTrialStatus();
            if (trialStatus) {
                setTrialInfo({
                    isOnTrial: trialStatus.isOnTrial,
                    daysRemaining: trialStatus.daysRemaining
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [preloadedUserProfile, fetchTrialStatus]);

    // Only fetch on mount
    useEffect(() => {
        if (isFirstMount.current) {
            fetchUserProfile();
            isFirstMount.current = false;
        }
    }, []);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (!isFirstMount.current) {
                onRefresh();
            }
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await SikiyaAPI.get('/user/profile/');
            const newProfilePicture = response.data.profile_picture;
            
            // Only update image version if profile picture actually changed
            if (newProfilePicture !== previousProfilePicture.current) {
                setImageVersion(Date.now());
                previousProfilePicture.current = newProfilePicture;
            }
            
            setUserProfile(response.data);
            
            // Refresh trial status
            const trialStatus = await fetchTrialStatus();
            if (trialStatus) {
                setTrialInfo({
                    isOnTrial: trialStatus.isOnTrial,
                    daysRemaining: trialStatus.daysRemaining
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // If user pulls down beyond -140, trigger refresh
        if (offsetY < -140 && !isLoading) {
            onRefresh();
        }
    };

    const previousProfilePicture = useRef(null); // Track previous profile picture URL
    const [imageVersion, setImageVersion] = useState(Date.now()); // Cache-busting version

    const handleSettingsPress = () => {
        navigation.navigate('Settings', {firstname: userProfile?.firstname, lastname: userProfile?.lastname});
    }

    const handleTestNotification = async () => {
        try {
            const response = await SikiyaAPI.post('/user/test-notification');
            if (response.data.success) {
                Alert.alert('Success', 'Test notification sent! Check your device for the notification.');
            } else {
                Alert.alert('Error', 'Failed to send notification: ' + (response.data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to send notification';
            Alert.alert('Error', errorMessage);
        }
    }

    if (isLoading) {
        return (
            <SafeAreaView style={[main_Style.safeArea]} edges={['top', 'left', 'right']}>
                <BigLoaderAnim />
            </SafeAreaView>
        );
    }
    //console.log("User Profile:", userProfile.profile_picture);

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <BannerAd />
            {/* Remove this line: */}
            {/* {refreshing && (<MediumLoadingState />)} */}
            <View style={styles.profileScreenBody}>
                <View style={styles.profileStickyHeader}>
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.headerButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.settingsButton, main_Style.genButtonElevation]}
                                onPress={handleSettingsPress}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="settings-outline" size={24} color={generalTitleColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    onScroll={handleScroll}
                >
                {/* My profile surface — warm paper + left accent (distinct from author-profile hero, still editorial) */}
                <View style={[styles.selfSurface, main_Style.genButtonElevation]}>
                    <View style={styles.selfTopRow}>
                        <View style={styles.selfAvatarShell}>
                            <View style={styles.selfAvatarClip}>
                                <Image
                                    key={`${userProfile?.profile_picture || 'default'}-${imageVersion}`}
                                    source={
                                        userProfile?.profile_picture
                                            ? {
                                                  uri: `${getImageUrl(userProfile.profile_picture)}?v=${imageVersion}`,
                                              }
                                            : require('../../assets/functionalImages/ProfilePic.png')
                                    }
                                    style={styles.selfAvatar}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                        <View style={styles.selfIdentityCol}>
                            <View style={styles.selfNameRow}>
                                <Text style={styles.selfDisplayName} numberOfLines={2}>
                                    {userProfile?.displayName || i18n.t('profile.displayNamePlaceholder')}
                                </Text>
                            </View>
                            <View style={styles.selfRoleRow}>
                                <Text style={styles.selfRoleLine} numberOfLines={1}>
                                    {roleLabel}
                                </Text>
                                {authState.role === 'contributor' && (
                                    <Image
                                        source={require('../../assets/OnboardingImages/contributorImage.png')}
                                        style={styles.contributorBadgeImage}
                                        resizeMode="contain"
                                    />
                                )}
                                {authState.role === 'thoughtleader' && (
                                    <Ionicons
                                        name="ribbon"
                                        size={14}
                                        color="#6D28D9"
                                        style={styles.thoughtLeaderBadgeIcon}
                                    />
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.selfMetricsRow}>
                        <View style={styles.selfMetricBlock}>
                            <TrustScoreRing score={scoreForRing} size={54} strokeWidth={4} />
                            <Text style={styles.selfMetricCaption}>{scoreRingCaption}</Text>
                        </View>
                        <View style={styles.selfMetricDivider} />
                        <View style={styles.selfMetricBlock}>
                            <Ionicons name="arrow-up-circle-outline" size={22} color={MainBrownSecondaryColor} style={styles.upvoteIcon} />
                            <Text style={styles.selfUpvoteNumber}>{userProfile?.total_upvotes_count ?? 0}</Text>
                            <Text style={styles.selfMetricCaption}>{i18n.t('profile.totalUpvotes')}</Text>
                        </View>
                    </View>

                    <View style={styles.selfFollowRow}>
                        <TouchableOpacity
                            style={styles.selfFollowTap}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('UserFollow', { follower: 'Following' })}
                        >
                            <Text style={styles.selfFollowNumber}>{userProfile?.number_following ?? 0}</Text>
                            <Text style={styles.selfFollowLabel}>{i18n.t('profile.following')}</Text>
                        </TouchableOpacity>
                        <View style={styles.selfFollowDivider} />
                        <TouchableOpacity
                            style={styles.selfFollowTap}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('UserFollow', { follower: 'Followers' })}
                        >
                            <Text style={styles.selfFollowNumber}>{userProfile?.number_of_followers ?? 0}</Text>
                            <Text style={styles.selfFollowLabel}>{i18n.t('profile.followers')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Free Trial Banner */}
                {trialInfo.isOnTrial &&
                    trialInfo.daysRemaining > 0 &&
                    authState?.role !== 'contributor' &&
                    authState?.role !== 'thoughtleader' && (
                    <View style={[styles.trialBanner, main_Style.genButtonElevation]}>
                        {/* Decorative Background Elements */}
                        <View style={styles.trialBannerDecoTop} />
                        <View style={styles.trialBannerDecoBottom} />

                        {/* Content Section */}
                        <View style={styles.trialContentSection}>
                            <Text style={styles.trialTitle}>{i18n.t('trial.title')}</Text>
                            <Text style={styles.trialMessage}>
                                {i18n.t('trial.message')}
                            </Text>
                            
                            {/* Progress Bar Section */}
                            <View style={styles.trialProgressSection}>
                                <View style={styles.trialProgressHeader}>
                                    <View style={styles.trialDaysContainer}>
                                        <Text style={styles.trialDaysNumber}>{trialInfo.daysRemaining}</Text>
                                        <Text style={styles.trialDaysLabel}>
                                            {trialInfo.daysRemaining === 1 ? i18n.t('trial.dayRemaining') : i18n.t('trial.daysRemaining')}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.trialCtaButton}
                                        onPress={() =>
                                            navigation.navigate('SubscriptionSettings', {
                                                screen: 'MembershipSettings',
                                            })
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.trialCtaText}>{i18n.t('trial.upgrade', { defaultValue: 'Upgrade Now' })}</Text>
                                        <Ionicons name="arrow-forward" size={16} color={AppScreenBackgroundColor} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.trialProgressBarContainer}>
                                    <View
                                        style={[
                                            styles.trialProgressBarFill,
                                            { width: `${Math.round(trialRemainingPct * 100)}%` },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Saved articles — same feed rhythm as author profile / search */}
                <View style={styles.savedFeedSection}>
                    <View style={styles.savedListHeaderRow}>
                        <View style={styles.savedTitleCluster}>
                            <View style={styles.savedListAccent} />
                            <Text style={styles.savedListTitle} numberOfLines={1}>
                                {i18n.t('profile.savedArticles')}
                            </Text>
                        </View>
                        {userProfile?.saved_articles?.length > 0 ? (
                            <Text style={styles.savedCountMeta} numberOfLines={1}>
                                {userProfile.saved_articles.length}{' '}
                                {userProfile.saved_articles.length === 1
                                    ? i18n.t('profile.article')
                                    : i18n.t('profile.articles_plural')}
                            </Text>
                        ) : null}
                    </View>
                    {userProfile?.saved_articles?.length > 0 ? (
                        userProfile.saved_articles.map((article) => (
                            <SecondaryNewsCart key={article._id} article={article} />
                        ))
                    ) : (
                        <View style={styles.noArticlesInFeed}>
                            <View style={styles.noArticlesIconContainer}>
                                <Ionicons name="bookmark-outline" size={44} color={withdrawnTitleColor} />
                            </View>
                            <Text style={styles.noArticlesText}>{i18n.t('profile.noSavedArticles')}</Text>
                            <Text style={styles.noArticlesSubtext}>{i18n.t('profile.noSavedArticlesMessage')}</Text>
                        </View>
                    )}
                </View>
                
                <VerticalSpacer height={20} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileScreenBody: {
        flex: 1,
    },
    profileStickyHeader: {
        backgroundColor: AppScreenBackgroundColor,
        zIndex: 2,
        elevation: 3,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(102, 70, 44, 0.1)',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        paddingHorizontal: homeScreenPadding,
        paddingBottom: 12,
        width: '100%',
    },
    logoContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 40,
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    testNotificationButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: genBtnBackgroundColor,
        borderWidth: 1.5,
        borderColor: MainBrownSecondaryColor,
    },
    settingsButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: genBtnBackgroundColor,
    },
    selfSurface: {
        marginHorizontal: homeScreenPadding,
        marginTop: 14,
        marginBottom: 16,
        paddingTop: 14,
        paddingBottom: 2,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: '#FDFCF8',
        borderWidth: 1,
        borderColor: 'rgba(102, 70, 44, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: PrimBtnColor,
        ...Platform.select({
            ios: {
                shadowColor: '#2C2416',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 14,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    selfTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    selfAvatarShell: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: AppScreenBackgroundColor,
        borderWidth: 2,
        borderColor: 'rgba(102, 70, 44, 0.14)',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selfAvatarClip: {
        width: 88,
        height: 88,
        borderRadius: 44,
        overflow: 'hidden',
        backgroundColor: AppScreenBackgroundColor,
    },
    selfAvatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },
    selfIdentityCol: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
        minWidth: 0,
    },
    selfNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    selfDisplayName: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: mainTitleColor,
        fontFamily: articleTitleFont,
        letterSpacing: 0.15,
    },
    selfRoleLine: {
        fontSize: withdrawnTitleSize + 1,
        fontWeight: '400',
        color: MainBrownSecondaryColor,
        fontFamily: generalTextFont,
        opacity: 0.95,
    },
    selfRoleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,
    },
    contributorBadgeImage: {
        width: 14,
        height: 14,
    },
    thoughtLeaderBadgeIcon: {
        marginLeft: 0,
    },
    selfMetricsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 4,
        marginBottom: 2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(102, 70, 44, 0.1)',
    },
    selfMetricBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
    },
    selfMetricDivider: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(102, 70, 44, 0.12)',
        marginHorizontal: 4,
    },
    selfMetricCaption: {
        marginTop: 3,
        fontSize: 9,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.85,
        textTransform: 'uppercase',
        opacity: 0.88,
        textAlign: 'center',
    },
    upvoteIcon: {
        marginBottom: 0,
        opacity: 0.9,
    },
    selfUpvoteNumber: {
        fontSize: 17,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        marginTop: 1,
        marginBottom: 0,
    },
    selfFollowRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 4,
    },
    selfFollowTap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    selfFollowNumber: {
        fontSize: 17,
        fontWeight: '700',
        color: mainTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    selfFollowLabel: {
        fontSize: generalSmallTextSize - 0.5,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    selfFollowDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(102, 70, 44, 0.1)',
    },
    trialBanner: {
        backgroundColor: '#F4F1FF',
        marginHorizontal: 12,
        marginBottom: 12,
        padding: 16,
        paddingBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.12)',
    },
    trialBannerDecoTop: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(109, 40, 217, 0.08)',
    },
    trialBannerDecoBottom: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(109, 40, 217, 0.06)',
    },
    trialHeaderSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    trialIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6D28D9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.10)',
    },
    trialBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(109, 40, 217, 0.10)',
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.16)',
    },
    trialBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4C1D95',
        fontFamily: generalTitleFont,
        letterSpacing: 1,
    },
    trialContentSection: {
        marginBottom: 0,
    },
    trialTitle: {
        fontSize: articleTitleSize,
        fontWeight: '700',
        color: '#2E1065',
        fontFamily: generalTitleFont,
        marginBottom: 8,
    },
    trialMessage: {
        fontSize: generalTextSize,
        color: 'rgba(46, 16, 101, 0.82)',
        fontFamily: generalTextFont,
        lineHeight: 22,
        marginBottom: 0,
    },
    trialProgressSection: {
        marginTop: 12,
    },
    trialProgressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    trialDaysContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    trialDaysNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2E1065',
        fontFamily: generalTitleFont,
    },
    trialDaysLabel: {
        fontSize: generalSmallTextSize,
        color: 'rgba(46, 16, 101, 0.72)',
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    trialCtaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6D28D9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
        shadowColor: '#6D28D9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 3,
    },
    trialCtaText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        fontFamily: generalTitleFont,
    },
    trialProgressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(109, 40, 217, 0.12)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    trialProgressBarFill: {
        height: '100%',
        backgroundColor: '#6D28D9',
        borderRadius: 4,
    },
    savedFeedSection: {
        width: '100%',
        marginTop: 4,
        paddingTop: homeCardVerticalGap + 4,
        paddingBottom: 8,
        backgroundColor: homeFeedBackgroundColor,
    },
    savedListHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: homeScreenPadding,
        paddingTop: 6,
        paddingBottom: 8,
        gap: 10,
    },
    savedTitleCluster: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
        minWidth: 0,
    },
    savedListAccent: {
        width: 2,
        height: 18,
        borderRadius: 2,
        backgroundColor: PrimBtnColor,
    },
    savedListTitle: {
        flex: 1,
        fontSize: 13,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: mainTitleColor,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    savedCountMeta: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        flexShrink: 0,
        maxWidth: '42%',
        textAlign: 'right',
    },
    noArticlesInFeed: {
        paddingVertical: 40,
        paddingHorizontal: homeScreenPadding,
        alignItems: 'center',
    },
    noArticlesIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: genBtnBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    noArticlesText: {
        fontSize: generalTitleSize,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: generalTitleFontWeight,
        marginBottom: 8,
        textAlign: 'center',
    },
    noArticlesSubtext: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default UserProfileScreen;