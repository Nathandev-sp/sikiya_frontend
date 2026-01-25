import React from "react";
import {View, Text, StyleSheet, Image, useWindowDimensions} from 'react-native';
import AppScreenBackgroundColor, { 
    articleTextSize,
    articleTitleColor, 
    articleTitleFont, 
    cardBackgroundColor, 
    commentTextSize, 
    generalSmallTextSize,
    generalTextColor, 
    generalTextFont, 
    generalTextSize, 
    generalTitleFont,
    generalTitleFontWeight, 
    lightBannerBackgroundColor,
    main_Style, 
    mainBrownColor, 
    withdrawnTitleColor, 
    withdrawnTitleSize 
} from "../styles/GeneralAppStyle";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";
import DateConverter from "../Helpers/DateConverter";
import { useLanguage } from "../Context/LanguageContext";

const JournalistSubmissionCard = ({submission}) => {
    const {width} = useWindowDimensions();
    const { t } = useLanguage();
    const isArticle = submission.type === 'article';
    const isVideo = submission.type === 'video';

    // Get status color
    const getStatusColor = (status) => {
        switch(status) {
            case 'approved':
                return '#10B981'; // green
            case 'rejected':
                return '#EF4444'; // red
            case 'pending':
                return '#F59E0B'; // orange/yellow
            default:
                return withdrawnTitleColor;
        }
    };

    // Get status text with translation
    const getStatusText = (status) => {
        switch(status) {
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

    // Get image source
    const getImageSource = () => {
        if (isArticle && submission.article_front_image) {
            return { uri: getImageUrl(submission.article_front_image) };
        }
        if (isVideo && submission.video_front_image) {
            return { uri: getImageUrl(submission.video_front_image) };
        }
        // Use video camera image for videos, placeholder for articles
        if (isVideo) {
            return require('../../assets/functionalImages/video-camera.png');
        }
        // Use placeholder for articles
        return require('../../assets/functionalImages/FrontImagePlaceholder.png');
    };

    return(
        <View style={[styles.container, main_Style.genButtonElevation, {width: width * 0.94}]}>
            <View style={styles.introContainer}>
                {/* Image on the left */}
                <View style={styles.imageContainer}>
                    <Image 
                        style={styles.frontImage}
                        defaultSource={isVideo ? require('../../assets/functionalImages/video-camera.png') : require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                        source={getImageSource()}
                    />
                </View>
                
                {/* Content on the right */}
                <View style={styles.contentContainer}>
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text 
                            style={styles.cardTitle} 
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {isArticle ? submission.article_title : submission.video_title}
                        </Text>
                    </View>
                    
                    {/* Type indicator (Article or Video) */}
                    <View style={styles.typeContainer}>
                        <Ionicons 
                            name={isArticle ? "document-text" : "videocam"} 
                            size={14} 
                            color={withdrawnTitleColor} 
                            style={styles.typeIcon}
                        />
                        <Text style={styles.typeText}>
                            {isArticle ? t('submissions.article') : t('submissions.video')}
                        </Text>
                    </View>
                </View>
            </View>
            
            {/* Approval Status Section */}
            <View style={styles.approvalSection}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{t('submissions.approvalStatus')}:</Text>
                    <View style={[styles.statusBadge]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(submission.approval_status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(submission.approval_status) }]}>
                            {getStatusText(submission.approval_status)}
                        </Text>
                    </View>
                </View>
                
                {/* Date Information */}
                <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar" size={14} color={withdrawnTitleColor} style={styles.dateIcon} />
                        <Text style={styles.dateLabel}>{t('submissions.created')}: </Text>
                        <Text style={styles.dateValue}>
                            {submission.created_on ? DateConverter(submission.created_on) : t('submissions.notAvailable')}
                        </Text>
                    </View>
                </View>
                
                {/* Decision Date - show if there's a decision (published_on or approval_date) */}
                {(submission.published_on || submission.approval_date) && (
                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Ionicons name="checkmark-circle" size={14} color={withdrawnTitleColor} style={styles.dateIcon} />
                            <Text style={styles.dateLabel}>{t('submissions.decisionDate')}: </Text>
                            <Text style={styles.dateValue}>
                                {DateConverter(submission.published_on || submission.approval_date)}
                            </Text>
                        </View>
                    </View>
                )}
                
                {/* Approval Message - only show if not pending */}
                {submission.approval_status !== 'pending' && submission.approval_reason && (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageLabel}>{t('submissions.decisionMessage')}:</Text>
                        <Text style={styles.messageText}>{submission.approval_reason}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 12,
        marginVertical: 8,
        alignSelf: 'center',
        padding: 12,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    introContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    imageContainer: {
        width: 110,
        height: 85,
        borderRadius: 12,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 12,
    },
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 12,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        minHeight: 85,
        paddingVertical: 2,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 8,
        minHeight: 44,
    },
    cardTitle: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        lineHeight: 20,
        letterSpacing: 0.2,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: lightBannerBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    typeIcon: {
        marginRight: 5,
    },
    typeText: {
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    approvalSection: {
        borderTopWidth: 0.5,
        borderTopColor: withdrawnTitleColor,
        paddingTop: 12,
        marginTop: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statusLabel: {
        fontSize: generalSmallTextSize,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    dateRow: {
        marginTop: 8,
        marginBottom: 4,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateIcon: {
        marginRight: 8,
    },
    dateLabel: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    dateValue: {
        fontSize: generalSmallTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    messageContainer: {
        marginTop: 10,
        padding: 12,
        backgroundColor: lightBannerBackgroundColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    messageLabel: {
        fontSize: generalSmallTextSize,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    messageText: {
        fontSize: generalSmallTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
    },
});

export default JournalistSubmissionCard;

