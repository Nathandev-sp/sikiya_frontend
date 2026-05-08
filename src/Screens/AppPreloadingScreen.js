import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigLoaderAnim from '../Components/LoadingComps/BigLoaderAnim';
import LottieView from 'lottie-react-native';
import { AppScreenBackgroundColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor } from '../styles/GeneralAppStyle';

const AppPreloadingScreen = () => {
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [logoScale]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <Animated.Image 
          source={require("../../assets/SikiyaLogoV2/SikiyaApprovedPreloadingAppLogo.png")}
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
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