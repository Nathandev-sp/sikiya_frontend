import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { generalTitleFont, generalTextFont, mainBrownColor, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, MainBrownSecondaryColor, auth_Style, articleTitleFont } from "../../styles/GeneralAppStyle";

const journalistImage = require("../../../assets/OnboardingImages/team.png");
const box2Image = require("../../../assets/OnboardingImages/contributorImage.png");
const box3Image = require("../../../assets/OnboardingImages/user.png");

const UserSpeech = "Stay informed with trusted, relevant content tailored to keep you engaged and inspired."

const UserIntro = () => {
  const { height } = useWindowDimensions();

  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.62, width: '96%'}, auth_Style.authElevation]}>
      {/* Top Container */}
      <View style={styles.topContainer}>
        <Image source={journalistImage} style={styles.journalistImage} />
        <View style={styles.topTextContainer}>
          <Text style={styles.headline}>Our Users</Text>
          <Text style={styles.description}>
                {UserSpeech}
          </Text>
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* Contributors */}
        <View style={styles.infoBox}>
          <Image source={box2Image} style={styles.boxImage} />
          <View style={styles.boxTextContainer}>
            <Text style={styles.boxTitle}>Contributors</Text>
            <Text style={styles.boxDesc}>Get timely article updates and reply to comments to share your perspective.</Text>
          </View>
        </View>
        {/* General Users */}
        <View style={styles.infoBox}>
          <Image source={box3Image} style={styles.boxImage} />
          <View style={styles.boxTextContainer}>
            <Text style={styles.boxTitle}>General Users</Text>
            <Text style={styles.boxDesc}>Access select articles and stay informed — completely free.</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    height: '35%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 10,
    //backgroundColor: 'green',
  },
  journalistImage: {
    width: 82,
    height: 82,
    borderRadius: "50%",
  },
  topTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 4,
    fontWeight: '700',
    color: generalTitleColor,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    paddingHorizontal: 12,
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    height: '65%',
    //backgroundColor: 'red',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    padding: 14,
    paddingVertical: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  boxImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 14,
  },
  boxTextContainer: {
    flex: 1,
  },
  boxTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize,
    fontWeight: '700',
    color: generalTitleColor,
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

export default UserIntro;