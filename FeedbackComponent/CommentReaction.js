import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import SikiyaAPI from '../API/SikiyaAPI';
import { secCardBackgroundColor } from '../src/styles/GeneralAppStyle';
import { formatNumber } from '../src/utils/numberFormatter';

const CommentReaction = ({ commentId, initialLikes = 0, initialDislikes = 0 }) => {
    const [reaction, setReaction] = useState('none'); // 'like', 'dislike', or 'none'
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check the user's current reaction when component mounts
        if (commentId) {
            checkReactionStatus();
        }
    }, [commentId]);

    const checkReactionStatus = async () => {
        try {
            const response = await SikiyaAPI.get(`/comment/${commentId}/reaction`);
            setReaction(response.data.reaction);
            setLikes(response.data.likes);
            setDislikes(response.data.dislikes);
        } catch (error) {
            console.error('Error checking reaction status:', error);
        }
    };

    const handleReaction = async (newReaction) => {
        if (isLoading || !commentId) return;
        
        // If clicking the same reaction button that's already active, set to 'none'
        const actionReaction = reaction === newReaction ? 'none' : newReaction;
        
        setIsLoading(true);
        try {
            const response = await SikiyaAPI.post(`/comment/${commentId}/reaction`, {
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

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[styles.reactionButton, reaction === 'like' && styles.likeActiveButton]} 
                onPress={() => handleReaction('like')}
                disabled={isLoading}
            >
                <AntDesign 
                    name='like' 
                    size={18} 
                    color={reaction === 'like' ? '#FFFFFF' : '#9E9E9E'} 
                />
                {likes > 0 && (
                    <Text style={[styles.countText, reaction === 'like' && styles.activeCountText]}>
                        {formatNumber(likes)}
                    </Text>
                )}
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.reactionButton, reaction === 'dislike' && styles.dislikeActiveButton]} 
                onPress={() => handleReaction('dislike')}
                disabled={isLoading}
            >
                <AntDesign 
                    name='dislike'
                    size={18} 
                    color={reaction === 'dislike' ? '#FFFFFF' : '#9E9E9E'} 
                />
                {dislikes > 0 && (
                    <Text style={[styles.countText, reaction === 'dislike' && styles.activeCountText]}>
                        {formatNumber(dislikes)}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: 40,
        //backgroundColor: 'red',
    },
    reactionButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        marginVertical: 2,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
        borderRadius: 6,
        minWidth: 28,
        minHeight: 28,
        //backgroundColor: 'orange',
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
        fontSize: 10,
        marginTop: 2,
    },
    activeCountText: {
        color: '#FFFFFF',
    }
});

export default CommentReaction;
