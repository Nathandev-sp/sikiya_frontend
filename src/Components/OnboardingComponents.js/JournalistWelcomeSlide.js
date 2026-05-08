import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { generalTitleFont, generalTextFont, generalTextColor, generalTextSize, generalTitleSize, auth_Style, articleTitleFont, MainBrownSecondaryColor, main_Style } from "../../styles/GeneralAppStyle";
import { useLanguage } from '../../Context/LanguageContext';

const journalistImage = require("../../../assets/OnboardingImages/journalistWork.png");

const JournalistWelcomeSlide = () => {
  const { height } = useWindowDimensions();
  const { t } = useLanguage();

  return (
    <View style={[auth_Style.onboardingContainer, { height: height * 0.56, width: '94%' }]}>
      <View style={styles.headerSection}>
        <View style={[styles.imageWrapper, main_Style.genContentElevation]}>
          <Image source={journalistImage} style={styles.journalistImage} />
        </View>
        <Text style={styles.headline}>{t('onboarding.ourJournalists')}</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{t('onboarding.journalistSpeech')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F6F3EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  journalistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headline: {
    fontFamily: articleTitleFont,
    fontSize: generalTitleSize + 3,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});

export default JournalistWelcomeSlide;
