import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, StatusBar, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
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
    generalTitleFontWeight,
    commentTextSize
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { Context as AuthContext } from '../../Context/AuthContext';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import { requestNotificationPermissions, getExpoPushToken, registerDeviceWithBackend } from '../../services/notificationService';

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
    const [hasNotificationPermission, setHasNotificationPermission] = useState(true);
    const [checkingPermission, setCheckingPermission] = useState(true);
    
    // Quiet hours state
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
    const [quietHoursStart, setQuietHoursStart] = useState(22);
    const [quietHoursEnd, setQuietHoursEnd] = useState(7);

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

    // Check notification permission and fetch preferences
    useEffect(() => {
        checkNotificationPermission();
    }, []);

    const checkNotificationPermission = async () => {
        try {
            setCheckingPermission(true);
            
            // Check if user has a push token registered
            const pushToken = await getExpoPushToken();
            
            if (!pushToken) {
                setHasNotificationPermission(false);
                setCheckingPermission(false);
                setLoading(false);
                return;
            }
            
            setHasNotificationPermission(true);
            await fetchPreferences();
        } catch (error) {
            console.error('Error checking notification permission:', error);
            setHasNotificationPermission(false);
        } finally {
            setCheckingPermission(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const response = await SikiyaAPI.get('/user/notification-preferences');
            if (response.data.success) {
                if (response.data.preferences) {
                    setPreferences(response.data.preferences);
                }
                // Get quiet hours settings from same response
                setQuietHoursEnabled(response.data.quietHoursEnabled || false);
                setQuietHoursStart(response.data.quietHoursStart || 22);
                setQuietHoursEnd(response.data.quietHoursEnd || 7);
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

    const handleEnableNotifications = async () => {
        try {
            // Request notification permissions
            const granted = await requestNotificationPermissions();
            
            if (!granted) {
                Alert.alert(
                    'Notifications Disabled',
                    'Notifications are disabled in your device settings. Would you like to open settings to enable them?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Open Settings', 
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
                return;
            }

            // Get and register push token
            const pushToken = await getExpoPushToken();
            if (pushToken) {
                await registerDeviceWithBackend(pushToken);
                setHasNotificationPermission(true);
                await fetchPreferences();
            } else {
                Alert.alert(
                    'Error',
                    'Failed to register for notifications. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            Alert.alert(
                'Error',
                'Failed to enable notifications. Please try again.',
                [{ text: 'OK' }]
            );
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
    
    const updateQuietHours = async (enabled, start, end) => {
        try {
            setSaving(true);
            const response = await SikiyaAPI.put('/user/notification-preferences', {
                quietHoursEnabled: enabled,
                quietHoursStart: start,
                quietHoursEnd: end
            });

            if (response.data.success) {
                setQuietHoursEnabled(enabled);
                setQuietHoursStart(start);
                setQuietHoursEnd(end);
            } else {
                Alert.alert(
                    'Error',
                    'Failed to update quiet hours. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error updating quiet hours:', error);
            Alert.alert(
                'Error',
                'Failed to update quiet hours. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSaving(false);
        }
    };
    
    const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    if (loading || checkingPermission) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                    <Text style={styles.loadingText}>
                        {checkingPermission ? 'Checking notification status...' : 'Loading preferences...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show prompt to enable notifications if user doesn't have permission
    if (!hasNotificationPermission) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.centerContent}>
                    {/* Header Section */}
                    <View style={settingsStyles.headerSection}>
                        <Ionicons name="notifications-outline" style={settingsStyles.headerIcon} />
                        <Text style={settingsStyles.headerTitle}>Notification Preferences</Text>
                    </View>

                    <View style={styles.notificationPromptContainer}>
                        <View style={styles.notificationIconContainer}>
                            <Ionicons name="notifications-off-outline" size={80} color={withdrawnTitleColor} />
                        </View>
                        
                        <Text style={styles.notificationPromptTitle}>Enable Notifications</Text>
                        <Text style={styles.notificationPromptDescription}>
                            To manage your notification preferences, you need to enable notifications first. 
                            Stay updated with new articles, comments, and interactions from journalists you follow.
                        </Text>

                        <TouchableOpacity 
                            style={[styles.enableButton, main_Style.genButtonElevation]}
                            activeOpacity={generalActiveOpacity}
                            onPress={handleEnableNotifications}
                        >
                            <Ionicons name="notifications" size={24} color="#fff" style={styles.enableButtonIcon} />
                            <Text style={styles.enableButtonText}>Enable Notifications</Text>
                        </TouchableOpacity>

                        <Text style={styles.notificationPromptNote}>
                            You can customize which notifications you receive after enabling them.
                        </Text>
                    </View>
                </ScrollView>
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

                {/* Quiet Hours Section */}
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="moon-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>Quiet Hours</Text>
                    </View>

                    <View style={[styles.preferencesContainer, main_Style.genButtonElevation]}>
                        {/* Enable Quiet Hours */}
                        <View style={styles.preferenceItem}>
                            <View style={styles.preferenceTextContainer}>
                                <Text style={styles.preferenceLabel}>Enable Quiet Hours</Text>
                                <Text style={styles.preferenceDescription}>
                                    Pause push notifications during specific hours. You'll still see them in your notification center.
                                </Text>
                            </View>
                            <Switch
                                value={quietHoursEnabled}
                                onValueChange={(value) => updateQuietHours(value, quietHoursStart, quietHoursEnd)}
                                trackColor={{ false: '#d3d3d3', true: MainBrownSecondaryColor }}
                                thumbColor={'#fff'}
                                disabled={saving}
                            />
                        </View>

                        {/* Quiet Hours Time Range */}
                        {quietHoursEnabled && (
                            <View style={[styles.preferenceItem, styles.timeRangeContainer]}>
                                <View style={styles.timePickerContainer}>
                                    <Text style={styles.timeLabel}>From</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Set Start Time',
                                                'Choose when quiet hours should begin',
                                                Array.from({ length: 24 }, (_, i) => ({
                                                    text: formatHour(i),
                                                    onPress: () => updateQuietHours(quietHoursEnabled, i, quietHoursEnd)
                                                })).concat([{ text: 'Cancel', style: 'cancel' }])
                                            );
                                        }}
                                        disabled={saving}
                                    >
                                        <Text style={styles.timeButtonText}>{formatHour(quietHoursStart)}</Text>
                                        <Ionicons name="chevron-down" size={20} color={withdrawnTitleColor} />
                                    </TouchableOpacity>
                                </View>

                                <Ionicons name="arrow-forward" size={20} color={withdrawnTitleColor} style={styles.arrowIcon} />

                                <View style={styles.timePickerContainer}>
                                    <Text style={styles.timeLabel}>To</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Set End Time',
                                                'Choose when quiet hours should end',
                                                Array.from({ length: 24 }, (_, i) => ({
                                                    text: formatHour(i),
                                                    onPress: () => updateQuietHours(quietHoursEnabled, quietHoursStart, i)
                                                })).concat([{ text: 'Cancel', style: 'cancel' }])
                                            );
                                        }}
                                        disabled={saving}
                                    >
                                        <Text style={styles.timeButtonText}>{formatHour(quietHoursEnd)}</Text>
                                        <Ionicons name="chevron-down" size={20} color={withdrawnTitleColor} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Quiet Hours Info */}
                        {quietHoursEnabled && (
                            <View style={styles.quietHoursInfo}>
                                <Ionicons name="information-circle-outline" size={16} color={MainBrownSecondaryColor} />
                                <Text style={styles.quietHoursInfoText}>
                                    Push notifications will be paused from {formatHour(quietHoursStart)} to {formatHour(quietHoursEnd)}. 
                                    All notifications will still appear in your notification center.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

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
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    centerContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    notificationPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    notificationIconContainer: {
        marginBottom: 25,
    },
    notificationPromptTitle: {
        fontSize: 24,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 15,
        textAlign: 'center',
    },
    notificationPromptDescription: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    enableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginBottom: 20,
        minWidth: 250,
    },
    enableButtonIcon: {
        marginRight: 10,
    },
    enableButtonText: {
        color: '#fff',
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        fontFamily: generalTitleFont,
    },
    notificationPromptNote: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        fontStyle: 'italic',
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
    timeRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    timePickerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 8,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'space-between',
    },
    timeButtonText: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginRight: 8,
    },
    arrowIcon: {
        marginHorizontal: 12,
    },
    quietHoursInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: MainBrownSecondaryColor + '10',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        marginHorizontal: 15,
    },
    quietHoursInfoText: {
        flex: 1,
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginLeft: 8,
        lineHeight: 18,
    },
});

export default NotificationPreferencesScreen;

