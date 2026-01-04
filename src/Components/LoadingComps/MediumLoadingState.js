import React from "react";
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions} from 'react-native';
import LottieView from "lottie-react-native";
import { bannerBackgroundColor, main_Style } from "../../styles/GeneralAppStyle";

const MediumLoadingState = () => {
    return (
        <View style={styles.container}>
            <View style={[styles.lottieContainer, main_Style.genButtonElevation]}>
                <LottieView
                    source={require("../../../assets/LottieView/sikiya_loading_icon.json")}
                    autoPlay
                    loop
                    style={[styles.lottieAnimation, main_Style.genButtonElevation]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        //justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32,
        alignSelf: "center",
        marginTop: 0,
        //backgroundColor: 'green'
    },
    lottieContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 36,
        width: 36,
        //backgroundColor: bannerBackgroundColor,
        borderRadius: 0
    },
    lottieAnimation: {
        width: 36,
        height: 36
    },

});

export default MediumLoadingState;
