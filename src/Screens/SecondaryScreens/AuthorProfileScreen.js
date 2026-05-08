import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Pressable, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import SikiyaAPI from "../../../API/SikiyaAPI";
import AppScreenBackgroundColor, { articleTitleFont, generalTextColor, generalTextFont, generalTitleFont, main_Style, mainBrownColor, generalActiveOpacity, MainBrownSecondaryColor, lightBannerBackgroundColor, genBtnBackgroundColor, withdrawnTitleSize, generalTextFontWeight, withdrawnTitleColor, generalTextSize, generalSmallTextSize, generalLineHeight, generalTitleSize, generalTitleFontWeight, generalTitleColor, homeFeedBackgroundColor, homeScreenPadding, homeCardVerticalGap, PrimBtnColor, mainTitleColor } from "../../styles/GeneralAppStyle";
import SecondaryNewsCart from "../../Components/SecondaryNewscart";
import FollowButton from '../../Components/FollowButton';
import GoBackButton from "../../../NavComponents/GoBackButton";
import BigLoaderAnim from "../../Components/LoadingComps/BigLoaderAnim";
import { getImageUrl } from "../../utils/imageUrl";
import i18n from "../../utils/i18n";
import { useNavigation } from "@react-navigation/native";

const TRUST_RING_SIZE = 78;
const TRUST_RING_STROKE = 6;
const TRUST_RING_LABEL_SPACE = 26;

function TrustScoreRing({ percent, label }) {
    const size = TRUST_RING_SIZE;
    const stroke = TRUST_RING_STROKE;
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const clamped = Math.min(100, Math.max(0, Number(percent) || 0));
    const offset = circumference * (1 - clamped / 100);

    return (
        <View style={styles.trustRingWrap}>
            <View style={styles.trustRingSvgBox}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke="rgba(102, 70, 44, 0.12)"
                        strokeWidth={stroke}
                        fill="none"
                    />
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke={PrimBtnColor}
                        strokeWidth={stroke}
                        fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                </Svg>
                <View style={styles.trustRingCenter} pointerEvents="none">
                    <Text style={styles.trustRingPercent}>{Math.round(clamped)}%</Text>
                </View>
            </View>
            <Text style={styles.trustRingLabel}>{label}</Text>
        </View>
    );
}

const AuthorProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    const userId = route.params?.userId ?? route.params?.authorId;
    const displayNameParam = typeof route.params?.displayName === 'string' ? route.params.displayName.trim() : '';
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNotPremiumUser, setIsNotPremiumUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Function to check if current user follows this user and if it's own profile
    const checkFollowStatus = async (targetUserId) => {
        try {
            const response = await SikiyaAPI.get(`/follow/check/${targetUserId}`);
            // Backend now returns isOwnProfile
            setIsOwnProfile(response.data.isOwnProfile || false);
            return response.data.isFollowing || false;
        } catch (err) {
            console.log('Error checking follow status:', err);
            setIsOwnProfile(false);
            return false;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("Fetching user:", userId);
                const response = await SikiyaAPI.get(`/users/profile/display/${userId}`);
                setUser(response.data);
                setIsNotPremiumUser(false);
                
                // Check if current user follows this user
                const followStatus = await checkFollowStatus(userId);
                setIsFollowing(followStatus);
            } catch (error) {
                // Handle expected errors (404, etc.) gracefully without triggering Expo error overlay
                if (error.response) {
                    // Server responded with error status
                    console.log("User profile not available:", error.response.status);
                    setIsNotPremiumUser(true);
                } else if (error.request) {
                    // Request was made but no response received
                    console.log("No response received from server");
                    setIsNotPremiumUser(true);
                } else {
                    // Something else happened
                    console.log("Error setting up request:", error.message);
                    setIsNotPremiumUser(true);
                }
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUser();
    }, [userId]);

    // Function to handle follow/unfollow action
    const handleFollowToggle = async (currentFollowStatus) => {
        try {
            if (currentFollowStatus) {
                // Unfollow
                await SikiyaAPI.delete(`/follow/${userId}`);
                setIsFollowing(false);
            } else {
                // Follow
                await SikiyaAPI.post(`/follow/${userId}`);
                setIsFollowing(true);
            }
        } catch (err) {
            console.log('Error toggling follow status:', err);
            // Optionally show an error message to the user
        }
    };

    //console.log('Fetched journalist:', journalist);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" />
                <GoBackButton />
                <BigLoaderAnim />
                <Text style={styles.loadingText}>{i18n.t('profile.loadingUserProfile')}</Text>
            </View>
        );
    }

    if (isNotPremiumUser) {
        const goUpgrade = () => {
            navigation.navigate('UserProfileGroup', {
                screen: 'SubscriptionSettings',
                params: { screen: 'MembershipSettings' },
            });
        };

        return (
            <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.notPremiumContainer}>
                    {/* Header with Back Button and Logo */}
                    <View style={styles.headerContainer}>
                        <GoBackButton buttonStyle={styles.backButtonOverride} />
                        <View style={styles.logoContainer}>
                            <Image 
                                source={require('../../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.notPremiumScroll}
                        contentContainerStyle={styles.notPremiumScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.notPremiumCard}>
                            <View style={styles.notPremiumIconCircle}>
                                <Ionicons name="lock-closed-outline" size={34} color={withdrawnTitleColor} />
                            </View>
                            <Text style={styles.notPremiumHeadline} numberOfLines={3}>
                                {displayNameParam || i18n.t('profile.notPremiumHeadline')}
                            </Text>
                            <Text style={styles.notPremiumExplanation}>{i18n.t('profile.notPremiumExplanation')}</Text>
                            <Text style={[styles.notPremiumBenefitPrimaryText, styles.notPremiumIntroLead]}>
                                {i18n.t('profile.notPremiumIntroCombined')}
                            </Text>

                            <View style={styles.notPremiumBenefitsGroup}>
                                <View style={styles.notPremiumBenefitSecondaryRow}>
                                    <Text style={styles.notPremiumBulletMark}>•</Text>
                                    <Text style={styles.notPremiumBenefitSecondaryText}>
                                        {i18n.t('profile.notPremiumBenefitCommentUnlimited')}
                                    </Text>
                                </View>
                                <View style={styles.notPremiumBenefitSecondaryRow}>
                                    <Text style={styles.notPremiumBulletMark}>•</Text>
                                    <Text style={styles.notPremiumBenefitSecondaryText}>
                                        {i18n.t('profile.notPremiumBenefitJoinDiscussions')}
                                    </Text>
                                </View>
                                <View style={styles.notPremiumBenefitSecondaryRow}>
                                    <Text style={styles.notPremiumBulletMark}>•</Text>
                                    <Text style={styles.notPremiumBenefitSecondaryText}>
                                        {i18n.t('profile.notPremiumBenefitShareProfile')}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.notPremiumContrast}>{i18n.t('profile.notPremiumFreeContrast')}</Text>

                            <Pressable
                                style={({ pressed }) => [styles.notPremiumCta, pressed && styles.notPremiumCtaPressed]}
                                onPress={goUpgrade}
                                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                            >
                                <Text style={styles.notPremiumCtaText}>{i18n.t('profile.notPremiumUpgradeCta')}</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={main_Style.safeArea}>
                <StatusBar barStyle="dark-content" />
                <GoBackButton />
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons name="person-outline" size={48} color={withdrawnTitleColor} />
                    </View>
                    <Text style={styles.errorText}>{i18n.t('profile.userNotFound')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Format followers count
    const formatFollowers = (count) => {
        if (!count) return '0';
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    // Format role for display
    const formatRole = (role) => {
        if (!role) return i18n.t('profile.notSpecified');
        const roleMap = {
            'journalist': i18n.t('profile.journalist'),
            'thoughtleader': i18n.t('profile.thoughtLeader'),
            'contributor': i18n.t('profile.contributor'),
            'general': i18n.t('profile.generalUser'),
            'needID': i18n.t('profile.pendingVerification')
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    const journalistAffiliation =
        user.journalist_affiliation && String(user.journalist_affiliation).trim();
    const roleLabel = formatRole(user.role);
    const scorePercent = user.role === 'journalist' ? (user.trust_score ?? 0) : (user.respect_score ?? 0);
    const scoreLabel = user.role === 'journalist' ? i18n.t('profile.trustScore') : i18n.t('profile.respectScore');

    const infoRows = [
        {
            key: 'fullName',
            label: i18n.t('profile.fullName'),
            value: `${user.firstname || ''} ${user.lastname || ''}`.trim() || i18n.t('profile.unknown'),
        },
        { key: 'role', label: i18n.t('profile.role'), value: formatRole(user.role) },
        ...(user.journalist_affiliation
            ? [{ key: 'affiliation', label: i18n.t('profile.affiliation'), value: user.journalist_affiliation }]
            : []),
        {
            key: 'focus',
            label: i18n.t('profile.areaOfFocus'),
            value: user.area_of_expertise || i18n.t('profile.notSpecified'),
        },
    ];

    return (
        <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.profileScreenBody}>
                <View style={styles.profileStickyHeader}>
                    <View style={styles.headerContainer}>
                        <GoBackButton buttonStyle={styles.backButtonOverride} />
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.headerShareButton}
                            activeOpacity={generalActiveOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={i18n.t('common.share')}
                        >
                            <Ionicons name="share-outline" size={22} color={MainBrownSecondaryColor} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    style={styles.scrollViewContainer}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: homeScreenPadding + 8 }}
                    showsVerticalScrollIndicator={false}
                >
                {/* Profile hero — avatar left, name / affiliation / followers / trust+follow on the right */}
                <View style={styles.heroSection}>
                    <View style={styles.heroMainRow}>
                        <View style={styles.heroAvatarShell}>
                            <Image
                                source={user.profile_picture
                                    ? { uri: getImageUrl(user.profile_picture) }
                                    : require('../../../assets/functionalImages/ProfilePic.png')}
                                style={styles.heroAvatar}
                            />
                            {user.isSikiyaCertified && (
                                <View style={styles.heroVerifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                                </View>
                            )}
                        </View>

                        <View style={styles.heroInfoColumn}>
                            <Text style={styles.heroName} numberOfLines={2}>
                                {user.displayName}
                            </Text>
                            {user.role === 'journalist' ? (
                                <Text style={styles.heroSubtitle} numberOfLines={2}>
                                    {journalistAffiliation || roleLabel}
                                </Text>
                            ) : (
                                <View style={styles.heroRoleRow}>
                                    <Text style={styles.heroSubtitle} numberOfLines={2}>
                                        {roleLabel}
                                    </Text>
                                    {user.role === 'contributor' && (
                                        <Image
                                            source={require('../../../assets/OnboardingImages/contributorImage.png')}
                                            style={styles.heroRoleBadgeImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                    {user.role === 'thoughtleader' && (
                                        <Ionicons
                                            name="ribbon"
                                            size={16}
                                            color="#6D28D9"
                                            style={styles.heroRoleBadgeIcon}
                                        />
                                    )}
                                </View>
                            )}
                            <Text style={styles.heroFollowersMeta}>
                                {formatFollowers(user.number_of_followers)} · {i18n.t('profile.followers')}
                            </Text>

                            <View style={styles.heroActionsRow}>
                                <TrustScoreRing percent={scorePercent} label={scoreLabel} />
                                <View style={styles.heroFollowWrap}>
                                    {isOwnProfile ? (
                                        <View style={[styles.selfProfilePill, styles.heroSelfProfilePillStretch]}>
                                            <Ionicons name="person-circle-outline" size={18} color={MainBrownSecondaryColor} />
                                            <Text style={styles.selfProfilePillText}>{i18n.t('profile.selfProfile')}</Text>
                                        </View>
                                    ) : (
                                        <FollowButton
                                            pill
                                            pillStretch
                                            initialFollowed={isFollowing}
                                            onToggle={handleFollowToggle}
                                            followLabel={i18n.t('profile.follow')}
                                            followingLabel={i18n.t('profile.followingButton')}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.infoRowsBlock}>
                    {infoRows.map((row, index) => (
                        <View
                            key={row.key}
                            style={[
                                styles.infoRowLine,
                                index === infoRows.length - 1 && styles.infoRowLineLast,
                            ]}
                        >
                            <Text style={styles.infoRowLabel}>{row.label}</Text>
                            <Text style={styles.infoRowValue} numberOfLines={4}>
                                {row.value}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.descriptionSection}>
                    <View style={styles.aboutSectionHeader}>
                        <View style={styles.aboutAccent} />
                        <Text style={styles.aboutSectionTitle}>{i18n.t('profile.about')}</Text>
                    </View>
                    <Text style={styles.description}>
                        {user.journalist_description || user.bio || i18n.t('profile.noDescriptionAvailable')}
                    </Text>
                </View>

                {/* Recent Articles — layout matches SearchScreen article list (feed background + card spacing) */}
                {user.articles && user.articles.length > 0 && (
                    <View style={styles.articlesFeedSection}>
                        <View style={styles.articlesListHeaderRow}>
                            <View style={styles.articlesListTitleCluster}>
                                <View style={styles.listSectionAccent} />
                                <Text style={styles.listSectionTitle} numberOfLines={1}>
                                    {i18n.t('profile.recentArticles')}
                                </Text>
                            </View>
                            <Text style={styles.articlesCountMeta} numberOfLines={1}>
                                {user.articles.length}{' '}
                                {user.articles.length === 1 ? i18n.t('profile.article') : i18n.t('profile.articles_plural')}
                            </Text>
                        </View>
                        {user.articles.map((article, idx) => (
                            <SecondaryNewsCart
                                key={article._id || idx}
                                article={article}
                            />
                        ))}
                    </View>
                )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppScreenBackgroundColor,
    },
    loadingText: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTextFont,
        marginTop: 16,
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
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
    },
    scrollViewContainer: {
        flex: 1,
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
        justifyContent: 'center',
        paddingVertical: 4,
        paddingTop: 4,
        position: 'relative',
    },
    backButtonOverride: {
        position: 'absolute',
        left: 15,
        top: 4,
        zIndex: 10,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logo: {
        width: 120,
        height: 40,
    },
    headerShareButton: {
        position: 'absolute',
        right: 14,
        top: 2,
        zIndex: 10,
        padding: 8,
    },
    heroSection: {
        width: '100%',
        paddingHorizontal: homeScreenPadding,
        paddingTop: 20,
        paddingBottom: 14,
    },
    heroMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 18,
        width: '100%',
    },
    heroAvatarShell: {
        position: 'relative',
        flexShrink: 0,
    },
    heroInfoColumn: {
        flex: 1,
        minWidth: 0,
        alignItems: 'flex-start',
    },
    heroAvatar: {
        width: 118,
        height: 118,
        borderRadius: 59,
        backgroundColor: mainBrownColor,
        borderWidth: 3,
        borderColor: 'rgba(102, 70, 44, 0.14)',
    },
    heroVerifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#FDFCF8',
        borderRadius: 14,
        padding: 1,
    },
    heroName: {
        fontSize: 26,
        fontWeight: '700',
        color: mainTitleColor,
        fontFamily: articleTitleFont,
        textAlign: 'left',
        letterSpacing: 0.2,
        marginBottom: 4,
        paddingHorizontal: 0,
        lineHeight: 30,
        ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    },
    heroSubtitle: {
        fontSize: withdrawnTitleSize + 1.5,
        fontWeight: '400',
        color: MainBrownSecondaryColor,
        fontFamily: generalTextFont,
        textAlign: 'left',
        lineHeight: 20,
        opacity: 0.92,
        paddingHorizontal: 0,
        marginBottom: 4,
        ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    },
    heroRoleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,
    },
    heroRoleBadgeImage: {
        width: 14,
        height: 14,
    },
    heroRoleBadgeIcon: {
        marginLeft: 0,
    },
    heroFollowersMeta: {
        fontSize: generalSmallTextSize - 0.5,
        fontWeight: '500',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        letterSpacing: 0.25,
        marginBottom: 6,
        ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    },
    heroActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
        width: '100%',
        paddingHorizontal: 0,
    },
    heroFollowWrap: {
        flex: 1,
        minWidth: 0,
        alignItems: 'stretch',
        justifyContent: 'center',
        minHeight: TRUST_RING_SIZE + TRUST_RING_LABEL_SPACE,
    },
    heroSelfProfilePillStretch: {
        width: '100%',
        alignSelf: 'stretch',
    },
    trustRingWrap: {
        width: TRUST_RING_SIZE,
        alignItems: 'center',
    },
    trustRingSvgBox: {
        width: TRUST_RING_SIZE,
        height: TRUST_RING_SIZE,
        position: 'relative',
    },
    trustRingCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trustRingPercent: {
        fontSize: 15,
        fontWeight: '700',
        color: PrimBtnColor,
        fontFamily: generalTitleFont,
        letterSpacing: -0.2,
    },
    trustRingLabel: {
        marginTop: 4,
        fontSize: 9,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    selfProfilePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 24,
        paddingVertical: 11,
        paddingHorizontal: 18,
        backgroundColor: '#FFFCF9',
        borderWidth: 1.5,
        borderColor: 'rgba(102, 70, 44, 0.22)',
        shadowColor: '#2C2416',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    selfProfilePillText: {
        fontWeight: '700',
        fontSize: 14,
        fontFamily: generalTextFont,
        letterSpacing: 0.2,
        color: MainBrownSecondaryColor,
    },
    infoRowsBlock: {
        marginHorizontal: homeScreenPadding,
        marginBottom: 8,
        paddingTop: 4,
        paddingLeft: 6,
        paddingRight: 6,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(102, 70, 44, 0.12)',
    },
    infoRowLine: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(102, 70, 44, 0.1)',
        gap: 16,
    },
    infoRowLineLast: {
        borderBottomWidth: 0,
    },
    infoRowLabel: {
        flexShrink: 0,
        width: '36%',
        maxWidth: 130,
        fontSize: 11,
        fontWeight: '500',
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.85,
        textTransform: 'uppercase',
        lineHeight: 16,
        paddingTop: 2,
    },
    infoRowValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: mainTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'right',
        lineHeight: 22,
    },
    descriptionSection: {
        marginTop: 8,
        marginBottom: 14,
        marginHorizontal: homeScreenPadding,
        paddingVertical: 22,
        paddingHorizontal: 22,
        backgroundColor: '#F2EFE3',
        borderRadius: 14,
        borderLeftWidth: 3,
        borderLeftColor: PrimBtnColor,
        shadowColor: '#2C2416',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    aboutSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    aboutAccent: {
        width: 2,
        height: 16,
        borderRadius: 2,
        backgroundColor: PrimBtnColor,
    },
    aboutSectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: generalTextSize,
        color: 'rgba(58, 39, 36, 0.82)',
        textAlign: 'left',
        lineHeight: 26,
        fontFamily: generalTextFont,
        fontStyle: 'italic',
        fontWeight: '400',
    },
    articlesFeedSection: {
        width: '100%',
        marginTop: 10,
        paddingTop: homeCardVerticalGap + 4,
        paddingBottom: 4,
        backgroundColor: homeFeedBackgroundColor,
    },
    articlesListHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: homeScreenPadding,
        paddingTop: 6,
        paddingBottom: 8,
        gap: 10,
    },
    articlesListTitleCluster: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
        minWidth: 0,
    },
    listSectionAccent: {
        width: 2,
        height: 18,
        borderRadius: 2,
        backgroundColor: PrimBtnColor,
    },
    listSectionTitle: {
        flex: 1,
        fontSize: 13,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: mainTitleColor,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    articlesCountMeta: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        flexShrink: 0,
        maxWidth: '42%',
        textAlign: 'right',
    },
    notPremiumContainer: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    notPremiumScroll: {
        flex: 1,
    },
    notPremiumScrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 28,
    },
    notPremiumCard: {
        backgroundColor: homeFeedBackgroundColor,
        marginHorizontal: 0,
        marginTop: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'stretch',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(44, 36, 22, 0.1)',
        ...main_Style.genButtonElevation,
    },
    notPremiumIconContainer: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notPremiumIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'center',
    },
    notPremiumHeadline: {
        fontFamily: articleTitleFont,
        fontSize: 20,
        color: PrimBtnColor,
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 26,
    },
    notPremiumExplanation: {
        fontSize: generalTextSize,
        color: '#5C6470',
        fontFamily: generalTextFont,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 14,
    },
    notPremiumIntroLead: {
        textAlign: 'center',
        marginBottom: 12,
    },
    notPremiumBenefitsGroup: {
        marginBottom: 4,
    },
    notPremiumBenefitPrimaryText: {
        fontFamily: generalTitleFont,
        fontWeight: '700',
        fontSize: 17,
        color: PrimBtnColor,
        lineHeight: 24,
    },
    notPremiumBenefitSecondaryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        paddingLeft: 2,
    },
    notPremiumBulletMark: {
        fontSize: 15,
        color: '#9CA3AF',
        marginRight: 8,
        lineHeight: 22,
        width: 14,
    },
    notPremiumBenefitSecondaryText: {
        flex: 1,
        fontSize: 14,
        color: '#5C6470',
        fontFamily: generalTextFont,
        fontWeight: '400',
        lineHeight: 21,
    },
    notPremiumContrast: {
        marginTop: 14,
        marginBottom: 28,
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        fontWeight: '400',
        color: withdrawnTitleColor,
        lineHeight: 19,
    },
    notPremiumCta: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notPremiumCtaPressed: {
        opacity: 0.92,
    },
    notPremiumCtaText: {
        fontFamily: generalTitleFont,
        fontWeight: '700',
        fontSize: generalTextSize,
        color: AppScreenBackgroundColor,
    },
});

export default AuthorProfileScreen;