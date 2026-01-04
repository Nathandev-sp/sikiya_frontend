import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { defaultButtonHitslop, generalTextFont } from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';
import { formatNumber } from '../utils/numberFormatter';

const LikeButton = ({ articleId, initialLikes = 0 }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (articleId) {
            checkLikeStatus();
        }
    }, [articleId]);

    // Update count when initialLikes prop changes
    useEffect(() => {
        setLikeCount(initialLikes);
    }, [initialLikes]);

    const checkLikeStatus = async () => {
        if (!articleId) return;
        
        try {
            const response = await SikiyaAPI.get(`/like/article/${articleId}/check`);
            if (response.data) {
                setLiked(response.data.isLiked || false);
                if (response.data.number_of_likes !== undefined) {
                    setLikeCount(response.data.number_of_likes);
                }
            }
        } catch (error) {
            console.log('Error checking like status:', error);
            setLiked(false);
        }
    };

    const handlePress = async () => {
        if (isLoading || !articleId) return;
        
        setIsLoading(true);
        
        try {
            let response;
            if (liked) {
                // Unlike the article
                response = await SikiyaAPI.delete(`/like/article/${articleId}`);
            } else {
                // Like the article
                response = await SikiyaAPI.post(`/like/article/${articleId}`);
            }
            
            // Update state from backend response
            if (response.data) {
                setLiked(response.data.liked !== undefined ? response.data.liked : !liked);
                // Always update count from backend response
                if (response.data.number_of_likes !== undefined && response.data.number_of_likes !== null) {
                    setLikeCount(response.data.number_of_likes);
                } else {
                    // If count not in response, refresh status
                    checkLikeStatus();
                }
            } else {
                // If no data in response, refresh status
                checkLikeStatus();
            }
        } catch (error) {
            // Silently refresh status on error - the operation may have succeeded
            // Suppress logging for 400 and 500 errors (expected in race conditions)
            if (error.response?.status !== 400 && error.response?.status !== 500) {
                console.log('Error toggling like:', error);
            }
            // Refresh status to sync with backend
            checkLikeStatus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.button} 
            onPress={handlePress} 
            hitSlop={defaultButtonHitslop}
            disabled={isLoading}
        >
            <Text style={styles.text}>{formatNumber(likeCount)}</Text>
            <FontAwesome
                name={liked ? 'heart' : 'heart-o'}
                size={20}
                color={liked ? 'red' : '#9E9E9E'}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: 'transparent',
        borderRadius: 4,
    },
    text: {
        marginRight: 8,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#9E9E9E',
        fontFamily: generalTextFont,
    },
});

export default LikeButton;
