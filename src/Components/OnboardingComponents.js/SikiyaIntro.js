import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, useWindowDimensions } from "react-native";
import LottieView from 'lottie-react-native';
import { generalTitleFont, generalTextFont, mainBrownColor, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, bannerBackgroundColor, MainBrownSecondaryColor, auth_Style } from "../../styles/GeneralAppStyle";

const Intro_message = "Welcome to Sikiya!!! A platform is dedicated to dialogues on the political, economic, social, and cultural dimensions shaping the continent."

const values = [
  { title: "Community", desc: "We connect people across Africa to share and grow together." },
  { title: "Integrity", desc: "We value honesty and transparency in all we do." },
  { title: "Innovation", desc: "We embrace new ideas to drive progress." },
  { title: "Empowerment", desc: "We empower voices and support positive change." },
];

const missionBullets = [
  "Empower communities with knowledge",
  "Encourage critical thinking",
  "Spark meaningful engagement",
];

// Single Lottie animation for the grid
const animation = require("../../../assets/LottieView/SikiyaOnboarding.json");

const SikiyaIntro = () => {

  const { height } = useWindowDimensions();


  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.62, width: '96%'}, auth_Style.authElevation]}>
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
          <Text style={styles.introParagraph}>
            {Intro_message}
          </Text>
          <Text style={styles.introMissionParagraph}>
            Our mission:
          </Text>
          <View style={styles.missionBulletsContainer}>
            {missionBullets.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
    //justifyContent: 'center',
    alignItems: 'center',
  },
  ImageGridContainer: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 0,
    backgroundColor: '#F6F3EF',
    borderRadius: 4,
    padding: 2,
  },
  gridImage: {
    width: '50%',
    height: '49%',
    borderRadius: 4,
    marginBottom: 0,
    marginTop: 0,
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    //borderWidth: 1,
    borderColor: 'gray',
    
  },
  gridAnimation: {
    width: '48%',
    height: '48%',
    marginBottom: 2,
    marginTop: 2,
  },
  singleAnimation: {
    width: '80%',
    height: '90%',
    alignSelf: 'center',
  },
  TextGridContainer: {
    width: '100%',
    height: '48%',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  introParagraph: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  introMissionParagraph: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    color: generalTitleColor,
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 4,
  },
  missionBulletsContainer: {
    width: '100%',
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 8,
  },
  bulletPoint: {
    fontSize: 18,
    color: MainBrownSecondaryColor,
    marginRight: 12,
    marginTop: 2,
    lineHeight: 22,
  },
  bulletText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  valuesGrid: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: 'green',
    padding: 2,
  },
  
});

export default SikiyaIntro;