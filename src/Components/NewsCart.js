import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextSlicer from "../Helpers/TextSlicer";
import AppScreenBackgroundColor, { articleTitleFont, cardBackgroundColor, generalTitleColor, generalTitleFont, mainborderColor, mainBrownColor, withdrawnTitleColor } from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import OverlappingCommentors from "./OverlappingCommentors";

const NewsCart = ({article}) => {

    const {width, height} = useWindowDimensions();
    //console.log(article)

    const navigation = useNavigation()

    const goToNewsHome = () => {
        navigation.navigate('NewsHome', {articleId: article._id})
    }

    return(
        <TouchableOpacity activeOpacity={0.8} onPress={goToNewsHome}>
        <View style = {[styles.container, {width: width * 0.78, height: height * 0.22}]}>
            <View style = {styles.Subcont1}>
                <View style = {styles.introContainer}>
                    <View style = {styles.imageContainer}>
                        <Image 
                            style = {contentstyle.frontImage}
                            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                            src = {article.article_front_image} />
                    </View>
                    <View style={styles.imageNextContainer}>
                        <View style={styles.profilePicContainer}>
                            <Image 
                                style = {contentstyle.AuthorImage}
                                defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                                src = {article.journalist.profile_picture} />
                        </View>
                        <View style={styles.authorInforContainer}>
                            <Text style={contentstyle.AuthorName}>
                              {article.journalist.firstname} {article.journalist.lastname}
                            </Text>
                            
                        </View>

                        <View style={styles.datepublishedContainer}>
                            <Text style={contentstyle.DatePosted}>{DateConverter(article.published_on)}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style = {styles.Subcont2}>
                <View style = {styles.textContainer}>
                    <Text style = {contentstyle.cardTitle}>{article.article_title}</Text>
                </View>
            </View>
            <View style = {styles.Subcont3}>
                <View style = {styles.commenterContainer}>
                    <OverlappingCommentors 
                        images={
                            article.commenter_profile_pictures && article.commenter_profile_pictures.length > 0
                                ? article.commenter_profile_pictures.map(pic =>
                                    pic ? { uri: pic } : null
                                ).filter(Boolean)
                                : []
                        }
                    />
                </View>
                <View style = {styles.bookmarkContainer}>
                    <BookmarkIcon/>
                </View>
            </View>
            

            
        </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        marginRight: 6,
        borderRadius: 4,
        marginBottom: 8,
        marginTop: 4,
        padding: 5,
        borderWidth: 1,
        //borderColor: 'green',
        alignSelf: 'center',
        backgroundColor: cardBackgroundColor, //#EEEEEE  	#606060  #A9A9A9 #E0E0E0 #ff9966 #DBDBDB #69747C #e3e3e3 #E5E2DC #d7d2c9
        flexDirection: 'column',
        //justifyContent:'space-around',
        borderColor: "#d7d2c9",  //#E9E3B4 #46659B
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 2.5 },
        shadowOpacity: 0.4,
        shadowRadius: 1.2,
    },
    Subcont1: {
        height: '58%',
        flexDirection: 'row',
        //justifyContent: "space-between",
    }, 
    Subcont2: {
        height: '26%',
        //padding: 8,
        verticalAlign: 'center',
    },
    Subcont3: {
        height: '16%',
        padding: 2,
        //backgroundColor: "red",
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 0.2,
    },
    introContainer:  {
        width: '100%',
        flexDirection: 'row',
        //backgroundColor: 'green',
    },
    imageContainer: {
        width: '68%',
        height: '100%',
        borderRadius: 4,
        backgroundColor: mainBrownColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageNextContainer: {
        width: '32%',
        height: '100%',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'green'
    },
    commenterContainer: {
        width: '80%',
        height: '100%',
        justifyContent: 'center',
        //alignItems: 'center',
        //backgroundColor: 'red',
    },
    bookmarkContainer: {
        width: '20%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'red',
    },
    textContainer: {
        paddingTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'green',
        
    },
    timePriceContainer: {
        paddingTop: 8,
        height: '30%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        marginTop: 10,
        height: 50,
        backgroundColor: '#2B4570',
        borderRadius: 12,
    },
    likeContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'transparent',
        position: 'absolute',
        right: 8,
        top: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicContainer: {
        //backgroundColor: 'red',
        width: '100%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorInforContainer: {
        //backgroundColor: 'blue',
        width: '100%',
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding:2,
        maxWidth: 70, // adjust as needed
    },
    datepublishedContainer: {
        //backgroundColor: 'purple',
        width: '100%',
        height: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        padding:2,
    },
    

});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: "100%",
        height: '100%',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8, // Android shadow
    },
    iconStyle: {
        fontSize: 55, 
        color: "#088395",
        alignSelf: 'center',
        padding: 12
    },
    AuthorImage: {
        width: 40,
        height: 40,
        borderRadius: '100%',
    },
    cardTitle: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        
    },
    AuthorName: {
        fontSize: 10,
        fontWeight: '600',
        alignSelf: 'center',
        fontFamily: generalTitleFont,
        color: generalTitleColor,
        justifyContent: 'center',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    DatePosted: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: '500',
        color: withdrawnTitleColor,
        alignSelf: 'center',
    },
})

export default NewsCart;
