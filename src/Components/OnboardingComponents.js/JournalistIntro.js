import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { generalTitleFont, generalTextFont, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, auth_Style, articleTitleFont, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor } from "../../styles/GeneralAppStyle";
import { useLanguage } from '../../Context/LanguageContext';

const journalistImage = require("../../../assets/OnboardingImages/journalistWork.png");
const box1Image = require("../../../assets/OnboardingImages/bad-feedback.png");

const JournalistIntro = () => {
  const { height } = useWindowDimensions();
  const { t } = useLanguage();

  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.56, width: '94%'}]}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={[styles.imageWrapper, main_Style.genContentElevation]}>
          <Image source={journalistImage} style={styles.journalistImage} />
        </View>
        <Text style={styles.headline}>{t('onboarding.ourJournalists')}</Text>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {t('onboarding.journalistSpeech')}
        </Text>
      </View>

      {/* Trust Score Info Box */}
      <View style={[styles.bottomContainer, main_Style.genContentElevation]}>
        <View style={styles.infoBox}>
          <View style={styles.iconContainer}>
            <Image source={box1Image} style={styles.boxImage} />
          </View>
          <View style={styles.boxTextContainer}>
            <Text style={styles.boxTitle}>{t('onboarding.trustScore')}</Text>
            <Text style={styles.boxDesc}>{t('onboarding.trustScoreDesc')}</Text>
          </View>
        </View>
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
    paddingVertical: 4,
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
  bottomContainer: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EF',
    borderRadius: 12,
    padding: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  boxImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  boxTextContainer: {
    flex: 1,
  },
  boxTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize,
    fontWeight: '700',
    color: MainSecondaryBlueColor,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  boxDesc: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize - 2,
    color: generalTextColor,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
});

export default JournalistIntro;