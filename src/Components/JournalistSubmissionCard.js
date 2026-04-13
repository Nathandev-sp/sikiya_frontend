import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
    articleTitleColor,
    articleTitleFont,
    generalSmallTextSize,
    generalTextFont,
    generalTitleFont,
    lightBannerBackgroundColor,
    MainBrownSecondaryColor,
    withdrawnTitleColor,
    withdrawnTitleSize,
    homeCardBorderRadius,
} from "../styles/GeneralAppStyle";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";
import { useLanguage } from "../Context/LanguageContext";

const STATUS_TOKENS = {
    approved: { bg: '#DCFCE7', text: '#166534', border: 'rgba(22, 101, 52, 0.25)' },
    rejected: { bg: '#FEE2E2', text: '#991B1B', border: 'rgba(153, 27, 27, 0.22)' },
    pending: { bg: '#FEF9C3', text: '#A16207', border: 'rgba(161, 98, 7, 0.28)' },
    default: { bg: '#F4F4F5', text: '#57534E', border: 'rgba(0,0,0,0.06)' },
};

function formatShortMetaDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    const opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) {
        opts.year = 'numeric';
    }
    return d.toLocaleDateString(undefined, opts);
}

const JournalistSubmissionCard = ({ submission, navigation }) => {
    const { t } = useLanguage();
    const isArticle = submission?.type === 'article';
    const isVideo = submission?.type === 'video';

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return t('submissions.approved');
            case 'rejected':
                return t('submissions.rejected');
            case 'pending':
                return t('submissions.pending');
            default:
                return t('submissions.pending');
        }
    };

    const hasRealThumbnail = useMemo(() => {
        if (isArticle && submission?.article_front_image) return true;
        if (isVideo && submission?.video_front_image) return true;
        return false;
    }, [isArticle, isVideo, submission?.article_front_image, submission?.video_front_image]);

    const imageSource = useMemo(() => {
        if (isArticle && submission?.article_front_image) {
            return { uri: getImageUrl(submission.article_front_image) };
        }
        if (isVideo && submission?.video_front_image) {
            return { uri: getImageUrl(submission.video_front_image) };
        }
        if (isVideo) {
            return require('../../assets/functionalImages/video-camera.png');
        }
        return require('../../assets/functionalImages/FrontImagePlaceholder.png');
    }, [isArticle, isVideo, submission?.article_front_image, submission?.video_front_image]);

    const title = (isArticle ? submission?.article_title : submission?.video_title) || t('submissions.untitled', { defaultValue: 'Untitled' });
    const statusKey = submission?.approval_status === 'approved' || submission?.approval_status === 'rejected' || submission?.approval_status === 'pending'
        ? submission.approval_status
        : 'default';
    const statusStyle = STATUS_TOKENS[statusKey] || STATUS_TOKENS.default;

    const metaLine = `${isArticle ? t('submissions.article') : t('submissions.video')} • ${submission?.created_on ? formatShortMetaDate(submission.created_on) : t('submissions.notAvailable')}`;

    const handleView = useCallback(() => {
        if (submission?.approval_status !== 'approved' || !navigation) return;
        if (isArticle) {
            navigation.navigate('NewsHome', { articleId: String(submission._id) });
        } else {
            navigation.navigate('LiveNews', { videoId: String(submission._id) });
        }
    }, [navigation, submission?._id, submission?.approval_status, isArticle]);

    const showSoon = useCallback(() => {
        Alert.alert(t('submissions.actionSoonTitle'), t('submissions.actionSoonMessage'));
    }, [t]);

    const decisionLine = useMemo(() => {
        const d = submission?.published_on || submission?.approval_date;
        if (!d) return null;
        return `${t('submissions.decisionShort')} ${formatShortMetaDate(d)}`;
    }, [submission?.published_on, submission?.approval_date, t]);

    return (
        <Pressable
            style={({ pressed }) => [styles.outer, pressed && styles.outerPressed]}
            accessibilityRole="summary"
            accessibilityLabel={`${isArticle ? t('submissions.article') : t('submissions.video')}: ${title}. ${getStatusText(submission?.approval_status)}`}
            android_ripple={null}
        >
            <View style={styles.card}>
                <View style={styles.topRow}>
                    <View style={styles.thumbWrap}>
                        <Image
                            style={styles.frontImage}
                            defaultSource={isVideo ? require('../../assets/functionalImages/video-camera.png') : require('../../assets/functionalImages/FrontImagePlaceholder.png')}
                            source={imageSource}
                            resizeMode="cover"
                        />
                        {!hasRealThumbnail && (
                            <>
                                <LinearGradient
                                    colors={['rgba(62,42,24,0.05)', 'rgba(62,42,24,0.38)']}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.thumbIconCenter}>
                                    <Ionicons
                                        name={isVideo ? 'videocam' : 'image-outline'}
                                        size={26}
                                        color="rgba(255,255,255,0.92)"
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.copyCol}>
                        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                            {title}
                        </Text>
                        <Text style={styles.metaMuted} numberOfLines={1}>
                            {metaLine}
                        </Text>
                        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                                {getStatusText(submission?.approval_status)}
                            </Text>
                        </View>
                    </View>
                </View>

                {decisionLine ? (
                    <Text style={styles.decisionMuted} numberOfLines={1}>{decisionLine}</Text>
                ) : null}

                {submission?.approval_status !== 'pending' && submission?.approval_reason ? (
                    <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{submission.approval_reason}</Text>
                    </View>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                    <Pressable
                        onPress={handleView}
                        disabled={submission?.approval_status !== 'approved'}
                        style={({ pressed }) => [
                            styles.actionHit,
                            submission?.approval_status !== 'approved' && styles.actionDisabled,
                            pressed && submission?.approval_status === 'approved' && styles.actionPressed,
                        ]}
                    >
                        <Text style={[
                            styles.actionText,
                            submission?.approval_status !== 'approved' && styles.actionTextDisabled,
                        ]}>
                            {t('submissions.view')}
                        </Text>
                    </Pressable>
                    <Text style={styles.actionSep}>|</Text>
                    <Pressable
                        onPress={showSoon}
                        style={({ pressed }) => [styles.actionHit, pressed && styles.actionPressed]}
                    >
                        <Text style={styles.actionTextMuted}>{t('submissions.edit')}</Text>
                    </Pressable>
                    <Text style={styles.actionSep}>|</Text>
                    <Pressable
                        onPress={showSoon}
                        style={({ pressed }) => [styles.actionHit, pressed && styles.actionPressed]}
                    >
                        <Text style={styles.actionTextMuted}>{t('submissions.delete')}</Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    outer: {
        marginVertical: 7,
        alignSelf: 'stretch',
    },
    outerPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.98,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: homeCardBorderRadius,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(44, 36, 22, 0.1)',
        shadowColor: '#2C2416',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    thumbWrap: {
        width: 88,
        height: 88,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: lightBannerBackgroundColor,
        marginRight: 14,
    },
    frontImage: {
        width: '100%',
        height: '100%',
    },
    thumbIconCenter: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyCol: {
        flex: 1,
        minHeight: 88,
        justifyContent: 'flex-start',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: articleTitleColor,
        fontFamily: articleTitleFont,
        lineHeight: 21,
        marginBottom: 6,
    },
    metaMuted: {
        fontSize: 13,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 10,
    },
    statusPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
    },
    statusPillText: {
        fontSize: 12,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    decisionMuted: {
        marginTop: 10,
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    messageBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: lightBannerBackgroundColor,
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(44, 36, 22, 0.08)',
    },
    messageText: {
        fontSize: generalSmallTextSize,
        color: '#4A4540',
        fontFamily: generalTextFont,
        lineHeight: 19,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(62, 42, 24, 0.22)',
        marginTop: 16,
        marginBottom: 12,
        alignSelf: 'stretch',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    actionHit: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    actionPressed: {
        opacity: 0.7,
    },
    actionDisabled: {
        opacity: 1,
    },
    actionText: {
        fontSize: 13,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
    },
    actionTextDisabled: {
        color: '#C4BFB8',
    },
    actionTextMuted: {
        fontSize: 13,
        fontFamily: generalTextFont,
        color: '#8A847C',
    },
    actionSep: {
        fontSize: 12,
        color: 'rgba(44, 36, 22, 0.2)',
        marginHorizontal: 2,
    },
});

export default React.memo(JournalistSubmissionCard);
