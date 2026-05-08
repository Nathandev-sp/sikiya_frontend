import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import LottieView from 'lottie-react-native';
import {
  generalTextFont,
  generalTextColor,
  generalTextSize,
  generalTitleSize,
  MainBrownSecondaryColor,
  auth_Style,
  articleTitleFont,
  main_Style,
} from "../../styles/GeneralAppStyle";
import { useLanguage } from '../../Context/LanguageContext';

/** Same default as SikiyaIntro; change any entry to a different JSON when you have per-slide animations */
const VALUE_SLIDE_ANIMATIONS = [
  require("../../../assets/LottieView/GlobalNews.json"),
  require("../../../assets/LottieView/reporting.json"),
  require("../../../assets/LottieView/Podcaster.json"),
  require("../../../assets/LottieView/Chat.json"),
];

const VALUE_KEYS = [
  { tagline: 'coverageTagline', desc: 'coverageDesc' },
  { tagline: 'verifiedTagline', desc: 'verifiedDesc' },
  { tagline: 'expertOpinionTagline', desc: 'expertOpinionDesc' },
  { tagline: 'discussionTagline', desc: 'discussionDesc' },
];

/**
 * Same layout + typography as SikiyaIntro: 65% card with Lottie, 35% text (introTitle + introParagraph styles).
 * @param {number} valueIndex 0–3
 */
const SikiyaValueSlide = ({ valueIndex = 0 }) => {
  const { height } = useWindowDimensions();
  const { t } = useLanguage();
  const idx = Math.min(Math.max(valueIndex, 0), VALUE_KEYS.length - 1);
  const keys = VALUE_KEYS[idx];
  const animationSource = VALUE_SLIDE_ANIMATIONS[idx];

  const val = {
    tagline: t(`onboarding.${keys.tagline}`),
    desc: t(`onboarding.${keys.desc}`),
  };

  return (
    <View style={[auth_Style.onboardingContainer, { height: height * 0.56, width: '94%' }]}>
      <View style={styles.mainContainer}>
        <View style={[styles.ImageGridContainer, main_Style.genContentElevation]}>
          <LottieView
            source={animationSource}
            style={styles.singleAnimation}
            autoPlay
            loop
          />
        </View>
        <ScrollView
          style={styles.textScroll}
          contentContainerStyle={styles.TextGridContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introTitle}>{val.tagline}</Text>
          <Text style={styles.introParagraph}>{val.desc}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

/** Mirrors SikiyaIntro.js for card + Lottie + text */
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
  textScroll: {
    width: '100%',
    height: '35%',
  },
  TextGridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  introTitle: {
    fontFamily: articleTitleFont,
    fontSize: generalTitleSize + 3,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  introParagraph: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize + 0.5,
    color: generalTextColor,
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: 0.2,
  },
});

export default SikiyaValueSlide;
