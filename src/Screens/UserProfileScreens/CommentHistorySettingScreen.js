import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, StatusBar, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generalTextColor, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, generalTextSize, generalSmallTextSize, commentTextSize } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import CommentElement from '../../../FeedbackComponent/CommentElement';
import SikiyaAPI from '../../../API/SikiyaAPI';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';

const CommentHistorySettingScreen = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    useEffect(() => {
        fetchSecondaryComments();
    }, []);

    const fetchSecondaryComments = async () => {
        try {
            setLoading(true);
            const response = await SikiyaAPI.get('/comment/user/secondary-comments');
            if (response.data && response.data.comments) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error('Error fetching secondary comments:', error);
            Alert.alert(
                'Error',
                'Failed to load your comment history. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSecondaryComments();
    };

    const handleDeleteComment = (comment) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteComment(comment._id)
                }
            ],
            { cancelable: true }
        );
    };

    const deleteComment = async (commentId) => {
        try {
            setDeletingCommentId(commentId);
            const response = await SikiyaAPI.delete(`/comment/${commentId}`);
            
            if (response.data.success) {
                // Remove the comment from the list
                setComments(prevComments => prevComments.filter(c => c._id !== commentId));
                Alert.alert('Success', 'Comment deleted successfully', [{ text: 'OK' }]);
            } else {
                throw new Error(response.data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to delete comment. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setDeletingCommentId(null);
        }
    };

    const getCommentContext = (comment) => {
        if (comment.articleTitle) {
            return `Article: ${comment.articleTitle}`;
        } else if (comment.videoTitle) {
            return `Video: ${comment.videoTitle}`;
        }
        return 'Comment';
    };

    if (loading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                <View style={styles.loadingContainer}>
                    <BigLoaderAnim />
                    <Text style={styles.loadingText}>Loading your comments...</Text>
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
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[MainBrownSecondaryColor]}
                    />
                }
            >
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="time-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Comment History</Text>
                </View>

                {comments.length === 0 ? (
                    <View style={[styles.emptyContainer, main_Style.genButtonElevation]}>
                        <Ionicons name="chatbubbles-outline" size={64} color={withdrawnTitleColor} />
                        <Text style={styles.emptyTitle}>No Comments Yet</Text>
                        <Text style={styles.emptyDescription}>
                            You haven't made any replies yet. Your comment history will appear here once you start replying to comments.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.commentsContainer}>
                        <View style={styles.commentsHeader}>
                            <Text style={styles.commentsCount}>
                                {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
                            </Text>
                        </View>
                        
                        {comments.map((comment) => (
                            <View key={comment._id} style={styles.commentWrapper}>
                                {comment.articleTitle || comment.videoTitle ? (
                                    <View style={styles.contextContainer}>
                                        <Ionicons 
                                            name={comment.articleTitle ? "newspaper-outline" : "videocam-outline"} 
                                            size={14} 
                                            color={withdrawnTitleColor} 
                                        />
                                        <Text style={styles.contextText}>
                                            {getCommentContext(comment)}
                                        </Text>
                                    </View>
                                ) : null}
                                <CommentElement
                                    comment={comment}
                                    showButtons={false}
                                    showDeleteButton={true}
                                    onDelete={() => handleDeleteComment(comment)}
                                />
                                {deletingCommentId === comment._id && (
                                    <View style={styles.deletingOverlay}>
                                        <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

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
    headerDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        marginTop: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: generalTextFont,
    },
    emptyContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 20,
        padding: 32,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
    },
    commentsContainer: {
        marginHorizontal: 12,
        marginTop: 20,
    },
    commentsHeader: {
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    commentsCount: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    commentWrapper: {
        marginBottom: 16,
    },
    contextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    contextText: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginLeft: 6,
        fontStyle: 'italic',
    },
    deletingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
});

export default CommentHistorySettingScreen;
