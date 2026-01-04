import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { main_Style } from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';

const NewsVideoScreen = () => {
    return(
        <SafeAreaView style={main_Style.safeArea}>
            <GoBackButton/>
            <Text>News Video Screen</Text>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({

});

export default NewsVideoScreen;