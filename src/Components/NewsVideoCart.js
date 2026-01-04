import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextSlicer from "../Helpers/TextSlicer";
import AppScreenBackgroundColor, { articleTitleFont, cardBackgroundColor, generalTitleColor, generalTitleFont, lightBannerBackgroundColor, mainborderColor, mainBrownColor, withdrawnTitleColor } from "../styles/GeneralAppStyle";
import BookmarkIcon from "./BookmarkIcon";
import DateConverter from "../Helpers/DateConverter";
import OverlappingCommentors from "./OverlappingCommentors";
import NewsCartv2Loading from "./LoadingComps/NewsCartv2Loading";

const NewsVideoCart = ({video}) => {

    const {width, height} = useWindowDimensions();
    const [Loading, setLoading] = useState(true);

    const navigation = useNavigation()

    const goToVideoHome = () => {
        navigation.navigate('VideoHomeScreen', { articleId: video._id })
    }

    return(
        <TouchableOpacity activeOpacity={0.8} onPress={goToVideoHome}>
            <View style={[styles.container, { width: width * 0.96, height: height * 0.34 }]}> 
                {/* Top row: Journalist profile, name, date */}
                <View style={styles.topRow}>
                    <View style={styles.profilePicContainer}>
                        <Image 
                            style={contentstyle.AuthorImage}
                            defaultSource={require('../../assets/functionalImages/ProfilePic.png')} 
                            src={video.journalist.profile_picture} />
                    </View>
                    <View style={styles.nameDateContainer}>
                        <Text style={contentstyle.AuthorName}>
                            {video.journalist.firstname} {video.journalist.lastname}
                        </Text>
                        <Text style={contentstyle.DatePosted}>{DateConverter(video.published_on)}</Text>
                    </View>
                </View>
                {/* Centered image */}
                <View style={styles.centeredImageContainer}>
                    <Image 
                        style={contentstyle.frontImage}
                        defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                        src={video.article_front_image} />
                    {/* Play button overlay */}
                    <View style={styles.playButtonContainer}>
                        <Image 
                            style={contentstyle.playButtonImage} 
                            source={require('../../assets/functionalImages/playButtonv2.png')} 
                        />
                    </View>
                </View>
                {/* Article title at bottom */}
                <View style={styles.bottomTitleContainer}>
                    <Text style={contentstyle.cardTitle}>{video.article_title}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 6,
        marginRight: 6,
        borderRadius: 4,
        marginBottom: 12,
        marginTop: 0,
        padding: 8,
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'column',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    profilePicContainer: {
        width: 45,
        height: 45,
        borderRadius: 0,
        overflow: 'hidden',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'green',
    },
    nameDateContainer: {
        height: 45,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        //backgroundColor: 'red'
    },
    centeredImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        position: 'relative',
    },
    playButtonContainer: {
        position: 'absolute',
        top: '49%',
        left: '49%',
        transform: [{ translateX: -18 }, { translateY: -18 }],
        zIndex: 2,
    },
    playButtonCircle: {
        width: 22,
        height: 22,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonIcon: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bottomTitleContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 0,
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
        //shadowRadius: 8,
        //elevation: 8, // Android shadow
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
        fontSize: 12,
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
    playButtonImage: {
        width: 40,   // or your desired size
        height: 40,
    },
})

export default NewsVideoCart;
