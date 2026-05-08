import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BinaryVoteResultBar from './BinaryVoteResultBar';
import {
    generalSmallTextSize,
    generalTextFont,
    generalTextSize,
    generalTitleFontWeight,
} from '../../styles/GeneralAppStyle';
import {
    LANE_FADED_TEXT,
    LANE_UNSELECTED_BORDER,
    LANE_UNSELECTED_FILL,
} from '../../theme/discussionLanePalette';
import { useLanguage } from '../../Context/LanguageContext';

const CARD_TEXT = '#1F2937';
const MUTED = '#6B7280';
const OPEN_CARD_MIN_HEIGHT = 96;

export default function DiscussionLaneCard({
    lane,
    palette,
    lang,
    commentCount,
    onOpenOpenLane,
    onBinaryVote,
    onJoinBinaryLane,
    voting = false,
    alwaysShowJoinBinary = false,
    joinDiscussionLabel,
    oneCommentLabel,
    manyCommentsLabel,
}) {
    const { t } = useLanguage();
    const isBinary = lane.laneType === 'binary';
    const tEn = lane.translations?.en;
    const tFr = lane.translations?.fr;
    const tLane = lang === 'fr' ? tFr : tEn;
    const title = lane.title || tLane?.title || lane.key;
    const primaryLabel = tLane?.binaryPrimaryLabel || 'Yes';
    const secondaryLabel = tLane?.binarySecondaryLabel || 'No';
    const vs = lane.voteSummary;
    const userSide = vs?.userSide;
    const totalVotes = vs?.total ?? 0;
    const primaryPct = vs?.primaryPct ?? 0;
    const secondaryPct = vs?.secondaryPct ?? 0;
    const showBar = totalVotes > 0 || Boolean(userSide);

    const cardBg = palette.cardSurface;
    const countLabel =
        commentCount === 1 ? oneCommentLabel || 'comment' : manyCommentsLabel || 'comments';

    const sentimentCaption =
        showBar &&
        t('article.communitySentimentLine', {
            primaryPct: Math.round(primaryPct),
            primaryLabel,
        });

    const primaryBtnStyle = (selected, pressed) => {
        const hasVote = Boolean(userSide);
        if (!hasVote) {
            return {
                backgroundColor: '#FFFFFF',
                borderColor: palette.primaryBorderUnvoted,
                borderWidth: 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            };
        }
        if (selected) {
            return {
                backgroundColor: palette.base,
                borderColor: palette.base,
                borderWidth: 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            };
        }
        return {
            backgroundColor: LANE_UNSELECTED_FILL,
            borderColor: LANE_UNSELECTED_BORDER,
            borderWidth: 1.5,
            transform: [{ scale: pressed ? 0.97 : 1 }],
        };
    };

    const secondaryBtnStyle = (selected, pressed) => {
        const hasVote = Boolean(userSide);
        if (!hasVote) {
            return {
                backgroundColor: '#FFFFFF',
                borderColor: palette.opposeBorder,
                borderWidth: 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            };
        }
        if (selected) {
            return {
                backgroundColor: palette.opposeSelected,
                borderColor: palette.opposeSelected,
                borderWidth: 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            };
        }
        return {
            backgroundColor: LANE_UNSELECTED_FILL,
            borderColor: LANE_UNSELECTED_BORDER,
            borderWidth: 1.5,
            transform: [{ scale: pressed ? 0.97 : 1 }],
        };
    };

    const primaryTextStyle = (selected) => {
        const hasVote = Boolean(userSide);
        if (!hasVote) return { color: palette.base };
        if (selected) return { color: '#FFFFFF' };
        return { color: LANE_FADED_TEXT };
    };

    const secondaryTextStyle = (selected) => {
        const hasVote = Boolean(userSide);
        if (!hasVote) return { color: MUTED };
        if (selected) return { color: '#FFFFFF' };
        return { color: LANE_FADED_TEXT };
    };

    const renderBinaryButtons = () => (
        <View>
            <View style={styles.btnRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.binBtn,
                        primaryBtnStyle(userSide === 'primary', pressed),
                    ]}
                    disabled={voting}
                    onPress={() => onBinaryVote(lane, 'primary')}
                >
                    <Text
                        style={[styles.binBtnText, primaryTextStyle(userSide === 'primary')]}
                        numberOfLines={2}
                    >
                        {primaryLabel}
                    </Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.binBtn,
                        secondaryBtnStyle(userSide === 'secondary', pressed),
                    ]}
                    disabled={voting}
                    onPress={() => onBinaryVote(lane, 'secondary')}
                >
                    <Text
                        style={[styles.binBtnText, secondaryTextStyle(userSide === 'secondary')]}
                        numberOfLines={2}
                    >
                        {secondaryLabel}
                    </Text>
                </Pressable>
            </View>
            {voting ? (
                <View style={styles.votingHint}>
                    <ActivityIndicator size="small" color={palette.base} />
                </View>
            ) : null}
        </View>
    );

    const ripple =
        Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)', foreground: true } : undefined;

    const cardShell = [
        styles.card,
        { backgroundColor: cardBg, borderColor: palette.cardBorder },
    ];

    if (!isBinary) {
        return (
            <Pressable
                style={({ pressed }) => [
                    ...cardShell,
                    styles.openCard,
                    { minHeight: OPEN_CARD_MIN_HEIGHT },
                    pressed && Platform.OS === 'ios' ? { opacity: 0.96 } : null,
                ]}
                onPress={() => onOpenOpenLane(lane)}
                accessibilityRole="button"
                android_ripple={ripple}
            >
                <View style={styles.openRow}>
                    <View style={[styles.iconWrap, { backgroundColor: palette.iconTileBg }]}>
                        <Ionicons name={lane.icon} size={20} color={palette.base} />
                    </View>
                    <View style={styles.openInfo}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.commentLineTight}>
                            {commentCount} {countLabel}
                        </Text>
                        <View style={styles.joinLabelRow}>
                            <Ionicons name="chatbubbles-outline" size={15} color={palette.accent} />
                            <Text style={[styles.joinInline, { color: palette.accent }]}>
                                {joinDiscussionLabel}
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.plusBtn,
                            {
                                borderColor: palette.accent,
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                            },
                        ]}
                        onPress={() => onOpenOpenLane(lane)}
                        hitSlop={8}
                        android_ripple={ripple}
                    >
                        <Ionicons name="add" size={24} color={palette.accent} />
                    </Pressable>
                </View>
            </Pressable>
        );
    }

    return (
        <View style={cardShell}>
            <View style={styles.binaryHeader}>
                <View style={[styles.iconWrap, { backgroundColor: palette.iconTileBg }]}>
                    <Ionicons name={lane.icon} size={20} color={palette.base} />
                </View>
                <Text style={[styles.title, styles.titleBinary]}>{title}</Text>
            </View>

            {renderBinaryButtons()}

            {showBar ? (
                <View style={styles.resultsBlock}>
                    {sentimentCaption ? (
                        <Text style={styles.pctLine} numberOfLines={2}>
                            {sentimentCaption}
                        </Text>
                    ) : null}
                    <BinaryVoteResultBar
                        primaryPct={primaryPct}
                        secondaryPct={secondaryPct}
                        primaryColor={palette.base}
                    />
                </View>
            ) : null}

            <Text style={styles.commentLineMeta}>
                {commentCount} {countLabel}
            </Text>

            {(userSide || alwaysShowJoinBinary) ? (
                <Pressable
                    onPress={() => onJoinBinaryLane(lane)}
                    style={styles.joinPress}
                    android_ripple={ripple}
                >
                    <View style={styles.joinLabelRow}>
                        <Ionicons name="chatbubbles-outline" size={17} color={palette.accent} />
                        <Text style={[styles.joinHint, { color: palette.accent }]}>
                            {joinDiscussionLabel}
                        </Text>
                    </View>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 0,
        borderWidth: 0.8,
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    openCard: {
        justifyContent: 'center',
    },
    openRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    openInfo: {
        flex: 1,
    },
    binaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 18,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: CARD_TEXT,
        fontFamily: generalTextFont,
    },
    titleBinary: {
        flex: 1,
    },
    commentLineTight: {
        fontSize: generalSmallTextSize,
        fontWeight: '500',
        color: MUTED,
        fontFamily: generalTextFont,
        marginTop: 4,
    },
    commentLineMeta: {
        fontSize: generalSmallTextSize,
        fontWeight: '500',
        color: MUTED,
        fontFamily: generalTextFont,
        marginTop: 6,
    },
    joinLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
        flexWrap: 'wrap',
    },
    joinInline: {
        fontSize: generalSmallTextSize + 0.5,
        fontFamily: generalTextFont,
        fontWeight: '700',
        flexShrink: 1,
    },
    plusBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    joinHint: {
        fontSize: generalSmallTextSize + 1,
        fontFamily: generalTextFont,
        fontWeight: '700',
        flexShrink: 1,
    },
    joinPress: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 2,
    },
    binBtn: {
        flex: 1,
        minHeight: 46,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    binBtnText: {
        fontSize: 13,
        fontFamily: generalTextFont,
        fontWeight: '600',
        textAlign: 'center',
    },
    resultsBlock: {
        marginTop: 8,
        gap: 8,
    },
    pctLine: {
        fontSize: 12,
        fontFamily: generalTextFont,
        color: '#475569',
        fontWeight: '600',
        letterSpacing: 0.15,
        lineHeight: 17,
    },
    votingHint: {
        alignItems: 'center',
        marginTop: 8,
    },
});
