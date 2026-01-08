import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import CommentFeed from '../FeedbackComponent/CommentFeed';
import SikiyaAPI from '../API/SikiyaAPI';
import mongoose from 'mongoose';
import BigLoaderAnim from '../src/Components/LoadingComps/BigLoaderAnim';
import { Ionicons } from '@expo/vector-icons';
import { MainBrownSecondaryColor, generalTextFont, generalTextColor, generalTitleSize, generalTitleFontWeight, generalTitleFont, generalTitleColor, main_Style, genBtnBackgroundColor } from '../src/styles/GeneralAppStyle';


const FeedbackContainer = ({ articleId, videoId, refreshKey, commentLoading, setCommentLoading, onAddCommentPress, hideHeader = false }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    //console.log("Article ID:", articleId, "Video ID:", videoId);

    //console.log('Fetched article:', articleId);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // Use videoId if provided, otherwise use articleId
                const endpoint = videoId 
                    ? `/comments/video/${videoId}`
                    : `/comments/article/${articleId}`;
                const response = await SikiyaAPI.get(endpoint);
                setComments(response.data);
                //console.log("Fetched comments:", response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
                if (setCommentLoading) setCommentLoading(false);
            }
        };
        if (articleId || videoId) fetchComments();
        
    }, [articleId, videoId, refreshKey]);

    if (loading || commentLoading) {
        return (
            <View style={styles.loaderContainer}>
                <BigLoaderAnim />
                <Text style={styles.loadingText}>
                    {commentLoading ? "Posting your comment..." : "Loading comments..."}
                </Text>
            </View>
        );
    }

    console.log('Fetched comments:', comments);

    const commentCount = comments.length;
    const formattedCount = commentCount >= 1000 ? `${(commentCount / 1000).toFixed(1)}k` : commentCount.toString();

    // Optionally, filter comments by sentiment if needed
    return (
        <View style={styles.feedbackContainterStyle}>
            {/* Comments Header - only show if hideHeader is false */}
            {!hideHeader && (
                <View style={styles.commentsHeader}>
                    <View style={styles.commentsHeaderLeft}>
                        <Ionicons name="chatbox-ellipses-outline" size={24} color={MainBrownSecondaryColor} />
                        <Text style={styles.commentsCountText}>{formattedCount} Comments</Text>
                    </View>
                    {onAddCommentPress && (
                        <TouchableOpacity 
                            style={[styles.addCommentButton, main_Style.genButtonElevation]}
                            onPress={onAddCommentPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={24} color={MainBrownSecondaryColor} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
            
            {
            comments.map((comment) => (
                <CommentFeed
                    key={comment._id}
                    mainComment={comment}
                    articleId={articleId}
                    videoId={videoId}
                />
            ))}
            <View style={styles.verticalSpacer} />
        </View>
    );
};

const styles = StyleSheet.create({
    feedbackContainterStyle: {
        width: '98%',
        marginTop: 2,
        paddingBottom: 50, // Add extra padding at the bottom for scrolling
        alignSelf: 'center',
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
        fontSize: generalTitleSize,
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
        height: 50, // Adjust the height as needed
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