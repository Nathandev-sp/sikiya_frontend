import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, ActivityIndicator } from 'react-native';
import CommentElement from '../FeedbackComponent/CommentElement';
import { defaultButtonHitslop, generalTextFont, MainBrownSecondaryColor } from '../src/styles/GeneralAppStyle';
import CommentInputModal from './CommentInputModal'; // Adjust path if needed
import SikiyaAPI from '../API/SikiyaAPI';
import { useLanguage } from '../src/Context/LanguageContext';

const CommentFeed = ({ mainComment, sentiment, articleId, videoId }) => {
    const [showSubComments, setShowSubComments] = useState(false);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [subComments, setSubComments] = useState([]);
    const [loadingSubComments, setLoadingSubComments] = useState(false);
    const [loadingReply, setLoadingReply] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;
    const { t } = useLanguage();

    //console.log("Comment", mainComment)

    const fetchSubComments = async () => {
        if (!mainComment || !mainComment._id) return;
        
        setLoadingSubComments(true);
        try {
            const response = await SikiyaAPI.get(`/comments/replies/${mainComment._id}`);
            setSubComments(response.data);
        } catch (error) {
            console.error('Error fetching sub-comments:', error);
        } finally {
            setLoadingSubComments(false);
        }
    };

    const toggleSubComments = () => {
        if (showSubComments) {
            // Close sub-comments
            Animated.timing(animationValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setShowSubComments(false));
        } else {
            // Open sub-comments and fetch data
            setShowSubComments(true);
            fetchSubComments();
            Animated.timing(animationValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const submitReply = async (replyText) => {
        if (!replyText || !mainComment._id || (!articleId && !videoId)) return;
        
        setLoadingReply(true);
        try {
            // Use videoId if provided, otherwise use articleId
            const payload = videoId ? {
                comment_content: replyText,
                mainComment: false,
                reply_to_comment_id: mainComment._id
            } : {
                comment_article_id: articleId,
                comment_content: replyText,
                reply_to_comment_id: mainComment._id
            };
            
            // Use video comment endpoint if videoId, otherwise use article reply endpoint
            const endpoint = videoId 
                ? `/video/${videoId}/comment`
                : '/comment/reply';
            
            const response = await SikiyaAPI.post(endpoint, payload);
            
            // Add the new reply to the subComments array
            setSubComments(prevComments => [response.data, ...prevComments]);
            
            // If subcomments are not visible, make them visible
            if (!showSubComments) {
                setShowSubComments(true);
                Animated.timing(animationValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
            
            setReplyModalVisible(false);
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setLoadingReply(false);
        }
    };

    const translateY = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0], // Slide up from -20 to 0
    });

    const opacity = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Fade in from 0 to 1
    });

    // Determine the color of the main comment bar based on the sentiment
    const getBarColor = () => {
        switch (sentiment) {
            case 'positive':
                return 'green';
            case 'neutral':
                return 'orange';
            case 'negative':
                return 'red';
            default:
                return 'gray'; // Default color if no sentiment is provided
        }
    };
    //console.log('Main Comment:', mainComment);

    return (
        <View style={styles.commentFeedContainer}>
            {/* Main Comment with Vertical Bar */}
            <View style={styles.mainCommentWrapper}>
                {/* Vertical Bar - full height of main comment */}
                <View style={styles.verticalBar} />
                
                <View style={styles.mainCommentContainer}>
                    <CommentElement comment={mainComment} showButtons={true} onToggleSubComments={toggleSubComments} onReply={() => setReplyModalVisible(true)} showSubComments={showSubComments} />
                </View>
            </View>

            {/* Sub-Comments with Animation */}
            {showSubComments && (
                <Animated.View
                    style={[
                        styles.subCommentContainer,
                        { transform: [{ translateY }], opacity },
                    ]}
                >
                    {loadingSubComments ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007BFF" />
                            <Text style={styles.loadingText}>{t('comments.loadingReplies')}</Text>
                        </View>
                    ) : subComments.length > 0 ? (
                        subComments.map((comment) => (
                            <CommentElement key={comment._id} comment={comment} showButtons={false} />
                        ))
                    ) : (
                        <Text style={styles.noRepliesText}>{t('comments.noRepliesYet')}</Text>
                    )}
                </Animated.View>
            )}

            {/* Reply Modal - Now with proper functionality */}
            <CommentInputModal
                visible={replyModalVisible}
                onClose={() => setReplyModalVisible(false)}
                onSend={submitReply}
                placeholder={t('comment.writeReplyPlaceholder')}
                mode="comment"
                isLoading={loadingReply}
                replyToName={
                    mainComment?.comment_author_id?.displayName ||
                    mainComment?.comment_author_id?.displayname ||
                    mainComment?.comment_author_id?.display_name ||
                    `${mainComment?.comment_author_id?.firstname || ''} ${mainComment?.comment_author_id?.lastname || ''}`.trim()
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    commentFeedContainer: {
        width: '98%',
        alignSelf: 'center',
        marginBottom: 8,
        //backgroundColor: 'red',
    },
    mainCommentWrapper: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'stretch',
    },
    verticalBar: {
        width: 3,
        backgroundColor: MainBrownSecondaryColor,
        marginRight: 12,
        borderRadius: 2,
        alignSelf: 'stretch', // Extends full height of main comment
    },
    mainCommentContainer: {
        flex: 1,
        width: '100%',
    },
    subCommentContainer: {
        paddingLeft: 16,
        paddingRight: 0,
        marginTop: 0,
        marginLeft: 0,
        width: '96%', // Make subcomments shorter than main comment
        alignSelf: 'flex-end', // Keep left alignment with margin
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
        fontFamily: generalTextFont,
    },
    noRepliesText: {
        padding: 10,
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        fontFamily: generalTextFont,
    }
});

export default CommentFeed;