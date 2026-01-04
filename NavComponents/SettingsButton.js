import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SettingsButton = () => {

    const navigation = useNavigation();

    return(
        <TouchableOpacity style={styles.mainContainer} activeOpacity={0.6} onPress={goToSetting}>
            <Ionicons name="settings-outline" size={30} color='#F5F5F5' />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    mainContainer: {
        marginRight: 10,
    }
});

export default SettingsButton;