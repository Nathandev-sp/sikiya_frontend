import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { generalTitleFont, generalTextFont, generalTextColor, generalTextSize, generalTitleSize, auth_Style, articleTitleFont, MainBrownSecondaryColor, main_Style, MainSecondaryBlueColor } from "../../styles/GeneralAppStyle";
import { useLanguage } from '../../Context/LanguageContext';

const box2Image = require("../../../assets/OnboardingImages/global-news.png");

const UserNewsSlide = () => {
  const { height } = useWindowDimensions();
  const { t } = useLanguage();

  return (
    <View style={[auth_Style.onboardingContainer, { height: height * 0.56, width: '94%' }]}>
      <View style={styles.top}>
        <Text style={styles.headline}>{t('onboarding.ourUsers')}</Text>
        <Text style={styles.subhead}>{t('onboarding.userNews')}</Text>
      </View>
      <View style={styles.cardOuter}>
        <View style={[styles.infoBox, main_Style.genContentElevation]}>
          <View style={styles.iconContainer}>
            <Image source={box2Image} style={styles.boxImage} />
          </View>
          <View style={styles.boxTextContainer}>
            <Text style={styles.boxTitle}>{t('onboarding.userNews')}</Text>
            <Text style={styles.boxDesc}>{t('onboarding.userNewsDesc')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  headline: {
    fontFamily: articleTitleFont,
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subhead: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize,
    fontWeight: '600',
    color: MainSecondaryBlueColor,
    textAlign: 'center',
  },
  cardOuter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EF',
    borderRadius: 12,
    padding: 16,
    paddingVertical: 18,
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

export default UserNewsSlide;
