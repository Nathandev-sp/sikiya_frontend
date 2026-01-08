import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { 
    cardBackgroundColor, 
    generalActiveOpacity, 
    generalTextColor, 
    generalTextFont, 
    generalTitleFont, 
    main_Style, 
    MainBrownSecondaryColor, 
    secCardBackgroundColor, 
    settingsStyles, 
    withdrawnTitleColor,
    generalSmallTextSize,
    generalTextSize,
    generalTextFontWeight,
    generalTitleFontWeight
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { Context as AuthContext } from '../../Context/AuthContext';

const NotificationPreferencesScreen = () => {
    const { state } = useContext(AuthContext);
    const isJournalist = state?.role === 'journalist';
    const [preferences, setPreferences] = useState({
        new_article: true,
        new_video: true,
        comment_reply: true,
        new_comment: true,
        new_follower: true,
        article_approved: true,
        video_approved: true,
        article_rejected: true,
        video_rejected: true,
        article_first_like: true,
        article_milestone_likes: true,
        article_milestone_comments: true,
        video_milestone_comments: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Notification categories and their items
    const allNotificationCategories = [
        {
            title: 'Content Notifications',
            icon: 'newspaper-outline',
            items: [
                { key: 'new_article', label: 'New Articles Published', description: 'Get notified when journalists you follow publish new articles' },
                { key: 'new_video', label: 'New Videos Published', description: 'Get notified when journalists you follow publish new videos' },
            ]
        },
        {
            title: 'Engagement Notifications',
            icon: 'chatbubbles-outline',
            items: [
                { key: 'comment_reply', label: 'Comment Replies', description: 'Get notified when someone replies to your comments' },
                { key: 'new_comment', label: 'New Comments on Your Content', description: 'Get notified when someone comments on your articles or videos', journalistOnly: true },
                { key: 'new_follower', label: 'New Followers', description: 'Get notified when someone starts following you' },
            ]
        },
        {
            title: 'Your Content Status',
            icon: 'checkmark-circle-outline',
            journalistOnly: true,
            items: [
                { key: 'article_approved', label: 'Article/Video Approved', description: 'Get notified when your content is approved and published' },
                { key: 'article_rejected', label: 'Article/Video Rejected', description: 'Get notified when your content is rejected' },
            ]
        },
        {
            title: 'Milestones',
            icon: 'trophy-outline',
            journalistOnly: true,
            items: [
                { key: 'article_first_like', label: 'First Like', description: 'Get notified when someone likes your article for the first time' },
                { key: 'article_milestone_likes', label: '1000 Likes Achievement', description: 'Get notified when your article reaches 1000 likes' },
                { key: 'article_milestone_comments', label: '25 Comments Achievement', description: 'Get notified when your article reaches 25 comments' },
                { key: 'video_milestone_comments', label: 'Video Comments Milestone', description: 'Get notified when your video reaches 25 comments' },
            ]
        }
    ];

    // Filter categories and items based on user role
    const notificationCategories = allNotificationCategories
        .filter(category => {
            // Hide entire category if it's journalist-only and user is not a journalist
            if (category.journalistOnly && !isJournalist) {
                return false;
            }
            return true;
        })
        .map(category => ({
            ...category,
            items: category.items.filter(item => {
                // Hide individual items that are journalist-only if user is not a journalist
                if (item.journalistOnly && !isJournalist) {
                    return false;
                }
                return true;
            })
        }))
        .filter(category => category.items.length > 0); // Remove categories with no items

    // Fetch preferences from backend
    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const response = await SikiyaAPI.get('/user/notification-preferences');
            if (response.data.success && response.data.preferences) {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            Alert.alert(
                'Error',
                'Failed to load notification preferences. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = async (key, value) => {
        // Optimistically update UI
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        try {
            setSaving(true);
            const response = await SikiyaAPI.put('/user/notification-preferences', {
                preferences: { [key]: value }
            });

            if (!response.data.success) {
                // Revert on failure
                setPreferences(preferences);
                Alert.alert(
                    'Error',
                    'Failed to update notification preference. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error updating notification preference:', error);
            // Revert on error
            setPreferences(preferences);
            Alert.alert(
                'Error',
                'Failed to update notification preference. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={MainBrownSecondaryColor} />
                    <Text style={styles.loadingText}>Loading preferences...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="notifications-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Notification Preferences</Text>
                </View>

                {notificationCategories.map((category, categoryIndex) => (
                    <View key={categoryIndex} style={styles.categoryContainer}>
                        <View style={styles.categoryHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={category.icon} size={20} color={withdrawnTitleColor} />
                            </View>
                            <Text style={styles.categoryTitle}>{category.title}</Text>
                        </View>

                        <View style={[styles.preferencesContainer, main_Style.genButtonElevation]}>
                            {category.items.map((item, itemIndex) => (
                                <View 
                                    key={item.key} 
                                    style={[
                                        styles.preferenceItem,
                                        itemIndex < category.items.length - 1 && styles.preferenceItemBorder
                                    ]}
                                >
                                    <View style={styles.preferenceTextContainer}>
                                        <Text style={styles.preferenceLabel}>{item.label}</Text>
                                        <Text style={styles.preferenceDescription}>{item.description}</Text>
                                    </View>
                                    <Switch
                                        value={preferences[item.key] ?? true}
                                        onValueChange={(value) => updatePreference(item.key, value)}
                                        trackColor={{ false: '#d3d3d3', true: MainBrownSecondaryColor }}
                                        thumbColor={'#fff'}
                                        disabled={saving}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <VerticalSpacer height={30} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    headerDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: generalTextFont,
    },
    categoryContainer: {
        marginBottom: 25,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: withdrawnTitleColor,
        marginLeft: 8,
        fontFamily: generalTitleFont,
    },
    preferencesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 12,
        paddingVertical: 8,
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    preferenceItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    preferenceTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    preferenceLabel: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        marginBottom: 4,
        fontFamily: generalTitleFont,
    },
    preferenceDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
});

export default NotificationPreferencesScreen;

