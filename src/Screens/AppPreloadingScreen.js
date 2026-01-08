import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import LottieView from 'lottie-react-native';
import { AppScreenBackgroundColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor } from '../styles/GeneralAppStyle';

const AppPreloadingScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.logoContainer}>
        <Image 
          source={require("../../assets/SikiyaLogoV2/NathanApprovedSikiyaPreloadingLogo.png")}
          style={[styles.logo]}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.loaderContainer}>
        <LottieView
            source={require("../../assets/LottieView/SikiyaLoading.json")}
            autoPlay
            loop
            style={[styles.lottieAnimation]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MainBrownSecondaryColor,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 360,
    height: 360,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150
  },
});

export default AppPreloadingScreen;