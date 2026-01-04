import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppScreenBackgroundColor, { defaultButtonHitslop, genBtnBackgroundColor, main_Style, MainBrownSecondaryColor } from '../src/styles/GeneralAppStyle';

const GoBackButton = ({buttonStyle, iconStyle}) => {
    const navigation = useNavigation();

    const handleback = () => {
        navigation.goBack()
    }
    return(
        <TouchableOpacity 
            style={[styles.navigationIconCont, buttonStyle, main_Style.genButtonElevation]} 
            activeOpacity={0.4} 
            onPress={handleback} 
            hitSlop={defaultButtonHitslop}
        >
            <Ionicons 
                name="arrow-back" 
                style={[styles.iconStyle, iconStyle]} 
            />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    navigationIconCont: {
        height: 40,
        width: 40,
        backgroundColor: genBtnBackgroundColor,
        position: 'absolute',
        left: 10,
        top: 53,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    iconStyle: {
        fontSize: 24,
        color: MainBrownSecondaryColor,
    },

});

export default GoBackButton;