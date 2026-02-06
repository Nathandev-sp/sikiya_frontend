import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { generalTitleFont, generalTextFont, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, auth_Style, generalActiveOpacity, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, articleTitleSize } from "../../styles/GeneralAppStyle";
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
    <View style={[auth_Style.onboardingContainer, {height: height*0.56, width: '94%', justifyContent: "space-between", paddingVertical: 16}]}>
      {/* Join as User Button */}
      <TouchableOpacity 
        style={[styles.ButtonContainer, styles.imageLeftContainer, main_Style.genButtonElevation]} 
        activeOpacity={generalActiveOpacity} 
        onPress={handleUserPress}
      >
        <View style={styles.imageWrapper}>
          <Image source={userImage} style={styles.largeImage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.headlineUser}>{t('onboarding.joinAsUser')}</Text>
          <Text style={styles.description}>
            {t('onboarding.joinAsUserDescription')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Apply to be Journalist Button */}
      <TouchableOpacity 
        style={[styles.ButtonContainer, styles.imageRightContainer, main_Style.genButtonElevation]} 
        activeOpacity={generalActiveOpacity} 
        onPress={handleJournalistPress}
      >
        <View style={styles.textContainer}>
          <Text style={styles.headlineJourn}>{t('onboarding.applyToBeJournalist')}</Text>
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
  },
  imageLeftContainer: {
    flexDirection: 'row',
    borderWidth: 1.2,
    borderColor: MainSecondaryBlueColor
  },
  imageRightContainer: {
    flexDirection: 'row-reverse',
    borderWidth: 1.2,
    borderColor: MainBrownSecondaryColor
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: 76,
    height: 76,
    borderRadius: 38,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headlineUser: {
    fontFamily: generalTitleFont,
    fontSize: articleTitleSize,
    fontWeight: '700',
    color: MainSecondaryBlueColor,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headlineJourn: {
    fontFamily: generalTitleFont,
    fontSize: articleTitleSize,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
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