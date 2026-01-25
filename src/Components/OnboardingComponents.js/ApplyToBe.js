import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { generalTitleFont, generalTextFont, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, auth_Style, generalActiveOpacity } from "../../styles/GeneralAppStyle";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from '../../Context/LanguageContext';

const journalistImage = require("../../../assets/OnboardingImages/journalistWork.png");
const userImage = require("../../../assets/OnboardingImages/team.png");

const ApplyToBe = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleUserPress = () => {
    navigation.navigate("GeneralUserJoinStack");
  };

  const handleJournalistPress = () => {
    navigation.navigate("JournalistJoinStack");
  }

  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.5, width: '94%', justifyContent: "space-between", paddingVertical: 16}, auth_Style.authElevation]}>
      {/* Join as User Button */}
      <TouchableOpacity 
        style={[styles.ButtonContainer, styles.imageLeftContainer]} 
        activeOpacity={generalActiveOpacity} 
        onPress={handleUserPress}
      >
        <View style={styles.imageWrapper}>
          <Image source={userImage} style={styles.largeImage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>{t('onboarding.joinAsUser')}</Text>
          <Text style={styles.description}>
            {t('onboarding.joinAsUserDescription')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Apply to be Journalist Button */}
      <TouchableOpacity 
        style={[styles.ButtonContainer, styles.imageRightContainer]} 
        activeOpacity={generalActiveOpacity} 
        onPress={handleJournalistPress}
      >
        <View style={styles.textContainer}>
          <Text style={styles.headline}>{t('onboarding.applyToBeJournalist')}</Text>
          <Text style={styles.description}>
            {t('onboarding.joinAsJournalistDescription')}
          </Text>
        </View>
        <View style={styles.imageWrapper}>
          <Image source={journalistImage} style={styles.largeImage} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ButtonContainer: {
    flex: 1,
    maxHeight: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: '#F6F3EF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageLeftContainer: {
    flexDirection: 'row',
  },
  imageRightContainer: {
    flexDirection: 'row-reverse',
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  largeImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headline: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize - 1,
    fontWeight: '700',
    color: generalTitleColor,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize - 1,
    color: generalTextColor,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default ApplyToBe;