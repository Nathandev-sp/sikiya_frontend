import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import SikiyaAPI from "../../../API/SikiyaAPI";
import AppScreenBackgroundColor, { articleTitleFont, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, main_Style, mainBrownColor, cardBackgroundColor, generalActiveOpacity, MainBrownSecondaryColor, lightBannerBackgroundColor, genBtnBackgroundColor, articleTitleSize, generalTitleFontWeight, XsmallTextSize, withdrawnTitleSize, generalTextFontWeight, withdrawnTitleColor, generalTextSize, generalSmallTextSize, commentTextSize, generalSmallLineHeight, generalTitleSize, generalLineHeight } from "../../styles/GeneralAppStyle";
import SecNewsCartMap from "../../Components/SecNewsCartMap";
import FollowButton from '../../Components/FollowButton';
import GoBackButton from "../../../NavComponents/GoBackButton";
import BigLoaderAnim from "../../Components/LoadingComps/BigLoaderAnim";
import ArticleLoadingState from "../../Components/LoadingComps/ArticleLoading";
import { getImageUrl } from "../../utils/imageUrl";
import i18n from "../../utils/i18n";

const AuthorProfileScreen = ({ route }) => {
    const { userId } = route.params;
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

                    {/* Not Premium User Card */}
                    <View style={styles.notPremiumCard}>
                        <View style={styles.notPremiumIconCircle}>
                            <Ionicons name="person-outline" size={56} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.notPremiumText}>
                            {i18n.t('profile.notPremiumUser')}
                        </Text>
                    </View>
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

    return (
        <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.scrollViewContainer}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
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

                {/* Profile Card */}
                <View style={[styles.profileCard, main_Style.genButtonElevation]}>
                    {/* Name - Centered */}
                    <Text style={styles.name}>{user.displayName}</Text>
                    
                    {/* Image and Stats Row */}
                    <View style={styles.imageAndStatsRow}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={user.profile_picture
                                    ? { uri: getImageUrl(user.profile_picture) }
                                    : require('../../../assets/functionalImages/ProfilePic.png')}
                                style={styles.profilePic}
                            />
                            {user.isSikiyaCertified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                        <View style={[styles.statsRow]}>
                            <View style={styles.statItem}>
                                <View style={styles.statContent}>
                                    <Ionicons name="shield-checkmark" size={18} color="#4CAF50" />
                                    <Text style={styles.statLabel}>
                                        {user.role === 'journalist' ? i18n.t('profile.trustScore') : i18n.t('profile.respectScore')}
                                    </Text>
                                    <Text style={styles.statText}>
                                        {user.role === 'journalist' 
                                            ? (user.trust_score || 0) 
                                            : (user.respect_score || 0)}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <View style={styles.statContent}>
                                    <Ionicons name="people" size={18} color={MainBrownSecondaryColor} />
                                    <Text style={styles.statLabel}>{i18n.t('profile.followers')}</Text>
                                    <Text style={styles.statText}>{formatFollowers(user.number_of_followers)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    {/* Follow Button and Share Button Row */}
                    <View style={styles.buttonRow}>
                        <View style={[styles.followButtonContainer, main_Style.genButtonElevation]}>
                            {isOwnProfile ? (
                                <TouchableOpacity 
                                    style={styles.selfProfileButton}
                                    activeOpacity={0.8}
                                    disabled
                                >
                                    <Text style={styles.selfProfileText}>{i18n.t('profile.selfProfile')}</Text>
                                </TouchableOpacity>
                            ) : (
                                <FollowButton 
                                    initialFollowed={isFollowing}
                                    onToggle={handleFollowToggle}
                                />
                            )}
                        </View>
                        <TouchableOpacity 
                            style={[styles.shareButton, main_Style.genButtonElevation]}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="share-outline" size={20} color={MainBrownSecondaryColor} />
                        </TouchableOpacity>
                    </View>
                    </View>

                    {/* Full Name, Role, Affiliation and Area of Focus Section */}
                    <View style={[styles.infoSection]}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoHeader}>
                                    <Ionicons name="person" size={16} color={MainBrownSecondaryColor} />
                                    <Text style={styles.infoTitle}>{i18n.t('profile.fullName')}</Text>
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {user.firstname} {user.lastname}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <View style={styles.infoHeader}>
                                    <Ionicons name="medal" size={16} color={MainBrownSecondaryColor} />
                                    <Text style={styles.infoTitle}>{i18n.t('profile.role')}</Text>
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {formatRole(user.role)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            {user.journalist_affiliation && (
                                <View style={styles.infoItem}>
                                    <View style={styles.infoHeader}>
                                        <Ionicons name="business" size={16} color={MainBrownSecondaryColor} />
                                        <Text style={styles.infoTitle}>{i18n.t('profile.affiliation')}</Text>
                                    </View>
                                    <Text style={styles.infoText} numberOfLines={2}>
                                        {user.journalist_affiliation}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.infoItem}>
                                <View style={styles.infoHeader}>
                                    <Ionicons name="megaphone" size={16} color={MainBrownSecondaryColor} />
                                    <Text style={styles.infoTitle}>{i18n.t('profile.areaOfFocus')}</Text>
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {user.area_of_expertise || i18n.t('profile.notSpecified')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.descriptionSection}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text" size={18} color={MainBrownSecondaryColor} />
                            <Text style={styles.sectionTitle}>{i18n.t('profile.about')}</Text>
                        </View>
                        <Text style={styles.description}>
                            {user.journalist_description || user.bio || i18n.t('profile.noDescriptionAvailable')}
                        </Text>
                    </View>
                

                {/* Recent Articles Section */}
                {user.articles && user.articles.length > 0 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.contentContainer}>
                            <View style={styles.sectionHeaderRow}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="newspaper-outline" size={20} color={generalTitleColor} />
                                    <Text style={styles.recentArticleText}>{i18n.t('profile.recentArticles')}</Text>
                                </View>
                                <Text style={styles.articleCount}>
                                    {user.articles.length} {user.articles.length === 1 ? i18n.t('profile.article') : i18n.t('profile.articles_plural')}
                                </Text>
                            </View>
                            <SecNewsCartMap articles={user.articles}/>
                        </View>
                    </>
                )}
            </ScrollView>
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
    profileCard: {
        backgroundColor: genBtnBackgroundColor,
        marginHorizontal: 12,
        marginTop: 16,
        marginBottom: 12,
        borderWidth: 0.1,
        borderColor: MainBrownSecondaryColor,
        padding: 12,
        borderRadius: 12,
    },
    name: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: articleTitleFont,
        textAlign: 'center',
        marginBottom: 8,
    },
    imageAndStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: '#F8F8F8',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: withdrawnTitleSize,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 4,
        marginBottom: 8,
    },
    statText: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
        marginBottom: 4,
    },
    statDivider: {
        width: 1,
        height: 45,
        backgroundColor: '#D0D0D0',
        marginHorizontal: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    followButtonContainer: {
        flex: 1,
    },
    shareButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: '#D0D0D0',
        marginLeft: 12,
        //shadowColor: '#000',
        //shadowOffset: {
        //    width: 0,
        //    height: 1,
        //},
        //shadowOpacity: 0.08,
        //shadowRadius: 2,
        //elevation: 1,
        minWidth: 48,
    },
    profileImageContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePic: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: mainBrownColor,
        borderWidth: 0,
        borderColor: AppScreenBackgroundColor,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    infoSection: {
        marginTop: 12,
        marginBottom: 8,
        //  022backgroundColor: '#F8F8F8',
        borderRadius: 12,

    },
    infoRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    infoItem: {
        flex: 1,
        //backgroundColor: '#F8F8F8',
        padding: 4,
        minHeight: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        //backgroundColor: 'red',
    },
    infoTitle: {
        fontSize: generalSmallTextSize,
        fontWeight: generalTextFontWeight,
        color: MainBrownSecondaryColor,
        marginLeft: 8,
        fontFamily: generalTitleFont,
    },
    infoText: {
        fontSize: commentTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: generalSmallLineHeight,
        textAlign: 'center',
    },
    descriptionSection: {
        marginBottom: 8,
        paddingTop: 8,
        paddingHorizontal: 4,
        marginHorizontal: 16,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: MainBrownSecondaryColor,
        marginLeft: 8,
        fontFamily: generalTitleFont,
    },
    description: {
        fontSize: generalTextSize,
        color: generalTextColor,
        textAlign: 'left',
        lineHeight: generalLineHeight,
        fontFamily: generalTextFont,
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: 4,
        marginHorizontal: 12,
    },
    contentContainer: {
        paddingHorizontal: 12,
        paddingTop: 4,
        //backgroundColor: 'red',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    recentArticleText: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        marginLeft: 8,
        fontFamily: generalTitleFont,
    },
    articleCount: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
    },
    notPremiumContainer: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    notPremiumCard: {
        backgroundColor: genBtnBackgroundColor,
        marginHorizontal: 12,
        marginTop: 40,
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.1,
        borderColor: MainBrownSecondaryColor,
        ...main_Style.genButtonElevation,
    },
    notPremiumIconContainer: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notPremiumIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    notPremiumText: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: generalLineHeight,
        paddingHorizontal: 16,
    },
    selfProfileButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: MainBrownSecondaryColor,
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        shadowColor: MainBrownSecondaryColor,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    selfProfileText: {
        fontWeight: '600',
        fontSize: 12,
        fontFamily: generalTextFont,
        letterSpacing: 0.3,
        color: '#FFFFFF',
    },
});

export default AuthorProfileScreen;