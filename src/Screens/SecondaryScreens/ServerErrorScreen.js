import React from 'react';
import {View, StyleSheet,Text} from 'react-native';
import LottieView from 'lottie-react-native';

const ServerErrorScreen = () => {
    return(
        <View style={styles.mainContainer}>
            <LottieView
                source={require('../../../assets/LottieView/LoadingFailureAnimation.json')} 
                autoPlay
                style={styles.animation}
                />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer:{
        backgroundColor: 'white',
        flex: 1,
        justifyContent:'center',
    },
    animation: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        alignSelf: 'center' 
    },

});

export default ServerErrorScreen;