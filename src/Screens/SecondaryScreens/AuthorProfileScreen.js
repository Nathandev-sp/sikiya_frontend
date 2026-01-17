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
                <Text style={styles.loadingText}>Loading user profile...</Text>
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
                        <View style={styles.notPremiumIconContainer}>
                            <Ionicons name="person-outline" size={56} color={MainBrownSecondaryColor} />
                        </View>
                        <Text style={styles.notPremiumText}>
                            The user you selected is not a Sikiya premium user
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={main_Style.safeArea}>
                <Text>User not found.</Text>
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
        if (!role) return 'Not specified';
        const roleMap = {
            'journalist': 'Journalist',
            'thoughtleader': 'Thought Leader',
            'contributor': 'Contributor',
            'general': 'General User',
            'needID': 'Pending Verification'
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
                                        {user.role === 'journalist' ? 'Trust Score' : 'Respect Score'}
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
                                    <Text style={styles.statLabel}>Followers</Text>
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
                                    <Text style={styles.selfProfileText}>Self Profile</Text>
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
                                    <Text style={styles.infoTitle}>Full Name</Text>
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {user.firstname} {user.lastname}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <View style={styles.infoHeader}>
                                    <Ionicons name="medal" size={16} color={MainBrownSecondaryColor} />
                                    <Text style={styles.infoTitle}>Role</Text>
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
                                        <Text style={styles.infoTitle}>Affiliation</Text>
                                    </View>
                                    <Text style={styles.infoText} numberOfLines={2}>
                                        {user.journalist_affiliation}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.infoItem}>
                                <View style={styles.infoHeader}>
                                    <Ionicons name="megaphone" size={16} color={MainBrownSecondaryColor} />
                                    <Text style={styles.infoTitle}>Area of Focus</Text>
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {user.area_of_expertise || 'Not specified'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.descriptionSection}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text" size={18} color={MainBrownSecondaryColor} />
                            <Text style={styles.sectionTitle}>About</Text>
                        </View>
                        <Text style={styles.description}>
                            {user.journalist_description || user.bio || 'No description available.'}
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
                                    <Text style={styles.recentArticleText}>Recent Articles</Text>
                                </View>
                                <Text style={styles.articleCount}>{user.articles.length} {user.articles.length === 1 ? 'article' : 'articles'}</Text>
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