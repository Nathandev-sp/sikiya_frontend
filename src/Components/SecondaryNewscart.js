import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Alert, ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../utils/i18n';
import AppScreenBackgroundColor, { 
    articleTitleColor, 
    articleTitleFont, 
    cardBackgroundColor, 
    generalLineHeight, 
    generalSmallLineHeight, 
    generalSmallTextSize,
    generalTextColor, 
    generalTextFont, 
    generalTextSize, 
    generalTitleColor, 
    generalTitleFont, 
    generalTitleFontWeight, 
    lightBannerBackgroundColor, 
    main_Style,
    mainborderColor, 
    mainBrownColor, 
    secCardBackgroundColor,
    withdrawnTitleColor, 
    withdrawnTitleSize 
} from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";

const SecondaryNewsCart = ({article}) => {
    const {width, height} = useWindowDimensions();
    const navigation = useNavigation();
    const [imageLoading, setImageLoading] = useState(true);

    const goToNewsHome = () => {
        if (article && article._id) {
            navigation.navigate('NewsHome', {article: article});
        } else {
            console.error('Cannot navigate: article ID is missing', article);
            Alert.alert(i18n.t('common.error'), i18n.t('article.cannotOpen') || 'Cannot open this article');
        }
    };

    return(
        <TouchableOpacity 
            activeOpacity={0.75} 
            onPress={goToNewsHome}
            accessibilityRole="button"
            accessibilityLabel={`${i18n.t('article.readArticle')}: ${article.article_title}`}
            accessibilityHint={i18n.t('article.tapToRead') || 'Tap to read full article'}
        >
            <View style={[styles.container, main_Style.genContentElevation, {width: width * 0.96}]}>
                <View style={styles.introContainer}>
                    {/* Image Container with Loading State */}
                    <View style={styles.imageContainer}>
                        <Image 
                            style={contentstyle.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            source={{ uri: getImageUrl(article.article_front_image) }}
                            resizeMode="cover"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />
                        
                        {/* Loading Indicator */}
                        {imageLoading && (
                            <View style={styles.imageLoadingOverlay}>
                                <ActivityIndicator size="small" color={mainBrownColor} />
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.contentContainer}>
                        {/* Category Badge */}
                        {article.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>
                                    {article.category.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        
                        {/* Title */}
                        <View style={styles.ArticleTitleContainer}>
                            <Text 
                                style={contentstyle.cardTitle} 
                                numberOfLines={3}
                                ellipsizeMode="tail"
                            >
                                {article.article_title}
                            </Text>
                        </View>
                        
                        {/* Author Info */}
                        <View style={styles.authorContainer}>
                            <View style={styles.authorImageContainer}>
                                <Image 
                                    style={styles.authorImage}
                                    defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                    source={{ uri: getImageUrl(article.journalist?.profile_picture) }}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName} numberOfLines={1}>
                                    {(() => {
                                        if (article.journalist?.displayName) {
                                            return article.journalist.displayName;
                                        }
                                        if (article.journalist?.journalist?.displayName) {
                                            return article.journalist.journalist.displayName;
                                        }
                                        const firstname = article.journalist?.firstname || article.journalist?.journalist?.firstname || '';
                                        const lastname = article.journalist?.lastname || article.journalist?.journalist?.lastname || '';
                                        if (firstname || lastname) {
                                            return `${firstname} ${lastname}`.trim();
                                        }
                                        return 'Unknown';
                                    })()}
                                </Text>
                                <View style={styles.dateRow}>
                                    <Ionicons name="time-outline" size={10} color={withdrawnTitleColor} style={{marginTop: 1}} />
                                    <Text style={contentstyle.DatePosted}>
                                        {DateConverter(article.published_on)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* Bookmark Icon */}
                <BookmarkIcon articleId={article._id} savedStatus={article.saved} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 8,
        marginVertical: 6,
        alignSelf: 'center',
        padding: 6,
        zIndex: 10,
        position: 'relative',
        overflow: 'visible',
        borderWidth: 0.8,
        borderColor: "#ccc",
        //shadowColor: '#000',
        //shadowOffset: { width: 0, height: 2 },
        //shadowOpacity: 0.1,
        //shadowRadius: 4,
        //elevation: 3,
        ...main_Style.genButtonElevation
    },
    introContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {
        width: 160,
        height: 120,
        borderRadius: 4,
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative',
        borderWidth: 0.8,
        borderColor: "#ccc",
        ...main_Style.genButtonElevation
    },
    imageLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        minHeight: 110,
        paddingRight: 8,
        paddingTop: 2,
        paddingBottom: 2,
        //backgroundColor: 'red',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(157, 115, 64, 0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 10,
        color: mainBrownColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    ArticleTitleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 8,
        minHeight: 54,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    authorImageContainer: {
        borderRadius: 17,
        borderWidth: 1.2,
        borderColor: "#ccc",
        padding: 0.4,
        marginRight: 8,
        backgroundColor: '#FFF',
    },
    authorImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    authorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: withdrawnTitleSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 0,
    },
    cardTitle: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        lineHeight: generalSmallLineHeight * 1.15,
        fontFamily: articleTitleFont,
        letterSpacing: 0.2,
    },
    DatePosted: {
        fontSize: withdrawnTitleSize - 0.5,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: '500',
        marginLeft: 1,
    },
});

export default SecondaryNewsCart;
