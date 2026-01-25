import React from "react";
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions} from 'react-native';
import LottieView from "lottie-react-native";
import { bannerBackgroundColor, main_Style } from "../../styles/GeneralAppStyle";

const SmallLoadingState = () => {
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
        height: 24,
        width: 24,
        alignSelf: "center",
        marginTop: 0,
        //backgroundColor: 'green'
    },
    lottieContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 24,
        width: 24,
        //backgroundColor: bannerBackgroundColor,
        borderRadius: 0
    },
    lottieAnimation: {
        width: 24,
        height: 24
    },

});

export default SmallLoadingState;
