import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTitleColor, generalTitleFont, generalTextFont, generalTextSize, generalTitleSize, MainBrownSecondaryColor, withdrawnTitleColor, generalTextColor, lightBannerBackgroundColor } from "../../styles/GeneralAppStyle";
import AuthScreenMiniHeader from "../../Components/AuthScreenMiniHeader";
import GoBackButton from "../../../NavComponents/GoBackButton";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../Context/LanguageContext";

// Import terms and conditions
import { termsAndConditions } from "../../../assets/PDFs/UserT&C";

const JournalistTermConditions = ({ route }) => {
  const navigation = useNavigation();
  const { journalistInfo, journalistInfo2, profileImageKey } = route.params;
  const [agreed, setAgreed] = useState(false);
  const { appLanguage, t } = useLanguage();
  
  // Get the correct terms based on language
  const language = appLanguage === 'fr' ? 'fr' : 'en';
  const termsData = termsAndConditions.journalist[language];

  const handleContinue = () => {
    if (!agreed) return;
    
    // Navigate to finish screen which will handle the API call
    navigation.navigate("JournalistFinishJoin", {
      journalistInfo,
      journalistInfo2,
      profileImageKey
    });
  };

  return (
    <SafeAreaView style={auth_Style.authSafeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={"dark-content"} />
      <AuthScreenMiniHeader title={t('onboarding.termsAndConditions')} />
      <GoBackButton />
      
      <View style={[auth_Style.formContainer]}>
        {/* Terms and Conditions ScrollView */}
        <View style={styles.termsContainer}>
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
              color={agreed ? MainBrownSecondaryColor : "#888"}
            />
          </TouchableOpacity>
          <Text style={styles.agreeText}>
            {t('onboarding.agreeToTerms')}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          hitSlop={defaultButtonHitslop}
          activeOpacity={generalActiveOpacity}
          style={[
            auth_Style.authButtonStyle,
            { marginTop: 24, marginBottom: 20, opacity: agreed ? 1 : 0.2 }
          ]}
          onPress={handleContinue}
          disabled={!agreed}
        >
          <Text style={auth_Style.authButtonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: lightBannerBackgroundColor,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontSize: generalTextSize - 1,
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
    backgroundColor: lightBannerBackgroundColor,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  agreeText: {
    fontSize: generalTextSize - 1,
    fontFamily: generalTextFont,
    color: generalTitleColor,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
});

export default JournalistTermConditions;
