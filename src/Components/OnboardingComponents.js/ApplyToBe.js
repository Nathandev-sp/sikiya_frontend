import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { generalTitleFont, generalTextFont, generalTextColor, generalTextSize, generalTitleSize, auth_Style, generalActiveOpacity, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, articleTitleFont } from "../../styles/GeneralAppStyle";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from '../../Context/LanguageContext';
import { Ionicons } from "@expo/vector-icons";

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
    <View style={[auth_Style.onboardingContainer, {height: height*0.56, width: '94%', paddingVertical: 12}]}>
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>{t('onboarding.chooseJoinPath')}</Text>
      </View>

      <View style={styles.cardsColumn}>
        {/* Join as User Button */}
        <TouchableOpacity 
          style={[styles.ButtonContainer, styles.userBorder, main_Style.genButtonElevation]} 
          activeOpacity={generalActiveOpacity} 
          onPress={handleUserPress}
          accessibilityRole="button"
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
          <Ionicons name="chevron-forward" size={22} color={MainSecondaryBlueColor} />
        </TouchableOpacity>

        {/* Apply to be Journalist Button */}
        <TouchableOpacity 
          style={[styles.ButtonContainer, styles.journalistBorder, main_Style.genButtonElevation]} 
          activeOpacity={generalActiveOpacity} 
          onPress={handleJournalistPress}
          accessibilityRole="button"
        >
          <View style={styles.imageWrapper}>
            <Image source={journalistImage} style={styles.largeImage} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.headlineJourn}>{t('onboarding.applyToBeJournalist')}</Text>
            <Text style={styles.description}>
              {t('onboarding.joinAsJournalistDescription')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={MainBrownSecondaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: articleTitleFont,
    fontSize: generalTitleSize + 3,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    paddingHorizontal: 8,
  },
  cardsColumn: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    gap: 14,
    paddingBottom: 4,
  },
  ButtonContainer: {
    flex: 1,
    maxHeight: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: '#F6F3EF',
    flexDirection: 'row',
  },
  userBorder: {
    borderWidth: 1.2,
    borderColor: MainSecondaryBlueColor,
  },
  journalistBorder: {
    borderWidth: 1.2,
    borderColor: MainBrownSecondaryColor,
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
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: MainSecondaryBlueColor,
    marginBottom: 8,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  headlineJourn: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    marginBottom: 8,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize - 1,
    color: generalTextColor,
    lineHeight: 20,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
});

export default ApplyToBe;