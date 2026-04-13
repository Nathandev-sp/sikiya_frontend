import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import SikiyaAPI from '../../API/SikiyaAPI';
import SmallLoadingState from './LoadingComps/SmallLoadingState';
import { generalActiveOpacity, MainBrownSecondaryColor, withdrawnTitleColor } from '../styles/GeneralAppStyle';

function coerceSavedFlag(v) {
    if (v === true || v === 1) return true;
    if (v === 'true') return true;
    return false;
}

/** When true, parent positions the control (e.g. feed cards); matches home header icon buttons (40×40, muted / brown states). */
const BookmarkIcon = ({
    articleId,
    size = 22,
    savedStatus,
    position = 'bottom',
    centered = false,
    iconColorOverride = null,
    feedCard = false,
    /** Article hero header: white outline when unsaved, matches back/share. */
    heroHeader = false,
}) => {
    const [bookmarked, setBookmarked] = useState(() => coerceSavedFlag(savedStatus));
    const [isLoading, setIsLoading] = useState(false);

    // FlatList recycles cells: props change but useState keeps the previous article’s saved flag without this sync.
    useEffect(() => {
        setBookmarked(coerceSavedFlag(savedStatus));
    }, [articleId, savedStatus]);

    const toggleBookmark = async () => {
        setIsLoading(true);
        try {
            const response = await SikiyaAPI.post('article/saved/toggle', { article_id: articleId });
            setBookmarked(coerceSavedFlag(response.data.saved));
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const iconName = bookmarked ? 'bookmark' : 'bookmark-outline';
    const feedIconSize = feedCard ? 26 : size;
    const iconColor =
        iconColorOverride !== null
            ? iconColorOverride
            : feedCard
              ? bookmarked
                  ? MainBrownSecondaryColor
                  : withdrawnTitleColor
              : heroHeader
                ? bookmarked
                    ? '#FF6B6B'
                    : '#FFFFFF'
                : bookmarked
                  ? '#FF5B5B'
                  : MainBrownSecondaryColor;

    const positionStyle = centered
        ? {}
        : position === 'top'
          ? { top: 10, bottom: 'auto' }
          : { bottom: 10, top: 'auto' };

    if (isLoading) {
        if (feedCard) {
            return (
                <View style={styles.bookmarkWrapperFeed}>
                    <SmallLoadingState />
                </View>
            );
        }
        if (centered) {
            return (
                <View style={styles.bookmarkLoadingCentered}>
                    <SmallLoadingState />
                </View>
            );
        }
        return (
            <View style={[styles.bookmarkWrapper, positionStyle]}>
                <SmallLoadingState />
            </View>
        );
    }

    if (feedCard) {
        return (
            <View style={styles.bookmarkWrapperFeed}>
                <TouchableOpacity
                    onPress={toggleBookmark}
                    style={styles.feedTouch}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    activeOpacity={generalActiveOpacity}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Save article'}
                >
                    <Ionicons name={iconName} size={feedIconSize} color={iconColor} />
                </TouchableOpacity>
            </View>
        );
    }

    const wrapperStyle = centered 
        ? [styles.bookmarkWrapper, styles.bookmarkWrapperCentered]
        : [styles.bookmarkWrapper, positionStyle];

    return (
        <View style={wrapperStyle}>
            <TouchableOpacity
                onPress={toggleBookmark}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={generalActiveOpacity}
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
    },
    bookmarkWrapperFeed: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    /** Hero / toolbar bookmark: same footprint as circular button, loader perfectly centered. */
    bookmarkLoadingCentered: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedTouch: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BookmarkIcon;