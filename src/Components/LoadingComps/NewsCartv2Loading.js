import React from 'react';
import LottieView from 'lottie-react-native';
import { lightBannerBackgroundColor, main_Style } from '../../styles/GeneralAppStyle';
import {View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions} from 'react-native';
import { cardBackgroundColor } from '../../styles/GeneralAppStyle';

const NewsCartv2Loading = () => {
    const {width, height} = useWindowDimensions();

    return(
        <View style = {[styles.container, {width: width * 0.70, height: height * 0.30}]}>
            <LottieView
                style={main_Style.loadingAnimation}
                source={require('../../../assets/LottieView/sikiya_loading_icon.json')}
                autoPlay
                loop
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        marginRight: 6,
        borderRadius: 8,
        marginBottom: 8,
        marginTop: 4,
        padding: 1,
        //borderWidth: 1,
        //borderColor: 'green',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: lightBannerBackgroundColor, //#EEEEEE  	#606060  #A9A9A9 #E0E0E0 #ff9966 #DBDBDB #69747C #e3e3e3 #E5E2DC #d7d2c9
        borderColor: "#d7d2c9",
        borderWidth: 0.6,
        flexDirection: 'column',
        //justifyContent:'space-around',
        borderColor: "#d7d2c9",  //#E9E3B4 #46659B
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 1.2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    }
});

export default NewsCartv2Loading;