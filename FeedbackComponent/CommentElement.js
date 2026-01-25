import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions, ScrollView, TouchableOpacity} from 'react-native';
import AppScreenBackgroundColor, { cardBackgroundColor, commentTextSize, defaultButtonHitslop, generalSmallLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, lightBannerBackgroundColor, main_Style, mainBrownColor, MainBrownSecondaryColor, mainTitleColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../src/styles/GeneralAppStyle';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateConverter from '../src/Helpers/DateConverter';
import SikiyaAPI from '../API/SikiyaAPI';
import { getImageUrl } from '../src/utils/imageUrl';
import { useLanguage } from '../src/Context/LanguageContext';

const CommentElement = ({comment, showButtons, onToggleSubComments, onReply, showSubComments, showDeleteButton, onDelete}) => {

    const navigation = useNavigation()
    const [reaction, setReaction] = useState('none');
    const [likes, setLikes] = useState(comment.number_of_likes || 0);
    const [dislikes, setDislikes] = useState(comment.number_of_dislikes || 0);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (comment._id) {
            checkReactionStatus();
        }
    }, [comment._id]);

    const checkReactionStatus = async () => {
        try {
            const response = await SikiyaAPI.get(`/comment/${comment._id}/reaction`);
            setReaction(response.data.reaction);
            setLikes(response.data.likes);
            setDislikes(response.data.dislikes);
        } catch (error) {
            console.error('Error checking reaction status:', error);
        }
    };

    const handleReaction = async (newReaction) => {
        if (isLoading || !comment._id) return;
        
        const actionReaction = reaction === newReaction ? 'none' : newReaction;
        
        setIsLoading(true);
        try {
            const response = await SikiyaAPI.post(`/comment/${comment._id}/reaction`, {
                reaction: actionReaction
            });
            
            setReaction(response.data.reaction);
            setLikes(response.data.likes);
            setDislikes(response.data.dislikes);
        } catch (error) {
            console.error('Error handling reaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const goToAuthorProfile = () => {
        navigation.navigate('AuthorProfile', {userId: comment.comment_author_id._id})
        //console.log("Comment author ID:", comment.comment_author_id._id);
    }

    //console.log("Comment author:", comment.comment_author_id);
    

    return(
        <View style={[styles.mainCommentContainer, main_Style.genContentElevation]}>
            <View style={styles.authorAndProfileRow}>
                <Image
                    style={styles.authorProfilePic}
                    source={
                        comment.comment_author_id?.profile_picture 
                            ? { uri: getImageUrl(comment.comment_author_id.profile_picture) }
                            : require('../assets/functionalImages/ProfilePic.png')
                    }
                />
                <TouchableOpacity 
                    style={styles.authorDetailsContainer}
                    activeOpacity={0.8}
                    onPress={goToAuthorProfile}
                    hitSlop={defaultButtonHitslop}
                >
                    <Text style={styles.authorName}>{comment.comment_author_id.displayName}</Text>
                    <Text style={styles.datePosted}>{DateConverter(comment.created_on)}</Text>
                </TouchableOpacity>
                {showDeleteButton && onDelete && (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={onDelete}
                        hitSlop={defaultButtonHitslop}
                    >
                        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.commentTextContainer}>
                <Text style={styles.CommentText}>{comment.comment_content}</Text>
            </View>
            
            <View style={styles.buttonsRow}>
                <TouchableOpacity 
                    style={[styles.reactionButton, reaction === 'like' && styles.likeActiveButton]} 
                    onPress={() => handleReaction('like')}
                    disabled={isLoading}
                    hitSlop={defaultButtonHitslop}
                >
                    <Ionicons 
                        name='thumbs-up' 
                        size={16} 
                        color={reaction === 'like' ? '#FFFFFF' : '#9E9E9E'} 
                    />
                    {likes > 0 && (
                        <Text style={[styles.countText, reaction === 'like' && styles.activeCountText]}>
                            {likes}
                        </Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.reactionButton, reaction === 'dislike' && styles.dislikeActiveButton]} 
                    onPress={() => handleReaction('dislike')}
                    disabled={isLoading}
                    hitSlop={defaultButtonHitslop}
                >
                    <Ionicons 
                        name='thumbs-down'
                        size={16} 
                        color={reaction === 'dislike' ? '#FFFFFF' : '#9E9E9E'} 
                    />
                    {dislikes > 0 && (
                        <Text style={[styles.countText, reaction === 'dislike' && styles.activeCountText]}>
                            {dislikes}
                        </Text>
                    )}
                </TouchableOpacity>

                {showButtons ? (
                    <>
                        <TouchableOpacity 
                            style={styles.seeMoreButton} 
                            onPress={onToggleSubComments} 
                            hitSlop={defaultButtonHitslop}
                        >
                            <Ionicons 
                                name={showSubComments ? 'chevron-up' : 'chevron-down'} 
                                size={16} 
                                color='#007BFF' 
                            />
                            <Text style={styles.seeMoreText}>{showSubComments ? t('comments.seeLess') : t('comments.seeMore')}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.replyButton} 
                            onPress={onReply} 
                            hitSlop={defaultButtonHitslop}
                        >
                            <Ionicons name='arrow-undo' size={16} color='#28A745' />
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
    )
};

const styles = StyleSheet.create({
    mainCommentContainer: {
        height: 'auto',
        width: '100%',
        backgroundColor: secCardBackgroundColor, //#F5F5F5 lightBannerBackgroundColor
        borderRadius: 8,
        alignSelf: 'center',
        padding: 6,
        paddingVertical: 8,
        marginBottom: 10,
        zIndex: 10,
        position: 'relative',
        borderWidth: 0.8,
        borderColor: '#E0E0E0',
    },
    authorAndProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    authorProfilePic: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginRight: 12,
        marginLeft: 6,
        //borderWidth: 2,
        borderColor: '#F5F5F5',
    },
    authorDetailsContainer: {
        flex: 1,
    },
    authorName: {
        fontSize: commentTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    datePosted: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    commentTextContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 4,
        marginBottom: 4,
        width: '100%',
        borderWidth: 0.8,
        borderColor: '#E8E8E8',
    },
    CommentText: {
        textAlign: 'left',
        fontFamily: generalTextFont,
        fontSize: generalTextSize,
        color: generalTextColor,
        lineHeight: generalSmallLineHeight,
        flexWrap: 'wrap',
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        width: '100%',
        paddingHorizontal: 0,
    },
    reactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
        backgroundColor: 'transparent',
        borderRadius: 6,
        flex: 1,
        minWidth: 0,
    },
    likeActiveButton: {
        backgroundColor: '#4CAF50',
    },
    dislikeActiveButton: {
        backgroundColor: '#E74C3C',
    },
    countText: {
        color: '#9E9E9E',
        fontWeight: '600',
        fontSize: withdrawnTitleSize,
        marginLeft: 4,
    },
    activeCountText: {
        color: '#FFFFFF',
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
        flex: 1,
        minWidth: 0,
    },
    seeMoreText: {
        fontSize: generalSmallTextSize,
        fontWeight: generalTitleFontWeight,
        color: '#007BFF',
        fontFamily: generalTitleFont,
        marginLeft: 4,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
        flex: 1,
        minWidth: 0,
    },
    replyText: {
        fontSize: generalSmallTextSize,
        fontWeight: generalTitleFontWeight,
        color: '#28A745',
        fontFamily: generalTitleFont,
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default CommentElement;