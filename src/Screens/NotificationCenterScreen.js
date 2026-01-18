import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppScreenBackgroundColor, {
    articleTextSize,
    articleTitleSize,
    cardBackgroundColor,
    commentTextSize,
    generalActiveOpacity,
    generalSmallTextSize,
    generalTextColor,
    generalTextFont,
    generalTextFontWeight,
    generalTextSize,
    generalTitleColor,
    generalTitleFont,
    generalTitleFontWeight,
    main_Style,
    MainBrownSecondaryColor,
    secCardBackgroundColor,
    withdrawnTitleColor,
} from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import GoBackButton from '../../NavComponents/GoBackButton';
import VerticalSpacer from '../Components/UI/VerticalSpacer';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import DateConverter from '../Helpers/DateConverter';

const NotificationCenterScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications(1, true);
    }, []);

    const fetchNotifications = async (pageNum = 1, isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await SikiyaAPI.get(`/notifications?page=${pageNum}&limit=20`);
            
            if (response.data.success) {
                const newNotifications = response.data.notifications;
                
                if (pageNum === 1) {
                    setNotifications(newNotifications);
                } else {
                    setNotifications(prev => [...prev, ...newNotifications]);
                }
                
                setUnreadCount(response.data.unreadCount);
                setHasMore(response.data.pagination.hasNextPage);
                setPage(pageNum);
            }
        } catch (error) {
            // Handle 403 (auth) errors silently - user may not be logged in or backend not ready
            if (error.response && error.response.status === 403) {
                setNotifications([]);
                setUnreadCount(0);
                setHasMore(false);
            } else {
                // Only show error for non-auth issues
                console.error('Error fetching notifications:', error);
                if (!isInitial) {
                    Alert.alert('Error', 'Failed to load notifications. Please try again.');
                }
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications(1, false);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchNotifications(page + 1, false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await SikiyaAPI.patch(`/notifications/${notificationId}/read`);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId 
                        ? { ...notif, read: true } 
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await SikiyaAPI.patch('/notifications/mark-all-read');
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
            
            Alert.alert('Success', 'All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert('Error', 'Failed to mark all as read. Please try again.');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await SikiyaAPI.delete(`/notifications/${notificationId}`);
            
            // Update local state
            const deletedNotif = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
            
            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            Alert.alert('Error', 'Failed to delete notification. Please try again.');
        }
    };

    const handleNotificationPress = (notification) => {
        // Mark as read if not already
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        const { type, data } = notification;
        
        if (type === 'new_article' && data.articleId) {
            navigation.navigate('NewsHome', { articleId: data.articleId });
        } else if (type === 'new_video' && data.videoId) {
            navigation.navigate('VideoHomeScreen', { videoId: data.videoId });
        } else if (type === 'comment_reply' && data.articleId) {
            navigation.navigate('NewsHome', { articleId: data.articleId });
        } else if (type === 'new_comment' && data.articleId) {
            navigation.navigate('NewsHome', { articleId: data.articleId });
        } else if (type === 'new_follower' && data.followerId) {
            navigation.navigate('AuthorProfileScreen', { authorId: data.followerId });
        } else if (type === 'article_approved' && data.articleId) {
            navigation.navigate('NewsHome', { articleId: data.articleId });
        } else if (type === 'video_approved' && data.videoId) {
            navigation.navigate('VideoHomeScreen', { videoId: data.videoId });
        }
    };

    const renderNotificationItem = ({ item }) => {
        const getNotificationIcon = (type) => {
            switch (type) {
                case 'new_article':
                    return { name: 'newspaper', color: MainBrownSecondaryColor };
                case 'new_video':
                    return { name: 'videocam', color: '#FF6B6B' };
                case 'comment_reply':
                    return { name: 'chatbubbles', color: '#4ECDC4' };
                case 'new_comment':
                    return { name: 'chatbubble-ellipses', color: '#95E1D3' };
                case 'new_follower':
                    return { name: 'person-add', color: '#6C5CE7' };
                case 'article_approved':
                    return { name: 'checkmark-circle', color: '#00B894' };
                case 'video_approved':
                    return { name: 'checkmark-circle', color: '#00B894' };
                case 'article_rejected':
                    return { name: 'close-circle', color: '#FF7675' };
                case 'video_rejected':
                    return { name: 'close-circle', color: '#FF7675' };
                case 'article_first_like':
                    return { name: 'heart', color: '#FD79A8' };
                case 'article_milestone_likes':
                    return { name: 'trophy', color: '#FFD700' };
                case 'article_milestone_comments':
                    return { name: 'trophy', color: '#FFD700' };
                default:
                    return { name: 'notifications', color: MainBrownSecondaryColor };
            }
        };

        const icon = getNotificationIcon(item.type);
        const isUnread = !item.read;
        
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    isUnread && styles.notificationItemUnread,
                    main_Style.genButtonElevation
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={generalActiveOpacity}
            >
                {/* Icon */}
                <View style={[styles.notificationIcon, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>

                {/* Content */}
                <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, isUnread && styles.notificationTitleUnread]}>
                        {item.title}
                    </Text>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                        {DateConverter(item.createdAt)}
                    </Text>
                </View>

                {/* Unread indicator */}
                {isUnread && <View style={styles.unreadDot} />}

                {/* Delete button */}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Delete Notification',
                            'Are you sure you want to delete this notification?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Delete', 
                                    style: 'destructive',
                                    onPress: () => deleteNotification(item._id)
                                }
                            ]
                        );
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="trash-outline" size={20} color={withdrawnTitleColor} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color={withdrawnTitleColor} />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
                You're all caught up! You'll see notifications here when something happens.
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="dark-content" />
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.leftSpacer}>
                        <GoBackButton buttonStyle={styles.backButtonOverride} />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                    </View>
                    <View style={styles.rightSpacer}>
                        <Image 
                            source={require('../../assets/SikiyaLogoV2/NathanApprovedSikiyaMiniLogo1NB.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.leftSpacer}>
                    <GoBackButton buttonStyle={styles.backButtonOverride} />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.rightSpacer}>
                    <Image 
                        source={require('../../assets/SikiyaLogoV2/NathanApprovedSikiyaMiniLogo1NB.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>
            
            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={markAllAsRead}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="checkmark-done" size={20} color={MainBrownSecondaryColor} />
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={MainBrownSecondaryColor}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
            />
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
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
        flexDirection: 'row',
    },
    headerTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
    },
    headerBadge: {
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    headerBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
    actionBar: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    markAllText: {
        fontSize: generalSmallTextSize,
        color: MainBrownSecondaryColor,
        fontFamily: generalTextFont,
        fontWeight: generalTextFontWeight,
        marginLeft: 6,
    },
    listContent: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        position: 'relative',
    },
    notificationItemUnread: {
        backgroundColor: '#f8f9ff',
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    notificationTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 4,
    },
    notificationTitleUnread: {
        fontWeight: '700',
    },
    notificationBody: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: MainBrownSecondaryColor,
    },
    deleteButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        padding: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        //backgroundColor: 'red',
    },
    emptyStateTitle: {
        fontSize: articleTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginTop: 20,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 22,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default NotificationCenterScreen;

