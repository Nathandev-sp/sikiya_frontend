import React, { useState, useRef, useContext } from "react"; // Add useRef import
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, ScrollView, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, withdrawnTitleColor, articleTitleFont, commentTextSize } from "../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import { Context as AuthContext } from "../../Context/AuthContext"; // Import AuthContext if needed
import LottieLoad from "../../Helpers/LottieLoad";
import { useLanguage } from "../../Context/LanguageContext";

const SignupScreen = ({navigation}) => {
  // Signup context and info -----------------------------
  const { state, signup, clearErrorMessage } = useContext(AuthContext); // Use AuthContext to access state and signup function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const {t} = useLanguage();

  // --------------------------------------------
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- Add this
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // <-- Add this
  const [loading, setLoading] = useState(false);


  const { height } = useWindowDimensions();
  const scrollRef = useRef(null); // Add scrollRef

    // Screen navigation functions-------------
        const goToLoginScreen = async() => {
          await clearErrorMessage(); // Clear any existing error messages
          navigation.navigate('Login');
        };

        const goToEmailConfirmationScreen = async() => {
          setLoading(true); // Set loading state to true
           
          try {
            await signup({ email, password, confirmPassword }); // Call signup function with email, password, and confirmPassword
          } finally {
            setLoading(false); // Set loading state to false after signup attempt
          }
        }
    // ----------------------------------------


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
            <View style={[styles.headerSection, { height: height * 0.32 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <Image 
                  source={require("../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
              </View>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>
                  {t('auth.joinSikiyaAndBePartOfAfrica')}
                </Text>
              </View>
            </View>

            


      <View style={[auth_Style.formContainer]}>

          <View style={auth_Style.authInputBundle}> 
            <Text style={auth_Style.authLabel}>{t('auth.email')}</Text>
            <View style={[
              auth_Style.authInputContainer,
              emailFocused && auth_Style.authInputContainerFocused
            ]}>
              <Ionicons name="mail-outline" style={auth_Style.authLogo}/>
              <TextInput
                style={auth_Style.input}
                hitSlop={defaultButtonHitslop}
                placeholder={t('auth.emailPlaceholder')}
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
            <Text style={auth_Style.authLabel}>{t('auth.password')}</Text>
            <View style={[
              auth_Style.authInputContainer,
              passwordFocused && auth_Style.authInputContainerFocused
            ]}>
              <Ionicons name="lock-closed-outline" style={auth_Style.authLogo}/>
              <TextInput
                style={auth_Style.input}
                hitSlop={defaultButtonHitslop}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                autoComplete="off"
                //keyboardType="email-address"
                autoCapitalize="none"
                secureTextEntry={!showPassword} // <-- This controls visibility
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => {setShowPassword(!showPassword), setShowConfirmPassword(false)}} hitSlop={defaultButtonHitslop}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={withdrawnTitleColor}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              </View>
          </View>

          <View style={auth_Style.authInputBundle}> 
            <Text style={auth_Style.authLabel}>{t('auth.confirmPassword')}</Text>
            <View style={[
              auth_Style.authInputContainer,
              confirmPasswordFocused && auth_Style.authInputContainerFocused
            ]}>
              <Ionicons name="lock-closed-outline" style={auth_Style.authLogo}/>
              <TextInput
                style={auth_Style.input}
                hitSlop={defaultButtonHitslop}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="off"
                autoCapitalize="none"
                secureTextEntry={!showConfirmPassword} // <-- This controls visibility
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => {setShowConfirmPassword(!showConfirmPassword); setShowPassword(false)}} activeOpacity={generalActiveOpacity}>    
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={withdrawnTitleColor}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            {state.errorMessage ? <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={styles.errorMessage}>{state.errorMessage}</Text>
            </View>: null}
          </View>

          <View style={{ alignSelf: 'center', marginTop: "auto", marginBottom: 50, width: '100%' }}>
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>{t('auth.alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={goToLoginScreen} activeOpacity={generalActiveOpacity} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.signupLink}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>

            

            <TouchableOpacity style={[auth_Style.authButtonStyle, styles.createAccountButton]} onPress={goToEmailConfirmationScreen} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} activeOpacity={generalActiveOpacity}>
              {loading ? (<LottieLoad />) : (<Text style={auth_Style.authButtonText}>{t('auth.createAccount')}</Text>)}
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
    //backgroundColor: "red"
    //paddingTop: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: MainBrownSecondaryColor,
    borderColor: MainBrownSecondaryColor,
    //borderWidth: 1,
    width: '92%',
    //borderRadius: 24,
    //marginBottom: 12,
    //flex: 1,
    maxHeight: '60%',
  },
  companyLogo: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    //flex: 0.3,
    justifyContent: 'center',
    //paddingTop: 8,
  },
  welcomeTitle: {
    fontFamily: articleTitleFont,
    fontSize: generalTitleSize + 6,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  welcomeParagraph: {
    fontFamily: articleTitleFont,
    fontSize: generalTextSize+1,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 2,
    marginTop: 40,
    //backgroundColor: 'red', // #F0F6FA #E0EDF5
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 12,
  },
  signupText: {
    fontFamily: generalTextFont,
    fontSize: commentTextSize,
    color: withdrawnTitleColor,
  },
  signupLink: {
    fontFamily: generalTitleFont,
    fontSize: commentTextSize+0.5,
    fontWeight: '600',
    color: MainSecondaryBlueColor,
    marginLeft: 5,
  },
  createAccountButton: {
    width: 200,
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
});

export default SignupScreen;



