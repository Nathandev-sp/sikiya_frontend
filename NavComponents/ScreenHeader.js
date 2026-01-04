import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { eventTextColor } from '../src/styles/GeneralAppStyle';

const ScreenHeader = ({title}) => {
    const navigation = useNavigation();

    handleback = () => {
        navigation.goBack()
    }
    return(
        <View style={styles.mainContainer}>
            <Text style={styles.screenTitle}>{title}</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    mainContainer: {
        height: 45,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        //borderBottomWidth: 0.3,
        //borderColor: 'black',
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: eventTextColor,
    },
    navigationIconCont: {
        height: 40,
        width: 40,
        backgroundColor: eventTextColor,
        position: 'absolute',
        left: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    }

});

export default ScreenHeader;