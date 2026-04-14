import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, StyleSheet, Text, SectionList, TouchableOpacity,
    StatusBar, ActivityIndicator, Alert, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AppScreenBackgroundColor, {
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
    MainSecondaryBlueColor,
    secCardBackgroundColor,
    withdrawnTitleColor,
} from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import { useLanguage } from '../Context/LanguageContext';
import {
    genBtnBackgroundColor,
    defaultButtonHitslop,
} from '../styles/GeneralAppStyle';

const ICON_MAP = {
    new_article:               { name: 'newspaper-outline',       color: '#3B82F6' },
    new_video:                 { name: 'play-circle-outline',     color: '#EF4444' },
    comment_reply:             { name: 'chatbubbles-outline',     color: '#8B5CF6' },
    new_comment:               { name: 'chatbubble-outline',      color: '#06B6D4' },
    new_follower:              { name: 'person-add-outline',      color: '#EC4899' },
    article_approved:          { name: 'checkmark-circle-outline',color: '#10B981' },
    video_approved:            { name: 'checkmark-circle-outline',color: '#10B981' },
    article_rejected:          { name: 'close-circle-outline',    color: '#EF4444' },
    video_rejected:            { name: 'close-circle-outline',    color: '#EF4444' },
    article_first_like:        { name: 'heart-outline',           color: '#F43F5E' },
    article_milestone_likes:   { name: 'trophy-outline',          color: '#F59E0B' },
    article_milestone_comments:{ name: 'trending-up-outline',     color: '#F59E0B' },
    video_milestone_comments:  { name: 'trending-up-outline',     color: '#F59E0B' },
};
const DEFAULT_ICON = { name: 'notifications-outline', color: MainBrownSecondaryColor };

const getRelativeTime = (dateStr, t) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('notifications.justNow') || 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const groupByDate = (notifications, t) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const today = [];
    const thisWeek = [];
    const earlier = [];

    for (const n of notifications) {
        const d = new Date(n.createdAt);
        if (d >= todayStart) today.push(n);
        else if (d >= weekStart) thisWeek.push(n);
        else earlier.push(n);
    }

    const sections = [];
    if (today.length) sections.push({ title: t('notifications.today') || 'Today', data: today });
    if (thisWeek.length) sections.push({ title: t('notifications.thisWeek') || 'This Week', data: thisWeek });
    if (earlier.length) sections.push({ title: t('notifications.earlier') || 'Earlier', data: earlier });
    return sections;
};

const NotificationCenterScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { t } = useLanguage();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fetchError, setFetchError] = useState(null);

    const fetchNotifications = useCallback(async (pageNum = 1, isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);
            setFetchError(null);

            const response = await SikiyaAPI.get(`/notifications?page=${pageNum}&limit=20`);

            if (response.data.success) {
                const items = response.data.notifications || [];
                if (pageNum === 1) {
                    setNotifications(items);
                } else {
                    setNotifications(prev => [...prev, ...items]);
                }
                setUnreadCount(response.data.unreadCount ?? 0);
                setHasMore(response.data.pagination?.hasNextPage ?? false);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (pageNum === 1) {
                setNotifications([]);
                setUnreadCount(0);
                const status = error?.response?.status;
                if (status === 403 || status === 401) {
                    setFetchError('auth');
                } else {
                    setFetchError('network');
                }
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) fetchNotifications(1, true);
    }, [isFocused]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications(1, false);
    }, [fetchNotifications]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore) fetchNotifications(page + 1, false);
    }, [loadingMore, hasMore, page, fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await SikiyaAPI.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await SikiyaAPI.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await SikiyaAPI.delete(`/notifications/${notificationId}`);
            const deleted = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (deleted && !deleted.read) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    const handleNotificationPress = useCallback((notification) => {
        if (!notification.read) markAsRead(notification._id);

        const { type, data } = notification;
        if (!data) return;

        switch (type) {
            case 'new_article':
            case 'article_approved':
            case 'new_comment':
            case 'article_milestone_comments':
                if (data.articleId) navigation.navigate('NewsHome', { articleId: data.articleId });
                break;
            case 'new_video':
            case 'video_approved':
            case 'video_milestone_comments':
                if (data.videoId) navigation.navigate('VideoHomeScreen', { videoId: data.videoId });
                break;
            case 'comment_reply':
                if (data.articleId) navigation.navigate('NewsHome', { articleId: data.articleId });
                else if (data.videoId) navigation.navigate('VideoHomeScreen', { videoId: data.videoId });
                break;
            case 'new_follower':
                if (data.followerId) {
                    navigation.navigate('AuthorProfile', {
                        userId: data.followerId,
                        ...(data.followerName ? { displayName: String(data.followerName).trim() } : {}),
                    });
                }
                break;
            case 'article_first_like':
            case 'article_milestone_likes':
                if (data.articleId) navigation.navigate('NewsHome', { articleId: data.articleId });
                break;
            default:
                break;
        }
    }, [markAsRead, navigation]);

    const sections = useMemo(() => groupByDate(notifications, t), [notifications, t]);

    const renderSectionHeader = useCallback(({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    ), []);

    const renderItem = useCallback(({ item }) => {
        const icon = ICON_MAP[item.type] || DEFAULT_ICON;
        const isUnread = !item.read;

        return (
            <TouchableOpacity
                style={[styles.notifRow, isUnread && styles.notifRowUnread]}
                onPress={() => handleNotificationPress(item)}
                onLongPress={() => {
                    Alert.alert(
                        t('notifications.deleteNotification') || 'Delete Notification',
                        t('notifications.deleteConfirmation') || 'Are you sure you want to delete this notification?',
                        [
                            { text: t('notifications.cancel') || 'Cancel', style: 'cancel' },
                            { text: t('notifications.delete') || 'Delete', style: 'destructive', onPress: () => deleteNotification(item._id) }
                        ]
                    );
                }}
                activeOpacity={generalActiveOpacity}
            >
                <View style={[styles.iconCircle, { backgroundColor: icon.color + '14' }]}>
                    <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>

                <View style={styles.notifBody}>
                    <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.body ? (
                        <Text style={styles.notifMessage} numberOfLines={2}>
                            {item.body}
                        </Text>
                    ) : null}
                    <Text style={styles.notifTime}>{getRelativeTime(item.createdAt, t)}</Text>
                </View>

                {isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    }, [handleNotificationPress, deleteNotification, t]);

    const renderEmpty = useCallback(() => {
        if (fetchError === 'auth') {
            return (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="log-in-outline" size={48} color={withdrawnTitleColor} />
                    </View>
                    <Text style={styles.emptyTitle}>Sign in to view notifications</Text>
                    <Text style={styles.emptyText}>
                        Your notifications will appear here once you're signed in.
                    </Text>
                </View>
            );
        }
        if (fetchError === 'network') {
            return (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="cloud-offline-outline" size={48} color={withdrawnTitleColor} />
                    </View>
                    <Text style={styles.emptyTitle}>Connection issue</Text>
                    <Text style={styles.emptyText}>
                        Could not load notifications. Pull down to try again.
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="notifications-off-outline" size={48} color={withdrawnTitleColor} />
                </View>
                <Text style={styles.emptyTitle}>
                    {t('notifications.allCaughtUp') || "You're all caught up!"}
                </Text>
                <Text style={styles.emptyText}>
                    {t('notifications.allCaughtUpDescription') || "When there's new activity — like new articles, replies, or followers — it'll show up here."}
                </Text>
            </View>
        );
    }, [t, fetchError]);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
            </View>
        );
    }, [loadingMore]);

    if (loading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="dark-content" />
                <Header unreadCount={0} onMarkAll={null} t={t} />
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <Header unreadCount={unreadCount} onMarkAll={unreadCount > 0 ? markAllAsRead : null} t={t} />

            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item._id}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={notifications.length === 0 ? styles.emptyListContent : styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={MainBrownSecondaryColor} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
            />
        </SafeAreaView>
    );
};

const Header = React.memo(({ unreadCount, onMarkAll, t }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.4}
                hitSlop={defaultButtonHitslop}
            >
                <Ionicons name="arrow-back" size={22} color={MainBrownSecondaryColor} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>{t('notifications.notifications') || 'Notifications'}</Text>
                {unreadCount > 0 && (
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.headerRight}>
                {onMarkAll ? (
                    <TouchableOpacity onPress={onMarkAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="checkmark-done-outline" size={24} color={MainBrownSecondaryColor} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ---- Header ---- */
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 52,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: secCardBackgroundColor,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: genBtnBackgroundColor,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
    },
    headerBadge: {
        backgroundColor: '#EF4444',
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
        fontSize: 11,
        fontWeight: '700',
        fontFamily: generalTitleFont,
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },

    /* ---- Section headers ---- */
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionHeaderText: {
        fontSize: generalSmallTextSize,
        fontWeight: '700',
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* ---- Notification row ---- */
    notifRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: secCardBackgroundColor,
    },
    notifRowUnread: {
        backgroundColor: cardBackgroundColor,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    notifBody: {
        flex: 1,
        paddingRight: 16,
    },
    notifTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        lineHeight: 20,
    },
    notifTitleUnread: {
        fontWeight: '700',
    },
    notifMessage: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 3,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: 12,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: MainSecondaryBlueColor,
        marginTop: 8,
    },

    /* ---- List ---- */
    listContent: {
        paddingBottom: 40,
    },
    emptyListContent: {
        flexGrow: 1,
    },

    /* ---- Empty state ---- */
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
    },
    emptyIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: secCardBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 22,
    },

    /* ---- Footer ---- */
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default NotificationCenterScreen;
