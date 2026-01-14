import React, {useState, useEffect, useCallback, useRef} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import AppScreenBackgroundColor, { generalTextFont, generalTextColor, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, genBtnBackgroundColor, withdrawnTitleColor, lightBannerBackgroundColor, generalSmallTextSize, generalTextFontWeight } from '../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../Components/UI/VerticalSpacer';
import SecondaryNewsCart from '../Components/SecondaryNewscart';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import GoBackButton from '../../NavComponents/GoBackButton';
import SikiyaAPI from '../../API/SikiyaAPI';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { getImageUrl } from '../utils/imageUrl';

const UserProfileScreen = ({route}) => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [imageVersion, setImageVersion] = useState(Date.now()); // Cache-busting version
    const isFirstMount = useRef(true);

    // Get preloaded user profile data from route params
    const preloadedUserProfile = route?.params?.preloadedUserProfile;

    //console.log("User Profile:", userProfile);

    const fetchUserProfile = async () => {
        try {
            if (!preloadedUserProfile) {
            setIsLoading(true);
            const response = await SikiyaAPI.get('/user/profile/');
            setUserProfile(response.data);
            } else {
                console.log("Using preloaded user profile");
                setUserProfile(preloadedUserProfile);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await SikiyaAPI.get('/user/profile/');
            setUserProfile(response.data);
            // Update image version to force refresh
            setImageVersion(Date.now());
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

    useEffect(() => {
        fetchUserProfile();
        isFirstMount.current = false;
    }, []);

    // Refresh profile when screen comes into focus (e.g., returning from ProfileSettingScreen)
    useFocusEffect(
        useCallback(() => {
            // Skip refresh on initial mount (handled by useEffect)
            // Only refresh when returning to the screen - always fetch fresh data from API
            if (!isFirstMount.current) {
                const refreshProfile = async () => {
                    try {
                        const response = await SikiyaAPI.get('/user/profile/');
                        setUserProfile(response.data);
                        // Update image version to force refresh
                        setImageVersion(Date.now());
                    } catch (error) {
                        console.error('Error fetching user profile:', error.message);
                    }
                };
                refreshProfile();
            }
        }, [])
    );

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
            { refreshing && (<MediumLoadingState />)}
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
            >
                {/* Header with Logo and Settings */}
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

                {/* Profile Card */}
                <View style={[styles.profileCard, main_Style.genButtonElevation]}>
                    <View style={styles.profileCardContent}>
                        {/* Profile photo */}
                        <View style={styles.profileImageContainer}>
                            <Image 
                                key={`${userProfile?.profile_picture || 'default'}-${imageVersion}`}
                                source={
                                    userProfile?.profile_picture 
                                        ? { 
                                            uri: `${getImageUrl(userProfile.profile_picture)}?v=${imageVersion}`,
                                            cache: 'reload'
                                          }
                                        : require('../../assets/functionalImages/ProfilePic.png')
                                } 
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        </View>
                        
                        {/* Right side: Name and Stats */}
                        <View style={styles.profileInfoContainer}>
                            {/* Name */}
                            <Text style={styles.userName}>
                                {userProfile?.displayName || "Display Name to be added"}
                            </Text>

                            {/* Impact and Engagement Stats Card */}
                            <View style={styles.statsCard}>
                                <View style={styles.statsContainerLeft}>
                                    <View style={styles.statItemLeft}>
                                        <Text style={styles.statNumber}>{(userProfile?.trust_score || userProfile?.respect_score || 0)}%</Text>
                                        <Text style={styles.statLabelLeft}>Trust Score</Text>
                                    </View>
                                    
                                    <View style={styles.statItemLeft}>
                                        <Text style={styles.statNumber}>{userProfile?.total_upvotes_count || 0}</Text>
                                        <Text style={styles.statLabelLeft}>Total Upvotes</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Following/Followers stats */}
                    <View style={styles.followStatsContainer}>
                        <TouchableOpacity 
                            style={styles.statItem}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('UserFollow',{follower: 'Following'})}
                        >
                            <Text style={styles.statNumber}>{userProfile?.number_following || 0}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.statItem}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('UserFollow',{follower: 'Followers'})}
                        >
                            <Text style={styles.statNumber}>{userProfile?.number_of_followers || 0}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Saved Articles Section */}
                <View style={styles.savedSection}>
                    <View style={styles.savedSectionHeader}>
                        <Ionicons name="bookmark" size={20} color={MainSecondaryBlueColor} />
                        <Text style={styles.savedSectionTitle}>Saved Articles</Text>
                        {userProfile?.saved_articles?.length > 0 && (
                            <Text style={styles.articleCount}>({userProfile.saved_articles.length})</Text>
                        )}
                    </View>

                    <View style={styles.articlesContainer}>
                        {userProfile?.saved_articles?.length > 0 ? (
                            userProfile.saved_articles.map(article => (
                                <SecondaryNewsCart key={article._id} article={article} />
                            ))
                        ) : (
                            <View style={styles.noArticlesContainer}>
                                <Ionicons name="bookmark-outline" size={48} color={withdrawnTitleColor} />
                                <Text style={styles.noArticlesText}>No saved articles yet</Text>
                                <Text style={styles.noArticlesSubtext}>Articles you bookmark will appear here</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <VerticalSpacer height={20} />
            </ScrollView>
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
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
    profileCard: {
        backgroundColor: genBtnBackgroundColor,
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 12,
        padding: 16,
        paddingTop: 24,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#E0E0E0',
    },
    profileCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    profileInfoContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'flex-start',
    },
    statsCard: {
        marginTop: 4,
    },
    followStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    profileImageContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        padding: 2.5,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: MainSecondaryBlueColor,
        backgroundColor: AppScreenBackgroundColor,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40.5,
        overflow: 'hidden',
    },
    userName: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        textAlign: 'left',
        marginBottom: 0,
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        marginBottom: 4,
        paddingHorizontal: 8,
    },
    statsContainerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-start',
        marginBottom: 4,
        paddingHorizontal: 0,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        padding:4,
        //backgroundColor: 'red',
    },
    statItemLeft: {
        alignItems: 'flex-start',
        flex: 1,
        padding:4,
    },
    statIconContainer: {
        marginBottom: 6,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: generalTitleFontWeight,
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        marginBottom: 4,
    },
    tierText: {
        fontSize: 18,
    },
    statLabel: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        textAlign: 'center',
    },
    statLabelLeft: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        textAlign: 'left',
    },
    statDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    savedSection: {
        marginTop: 0,
    },
    savedSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },
    savedSectionTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        flex: 1,
    },
    articleCount: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
    },
    articlesContainer: {
        marginHorizontal: 12,
    },
    noArticlesContainer: {
        padding: 48,
        alignItems: 'center',
        backgroundColor: lightBannerBackgroundColor,
        borderRadius: 12,
        marginHorizontal: 12,
    },
    noArticlesText: {
        fontSize: generalTextSize,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: generalTitleFontWeight,
        marginTop: 16,
        marginBottom: 4,
    },
    noArticlesSubtext: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
    },
});

export default UserProfileScreen;