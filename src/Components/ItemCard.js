import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import OpenClosedInd from "./CardItem/OpenClosedInd";
import StartingPrice from "./CardItem/StartingPrice";
import ApetureIcon from "./CardItem/ApetureIcon";
import LocationIcon from "./CardItem/LocationIcon"
import { useNavigation } from '@react-navigation/native';
import ItemCardButtonBar from "./ItemCardButtonBar";

import TextSlicer from "../Helpers/TextSlicer";
import Liked from "./EventHomeComp/EventHomeSubComp/Liked";

const ItemCard = ({event}) => {

    const navigation = useNavigation()

    const goToEventHome = () => {
        navigation.navigate('EventHome', { eventId: event.id })
    }

    return(
        <TouchableOpacity activeOpacity={0.8} onPress={ goToEventHome }>
        <View style = {styles.container}>
            <View style = {styles.Subcont1}>
                <View style = {styles.SubsubCont1}>
                    <Image 
                        style = {contentstyle.frontImage}
                        defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
                        src = {event.mainImage} />
                    <View style={styles.likeContainer}>
                        <Liked />
                    </View>
                </View>
            </View>
            <View style = {styles.Subcont2}>
                <View style = {styles.textContainer}>
                    <Text style = {contentstyle.cardTitle}>{event.eventTitle}</Text>
                    <Text style = {contentstyle.description}>{TextSlicer(event.description)}</Text>
                </View>
                <View style = {styles.timePriceContainer}>
                    <OpenClosedInd event = {event}/>
                    <StartingPrice event = {event}/>
                </View>
            </View>
            

            
        </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 12,
        marginRight: 8,
        borderRadius: 12,
        marginBottom: 16,
        marginTop: 12,
        alignSelf: 'center',
        backgroundColor: '#E0E0E0', //#EEEEEE  	#606060  #A9A9A9 #E0E0E0 #ff9966
        height: 295,
        width: 290,
        flexDirection: 'column',
        //padding: 6,
        justifyContent:'space-around',
        borderWidth: 0,
        borderColor: '#3E6990',  //#E9E3B4 #46659B
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 1.2,
    },
    Subcont1: {
        height: '55%',
        flexDirection: 'row',
        justifyContent: "space-between",
    },
    Subcont2: {
        height: '45%',
        borderRadius: 15,
        padding: 8,
    },
    SubsubCont1:  {
        width: '100%',
    },
    textContainer: {
        height: '70%',
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
    }
    

});

const contentstyle = StyleSheet.create({
    frontImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        //zIndex: 10,
        //shadowColor: '#000000', // iOS shadow properties
        //shadowOffset: { width: 0, height: 5 },
        //shadowOpacity: 0.2,
        //shadowRadius: 1.2,
    },
    iconStyle: {
        fontSize: 55, 
        color: "#088395",
        alignSelf: 'center',
        padding: 12

    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#182842',
        alignSelf: 'center',
    },
    description: {
        fontSize: 13,
        paddingTop: 5,
        paddingBottom:10,
        fontFamily: 'Philosopher-Regular',
        color: '#182842',
    }
})

export default ItemCard;
