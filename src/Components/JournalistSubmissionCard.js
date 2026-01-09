import React from "react";
import {View, Text, StyleSheet, Image, useWindowDimensions} from 'react-native';
import AppScreenBackgroundColor, { 
    articleTextSize,
    articleTitleColor, 
    articleTitleFont, 
    commentTextSize, 
    generalTextColor, 
    generalTextFont, 
    generalTextSize, 
    generalTitleFontWeight, 
    mainBrownColor, 
    withdrawnTitleColor, 
    withdrawnTitleSize 
} from "../styles/GeneralAppStyle";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";
import DateConverter from "../Helpers/DateConverter";

const JournalistSubmissionCard = ({submission}) => {
    const {width} = useWindowDimensions();
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

    // Get status text with capital first letter
    const getStatusText = (status) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
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
        <View style={[styles.container, {width: width * 0.94}]}>
            <View style={styles.introContainer}>
                {/* Image on the left */}
                <View style={styles.imageContainer}>
                    <Image 
                        style={styles.frontImage}
                        defaultSource={isVideo ? require('../../assets/functionalImages/video-camera.png') : require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                        source={getImageSource()}
                    />
                    <View style={styles.imageOverlay} pointerEvents="none" />
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
                            {isArticle ? 'Article' : 'Video'}
                        </Text>
                    </View>
                </View>
            </View>
            
            {/* Approval Status Section */}
            <View style={styles.approvalSection}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Approval Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(submission.approval_status) + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(submission.approval_status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(submission.approval_status) }]}>
                            {getStatusText(submission.approval_status)}
                        </Text>
                    </View>
                </View>
                
                {/* Date Information */}
                <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={14} color={withdrawnTitleColor} style={styles.dateIcon} />
                        <Text style={styles.dateLabel}>Created: </Text>
                        <Text style={styles.dateValue}>
                            {submission.created_on ? DateConverter(submission.created_on) : 'N/A'}
                        </Text>
                    </View>
                </View>
                
                {/* Decision Date - show if there's a decision (published_on or approval_date) */}
                {(submission.published_on || submission.approval_date) && (
                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Ionicons name="checkmark-circle-outline" size={14} color={withdrawnTitleColor} style={styles.dateIcon} />
                            <Text style={styles.dateLabel}>Decision Date: </Text>
                            <Text style={styles.dateValue}>
                                {DateConverter(submission.published_on || submission.approval_date)}
                            </Text>
                        </View>
                    </View>
                )}
                
                {/* Approval Message - only show if not pending */}
                {submission.approval_status !== 'pending' && submission.approval_reason && (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageLabel}>Decision Message:</Text>
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
        borderRadius: 10,
        marginVertical: 6,
        alignSelf: 'center',
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    introContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    imageContainer: {
        width: 100,
        height: 75,
        borderRadius: 8,
        backgroundColor: mainBrownColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 10,
        position: 'relative',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        zIndex: 1,
    },
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 8,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        minHeight: 75,
        paddingVertical: 0,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 6,
        minHeight: 40,
    },
    cardTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: articleTitleColor,
        fontFamily: articleTitleFont,
        lineHeight: 18,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    typeIcon: {
        marginRight: 6,
    },
    typeText: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    approvalSection: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        marginTop: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statusLabel: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: withdrawnTitleSize,
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    dateRow: {
        marginTop: 6,
        marginBottom: 3,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateIcon: {
        marginRight: 6,
    },
    dateLabel: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    dateValue: {
        fontSize: withdrawnTitleSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '400',
    },
    messageContainer: {
        marginTop: 6,
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    messageLabel: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
        marginBottom: 4,
    },
    messageText: {
        fontSize: commentTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
});

export default JournalistSubmissionCard;

