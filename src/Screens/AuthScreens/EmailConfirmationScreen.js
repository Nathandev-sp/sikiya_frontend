import React, { useState, useRef, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, KeyboardAvoidingView, ScrollView, useWindowDimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppScreenBackgroundColor, { main_Style, generalTitleFont, generalTextFont, generalTextSize, generalTitleSize, generalTitleColor, withdrawnTitleColor, lightBannerBackgroundColor, MainBrownSecondaryColor, auth_Style, generalActiveOpacity, defaultButtonHitslop } from "../../styles/GeneralAppStyle";
import {Context as AuthContext} from '../../Context/AuthContext';
import { set } from "mongoose";
import sleep from "../../Helpers/Sleep";

const EmailConfirmationScreen = ({ navigation, route }) => {
  const {state, verifyEmail, clearErrorMessage, resendVerificationCode, clearState} = useContext(AuthContext);
  const emailFromContext = state.email || null;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeFocused, setCodeFocused] = useState(false); // Add focus state

  const scrollRef = useRef(null);
  const { height } = useWindowDimensions();

  // Get email from route.params
  const email = route?.params?.email || "your email";

  const handleConfirm = async () => {
    setLoading(true);
    try{
      await verifyEmail({ code });
    }finally{
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      // Call resendVerificationCode from AuthContext
      await resendVerificationCode();
    } finally {
      setLoading(false);
    }
    clearErrorMessage();
  };

  const goToSignup = async() => {
    setLoading(true);
    await sleep(200); // Small delay to ensure state updates
    await clearState(); // Clear auth state before navigating
    setLoading(false);
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
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1 }}>
            {/* Header Section - Same as ForgotPasswordScreen */}
            <View style={[styles.headerSection, { height: height * 0.35 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <Image 
                  source={require("../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Verify Your Email</Text>
              </View>
            </View>

            {/* Form Section */}
            <View style={[auth_Style.formContainer, {marginTop: 0}]}>
              <Text style={styles.emailText}>
                We've sent a 6-digit code to <Text style={styles.emailHighlight}>{emailFromContext}</Text>. Please enter that code below to verify your account.
              </Text>

              <Text style={styles.instructionText}>
                Please check your inbox and enter the verification code.
              </Text>

              <TextInput
                style={[
                  styles.input,
                  codeFocused && styles.inputFocused
                ]}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
              />

              {state.errorMessage ? <Text style={styles.error}>{state.errorMessage}</Text> : null}

              <TouchableOpacity
                style={[auth_Style.authButtonStyle, styles.confirmButton]}
                activeOpacity={generalActiveOpacity}
                onPress={handleConfirm}
                disabled={loading || code.length < 6}
                hitSlop={defaultButtonHitslop}
              >
                <Text style={auth_Style.authButtonText}>
                  {loading ? "Verifying..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons at Bottom */}
            <View style={styles.bottomActionContainer}>
              <TouchableOpacity 
                onPress={handleResend} 
                disabled={loading} 
                activeOpacity={generalActiveOpacity}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Text style={styles.actionText}>Resend Code</Text>
              </TouchableOpacity>

              <Text style={styles.separatorText}>or</Text>

              <TouchableOpacity 
                onPress={goToSignup} 
                disabled={loading} 
                activeOpacity={generalActiveOpacity}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Text style={styles.actionText}>Sign up with different email</Text>
              </TouchableOpacity>
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
    paddingTop: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightBannerBackgroundColor,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    width: '92%',
    borderRadius: 16,
    marginBottom: 0,
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
    paddingHorizontal: 32,
    flex: 0.3,
    justifyContent: 'center',
    paddingTop: 12,
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 8,
    fontWeight: '700',
    color: generalTitleColor,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  emailText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: MainBrownSecondaryColor,
  },
  instructionText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: withdrawnTitleColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: AppScreenBackgroundColor,
    fontFamily: generalTextFont,
    alignSelf: 'center',
  },
  inputFocused: {
    borderColor: MainBrownSecondaryColor,
    backgroundColor: '#fff',
  },
  confirmButton: {
    width: 200,
    alignSelf: 'center',
    marginTop: 12
  },
  bottomActionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  actionText: {
    color: "#2BA1E6",
    fontSize: 12,
    fontFamily: generalTextFont,
    marginVertical: 8,
    textAlign: "center",
  },
  separatorText: {
    color: withdrawnTitleColor,
    fontSize: 12,
    fontFamily: generalTextFont,
    marginVertical: 4,
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: generalTextFont,
  },
});

export default EmailConfirmationScreen;