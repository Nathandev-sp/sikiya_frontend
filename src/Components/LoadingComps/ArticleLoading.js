import React from "react";
import {View, Text, StyleSheet, FlatList, Image, useWindowDimensions} from 'react-native';
import LottieView from "lottie-react-native";
import { bannerBackgroundColor, main_Style } from "../../styles/GeneralAppStyle";

const ArticleLoadingState = () => {
    return (
        <View style={styles.container}>
            <View style={[styles.lottieContainer, main_Style.genButtonElevation]}>
                <LottieView
                    source={require("../../../assets/LottieView/ArticleWritingAnim.json")}
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
        //justifyContent: "center",
        alignItems: "center",
        height: 100,
        width: 120,
        alignSelf: "center",
        marginTop: 100
    },
    lottieContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 80,
        width: 80,
        //backgroundColor: bannerBackgroundColor,
        borderRadius: 12
    },
    lottieAnimation: {
        width: 80,
        height: 80
    },

});

export default ArticleLoadingState;
