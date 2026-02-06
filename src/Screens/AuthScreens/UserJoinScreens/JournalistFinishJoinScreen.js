import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';
import AppScreenBackgroundColor, { articleTitleFont, articleTitleSize, auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleSize, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor } from "../../../styles/GeneralAppStyle";
import AuthScreenMiniHeader from "../../../Components/AuthScreenMiniHeader";
import LottieLoad from "../../../Helpers/LottieLoad";
import SikiyaAPI from "../../../../API/SikiyaAPI";
import { Context as AuthContext } from "../../../Context/AuthContext";
import { useLanguage } from "../../../Context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";

const animation = require("../../../../assets/LottieView/JournalistWorkingLottie.json");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const JournalistFinishJoinScreen = ({ navigation, route }) => {
  const { height } = useWindowDimensions();
  const { updateRole } = useContext(AuthContext);
  const { appLanguage, contentLanguage, t } = useLanguage();
  const { journalistInfo, journalistInfo2, profileImageKey } = route.params;

  const [loading, setLoading] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);
  const [timer, setTimer] = useState(15);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Disable back button
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent going back until profile is created
      if (!profileCreated) {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation, profileCreated]);

  // Start timer immediately (no profile creation)
  useEffect(() => {
    setLoading(false); // Stop showing loading animation
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createJournalistProfile = async () => {
    try {
      const payload = {
        firstname: journalistInfo.firstName,
        lastname: journalistInfo.lastName,
        date_of_birth: journalistInfo.dob,
        city_of_residence: journalistInfo.city,
        country_of_residence: journalistInfo.country,
        interested_african_country: journalistInfo.countryOfInterest,
        signed_agreement: true,
        displayName: journalistInfo2.nickname || `${journalistInfo.firstName} ${journalistInfo.lastName}`,
        journalist_affiliation: journalistInfo2.mediaCompany.trim() || 'Independent Journalist',
        journalist_description: journalistInfo2.description,
        area_of_expertise: journalistInfo2.areaOfExpertise,
        profile_picture: profileImageKey,
        phone_country_code: journalistInfo.phoneCountryCode?.code || journalistInfo.phoneCountryCode,
        phone_number: journalistInfo.phoneNumber,
        appLanguage: appLanguage,
        contentLanguage: contentLanguage
      };

      await SikiyaAPI.post('/signup/journalist', payload);
      setProfileCreated(true);
      // Auto-navigate after profile is created
      updateRole({ role: 'general' });
    } catch (error) {
      console.log("Error creating journalist profile:", error);
      Alert.alert(
        t('errors.serverError'),
        error.response?.data?.error || t('errors.unknownError'),
        [
          { text: t('common.tryAgain'), onPress: () => createJournalistProfile() },
          { text: t('common.cancel'), onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const handleContinue = async () => {
    setButtonLoading(true);
    // Create profile when user presses the button
    await createJournalistProfile();
  };

  const nextSteps = [
    { icon: "mail-outline", text: t('onboarding.expectEmailFromSikiya') },
    { icon: "document-text-outline", text: t('onboarding.fillOutAdminPaperwork') },
    { icon: "checkmark-circle-outline", text: t('onboarding.getAccessAndStartReporting') },
  ];

  return (
    <SafeAreaView style={auth_Style.authSafeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={"dark-content"} />
      <AuthScreenMiniHeader title={t('onboarding.welcomeToSikiya')} />

      <View style={[auth_Style.onboardingContainer, { height: height * 0.55, width: '94%', marginTop: 4 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieLoad />
            <Text style={styles.loadingText}>{t('onboarding.creatingYourProfile')}</Text>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            {/* Lottie Animation Section */}
            <View style={[styles.ImageGridContainer, main_Style.genContentElevation]}>
              <LottieView
                source={animation}
                style={styles.singleAnimation}
                autoPlay
                loop
              />
            </View>

            {/* Text Content Section */}
            <View style={styles.TextGridContainer}>
              
              
              <Text style={styles.introMissionParagraph}>
                {t('onboarding.nextSteps')}:
              </Text>
              
              <View style={styles.nextStepsContainer}>
                {nextSteps.map((item, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepIconContainer}>
                      <Ionicons name={item.icon} size={20} color={MainBrownSecondaryColor} />
                    </View>
                    <Text style={styles.stepText}>{item.text}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.inTheMeantimeContainer, main_Style.genContentElevation]}>
                <Ionicons name="heart-outline" size={24} color={MainSecondaryBlueColor} style={styles.heartIcon} />
                <Text style={styles.inTheMeantimeText}>
                  {t('onboarding.inTheMeantime')}
                </Text>
              </View>

              {/* In the meantime message */}
              
            </View>
          </View>
        )}
      </View>

      {/* Continue Button with Timer - Disabled until 15s, then enabled */}
      <TouchableOpacity
        hitSlop={defaultButtonHitslop}
        style={[
          auth_Style.authButtonStyle,
          styles.continueButton,
          timer > 0 && styles.disabledButton,
        ]}
        activeOpacity={generalActiveOpacity}
        onPress={handleContinue}
        disabled={timer > 0 || buttonLoading}
      >
        {buttonLoading ? (
          <LottieLoad />
        ) : (
          <>
            <Text style={[auth_Style.authButtonText, timer > 0 && styles.disabledButtonText]}>
              {timer > 0 
                ? `${t('onboarding.openSikiya')} (${timer}s)`
                : t('onboarding.openSikiya')
              }
            </Text>
            <Ionicons name="arrow-forward" size={20} color={timer > 0 ? '#ccc' : '#fff'} style={styles.arrowIcon} />
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: generalTextFont,
    fontSize: 16,
    color: generalTitleColor,
    marginTop: 16,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    padding: 0,
    alignItems: 'center',
  },
  ImageGridContainer: {
    width: '100%',
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 0,
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    padding: 4,
  },
  singleAnimation: {
    width: '85%',
    height: '95%',
    alignSelf: 'center',
  },
  TextGridContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 8,
  },
  introParagraph: {
    fontFamily: generalTextFont,
    fontSize: 13.5,
    color: generalTextColor,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 19,
  },
  introMissionParagraph: {
    fontFamily: articleTitleFont,
    fontSize: articleTitleSize,
    fontWeight: 'bold',
    color: generalTitleColor,
    marginBottom: 16,
  },
  nextStepsContainer: {
    marginBottom: 12,
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: secCardBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: MainBrownSecondaryColor + '40',
  },
  stepText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    flex: 1,
    lineHeight: 18,
  },
  inTheMeantimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: secCardBackgroundColor,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  heartIcon: {
    marginRight: 6,
  },
  inTheMeantimeText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTextColor,
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    marginTop: 40,
    marginBottom: 24,
    minHeight: 54,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: MainBrownSecondaryColor,
  },
  disabledButtonText: {
    color: AppScreenBackgroundColor
  },
});

export default JournalistFinishJoinScreen;
