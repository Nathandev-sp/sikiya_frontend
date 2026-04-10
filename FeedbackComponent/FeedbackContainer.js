import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import CommentFeed from '../FeedbackComponent/CommentFeed';
import SikiyaAPI from '../API/SikiyaAPI';
import mongoose from 'mongoose';
import BigLoaderAnim from '../src/Components/LoadingComps/BigLoaderAnim';
import { Ionicons } from '@expo/vector-icons';
import { MainBrownSecondaryColor, generalTextFont, generalTextColor, generalTitleSize, generalTitleFontWeight, generalTitleFont, generalTitleColor, main_Style, genBtnBackgroundColor, commentTextSize, generalTextSize, withdrawnTitleColor, generalSmallTextSize, MainSecondaryBlueColor } from '../src/styles/GeneralAppStyle';
import { useLanguage } from '../src/Context/LanguageContext';


const FeedbackContainer = ({ articleId, videoId, discussionLaneId = null, refreshKey, commentLoading, setCommentLoading, onAddCommentPress, onReplyToComment, onBeforeNavigate, hideHeader = false, totalCommentCount = null }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(totalCommentCount || 0);
    const { t } = useLanguage();
    //console.log("Article ID:", articleId, "Video ID:", videoId);

    //console.log('Fetched article:', articleId);

    const buildCommentsEndpoint = (page = 1, limit = 10) => {
        if (videoId) {
            let url = `/comments/video/${videoId}?page=${page}&limit=${limit}`;
            if (discussionLaneId) url += `&discussionLaneKey=${encodeURIComponent(discussionLaneId)}`;
            return url;
        }
        let url = `/comments/article/${articleId}?page=${page}&limit=${limit}`;
        if (discussionLaneId) url += `&discussionLaneKey=${encodeURIComponent(discussionLaneId)}`;
        return url;
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const endpoint = buildCommentsEndpoint(1, 10);
                const response = await SikiyaAPI.get(endpoint);
                
                // Handle paginated response
                if (response.data.comments) {
                    setComments(response.data.comments);
                    setTotalCount(response.data.pagination.totalComments);
                    setHasMore(response.data.pagination.hasNextPage);
                    setCurrentPage(1);
                } else {
                    // Backward compatibility if backend returns array directly
                    setComments(response.data);
                    setTotalCount(response.data.length);
                    setHasMore(false);
                }
                //console.log("Fetched comments:", response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
                if (setCommentLoading) setCommentLoading(false);
            }
        };
        if (articleId || videoId) fetchComments();
        
    }, [articleId, videoId, discussionLaneId, refreshKey]);

    // Update totalCount when totalCommentCount prop changes
    useEffect(() => {
        if (totalCommentCount !== null && totalCommentCount !== undefined) {
            setTotalCount(totalCommentCount);
        }
    }, [totalCommentCount]);

    // Load more comments
    const loadMoreComments = async () => {
        if (!hasMore || loadingMore) return;

        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const endpoint = buildCommentsEndpoint(nextPage, 10);
            const response = await SikiyaAPI.get(endpoint);
            
            if (response.data.comments) {
                setComments(prev => [...prev, ...response.data.comments]);
                setHasMore(response.data.pagination.hasNextPage);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Error loading more comments:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading || commentLoading) {
        return (
            <View style={styles.loaderContainer}>
                <BigLoaderAnim />
                <Text style={styles.loadingText}>
                    {commentLoading ? t('comments.postingComment') : t('comments.loadingComments')}
                </Text>
            </View>
        );
    }

    //console.log('Fetched comments:', comments);

    const commentCount = totalCount || comments.length;
    const formattedCount = commentCount >= 1000 ? `${(commentCount / 1000).toFixed(1)}k` : commentCount.toString();

    // Render header
    const renderHeader = () => {
        if (hideHeader) return null;
        return (
            <View style={styles.commentsHeader}>
                {/*<View style={styles.commentsHeaderLeft}>
                    <Ionicons name="chatbox-ellipses-outline" size={20} color={MainBrownSecondaryColor} />
                    <Text style={styles.commentsCountText}>{formattedCount} {t('comments.comments')}</Text>
                </View>
                {onAddCommentPress && (
                    <TouchableOpacity 
                        style={[styles.addCommentButton, main_Style.genButtonElevation]}
                        onPress={onAddCommentPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chatbubbles" size={20} color={MainBrownSecondaryColor} />
                    </TouchableOpacity>
                )}  */}
            </View>
        );
    };

    // Render footer with loading spinner
    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={MainSecondaryBlueColor} />
                </View>
            );
        }

        // If there are only 1-2 comments, the modal can feel empty.
        // Add a lightweight prompt to invite participation without changing behavior.
        if (comments.length > 0 && comments.length < 2) {
            return (
                <View style={styles.lowVolumePrompt}>
                    <Text style={styles.lowVolumeTitle}>{t('comments.keepItGoing')}</Text>
                    <Text style={styles.lowVolumeSub}>{t('comments.shareYourPerspectivePrompt')}</Text>
                </View>
            );
        }

        return null;
    };

    // Render empty state
    const renderEmptyState = () => {
        return (
            <View style={styles.emptyStateContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={withdrawnTitleColor} />
                <Text style={styles.emptyStateText}>{t('comments.noCommentsYet')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('comments.beTheFirstToStartTheConversation')}</Text>
            </View>
        );
    };

    // Render each comment item
    const renderCommentItem = ({ item }) => (
        <CommentFeed
            mainComment={item}
            articleId={articleId}
            videoId={videoId}
            onReplyToComment={onReplyToComment}
            onBeforeNavigate={onBeforeNavigate}
        />
    );

    const ItemSeparator = () => <View style={styles.itemSeparator} />;

    return (
        <View style={styles.feedbackContainterStyle}>
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={ItemSeparator}
                onEndReached={loadMoreComments}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                nestedScrollEnabled={true}
            />
            <View style={styles.verticalSpacer} />
        </View>
    );
};

const styles = StyleSheet.create({
    feedbackContainterStyle: {
        width: '100%',
        alignSelf: 'center',
        paddingBottom: 24,
        //backgroundColor: 'red',
    },
    commentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    commentsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    commentsCountText: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
    },
    addCommentButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: genBtnBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verticalSpacer: {
        height: 16,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
        minHeight: 180,
    },
    emptyStateText: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginTop: 20,
        marginBottom: 6,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lowVolumePrompt: {
        marginTop: 16,
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    lowVolumeTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 6,
    },
    lowVolumeSub: {
        fontSize: generalSmallTextSize,
        fontWeight: '400',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.06)',
        marginVertical: 12,
        marginHorizontal: 0,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 200,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        fontFamily: 'OpenSans-Regular',
        textAlign: 'center'
    }
});

export default FeedbackContainer;