import React, { useState, useRef, useContext } from "react"; // Add useRef import
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, ScrollView, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, withdrawnTitleColor } from "../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import { Context as AuthContext } from "../../Context/AuthContext"; // Import AuthContext if needed
import LottieLoad from "../../Helpers/LottieLoad";

const SignupScreen = ({navigation}) => {
  // Signup context and info -----------------------------
  const { state, signup, clearErrorMessage } = useContext(AuthContext); // Use AuthContext to access state and signup function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
            <View style={[styles.headerSection, { height: height * 0.35 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <Image 
                  source={require("../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
                
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>Welcome</Text>
                  <Text style={styles.welcomeParagraph}>
                    Join Sikiya and be part of Africa's conversation. Create your account to get started!
                  </Text>
                </View>
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
            <Text style={auth_Style.authLabel}>Confirm password</Text>
            <View style={[
              auth_Style.authInputContainer,
              confirmPasswordFocused && auth_Style.authInputContainerFocused
            ]}>
              <Ionicons name="lock-closed-outline" style={auth_Style.authLogo}/>
              <TextInput
                style={auth_Style.input}
                hitSlop={defaultButtonHitslop}
                placeholder="Password"
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
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Already have an account?</Text>
            <TouchableOpacity onPress={goToLoginScreen} activeOpacity={generalActiveOpacity} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.signupLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {state.errorMessage ? <View style={{ marginTop: 10, alignItems: 'center' }}>
             <Text style={styles.errorMessage}>{state.errorMessage}</Text>
          </View>: null}

          <TouchableOpacity style={[auth_Style.authButtonStyle, styles.createAccountButton]} onPress={goToEmailConfirmationScreen}>
            {loading ? (<LottieLoad />) : (<Text style={auth_Style.authButtonText}>Create an Account</Text>)}
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightBannerBackgroundColor,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    width: '92%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    maxHeight: '100%',
  },
  companyLogo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginRight: 16,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 6,
    fontWeight: '700',
    color: generalTitleColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeParagraph: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 20,
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



