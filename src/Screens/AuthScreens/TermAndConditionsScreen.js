import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth_Style, AppScreenBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTitleColor, generalTitleFont, generalTextFont, generalTextSize, generalTitleSize, MainBrownSecondaryColor, withdrawnTitleColor, generalTextColor, lightBannerBackgroundColor, main_Style, MainSecondaryBlueColor, commentTextSize, cardBackgroundColor } from "../../styles/GeneralAppStyle";
import AuthScreenMiniHeader from "../../Components/AuthScreenMiniHeader";
import SikiyaAPI from "../../../API/SikiyaAPI";
import LottieLoad from "../../Helpers/LottieLoad";
import sleep from "../../Helpers/Sleep";
import { Context as AuthContext } from "../../Context/AuthContext";
import { useLanguage } from "../../Context/LanguageContext";

// Import terms and conditions
import { termsAndConditions } from "../../../assets/PDFs/TermsAndConditions";

const TermAndConditionsScreen = ({ navigation, route }) => {
  const { userInfo, userType = 'user' } = route.params; // userType can be 'user' or 'journalist'
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { state, updateRole } = useContext(AuthContext);
  const { appLanguage, contentLanguage } = useLanguage();
  const { t } = useLanguage();

  // Get the appropriate terms based on user type and language
  const language = appLanguage === 'fr' ? 'fr' : 'en';
  const termsData = termsAndConditions[userType][language];
  const createUserProfile = async () => {
    if (!agreed) return;

    setLoading(true);

    try {
      const payload = {
        firstname: userInfo.firstName,
        lastname: userInfo.lastName,
        date_of_birth: userInfo.dob,
        city_of_residence: userInfo.city,
        country_of_residence: userInfo.country,
        interested_african_country: userInfo.countryOfInterest,
        signed_agreement: true,
        displayName: `${userInfo.firstName} ${userInfo.lastName}`,
        phone_country_code: userInfo.phoneCountryCode?.code || userInfo.phoneCountryCode,
        phone_number: userInfo.phoneNumber,
        appLanguage: appLanguage, // Include app language from context
        contentLanguage: contentLanguage // Include content language from context
      };
      
      const response = await SikiyaAPI.post('/signup/user', payload);
      await sleep(500);

    } catch (error) {
      console.log("Error creating user profile:", error);
    } finally {
      await updateRole({ role: 'contributor' });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={auth_Style.authSafeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={"dark-content"} />
      <AuthScreenMiniHeader title={t('onboarding.termsAndConditions')} />
      
      <View style={[auth_Style.formContainer]}>
        {/* Terms and Conditions ScrollView */}
        <View style={[styles.termsContainer, main_Style.genContentElevation]}>
          <ScrollView 
            style={styles.termsScrollView}
            contentContainerStyle={styles.termsContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Header */}
            <Text style={styles.termsTitle}>{termsData.title}</Text>
            <Text style={styles.lastUpdated}>{t('onboarding.lastUpdated')}: {termsData.lastUpdated}</Text>

            {/* Sections */}
            {termsData.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionHeading}>{section.heading}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Agreement Row */}
        <View style={styles.agreeRow}>
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={styles.checkboxContainer}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            activeOpacity={generalActiveOpacity}
          >
            <Ionicons
              name={agreed ? "checkbox" : "square-outline"}
              size={24}
              color={agreed ? MainSecondaryBlueColor : MainSecondaryBlueColor}
            />
          </TouchableOpacity>
          <Text style={styles.agreeText}>
            {t('onboarding.agreeToTerms')}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={generalActiveOpacity}
          style={[
            auth_Style.authButtonStyle,
            { marginTop: 16, marginBottom: 32, opacity: agreed ? 1 : 0.2, backgroundColor: MainSecondaryBlueColor }
          ]}
          onPress={() => {
            if (agreed) {
              createUserProfile();
            }
          }}
          disabled={!agreed || loading}
        >
          {loading ? (
            <LottieLoad />
          ) : (
            <Text style={auth_Style.authButtonText}>{t('onboarding.openSikiya')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: lightBannerBackgroundColor,
    //borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: 'hidden',
  },
  termsScrollView: {
    flex: 1,
  },
  termsContent: {
    padding: 20,
    paddingBottom: 32,
  },
  termsTitle: {
    fontSize: generalTitleSize + 4,
    fontWeight: "700",
    fontFamily: generalTitleFont,
    color: MainBrownSecondaryColor,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  lastUpdated: {
    fontSize: generalTextSize - 3,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    marginBottom: 24,
    textAlign: "center",
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: generalTitleSize,
    fontWeight: "700",
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  sectionContent: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: cardBackgroundColor,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MainSecondaryBlueColor,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  agreeText: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
});

export default TermAndConditionsScreen;



