import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextSlicer from "../Helpers/TextSlicer";
import AppScreenBackgroundColor, { articleTitleColor, articleTitleFont, cardBackgroundColor, generalLineHeight, generalSmallLineHeight, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, lightBannerBackgroundColor, mainborderColor, mainBrownColor, widrawnTitleColor, withdrawnTitleColor, withdrawnTitleSize } from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";

const SecondaryNewsCart = ({article}) => {
    const {width, height} = useWindowDimensions()
    const navigation = useNavigation()

    //console.log("Article in SecondaryNewsCart:", article);

    const goToNewsHome = () => {
        if (article && article._id) {
            navigation.navigate('NewsHome', {article: article});
        } else {
            console.error('Cannot navigate: article ID is missing', article);
            // Optional: Show an alert to the user
            Alert.alert('Error', 'Cannot open this article');
        }
    }

    return(
        <TouchableOpacity activeOpacity={0.8} onPress={goToNewsHome}>
            <View style = {[styles.container, {width: width * 0.95}]}>
                <View style = {styles.introContainer}>
                    <View style = {styles.imageContainer}>
                        <Image 
                            style={contentstyle.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            source={{ uri: getImageUrl(article.article_front_image) }}
                        />
                        {/* Light Dark Overlay */}
                        <View style={styles.imageOverlay} pointerEvents="none" />
                    </View>
                    
                    <View style={styles.contentContainer}>
                        {/* Category */}
                        {article.category && (
                            <Text style={styles.categoryText}>{article.category}</Text>
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
                            <Image 
                                style={styles.authorImage}
                                defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                source={{ uri: getImageUrl(article.journalist?.profile_picture) }}
                            />
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName} numberOfLines={1}>
                                    {(() => {
                                        // Try different possible structures for displayName
                                        if (article.journalist?.displayName) {
                                            return article.journalist.displayName;
                                        }
                                        // Check nested structure
                                        if (article.journalist?.journalist?.displayName) {
                                            return article.journalist.journalist.displayName;
                                        }
                                        // Fallback to firstname + lastname
                                        const firstname = article.journalist?.firstname || article.journalist?.journalist?.firstname || '';
                                        const lastname = article.journalist?.lastname || article.journalist?.journalist?.lastname || '';
                                        if (firstname || lastname) {
                                            return `${firstname} ${lastname}`.trim();
                                        }
                                        return 'Unknown';
                                    })()}
                                </Text>
                                <Text style={contentstyle.DatePosted}>{DateConverter(article.published_on)}</Text>
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
        //backgroundColor: '#F8F8F8',
        borderRadius: 10,
        marginVertical: 4,
        alignSelf: 'center',
        padding: 6,
        zIndex: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    introContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        //backgroundColor: 'yellow',
    },
    imageContainer: {
        width: 160,
        height: 110,
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
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        zIndex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        //paddingRight: 32,
        minHeight: 110,
        paddingVertical: 2,
        //backgroundColor: 'blue',
    },
    categoryText: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    ArticleTitleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 8,
        minHeight: 60,
        //backgroundColor: 'red',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
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
});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: articleTitleColor,
        lineHeight: generalSmallLineHeight,
        fontFamily: articleTitleFont,
    },
    DatePosted: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: generalTitleFontWeight,
    },
})

export default SecondaryNewsCart;
