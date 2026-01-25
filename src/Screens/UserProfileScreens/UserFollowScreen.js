import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { 
    main_Style, 
    generalTextFont, 
    generalTextColor, 
    generalTextSize,
    generalTitleColor,
    generalTitleFont,
    generalTitleSize,
    generalTitleFontWeight,
    withdrawnTitleColor,
    articleTitleSize,
    secCardBackgroundColor,
    lightBannerBackgroundColor,
    generalTextFontWeight
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import GoBackButton from '../../../NavComponents/GoBackButton';
import PeopleDisplay from '../../Components/PeopleDisplay';
import SikiyaAPI from '../../../API/SikiyaAPI';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import i18n from '../../utils/i18n';

const UserFollowScreen = ({ route }) => {
    const { follower } = route.params;
    const insets = useSafeAreaInsets();
    const [peopleArray, setPeopleArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // Function to fetch followers
    const fetchFollowers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await SikiyaAPI.get('/followers/users');
            // Extract the follower profiles from the response
            const followers = response.data.followers || [];
            // Map to format expected by PeopleDisplay component and check follow status
            const formattedFollowers = await Promise.all(followers.map(async (item) => {
                const userId = item.follower_id?._id || item._id;
                const isFollowing = await checkFollowStatus(userId);
                return {
                    _id: userId,
                    firstname: item.follower_id?.firstname || i18n.t('profile.unknown'),
                    lastname: item.follower_id?.lastname || '',
                    profile_picture: item.follower_id?.profile_picture || null,
                    displayName: item.follower_id?.displayName || null,
                    role: item.follower_id?.role || null,
                    user_impact: item.follower_id?.user_impact || null,
                    total_upvotes_count: item.follower_id?.total_upvotes_count || 0,
                    isFollowing: isFollowing,
                };
            }));
            setPeopleArray(formattedFollowers);
        } catch (err) {
            console.log('Error fetching followers:', err);
            setError(i18n.t('profile.failedToLoadFollowers'));
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch following list
    const fetchFollowing = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await SikiyaAPI.get('/following/users');
            // Extract the following profiles from the response
            const following = response.data.following || [];
            // Map to format expected by PeopleDisplay component
            // For following list, we know they're all being followed, so isFollowing = true
            const formattedFollowing = following.map(item => ({
                _id: item.following_id?._id || item._id,
                firstname: item.following_id?.firstname || i18n.t('profile.unknown'),
                lastname: item.following_id?.lastname || '',
                profile_picture: item.following_id?.profile_picture || null,
                displayName: item.following_id?.displayName || null,
                role: item.following_id?.role || null,
                user_impact: item.following_id?.user_impact || null,
                total_upvotes_count: item.following_id?.total_upvotes_count || 0,
                isFollowing: true, // All users in following list are being followed
            }));
            setPeopleArray(formattedFollowing);
        } catch (err) {
            console.log('Error fetching following:', err);
            setError(i18n.t('profile.failedToLoadFollowing'));
        } finally {
            setLoading(false);
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
                prevArray.map(person => 
                    person._id === userId 
                        ? { ...person, isFollowing: !currentFollowStatus }
                        : person
                )
            );
        } catch (err) {
            console.log('Error toggling follow status:', err);
            // Optionally show an error message to the user
        }
    };

    // Load data when component mounts
    useEffect(() => {
        if (follower === 'Followers') {
            fetchFollowers();
        } else if (follower === 'Following') {
            fetchFollowing();
        }
    }, [follower]);

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            {/* Header */}
            <View style={[styles.headerContainer]}>
                <View style={styles.leftSpacer}>
                    <GoBackButton buttonStyle={styles.backButtonOverride} />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>
                        {follower === 'Followers' 
                            ? i18n.t('profile.followers')
                            : i18n.t('profile.following')
                        }
                    </Text>
                </View>
                <View style={styles.rightSpacer}>
                    <Image 
                        source={require('../../../assets/SikiyaLogoV2/NathanApprovedSikiyaMiniLogo1NB.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={withdrawnTitleColor} />
                    </View>
                    <Text style={styles.errorTitle}>{error}</Text>
                    <Text style={styles.errorSubtext}>{i18n.t('profile.tryAgainLater')}</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    {peopleArray.length > 0 ? (
                        peopleArray.map((journalist, idx) => (
                            <PeopleDisplay 
                                key={journalist._id || idx}
                                journalist={journalist}
                                onFollowToggle={handleFollowToggle}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons 
                                    name={follower === 'Followers' ? "people-outline" : "person-add-outline"} 
                                    size={56} 
                                    color={withdrawnTitleColor} 
                                />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {follower === 'Followers' 
                                    ? i18n.t('profile.noFollowers')
                                    : i18n.t('profile.noFollowing')
                                }
                            </Text>
                            <Text style={styles.emptyMessage}>
                                {follower === 'Followers'
                                    ? i18n.t('profile.noFollowersMessage')
                                    : i18n.t('profile.noFollowingMessage')
                                }
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        //backgroundColor: 'red',
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: secCardBackgroundColor,
    },
    leftSpacer: {
        width: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    backButtonOverride: {
        position: 'absolute',
        left: 16,
        top: -20,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
    },
    rightSpacer: {
        width: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    logo: {
        position: 'absolute',
        right: 16,
        top: -20,
        width: 44,
        height: 44,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 50,
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
    errorTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default UserFollowScreen;