import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    StatusBar,
    Alert,
    RefreshControl,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, {
    generalSmallTextSize,
    generalTextColor,
    generalTextFont,
    generalTextFontWeight,
    generalTextSize,
    generalTitleFont,
    generalTitleFontWeight,
    main_Style,
    MainBrownSecondaryColor,
    settingsStyles,
    withdrawnTitleColor,
    commentTextSize,
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import CommentElement from '../../../FeedbackComponent/CommentElement';
import SikiyaAPI from '../../../API/SikiyaAPI';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import { useLanguage } from '../../Context/LanguageContext';

const CommentHistorySettingScreen = () => {
    const { t } = useLanguage();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSecondaryComments = useCallback(
        async ({ showFullScreenLoader = false } = {}) => {
            try {
                if (showFullScreenLoader) setLoading(true);
                const response = await SikiyaAPI.get('/comment/user/secondary-comments');
                if (response.data && response.data.comments) {
                    setComments(response.data.comments);
                } else {
                    setComments([]);
                }
            } catch (error) {
                console.error('Error fetching secondary comments:', error);
                Alert.alert(
                    t('common.error'),
                    t('commentHistory.failedToLoadHistory'),
                    [{ text: t('common.ok') }]
                );
            } finally {
                if (showFullScreenLoader) setLoading(false);
                setRefreshing(false);
            }
        },
        [t]
    );

    useEffect(() => {
        fetchSecondaryComments({ showFullScreenLoader: true });
    }, [fetchSecondaryComments]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSecondaryComments({ showFullScreenLoader: false });
    };

    const deleteComment = async (commentId) => {
        try {
            const response = await SikiyaAPI.delete(`/comment/${commentId}`);

            if (response.data.success) {
                setComments((prev) => prev.filter((c) => c._id !== commentId));
                Alert.alert(t('common.success'), t('commentHistory.commentDeletedSuccess'), [
                    { text: t('common.ok') },
                ]);
            } else {
                throw new Error(response.data.error || t('commentHistory.failedToDeleteComment'));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert(
                t('common.error'),
                error.response?.data?.error || t('commentHistory.failedToDeleteComment'),
                [{ text: t('common.ok') }]
            );
        }
    };

    const getCommentContext = (comment) => {
        if (comment.articleTitle) {
            return `${t('commentHistory.article')}: ${comment.articleTitle}`;
        }
        if (comment.videoTitle) {
            return `${t('commentHistory.video')}: ${comment.videoTitle}`;
        }
        return t('commentHistory.comment');
    };

    const renderGroupedContent = () => (
        <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={withdrawnTitleColor} />
                </View>
                <Text style={styles.categoryTitle}>{t('commentHistory.replies')}</Text>
            </View>

            <View style={[styles.listCard, main_Style.genButtonElevation]}>
                {comments.length === 0 ? (
                    <View style={styles.emptyInner}>
                        <Ionicons name="chatbubbles-outline" size={48} color={withdrawnTitleColor} />
                        <Text style={styles.emptyTitle}>{t('commentHistory.noCommentsYet')}</Text>
                        <Text style={styles.emptyDescription}>{t('commentHistory.noCommentsDescription')}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>
                                {comments.length}{' '}
                                {comments.length === 1
                                    ? t('commentHistory.reply')
                                    : t('commentHistory.replies')}
                            </Text>
                        </View>
                        {comments.map((comment, idx) => (
                            <View
                                key={comment._id}
                                style={[
                                    styles.commentRow,
                                    idx < comments.length - 1 && styles.rowDivider,
                                ]}
                            >
                                {(comment.articleTitle || comment.videoTitle) && (
                                    <View style={styles.contextContainer}>
                                        <Ionicons
                                            name={
                                                comment.articleTitle
                                                    ? 'newspaper-outline'
                                                    : 'videocam-outline'
                                            }
                                            size={16}
                                            color={withdrawnTitleColor}
                                        />
                                        <Text style={styles.contextText} numberOfLines={2}>
                                            {getCommentContext(comment)}
                                        </Text>
                                    </View>
                                )}
                                <CommentElement
                                    comment={comment}
                                    showButtons={false}
                                    showDeleteButton={true}
                                    variant="embedded"
                                    onDelete={() => deleteComment(comment._id)}
                                />
                            </View>
                        ))}
                    </>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={'dark-content'} />
                <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                    <GoBackButton />
                </View>
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                    <Text style={styles.loadingText}>{t('commentHistory.loadingComments')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={'dark-content'} />
            <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                <GoBackButton />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[MainBrownSecondaryColor]}
                        tintColor={MainBrownSecondaryColor}
                    />
                }
            >
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="chatbubbles-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('commentHistory.commentHistory')}</Text>
                </View>

                {renderGroupedContent()}

                <VerticalSpacer height={30} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
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
    listCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    summaryRow: {
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryText: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    commentRow: {
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    },
    rowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contextContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    contextText: {
        flex: 1,
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    emptyInner: {
        paddingHorizontal: 24,
        paddingVertical: 36,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 8,
    },
});

export default CommentHistorySettingScreen;
