import React, { useState, useRef, useContext } from "react";
import { View, Text, StyleSheet,Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, withdrawnTitleColor } from "../../styles/GeneralAppStyle";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Context as AuthContext } from "../../Context/AuthContext"; // Import AuthContext if needed
import { set } from "mongoose";
import LottieLoad from "../../Helpers/LottieLoad";

const LoginScreen = ({navigation}) => {
  
  const { state, signin, clearErrorMessage } = useContext(AuthContext); // Use AuthContext to access state and signup function

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  const { height } = useWindowDimensions();

  const goToSignupScreen = async () => {
    await clearErrorMessage();
    navigation.navigate('Signup');
  };

  const goToForgotPassword = async () => {
    await clearErrorMessage();
    navigation.navigate('ForgotPassword');
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      await signin({ email, password });
    } finally {
      setLoading(false);
    }
  }

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
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1 }}>
            <View style={[styles.headerSection, { height: height * 0.35 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <Image 
                  source={require("../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome</Text>
                <Text style={styles.welcomeSubtitle}>Login to join conversations that change Africa.</Text>
              </View>
            </View>

            <View style={[auth_Style.formContainer, {marginTop: 20}]}>
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>Email</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  emailFocused && auth_Style.authInputContainerFocused
                ]}>
                  <Ionicons name="mail-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>Password</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  passwordFocused && auth_Style.authInputContainerFocused
                ]}>
                  <Ionicons name="lock-closed-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={defaultButtonHitslop}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color={withdrawnTitleColor}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={goToSignupScreen} activeOpacity={generalActiveOpacity} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {state.errorMessage ? <View style={{ marginTop: 10, alignItems: 'center' }}>
                  <Text style={styles.errorMessage}>{state.errorMessage}</Text>
              </View>: null}

              <TouchableOpacity  style={[auth_Style.authButtonStyle, styles.loginButton]} activeOpacity={generalActiveOpacity} onPress={handleLogin}>
                {loading ? (<LottieLoad />) : (<Text style={auth_Style.authButtonText}>Login</Text>)}
              </TouchableOpacity>

              {/* Forgot Password Link - Below Button */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={goToForgotPassword} activeOpacity={generalActiveOpacity} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
    paddingTop: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightBannerBackgroundColor,
    borderColor: MainBrownSecondaryColor,
    borderWidth: 1,
    width: '92%',
    borderRadius: 16,
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
    paddingHorizontal: 32,
    flex: 0.3,
    justifyContent: 'center',
    paddingTop: 8,
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
  welcomeSubtitle: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  signupText: {
    fontFamily: generalTextFont,
    fontSize: 13.5,
    color: withdrawnTitleColor,
  },
  signupLink: {
    fontFamily: generalTitleFont,
    fontSize: 13.5,
    fontWeight: '600',
    color: MainSecondaryBlueColor,
    marginLeft: 5,
  },
  loginButton: {
    marginTop: 32,
  },
  errorMessage: {
    color: 'red',
    fontFamily: generalTextFont,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 0,
    paddingHorizontal: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontFamily: generalTextFont,
    fontSize: 13.5,
    color: withdrawnTitleColor,
    //opacity: 0.7,
  },
});

export default LoginScreen;

