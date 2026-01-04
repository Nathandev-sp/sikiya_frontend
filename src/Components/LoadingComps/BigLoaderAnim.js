import React from "react";
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions} from 'react-native';
import LottieView from "lottie-react-native";
import { bannerBackgroundColor, main_Style } from "../../styles/GeneralAppStyle";

const BigLoaderAnim = () => {
    return (
        <View style={styles.container}>
            <View style={[styles.lottieContainer, main_Style.genButtonElevation]}>
                <LottieView
                    source={require("../../../assets/LottieView/SikiyaLoading.json")}
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
        justifyContent: "center",
        alignItems: "center",
        height: 100,
        width: 120,
        alignSelf: "center"
    },
    lottieContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 200,
        width: 200,
        //backgroundColor: bannerBackgroundColor,
        borderRadius: 12
    },
    lottieAnimation: {
        width: 100,
        height: 100
    },

});

export default BigLoaderAnim;
