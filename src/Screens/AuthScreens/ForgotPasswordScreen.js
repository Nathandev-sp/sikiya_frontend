import React, { useState, useRef, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, KeyboardAvoidingView, ScrollView, useWindowDimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppScreenBackgroundColor, { main_Style, generalTitleFont, generalTextFont, generalTextSize, generalTitleSize, generalTitleColor, withdrawnTitleColor, lightBannerBackgroundColor, MainBrownSecondaryColor, auth_Style, generalActiveOpacity, defaultButtonHitslop, MainSecondaryBlueColor, articleTitleFont } from "../../styles/GeneralAppStyle";
import { Context as AuthContext } from "../../Context/AuthContext";
import LottieLoad from "../../Helpers/LottieLoad";
import SikiyaAPI from "../../../API/SikiyaAPI";
import { Alert } from "react-native";
import { useLanguage } from "../../Context/LanguageContext";

const ForgotPasswordScreen = ({ navigation }) => {
  const { state, clearErrorMessage } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const scrollRef = useRef(null);
  const { height } = useWindowDimensions();

  const handleSendResetLink = async () => {
    if (!email || !email.includes('@')) {
      setEmailError(true);
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setEmailError(false);

    setLoading(true);
    try {
      const response = await SikiyaAPI.post('/forgot-password', { email });
      
      Alert.alert(
        'Reset Link Sent',
        'If an account exists with this email, a password reset link has been sent. Please check your email and click the link to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      console.log("Error sending reset link:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send reset link. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = async () => {
    await clearErrorMessage();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={auth_Style.authSafeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={"dark-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            {/* Header Section - Same as LoginScreen */}
            <View style={[styles.headerSection, { height: height * 0.44 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <Image 
                  source={require("../../../assets/SikiyaLogoV2/NathanApprovedSikiyaPreloadingLogo.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>{t('auth.resetPassword')}</Text>
                <Text style={styles.instructionText}>
                {t('auth.resendLinkMessage')}
                </Text>   
              </View>
            </View>

            {/* Form Section */}
            <View style={[auth_Style.formContainer]}>
              

              {/* Email Input - Same style as LoginScreen */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>{t('auth.email')}</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  emailFocused && auth_Style.authInputContainerFocused,
                  emailError && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="mail-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {state.errorMessage ? (
                <Text style={styles.error}>{state.errorMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={[auth_Style.authButtonStyle, styles.sendButton]}
                activeOpacity={generalActiveOpacity}
                onPress={handleSendResetLink}
                disabled={loading || !email}
                hitSlop={defaultButtonHitslop}
              >
                {loading ? (
                  <LottieLoad />
                ) : (
                  <Text style={auth_Style.authButtonText}>{t('auth.sendResetLink')}</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <TouchableOpacity 
                  onPress={goBackToLogin} 
                  disabled={loading} 
                  activeOpacity={generalActiveOpacity}
                  hitSlop={defaultButtonHitslop}
                >
                  <Text style={styles.backToLoginText}>{t('auth.login')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MainBrownSecondaryColor,
    borderColor: MainBrownSecondaryColor,
    borderWidth: 1,
    width: '92%',
    borderRadius: 24,
    marginBottom: 12,
    flex: 1,
    maxHeight: '70%',
  },
  companyLogo: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 16,
    //flex: 0.1,
    //backgroundColor: 'red',
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 6,
    fontWeight: '700',
    color: generalTitleColor,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 0,
  },
  instructionText: {
    fontFamily: articleTitleFont,
    fontSize: generalTextSize+1,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  sendButton: {
    width: 200,
    marginTop: 20,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    color: MainSecondaryBlueColor,
    fontSize: 13.5,
    fontFamily: generalTextFont,
    textAlign: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
    textAlign: "center",
    fontFamily: generalTextFont,
  },
});

export default ForgotPasswordScreen;

