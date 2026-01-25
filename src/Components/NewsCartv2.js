import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextSlicer from "../Helpers/TextSlicer";
import AppScreenBackgroundColor, { articleTitleColor, articleTitleFont, cardBackgroundColor, generalLineHeight, generalSmallLineHeight, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, lightBannerBackgroundColor, main_Style, mainborderColor, mainBrownColor, withdrawnTitleColor, withdrawnTitleFontWeight, withdrawnTitleSize } from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import OverlappingCommentors from "./OverlappingCommentors";
import NewsCartv2Loading from "./LoadingComps/NewsCartv2Loading";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";

const NewsCartv2 = ({article}) => {

    const {width, height} = useWindowDimensions();
    const [Loading, setLoading] = useState(true);

    const navigation = useNavigation()

    const goToNewsHome = () => {
        navigation.navigate('NewsHome', {articleId: article._id, article: article})
    }

    return(
        <TouchableOpacity activeOpacity={0.75} onPress={goToNewsHome}>
            <View style = {[styles.container, main_Style.genContentElevation, {width: width * 0.96, height: height * 0.175}]}>
                <View style = {styles.introContainer}>
                    {/* Image Container - Left Side */}
                    <View style = {styles.imageContainer}>
                        <Image 
                            style={contentstyle.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            source={{ uri: getImageUrl(article.article_front_image) }}
                        />
                        {/* Subtle overlay for depth */}
                        <View style={styles.imageOverlay} pointerEvents="none" />
                    </View>
                    
                    {/* Content Container - Right Side */}
                    <View style={styles.contentContainer}>
                        {/* Category Badge */}
                        {article.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
                            </View>
                        )}
                        
                        {/* Article Title */}
                        <View style={styles.titleContainer}>
                            <Text 
                                style={contentstyle.cardTitle}
                                numberOfLines={3}
                                ellipsizeMode="tail"
                            >
                                {article.article_title}
                            </Text>
                        </View>
                        
                        {/* Location */}
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-sharp" size={12} color={withdrawnTitleColor} />
                            <Text style={styles.locationText}>
                                {article?.location || "Bukavu, RDC"}
                            </Text>
                        </View>
                        
                        {/* Author Info with Date */}
                        <View style={styles.authorContainer}>
                            <View style={styles.authorImageContainer}>
                                <Image 
                                    style={styles.authorImage}
                                    defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                    source={{ uri: getImageUrl(article.journalist.profile_picture) }}
                                />
                            </View>
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName} numberOfLines={1}>
                                    {article.journalist.displayName}
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
        overflow: 'hidden',
        borderWidth: 0.8,
        borderColor: "#ccc",
        //borderColor: 'rgba(0,0,0,0.05)',
        // Enhanced shadows for better depth
        //shadowColor: '#000',
        //shadowOffset: {
        //    width: 0,
        //    height: 2,
        //},
        //shadowOpacity: 0.1,
        //shadowRadius: 6,
        // Android Elevation
        //elevation: 3,
        ...main_Style.genButtonElevation
    },
    introContainer: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
    },
    imageContainer: {
        width: '46%',
        height: '100%',
        borderRadius: 6,
        backgroundColor: mainBrownColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative',
        borderWidth: 0.8,
        borderColor: "#ccc",
        ...main_Style.genButtonElevation
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 10,
        zIndex: 1,
    },
    contentContainer: {
        width: '54%',
        height: '100%',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingLeft: 0,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 4,
        flex: 1,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: mainBrownColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: generalTitleFont,
        letterSpacing: 0.6,
    },
    titleContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        marginBottom: 4,
        flex: 1,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: 7,
        marginTop: 2,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
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
    locationText: {
        fontSize: withdrawnTitleSize - 0.5,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: '500',
    },
});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 0,
    },
    cardTitle: {
        marginTop: 0,
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

export default NewsCartv2;
