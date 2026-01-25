import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import LottieView from 'lottie-react-native';
import { generalTitleFont, generalTextFont, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, auth_Style } from "../../styles/GeneralAppStyle";
import { useLanguage } from '../../Context/LanguageContext';

const Intro_message = "A News platform that inspire conversations on the political, economic, social, and cultural dimensions shaping the continent."

const animation = require("../../../assets/LottieView/SikiyaOnboarding.json");

const SikiyaIntro = () => {

  const { height } = useWindowDimensions();
  const { t } = useLanguage();


  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.50, width: '94%'}, auth_Style.authElevation]}>
      <View style={styles.mainContainer}>
        <View style={styles.ImageGridContainer}>
          <LottieView
            source={animation}
            style={styles.singleAnimation}
            autoPlay
            loop
          />
        </View>
        <View style={styles.TextGridContainer}>
          <Text style={styles.introTitle}>{t('onboarding.whatIsSikiya')}</Text>
          <Text style={styles.introParagraph}>
            {t('onboarding.whatIsSikiyaDescription')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ImageGridContainer: {
    width: '100%',
    height: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
    backgroundColor: '#F6F3EF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  singleAnimation: {
    width: '85%',
    height: '95%',
    alignSelf: 'center',
  },
  TextGridContainer: {
    width: '100%',
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  introTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: generalTitleColor,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  introParagraph: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: 0.2,
  },
});

export default SikiyaIntro;