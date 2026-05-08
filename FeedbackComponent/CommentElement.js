import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import AppScreenBackgroundColor, { cardBackgroundColor, commentTextSize, defaultButtonHitslop, generalActiveOpacity, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, generalTitleFontWeight, withdrawnTitleColor, MainBrownSecondaryColor, main_Style, generalTitleColor } from '../src/styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateConverter from '../src/Helpers/DateConverter';
import SikiyaAPI from '../API/SikiyaAPI';
import { getImageUrl } from '../src/utils/imageUrl';
import { useLanguage } from '../src/Context/LanguageContext';

// Constants
const REACTION_COLORS = {
    like: MainBrownSecondaryColor,
    dislike: '#C2410C',
    default: '#9E9E9E',
};

const MAX_TEXT_LENGTH = 300;
const PROFILE_PIC_SIZE = 32;

const CommentElement = ({ 
    comment, 
    showButtons, 
    onToggleSubComments, 
    onReply, 
    showSubComments, 
    showDeleteButton, 
    onDelete,
    onBeforeNavigate,
    testID,
    /** Minimal chrome when nested inside settings/history grouped cards */
    variant = 'default',
}) => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    
    // State management
    const [reaction, setReaction] = useState('none');
    const [likes, setLikes] = useState(comment?.number_of_likes || 0);
    const [dislikes, setDislikes] = useState(comment?.number_of_dislikes || 0);
    const [isLoadingReaction, setIsLoadingReaction] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isFetchingReaction, setIsFetchingReaction] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // Initialize reaction status
    useEffect(() => {
        if (comment?._id) {
            checkReactionStatus();
        }
    }, [comment?._id]);

    const checkReactionStatus = useCallback(async () => {
        try {
            setIsFetchingReaction(true);
            const response = await SikiyaAPI.get(`/comment/${comment._id}/reaction`);
            setReaction(response.data?.reaction || 'none');
            setLikes(response.data?.likes || 0);
            setDislikes(response.data?.dislikes || 0);
        } catch (error) {
            console.error('Error checking reaction status:', error);
            // Fallback to local state on error
        } finally {
            setIsFetchingReaction(false);
        }
    }, [comment?._id]);

    const handleReaction = useCallback(async (newReaction) => {
        if (isLoadingReaction || !comment?._id) return;

        const actionReaction = reaction === newReaction ? 'none' : newReaction;
        const prevReaction = reaction;
        const prevLikes = likes;
        const prevDislikes = dislikes;

        // Optimistic update
        setReaction(actionReaction);
        if (actionReaction === 'like') {
            setLikes(prev => prev + (prevReaction === 'like' ? -1 : 1));
            setDislikes(prev => (prevReaction === 'dislike' ? prev - 1 : prev));
        } else if (actionReaction === 'dislike') {
            setDislikes(prev => prev + (prevReaction === 'dislike' ? -1 : 1));
            setLikes(prev => (prevReaction === 'like' ? prev - 1 : prev));
        } else {
            if (prevReaction === 'like') setLikes(prev => prev - 1);
            if (prevReaction === 'dislike') setDislikes(prev => prev - 1);
        }

        setIsLoadingReaction(true);
        try {
            const response = await SikiyaAPI.post(`/comment/${comment._id}/reaction`, {
                reaction: actionReaction
            });
            
            // Update with server response
            setReaction(response.data?.reaction || 'none');
            setLikes(response.data?.likes || 0);
            setDislikes(response.data?.dislikes || 0);
        } catch (error) {
            console.error('Error handling reaction:', error);
            // Revert on error
            setReaction(prevReaction);
            setLikes(prevLikes);
            setDislikes(prevDislikes);
            Alert.alert('Error', 'Failed to update reaction. Please try again.');
        } finally {
            setIsLoadingReaction(false);
        }
    }, [comment?._id, reaction, likes, dislikes, isLoadingReaction]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            t('comments.deleteComment') || 'Delete Comment',
            t('comments.deleteConfirmation') || 'Are you sure you want to delete this comment?',
            [
                {
                    text: t('common.cancel') || 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: t('common.delete') || 'Delete',
                    onPress: async () => {
                        setIsLoadingDelete(true);
                        try {
                            await onDelete?.();
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            Alert.alert('Error', 'Failed to delete comment. Please try again.');
                        } finally {
                            setIsLoadingDelete(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    }, [onDelete, t]);

    const goToAuthorProfile = useCallback(() => {
        const authorId = comment?.comment_author_id?._id;
        if (authorId) {
            onBeforeNavigate?.();
            const displayName =
                comment?.comment_author_id?.displayName &&
                String(comment.comment_author_id.displayName).trim();
            navigation.navigate('AuthorProfile', {
                userId: authorId,
                ...(displayName ? { displayName } : {}),
            });
        }
    }, [comment?.comment_author_id, navigation, onBeforeNavigate]);

    // Safely get comment data with fallbacks
    const authorName = comment?.comment_author_id?.displayName || 'Unknown User';
    const authorProfilePic = comment?.comment_author_id?.profile_picture;
    const authorRole = comment?.comment_author_id?.role;
    const commentContent = comment?.comment_content || '';
    const commentDate = comment?.created_on ? DateConverter(comment.created_on) : '';
    const shouldShowExpandButton = commentContent.length > MAX_TEXT_LENGTH;
    const displayText = isExpanded ? commentContent : commentContent.substring(0, MAX_TEXT_LENGTH);

    const isEmbedded = variant === 'embedded';
    const shouldShowProBadge = authorRole === 'thoughtleader' || authorRole === 'journalist';

    return (
        <View 
            style={[
                styles.mainCommentContainer,
                !isEmbedded && main_Style.genContentElevation,
                isEmbedded && styles.embeddedInSettingsList,
            ]}
            testID={testID || 'comment-element'}
        >
            {shouldShowProBadge && (
                <View
                    style={[
                        styles.proBadge,
                        showDeleteButton && onDelete ? styles.proBadgeWithDelete : null,
                    ]}
                    pointerEvents="none"
                >
                    <Ionicons name="ribbon" size={14} color="#fff" />
                </View>
            )}
            {/* Author Info */}
            <View style={styles.authorProfileRow}>
                <Image
                    style={styles.authorProfilePic}
                    source={
                        authorProfilePic 
                            ? { uri: getImageUrl(authorProfilePic) }
                            : require('../assets/functionalImages/ProfilePic.png')
                    }
                    accessibilityLabel={`${authorName}'s profile picture`}
                />

                <TouchableOpacity 
                    style={styles.authorDetailsContainer}
                    activeOpacity={generalActiveOpacity}
                    onPress={goToAuthorProfile}
                    hitSlop={defaultButtonHitslop}
                    accessibilityRole="link"
                    accessibilityLabel={`${authorName}, commented ${commentDate}`}
                >
                    <Text style={styles.authorName} numberOfLines={1}>{authorName}</Text>
                    <Text style={styles.datePosted}>{commentDate}</Text>
                </TouchableOpacity>
            </View>

            {/* Comment Content */}
            <View style={styles.commentMainContent}>
                {/* Delete Button */}
                {showDeleteButton && onDelete && (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={isLoadingDelete}
                        hitSlop={defaultButtonHitslop}
                        accessibilityRole="button"
                        accessibilityLabel="Delete comment"
                        testID="delete-comment-button"
                    >
                        {isLoadingDelete ? (
                            <ActivityIndicator size="small" color="#E74C3C" />
                        ) : (
                            <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                        )}
                    </TouchableOpacity>
                )}

                {/* Comment Text */}
                <View style={styles.commentTextContainer}>
                    <Text 
                        style={styles.CommentText}
                        accessibilityRole="text"
                    >
                        {displayText}
                        {shouldShowExpandButton && !isExpanded && '...'}
                    </Text>
                    {shouldShowExpandButton && (
                        <TouchableOpacity 
                            onPress={() => setIsExpanded(!isExpanded)}
                            hitSlop={defaultButtonHitslop}
                            accessibilityRole="button"
                            accessibilityLabel={isExpanded ? 'Show less' : 'Show more'}
                        >
                            <Text style={styles.expandText}>
                                {isExpanded ? ' Show less' : ' Show more'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsRow}>
                    {/* Like Button */}
                    <TouchableOpacity 
                        style={[styles.reactionIconButton, isLoadingReaction && styles.disabledButton]}
                        onPress={() => handleReaction('like')}
                        disabled={isLoadingReaction || isFetchingReaction}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={generalActiveOpacity}
                        accessibilityRole="button"
                        accessibilityLabel={`Like button, ${likes} likes`}
                        accessibilityState={{ disabled: isLoadingReaction }}
                        testID="like-button"
                    >
                        <Ionicons 
                            name={reaction === 'like' ? 'heart' : 'heart-outline'} 
                            size={16} 
                            color={reaction === 'like' ? REACTION_COLORS.like : REACTION_COLORS.default} 
                        />
                        {likes > 0 && (
                            <Text style={[styles.reactionCountText, reaction === 'like' && styles.activeLikeText]}>
                                {likes}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Dislike Button */}
                    <TouchableOpacity 
                        style={[styles.reactionIconButton, isLoadingReaction && styles.disabledButton]}
                        onPress={() => handleReaction('dislike')}
                        disabled={isLoadingReaction || isFetchingReaction}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={generalActiveOpacity}
                        accessibilityRole="button"
                        accessibilityLabel={`Dislike button, ${dislikes} dislikes`}
                        accessibilityState={{ disabled: isLoadingReaction }}
                        testID="dislike-button"
                    >
                        <Ionicons 
                            name='heart-dislike'
                            size={16} 
                            color={reaction === 'dislike' ? REACTION_COLORS.dislike : REACTION_COLORS.default} 
                        />
                        {dislikes > 0 && (
                            <Text style={[styles.reactionCountText, reaction === 'dislike' && styles.activeDislikeText]}>
                                {dislikes}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {showButtons ? (
                        <>
                            {/* See More/Less Button */}
                            <TouchableOpacity 
                                style={styles.seeMoreButton} 
                                onPress={onToggleSubComments}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={generalActiveOpacity}
                                accessibilityRole="button"
                                accessibilityLabel={showSubComments ? t('comments.seeLess') : t('comments.seeMore')}
                                testID="see-more-button"
                            >
                                <Ionicons 
                                    name={showSubComments ? 'chevron-up' : 'chevron-down'} 
                                    size={14} 
                                    color={withdrawnTitleColor}
                                />
                                <Text style={styles.seeMoreText}>
                                    {showSubComments ? t('comments.seeLess') : t('comments.seeMore')}
                                </Text>
                            </TouchableOpacity>

                            {/* Reply Button */}
                            <TouchableOpacity 
                                style={styles.replyButton} 
                                onPress={onReply}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={generalActiveOpacity}
                                accessibilityRole="button"
                                accessibilityLabel={t('comments.reply')}
                                testID="reply-button"
                            >
                                <Ionicons name='arrow-undo' size={14} color={withdrawnTitleColor} />
                                <Text style={styles.replyText}>{t('comments.reply')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.seeMoreButton} />
                            <View style={styles.replyButton} />
                        </>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainCommentContainer: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        zIndex: 10,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    embeddedInSettingsList: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        marginBottom: 0,
        paddingHorizontal: 0,
        paddingVertical: 4,
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    authorProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        paddingTop: 2,
        //backgroundColor: 'red'
    },
    authorProfilePic: {
        width: PROFILE_PIC_SIZE,
        height: PROFILE_PIC_SIZE,
        borderRadius: PROFILE_PIC_SIZE / 2,
        marginRight: 10,
        backgroundColor: cardBackgroundColor,
        ...main_Style.genContentElevation,
    },
    commentMainContent: {
        paddingVertical: 2,
        width: '100%',
    },
    authorDetailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: commentTextSize,
        fontWeight: '700',
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    datePosted: {
        fontSize: generalSmallTextSize - 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '400',
        opacity: 0.85,
    },
    commentTextContainer: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        marginBottom: 8,
        //marginTop: 0,
        //borderRadius: 6,
        //backgroundColor: 'green'
    },
    CommentText: {
        textAlign: 'left',
        fontFamily: generalTextFont,
        fontSize: generalTextSize,
        color: generalTextColor,
        lineHeight: 22,
        flexWrap: 'wrap',
    },
    expandText: {
        color: MainBrownSecondaryColor,
        fontWeight: '600',
        fontSize: generalSmallTextSize - 1,
        fontFamily: generalTitleFont,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reactionIconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    disabledButton: {
        opacity: 0.6,
    },
    reactionCountText: {
        color: '#9E9E9E',
        fontWeight: '500',
        fontSize: generalSmallTextSize - 2,
        fontFamily: generalTextFont,
    },
    activeLikeText: {
        color: REACTION_COLORS.like,
        fontWeight: '600',
    },
    activeDislikeText: {
        color: REACTION_COLORS.dislike,
        fontWeight: '600',
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
        minHeight: 32,
    },
    seeMoreText: {
        fontSize: generalSmallTextSize - 1.5,
        fontWeight: '600',
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        marginLeft: 4,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
        minHeight: 32,
    },
    replyText: {
        fontSize: generalSmallTextSize - 1.5,
        fontWeight: '600',
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        marginLeft: 4,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    proBadge: {
        position: 'absolute',
        top: 16,
        right: 12,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#6D28D9',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 15,
        shadowColor: '#6D28D9',
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    proBadgeWithDelete: {
        right: 50,
    },
});

export default CommentElement;