import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { generalTitleFont, generalTextFont, mainBrownColor, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, MainBrownSecondaryColor, auth_Style, generalActiveOpacity, main_Style, articleTitleFont, lightBannerBackgroundColor, bannerBackgroundColor } from "../../styles/GeneralAppStyle";
import {useNavigation} from "@react-navigation/native";

const journalistImage = require("../../../assets/OnboardingImages/journalistWork.png");
const userImage = require("../../../assets/OnboardingImages/team.png");

const journalistSpeech = "Report the truth and spark meaningful conversations. Anyone can apply — start your journalism journey today."
const UserSpeech = "Enjoy trusted content that keeps you informed. Engage with articles, comment, and join the conversation."

const ApplyToBe = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();

  const handleUserPress = () => {
    navigation.navigate("GeneralUserJoinStack");
  };

  const handleJournalistPress = () => {
    navigation.navigate("JournalistJoinStack");
  }

  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.62, width: '96%', justifyContent: "space-around"}, auth_Style.authElevation]}>
      {/* Top Container - Image Left */}
      <TouchableOpacity style={[styles.ButtonContainer, styles.imageLeftContainer, {backgroundColor: "#F6F3EF"}, main_Style.genButtonElevation]} activeOpacity={generalActiveOpacity} onPress={handleUserPress}>
        <Image source={userImage} style={styles.largeImage} />
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Join as a User</Text>
          <Text style={styles.description}>
                {UserSpeech}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Container - Image Right */}
      <TouchableOpacity style={[styles.ButtonContainer, styles.imageRightContainer, {backgroundColor: '#F6F3EF'}, main_Style.genButtonElevation]} activeOpacity={generalActiveOpacity} onPress={handleJournalistPress}>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Apply to be a Journalist</Text>
          <Text style={styles.description}>
                {journalistSpeech}
          </Text>
        </View>
        <Image source={journalistImage} style={styles.largeImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ButtonContainer: {
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  imageLeftContainer: {
    flexDirection: 'row',
  },
  imageRightContainer: {
    flexDirection: 'row-reverse',
  },
  largeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0.4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headline: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: generalTitleColor,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize - 1,
    color: generalTextColor,
    lineHeight: 21,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    height: '42%',
    //backgroundColor: 'red',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  boxImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 14,
  },
  boxTextContainer: {
    flex: 1,
  },
  boxTitle: {
    fontFamily: generalTitleFont,
    fontSize: 16,
    fontWeight: 'bold',
    color: generalTitleColor,
    marginBottom: 4,
  },
  boxDesc: {
    fontFamily: generalTextFont,
    fontSize: 13,
    color: generalTextColor,
  },
});

export default ApplyToBe;