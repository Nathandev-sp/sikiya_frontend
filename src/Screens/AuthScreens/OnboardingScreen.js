import React, { useState, useRef, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, Animated, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, cardBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, withdrawnTitleColor } from "../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import SikiyaIntro from "../../Components/OnboardingComponents.js/SikiyaIntro";
import SikiyaValues from "../../Components/OnboardingComponents.js/SikiyaValues";
import JournalistIntro from "../../Components/OnboardingComponents.js/JournalistIntro";
import UserIntro from "../../Components/OnboardingComponents.js/UserIntro";
import ApplyToBe from "../../Components/OnboardingComponents.js/ApplyToBe";
import AuthScreenMiniHeader from "../../Components/AuthScreenMiniHeader";
import { useLanguage } from "../../Context/LanguageContext";
import { Context as AuthContext } from "../../Context/AuthContext";

const OnboardingScreen = ({ navigation }) => {
  const { height, width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();
  const { signout } = useContext(AuthContext);

  const onboardingComponents = [
    <SikiyaIntro key="intro" />,
    <SikiyaValues key="values" />,
    <JournalistIntro key="journalist" />,
    <UserIntro key="user" />,
    <ApplyToBe key="apply" />,

    // Add more components here
  ];

  // Slide to next or previous component
  const slideTo = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    Animated.timing(slideAnim, {
      toValue: -direction * width,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setStep((prev) => prev + direction);
      slideAnim.setValue(direction * width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => setIsAnimating(false));
    });
  };

  const handleNext = () => {
    if (step < onboardingComponents.length - 1) {
      slideTo(1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      slideTo(-1);
    }
  };

  const handleLogout = async () => {
    await signout();
  };

  return (
    <SafeAreaView style={auth_Style.authSafeArea} >
      <StatusBar barStyle={"dark-content"} />
      <AuthScreenMiniHeader title={t('onboarding.welcome')} />
      <View style={auth_Style.onboardingFormContainer}>

      
        <View style={[styles.onboardingContainer, { flex: 1, width: '99%', alignSelf: 'center', paddingTop: 0 }]}>
          <Animated.View
            style={{
              width: '100%',
              marginTop: 25,
              flex: 1,
              transform: [{ translateX: slideAnim }],
            }}
          >
            {onboardingComponents[step]}
          </Animated.View>
        </View>
      

        <View style={styles.bottonLayer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', width: '80%', alignSelf: 'center' }}>
            {/* Only "Next" on the first step */}
            {step === 0 && (
              <TouchableOpacity
                hitSlop={defaultButtonHitslop}
                style={[auth_Style.authButtonStyle, styles.createAccountButton]}
                onPress={handleNext}
                disabled={isAnimating}
              >
                <Text style={auth_Style.authButtonText}>{t('common.next')}</Text>
              </TouchableOpacity>
            )}
            {/* Only "Back" on the last step */}
            {step === onboardingComponents.length - 1 && (
              <TouchableOpacity
                hitSlop={defaultButtonHitslop}
                style={[auth_Style.authButtonStyle, styles.createAccountButton]}
                onPress={handleBack}
                disabled={isAnimating}
              >
                <Text style={auth_Style.authButtonText}>{t('common.back')}</Text>
              </TouchableOpacity>
            )}
            {/* Both "Back" and "Next" on middle steps */}
            {step > 0 && step < onboardingComponents.length - 1 && (
              <>
                <TouchableOpacity
                  hitSlop={defaultButtonHitslop}
                  style={[auth_Style.authButtonStyle, styles.createAccountButton, { marginRight: 18, backgroundColor: '#B1B2A2' }]}
                  activeOpacity={generalActiveOpacity}
                  onPress={handleBack}
                  disabled={isAnimating}
                >
                  <Text style={auth_Style.authButtonText}>{t('common.back')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={defaultButtonHitslop}
                  style={[auth_Style.authButtonStyle, styles.createAccountButton]}
                  activeOpacity={generalActiveOpacity}
                  onPress={handleNext}
                  disabled={isAnimating}
                >
                  <Text style={auth_Style.authButtonText}>{t('common.next')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Logout Link */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              onPress={handleLogout} 
              activeOpacity={generalActiveOpacity}
              hitSlop={defaultButtonHitslop}
            >
              <Text style={styles.logoutText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: bannerBackgroundColor,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
  },
  onboardingContainer: {
    //backgroundColor: 'green',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',

  },
  comapnyLogo: {
    marginTop: 20,
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  bottonLayer: {
    marginTop: 10,
    //justifyContent: 'center',
    //backgroundColor: bannerBackgroundColor, // #F0F6FA #E0EDF5
  },
  createAccountButton: {
    width: 180,
    alignSelf: 'center',
    marginTop: 0,
    //backgroundColor: "#699FFC" //#6989FC #587BFA
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoutText: {
    fontFamily: generalTextFont,
    fontSize: 14,
    color: withdrawnTitleColor,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;



