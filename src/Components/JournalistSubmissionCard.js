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
            {/* Upper section with red background */}
            <View style={styles.upperSection}>
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
                                size={20} 
                                color={withdrawnTitleColor} 
                                style={styles.typeIcon}
                            />
                            <Text style={styles.typeText}>
                                {isArticle ? t('submissions.article') : t('submissions.video')}
                            </Text>
                        </View>
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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 6,
        alignSelf: 'center',
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    upperSection: {
        backgroundColor: cardBackgroundColor,
        padding: 8,
    },
    introContainer: {
        width: '100%',
        flexDirection: 'row',
        minHeight: 80,
        marginBottom: 0,
    },
    imageContainer: {
        width: '30%',
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative',
    },
    frontImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingRight: 4,
        paddingVertical: 2,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: articleTitleFont,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: mainBrownColor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeIcon: {
        marginRight: 5,
    },
    typeText: {
        fontSize: commentTextSize,
        color:generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    approvalSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 12,
        marginTop: 0,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: withdrawnTitleSize - 1,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: withdrawnTitleSize - 1,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    dateRow: {
        marginTop: 6,
        marginBottom: 3,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateIcon: {
        marginRight: 2,
    },
    dateLabel: {
        fontSize: withdrawnTitleSize - 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    dateValue: {
        fontSize: withdrawnTitleSize - 1,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    messageContainer: {
        marginTop: 8,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    messageLabel: {
        fontSize: withdrawnTitleSize - 1,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    messageText: {
        fontSize: withdrawnTitleSize - 1,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
});

export default JournalistSubmissionCard;

