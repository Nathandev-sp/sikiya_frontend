import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Platform, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {
    generalTextFont,
    generalTitleFont,
    generalTitleSize,
    generalLineHeight,
    generalSmallTextSize,
    generalSmallLineHeight,
    commentTextSize,
    articleLineHeight,
    generalTextColor,
    withdrawnTitleColor,
    mainTitleColor,
    defaultButtonHitslop,
    generalActiveOpacity,
    generalTitleFontWeight,
    generalTextFontWeight,
    withdrawnTitleFontWeight,
} from '../styles/GeneralAppStyle';
import { getImageUrl } from '../utils/imageUrl';
import { formatNumber } from '../utils/numberFormatter';
import i18n from '../utils/i18n';

const PLACEHOLDER_AVATAR = require('../../assets/functionalImages/ProfilePic.png');

/** Min height for expert cards (carousel + single-card layouts). */
export const ARTICLE_INFLUENCE_CARD_MIN_HEIGHT = 240;

/** Border ring + top accent (support / disapprove / neutral). */
export const INFLUENCE_SENTIMENT = {
    support: '#16A34A',
    disapprove: '#DC2626',
    neutral: '#EA580C',
};

/** Rule below header — footer flows without a second line so quote + likes feel connected */
const SECTION_RULE_COLOR = 'rgba(24, 40, 66, 0.09)';
const SECTION_RULE_WIDTH = 1;

/** Soft fill for sentiment pill background from hex. */
function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return null;
    let h = hex.replace('#', '');
    if (h.length === 3) {
        h = h.split('').map((c) => c + c).join('');
    }
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return `rgba(${r},${g},${b},${alpha})`;
}

const SENTIMENT_I18N_KEY = {
    support: 'articleInfluence.sentimentSupport',
    disapprove: 'articleInfluence.sentimentDisapprove',
    neutral: 'articleInfluence.sentimentNeutral',
};

/**
 * Expert opinion slide: white card, top accent + avatar ring + sentiment pill.
 *
 * @param {'support'|'disapprove'|'neutral'} sentiment
 * @param {number} [likeCount=0] — likes shown in footer
 * @param {Function} [onLikePress] — optional like handler (footer is non-pressable when omitted)
 * @param {boolean} [isActive=true] — carousel: scale + shadow on focused card
 */
const ArticleInfluenceItem = ({
    text,
    displayName,
    occupation,
    profilePicture,
    sentiment = 'neutral',
    likeCount = 0,
    isLiked = false,
    onHeaderPress,
    onLikePress,
    isActive = true,
    style,
}) => {
    const avatarSource =
        profilePicture != null && profilePicture !== ''
            ? { uri: getImageUrl(profilePicture) }
            : PLACEHOLDER_AVATAR;

    const accent = INFLUENCE_SENTIMENT[sentiment] ?? INFLUENCE_SENTIMENT.neutral;
    const sentimentLabel = i18n.t(SENTIMENT_I18N_KEY[sentiment] ?? SENTIMENT_I18N_KEY.neutral);

    const pillBg = useMemo(() => hexToRgba(accent, 0.12) ?? 'rgba(234, 88, 12, 0.12)', [accent]);

    const scale = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: isActive ? 1 : 0.95,
            friction: 7,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, [isActive, scale]);

    const animatedTransform = { transform: [{ scale }] };

    const footerLikeContent = (
        <>
            <FontAwesome
                name={isLiked ? 'heart' : 'heart-o'}
                size={commentTextSize + 2}
                color={isLiked ? accent : withdrawnTitleColor}
            />
            <Text style={styles.footerCount}>{formatNumber(likeCount)}</Text>
            <Text style={styles.footerLikesWord}>{i18n.t('articleInfluence.likes')}</Text>
        </>
    );

    return (
        <Animated.View
            style={[
                styles.shadowOuter,
                isActive ? styles.shadowActive : styles.shadowInactive,
                animatedTransform,
                style,
            ]}
        >
            <View style={styles.cardInner}>
                <View style={[styles.accentBar, { backgroundColor: accent }]} />
                <TouchableOpacity
                    style={styles.headerRow}
                    onPress={onHeaderPress}
                    disabled={!onHeaderPress}
                    activeOpacity={generalActiveOpacity}
                    accessibilityRole={onHeaderPress ? 'button' : 'text'}
                    accessibilityLabel={displayName ? `${displayName}` : i18n.t('profile.profile')}
                >
                    <Image
                        source={avatarSource}
                        style={[styles.avatar, { borderColor: accent }]}
                        resizeMode="cover"
                    />
                    <View style={styles.nameColumn}>
                        <Text style={styles.displayName} numberOfLines={2}>
                            {displayName || '—'}
                        </Text>
                        {occupation ? (
                            <Text style={styles.occupationBelow} numberOfLines={2}>
                                {occupation}
                            </Text>
                        ) : null}
                    </View>
                    <View style={[styles.sentimentPill, { backgroundColor: pillBg }]}>
                        <View style={[styles.sentimentDot, { backgroundColor: accent }]} />
                        <Text style={styles.sentimentPillText} numberOfLines={1}>
                            {sentimentLabel}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.commentBlock}>
                    <Text style={styles.commentText} numberOfLines={5} ellipsizeMode="tail">
                        {text}
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    {onLikePress ? (
                        <TouchableOpacity
                            style={styles.footerLikeRow}
                            onPress={onLikePress}
                            hitSlop={defaultButtonHitslop}
                            activeOpacity={generalActiveOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={`${formatNumber(likeCount)} ${i18n.t('articleInfluence.likes')}`}
                        >
                            {footerLikeContent}
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={styles.footerLikeRow}
                            accessibilityRole="text"
                            accessibilityLabel={`${formatNumber(likeCount)} ${i18n.t('articleInfluence.likes')}`}
                        >
                            {footerLikeContent}
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadowOuter: {
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        width: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
            },
            android: {},
        }),
    },
    shadowInactive: {
        ...Platform.select({
            ios: {
                shadowOpacity: 0.07,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    shadowActive: {
        ...Platform.select({
            ios: {
                shadowOpacity: 0.14,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    cardInner: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        minHeight: ARTICLE_INFLUENCE_CARD_MIN_HEIGHT,
        flexDirection: 'column',
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    headerRow: {
        flexShrink: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    nameColumn: {
        flex: 1,
        marginLeft: 12,
        minWidth: 0,
        justifyContent: 'center',
        paddingRight: 8,
    },
    sentimentPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexShrink: 0,
        maxWidth: 124,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        gap: 6,
    },
    sentimentDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        flexShrink: 0,
    },
    sentimentPillText: {
        fontFamily: generalTextFont,
        fontSize: generalSmallTextSize,
        lineHeight: generalSmallLineHeight,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
    },
    displayName: {
        fontFamily: generalTitleFont,
        fontSize: generalTitleSize,
        fontWeight: generalTitleFontWeight,
        color: mainTitleColor,
        lineHeight: generalLineHeight,
    },
    occupationBelow: {
        marginTop: 4,
        fontFamily: generalTextFont,
        fontSize: generalSmallTextSize,
        lineHeight: generalSmallLineHeight,
        color: withdrawnTitleColor,
        fontWeight: withdrawnTitleFontWeight,
    },
    commentBlock: {
        flexShrink: 0,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: SECTION_RULE_WIDTH,
        borderTopColor: SECTION_RULE_COLOR,
    },
    commentText: {
        fontFamily: generalTextFont,
        fontSize: commentTextSize,
        lineHeight: articleLineHeight,
        color: generalTextColor,
        fontWeight: generalTextFontWeight,
    },
    cardFooter: {
        flexShrink: 0,
        marginTop: 'auto',
        paddingTop: 2,
    },
    footerLikeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerCount: {
        marginLeft: 10,
        fontFamily: generalTextFont,
        fontSize: commentTextSize,
        lineHeight: articleLineHeight,
        color: generalTextColor,
        fontWeight: generalTitleFontWeight,
    },
    footerLikesWord: {
        marginLeft: 4,
        fontFamily: generalTextFont,
        fontSize: generalSmallTextSize,
        lineHeight: generalSmallLineHeight,
        color: withdrawnTitleColor,
        fontWeight: withdrawnTitleFontWeight,
    },
});

export default ArticleInfluenceItem;
