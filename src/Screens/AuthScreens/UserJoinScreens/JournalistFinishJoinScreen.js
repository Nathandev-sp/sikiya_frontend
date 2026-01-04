import React, { useEffect, useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';
import { auth_Style, bannerBackgroundColor, generalTextColor, generalTextFont, generalTitleColor, generalTitleFont, MainBrownSecondaryColor } from "../../../styles/GeneralAppStyle";
import AuthScreenMiniHeader from "../../../Components/AuthScreenMiniHeader";
import BigLoaderAnim from "../../../Components/LoadingComps/BigLoaderAnim";
import {Context as AuthContext} from "../../../Context/AuthContext";

const animation = require("../../../../assets/LottieView/JournalistWorkingLottie.json");

const welcomeMessage = "Thank you for your interest in joining Sikiya as a journalist. Be part of our mission to publish articles that inspire thoughtful and constructive discussions about Africa. You will be assigned a publisher who will contact you via email with further details.";

const nextSteps = [
  "Enjoy Sikiya as a user",
  "Wait for an email from your publisher",
  "Complete journalist training",
  "Start posting",
];

const JournalistFinishJoinScreen = ({ navigation }) => {
  const { height } = useWindowDimensions();
  const { state, updateRole } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateRole('general');
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={auth_Style.authSafeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={"dark-content"} />
      <AuthScreenMiniHeader title="Welcome to Sikiya" />

      <View style={[auth_Style.onboardingContainer, { height: height * 0.60, width: '96%', marginTop: 16 }, auth_Style.authElevation]}>
        <View style={styles.mainContainer}>
          {/* Lottie Animation Section */}
          <View style={styles.ImageGridContainer}>
            <LottieView
              source={animation}
              style={styles.singleAnimation}
              autoPlay
              loop
            />
          </View>

          {/* Text Content Section */}
          <View style={styles.TextGridContainer}>
            <Text style={styles.introParagraph}>
              {welcomeMessage}
            </Text>
            
            <Text style={styles.introMissionParagraph}>
              Next Steps:
            </Text>
            
            <View style={{ marginBottom: 12, width: '95%', alignSelf: 'center' }}>
              {nextSteps.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13.5, color: MainBrownSecondaryColor, marginRight: 8 }}>{'\u2022'}</Text>
                  <Text style={{ fontFamily: generalTextFont, fontSize: 13.5, color: 'black', flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <BigLoaderAnim />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
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
  singleAnimation: {
    width: '80%',
    height: '90%',
    alignSelf: 'center',
  },
  TextGridContainer: {
    width: '100%',
    height: '48%',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  introParagraph: {
    fontFamily: generalTextFont,
    fontSize: 13.5,
    color: 'black',
    marginBottom: 16,
    alignSelf: 'center',
    textAlign: 'justify',
  },
  introMissionParagraph: {
    fontFamily: generalTitleFont,
    fontSize: 16,
    fontWeight: 'bold',
    color: generalTitleColor,
    textAlign: 'flex-start',
    marginBottom: 8,
  },
});

export default JournalistFinishJoinScreen;