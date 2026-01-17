import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextSlicer from "../Helpers/TextSlicer";
import AppScreenBackgroundColor, { articleTitleColor, articleTitleFont, cardBackgroundColor, generalLineHeight, generalSmallLineHeight, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, lightBannerBackgroundColor, mainborderColor, mainBrownColor, withdrawnTitleColor, withdrawnTitleFontWeight, withdrawnTitleSize } from "../styles/GeneralAppStyle";
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
        <TouchableOpacity activeOpacity={0.8} onPress={goToNewsHome}>
            <View style = {[styles.container, {width: width * 0.98, height: height * 0.16}]}>
                <View style = {styles.introContainer}>
                    {/* Image Container - Left Side */}
                    <View style = {styles.imageContainer}>
                        <Image 
                            style={contentstyle.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            source={{ uri: getImageUrl(article.article_front_image) }}
                        />
                        {/* Light Dark Overlay */}
                        <View style={styles.imageOverlay} pointerEvents="none" />
                    </View>
                    
                    {/* Content Container - Right Side */}
                    <View style={styles.contentContainer}>
                        {/* Category */}
                        {article.category && (
                            <Text style={styles.categoryText}>{article.category}</Text>
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
                            <Ionicons name="location" size={12} color={withdrawnTitleColor} />
                            <Text style={styles.locationText}>
                                {article?.location || "Bukavu, RDC"}
                            </Text>
                        </View>
                        
                        {/* Author Info with Date */}
                        <View style={styles.authorContainer}>
                            <Image 
                                style={styles.authorImage}
                                defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                source={{ uri: getImageUrl(article.journalist.profile_picture) }}
                            />
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName} numberOfLines={1}>
                                    {article.journalist.displayName}
                                </Text>
                                <Text style={contentstyle.DatePosted}>
                                    {DateConverter(article.published_on)}
                                </Text>
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
        //backgroundColor: 'red',
        borderRadius: 12,
        marginVertical: 4,
        alignSelf: 'center',
        padding: 4,
        zIndex: 10,
        overflow: 'hidden',
        //backgroundColor: "red"
        //borderWidth: 1.5,
        //borderColor: '#E8E8E8',
        // iOS Shadow
        //shadowColor: '#000',
        //shadowOffset: {
        //    width: 0,
        //    height: 2,
        //},
        //shadowOpacity: 0.1,
        //shadowRadius: 4,
        // Android Elevation
        //elevation: 3,
    },
    introContainer: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
    },
    imageContainer: {
        width: '45%',
        height: '97.5%',
        borderRadius: 8,
        backgroundColor: mainBrownColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative',

    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0)',
        borderRadius: 8,
        zIndex: 1,
    },
    contentContainer: {
        width: '55%',
        height: '100%',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingLeft: 0,
        paddingRight: 4,
        paddingTop: 6,
        paddingBottom: 6,
        flex: 1,
    },
    titleContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        marginBottom: 4,
        minHeight: 60,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
        marginTop: 2,
        //backgroundColor: 'red',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
    },
    authorImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    authorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: withdrawnTitleSize,
        fontWeight: generalTitleFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    locationText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: withdrawnTitleFontWeight,
    },
});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 6,
    },
    cardTitle: {
        marginTop: 0,
        fontSize: generalTextSize,
        //fontWeight: '700',
        color: generalTextColor,
        lineHeight: generalSmallLineHeight,
        fontFamily: articleTitleFont,
    },
    DatePosted: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: withdrawnTitleFontWeight,
    },
});

export default NewsCartv2;
