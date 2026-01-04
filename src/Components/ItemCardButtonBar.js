import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const ItemCardButtonBar = () => {

    const [Favorite,setFavorite] = useState(false)

    const handlePress = () => {
        console.log('Button pressed')
    };

    const addFavorite = () => {
        setFavorite(!Favorite)
    }

    return(
        <View style = {styles.mainContainer}>
            <TouchableOpacity style={[styles.iconContainer, styles.videoCont]} onPress={handlePress}>
                <Feather name="aperture" size={30} color="#2B4570" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconContainer , styles.videoCont]} onPress={addFavorite}>
                {Favorite ? (<AntDesign name="star" size={30} color="#B29243" />):(<AntDesign name="staro" size={30} color="#B29243" />)}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rightIconContainer, , styles.videoCont]} onPress={handlePress}>
                <MaterialCommunityIcons name="account-group-outline" size={30} color="#2B4570" />
            </TouchableOpacity>
        
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 10,
        height: 40,
        backgroundColor: '#EEEEEE', //#3C629E other blue #46659B
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#2B4570',
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.2,
    },
    iconContainer: {
        width: '32%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
    },
    rightIconContainer: {
        width: '32%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoCont: {
        
    }

});

export default ItemCardButtonBar;