import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, cardBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, withdrawnTitleColor } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";

const PremiumUserJoinScreen = ({ navigation }) => {
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // State for each input
  const [profession, setProfession] = useState('');
  const [professionFocused, setProfessionFocused] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [expertiseFocused, setExpertiseFocused] = useState(false);
  const [description, setDescription] = useState("");
  const [descriptionFocused, setDescriptionFocused] = useState(false);

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
            <View style={[styles.logoContainer, auth_Style.authElevation]}>
              <Image 
                source={require("../../../../assets/Sikiya_Logo/Sikiya_Auth_logo_2.0.png")}
                style={styles.comapnyLogo}
              />
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Premium User Profile</Text>
              </View>
            </View>

            <View style={[auth_Style.formContainer, { justifyContent: 'center' }]}>
              {/* Profile Photo Placeholder */}
              <View style={styles.profilePhotoContainer}>
                <View style={styles.profilePhotoCircle}>
                  <Ionicons name="camera-outline" size={36} color="#fff" />
                </View>
                <Text style={styles.profilePhotoText}>Add Profile Photo</Text>
              </View>
              {/* Profession */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Profession</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  professionFocused && auth_Style.authInputContainerFocused
                ]}>
                  <Ionicons name="briefcase-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your profession"
                    placeholderTextColor="#aaa"
                    value={profession}
                    onChangeText={setProfession}
                    autoCapitalize="words"
                    onFocus={() => {
                      setProfessionFocused(true);
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }}
                    onBlur={() => setProfessionFocused(false)}
                  />
                </View>
              </View>
              {/* Area of Expertise */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Area of Expertise</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  expertiseFocused && auth_Style.authInputContainerFocused
                ]}>
                  <Ionicons name="star-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your area of expertise"
                    placeholderTextColor="#aaa"
                    value={expertise}
                    onChangeText={setExpertise}
                    autoCapitalize="words"
                    onFocus={() => {
                      setExpertiseFocused(true);
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }}
                    onBlur={() => setExpertiseFocused(false)}
                  />
                </View>
              </View>
              {/* Description */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Description</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  descriptionFocused && auth_Style.authInputContainerFocused
                ]}>
                  <Ionicons name="document-text-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={[auth_Style.input, { height: 80, textAlignVertical: 'top' }]}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    onFocus={() => {
                      setDescriptionFocused(true);
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }}
                    onBlur={() => setDescriptionFocused(false)}
                  />
                </View>
              </View>
            </View>
            {/* Continue Button */}
            <TouchableOpacity
              hitSlop={defaultButtonHitslop}
              style={[auth_Style.authButtonStyle, styles.loginButton, { marginTop: 32, marginBottom: 24 }]}
              onPress={() => {
                // Handle continue action here
              }}
            >
              <Text style={auth_Style.authButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: bannerBackgroundColor,
    margin: 8,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
  },
  comapnyLogo: {
    marginTop: 10,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    width: '60%',
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: 22,
    fontWeight: 'bold',
    color: MainBrownSecondaryColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  profilePhotoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePhotoText: {
    color: "#444",
    fontSize: 14,
    marginBottom: 8,
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'center',
  },
  loginButton: {
    alignSelf: 'center',
    width: '80%',
  },
});

export default PremiumUserJoinScreen;