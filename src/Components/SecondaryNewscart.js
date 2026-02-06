import React, { memo } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppScreenBackgroundColor, { 
    articleTitleColor, 
    articleTitleFont, 
    generalLineHeight, 
    generalSmallLineHeight, 
    generalTextColor, 
    generalTextFont, 
    generalTextSize, 
    generalTitleFont, 
    main_Style,
    mainBrownColor, 
    withdrawnTitleColor, 
    withdrawnTitleSize 
} from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";

const SecondaryNewsCart = memo(({article}) => {
    const {width} = useWindowDimensions();
    const navigation = useNavigation();

    const goToNewsHome = () => {
        navigation.navigate('NewsHome', {articleId: article._id, article: article});
    };

    // Fallback for missing data
    const authorName = article.journalist?.displayName || 'Unknown Author';
    const authorImage = article.journalist?.profile_picture;
    const category = article?.category;

    return(
        <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={goToNewsHome}
            accessible={true}
            accessibilityLabel={`Article: ${article.article_title}`}
            accessibilityRole="button"
        >
            <View style={[styles.container, main_Style.genContentElevation, {width: width * 0.96}]}>
                <View style={styles.introContainer}>
                    {/* Image Container - Left Side */}
                    <View style={styles.imageContainer}>
                        <Image 
                            style={styles.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            source={{ uri: getImageUrl(article.article_front_image) }}
                            resizeMode="cover"
                        />
                        {/* Subtle gradient overlay */}
                        <View style={styles.imageOverlay} pointerEvents="none" />
                    </View>
                    
                    {/* Content Container - Right Side */}
                    <View style={styles.contentContainer}>
                        {/* Category Badge */}
                        {category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
                            </View>
                        )}
                        
                        {/* Article Title */}
                        <View style={styles.titleContainer}>
                            <Text 
                                style={styles.cardTitle}
                                numberOfLines={3}
                                ellipsizeMode="tail"
                            >
                                {article.article_title}
                            </Text>
                        </View>
                        
                        {/* Author Info with Date */}
                        <View style={styles.authorContainer}>
                            <View style={styles.authorImageContainer}>
                                <Image 
                                    style={styles.authorImage}
                                    defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                    source={{ uri: getImageUrl(authorImage) }}
                                />
                            </View>
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName} numberOfLines={1}>
                                    {authorName}
                                </Text>
                                <View style={styles.dateRow}>
                                    <Ionicons name="time-outline" size={12} color={withdrawnTitleColor} />
                                    <Text style={styles.datePosted}>
                                        {DateConverter(article.published_on)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* Bookmark Icon */}
                <View style={styles.bookmarkContainer}>
                    <BookmarkIcon articleId={article._id} savedStatus={article.saved} />
                </View>
            </View>
        </TouchableOpacity>
    );
});

SecondaryNewsCart.displayName = 'SecondaryNewsCart';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 4,
        alignSelf: 'center',
        padding: 6,
        overflow: 'hidden',
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    introContainer: {
        width: '100%',
        flexDirection: 'row',
        minHeight: 110,
    },
    imageContainer: {
        width: 140,
        aspectRatio: 1.2,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        marginRight: 10,
        position: 'relative',
    },
    frontImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingRight: 4,
        paddingVertical: 2,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: mainBrownColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: generalTextFont,
        letterSpacing: 0.8,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: generalTextSize - 0.5,
        fontWeight: '600',
        color: generalTextColor,
        lineHeight: generalSmallLineHeight * 1.15,
        fontFamily: articleTitleFont,
        letterSpacing: 0.1,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorImageContainer: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E5E5',
        padding: 1,
        marginRight: 7,
        backgroundColor: '#FFF',
    },
    authorImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    authorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: withdrawnTitleSize - 0.5,
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
    datePosted: {
        fontSize: withdrawnTitleSize - 1.5,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    bookmarkContainer: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 10,
    },
});

export default SecondaryNewsCart;
