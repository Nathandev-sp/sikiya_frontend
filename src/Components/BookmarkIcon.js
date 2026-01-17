import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import SikiyaAPI from '../../API/SikiyaAPI';
import SmallLoadingState from './LoadingComps/SmallLoadingState';
import { withdrawnTitleColor } from '../styles/GeneralAppStyle';

const BookmarkIcon = ({ articleId, size = 22, savedStatus, position = 'bottom', centered = false, iconColorOverride = null }) => {
    const [bookmarked, setBookmarked] = useState(savedStatus);
    const [isLoading, setIsLoading] = useState(false);

    // Check if article is saved on mount
    /*useEffect(() => {
        if (!articleId) return;
        
        const checkSavedStatus = async () => {
            try {
                const response = await SikiyaAPI.get(`/saved-articles/check/${articleId}`);
                setBookmarked(response.data.saved);
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        };
        
        checkSavedStatus();
    }, [articleId]);*/

    const toggleBookmark = async () => {
        setIsLoading(true);
        try {
            const response = await SikiyaAPI.post('article/saved/toggle', { article_id: articleId });
            setBookmarked(response.data.saved);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const iconName = bookmarked ? 'bookmark' : 'bookmark-outline';
    const iconColor = iconColorOverride !== null ? iconColorOverride : (bookmarked ? '#FF5B5B' : withdrawnTitleColor);

    if (isLoading) {
        return (
            <View style={styles.bookmarkWrapper}>
                <SmallLoadingState />
            </View>
        );
    }

    const positionStyle = centered 
        ? {} 
        : position === 'top' 
            ? { top: 10, bottom: 'auto' }
            : { bottom: 10, top: 'auto' };

    const wrapperStyle = centered 
        ? [styles.bookmarkWrapper, styles.bookmarkWrapperCentered]
        : [styles.bookmarkWrapper, positionStyle];

    return (
        <View style={wrapperStyle}>
            <TouchableOpacity
                onPress={toggleBookmark}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
                disabled={isLoading}
            >
                <Ionicons name={iconName} size={size} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bookmarkWrapper: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 100,
        //backgroundColor: 'red',
    },
    bookmarkWrapperCentered: {
        position: 'relative',
        top: 'auto',
        bottom: 'auto',
        left: 'auto',
        right: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default BookmarkIcon;