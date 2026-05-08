import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import ArticleInfluenceItem, {
    ARTICLE_INFLUENCE_CARD_MIN_HEIGHT,
} from './ArticleInfluenceItem';
import {
    MainBrownSecondaryColor,
    generalTitleSize,
    articleTitleFont,
    generalTextFontWeight,
} from '../styles/GeneralAppStyle';
import i18n from '../utils/i18n';

/** Frontend-only sample rows until the API is wired. */
const DEFAULT_OPINIONS = [
    {
        id: '1',
        text: 'This analysis connects the policy shift to outcomes citizens will feel in the next quarter.',
        displayName: 'Dr. A. Mensah',
        occupation: 'Political economist',
        profilePicture: null,
        sentiment: 'support',
        likeCount: 24,
    },
    {
        id: '2',
        text: 'The data cited matches independent surveys; the conclusion is consistent with regional trends.',
        displayName: 'Prof. J. Nkomo',
        occupation: 'Statistician',
        profilePicture: null,
        sentiment: 'neutral',
        likeCount: 5,
    },
    {
        id: '3',
        text: 'Important nuance: implementation timelines often slip—watch the ministry’s next briefing.',
        displayName: 'M. Chanda',
        occupation: 'Podcaster',
        profilePicture: null,
        sentiment: 'disapprove',
        likeCount: 12,
    },
];

/**
 * Card width as a fraction of the carousel viewport — side insets center each snap position.
 * Higher = wider card (neighbors may sit fully off-screen).
 */
const CARD_WIDTH_FRACTION = 0.96;

/** Until `onLayout` runs, approximate NewsHome content padding + section side margin. */
const ESTIMATED_CAROUSEL_INSETS = 40;

const ArticleInfluenceSection = ({ opinions = DEFAULT_OPINIONS }) => {
    const { width: windowWidth } = useWindowDimensions();
    const [carouselWidth, setCarouselWidth] = useState(() =>
        Math.max(1, windowWidth - ESTIMATED_CAROUSEL_INSETS),
    );

    const onCarouselHostLayout = useCallback((event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        if (next > 0) {
            setCarouselWidth((prev) => (prev === next ? prev : next));
        }
    }, []);

    const { cardWidth, sideInset } = useMemo(() => {
        const w = carouselWidth;
        const cw = Math.max(1, Math.round(w * CARD_WIDTH_FRACTION));
        const si = Math.max(0, Math.round((w - cw) / 2));
        return { cardWidth: cw, sideInset: si };
    }, [carouselWidth]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const syncIndexFromOffset = useCallback(
        (offsetX) => {
            if (!opinions.length || cardWidth <= 0) return;
            const idx = Math.round(offsetX / cardWidth);
            const clamped = Math.min(Math.max(0, idx), opinions.length - 1);
            setCurrentIndex((prev) => (prev === clamped ? prev : clamped));
        },
        [opinions.length, cardWidth],
    );

    const onMomentumScrollEnd = useCallback(
        (e) => {
            syncIndexFromOffset(e.nativeEvent.contentOffset.x);
        },
        [syncIndexFromOffset],
    );

    const contentContainerStyle = useMemo(
        () => ({
            paddingHorizontal: sideInset,
        }),
        [sideInset],
    );

    const renderItem = useCallback(
        ({ item, index }) => (
            <View
                style={[
                    styles.slidePage,
                    { width: cardWidth, minHeight: ARTICLE_INFLUENCE_CARD_MIN_HEIGHT },
                ]}
            >
                <ArticleInfluenceItem
                    style={styles.slideItemFill}
                    text={item.text}
                    displayName={item.displayName}
                    occupation={item.occupation}
                    profilePicture={item.profilePicture}
                    sentiment={item.sentiment}
                    likeCount={item.likeCount ?? 0}
                    isLiked={item.isLiked ?? false}
                    onLikePress={typeof item.onLikePress === 'function' ? item.onLikePress : undefined}
                    onHeaderPress={typeof item.onHeaderPress === 'function' ? item.onHeaderPress : undefined}
                    isActive={opinions.length <= 1 || index === currentIndex}
                />
            </View>
        ),
        [cardWidth, opinions.length, currentIndex],
    );

    if (!opinions.length) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{i18n.t('articleInfluence.sectionTitle')}</Text>

            <View style={styles.carouselHost} onLayout={onCarouselHostLayout}>
                <FlatList
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={false}
                    snapToInterval={cardWidth}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    disableIntervalMomentum
                    data={opinions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    contentContainerStyle={contentContainerStyle}
                />
            </View>

            {opinions.length > 1 ? (
                <View
                    style={styles.dotsRow}
                    accessibilityRole="adjustable"
                    accessibilityLabel={`${i18n.t('articleInfluence.sectionTitle')}, slide ${currentIndex + 1} of ${opinions.length}`}
                >
                    {opinions.map((item, i) => (
                        <View
                            key={item.id}
                            style={[styles.dot, i === currentIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        marginHorizontal: 4,
        marginVertical: 2,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: generalTitleSize,
        fontWeight: generalTextFontWeight,
        color: MainBrownSecondaryColor,
        fontFamily: articleTitleFont,
        marginBottom: 12,
    },
    carouselHost: {
        width: '100%',
    },
    slidePage: {
        flexShrink: 0,
        justifyContent: 'center',
        paddingVertical: 6,
    },
    slideItemFill: {
        width: '100%',
        minHeight: ARTICLE_INFLUENCE_CARD_MIN_HEIGHT,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        paddingBottom: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    dotActive: {
        backgroundColor: MainBrownSecondaryColor,
        transform: [{ scale: 1.25 }],
    },
});

export default ArticleInfluenceSection;
