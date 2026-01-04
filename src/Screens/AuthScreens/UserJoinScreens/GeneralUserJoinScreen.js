import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, bannerBackgroundColor, cardBackgroundColor, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, withdrawnTitleColor } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from 'react-native-picker-select';
import { set } from "mongoose";
import CountryPicker from "../../../Components/CountryPicker";
import CountryCodePicker from "../../../Components/CountryCodePicker";
import CityPicker from "../../../Components/CityPicker";
import AfricanCountries from "../../../../assets/Data/AfricanCountries.json";
import AllCountries from "../../../../assets/Data/AllCountries.json";
import DatePickerModal from "../../../Components/DOBPicker";
import GoBackButton from "../../../../NavComponents/GoBackButton";
import VerticalSpacer from "../../../Components/UI/VerticalSpacer";


const GeneralUserJoinScreen = ({ navigation }) => {
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // Form input for all the data
  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phoneCountryCode: null,
    phoneNumber: "",
    city: "",
    country: "",
    countryOfInterest: "",
  });

  // sets error for highlight of missing information
  const [error, setError] = useState({});

  // State for each input
  //const [firstName, setFirstName] = useState("");
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  //const [lastName, setLastName] = useState("");
  const [lastNameFocused, setLastNameFocused] = useState(false);
  //const [dob, setDob] = useState("");
  const [dobFocused, setDobFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  //const [city, setCity] = useState("");
  const [cityFocused, setCityFocused] = useState(false);
  //const [country, setCountry] = useState("");
  const [countryFocused, setCountryFocused] = useState(false);
  //const [countryOfInterest, setCountryOfInterest] = useState('');
  const [countryOfInterestFocused, setCountryOfInterestFocused] = useState(false);

  const handleFormChanges = (key, value) => {
    setUserFormData({ ...userFormData, [key]: value });
    if (value) setError((prev) => ({ ...prev, [key]: false }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters for validation
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // Phone number should be between 7 and 15 digits (international standard)
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const handleSubmit = () => {
    // Check for empty fields
    let newErrors = {};
    
    // Check required fields
    if (!userFormData.firstName) newErrors.firstName = true;
    if (!userFormData.lastName) newErrors.lastName = true;
    if (!userFormData.dob) newErrors.dob = true;
    if (!userFormData.phoneCountryCode) newErrors.phoneCountryCode = true;
    if (!userFormData.phoneNumber) {
      newErrors.phoneNumber = true;
    } else if (!validatePhoneNumber(userFormData.phoneNumber)) {
      newErrors.phoneNumber = true;
    }
    if (!userFormData.city) newErrors.city = true;
    if (!userFormData.country) newErrors.country = true;
    if (!userFormData.countryOfInterest) newErrors.countryOfInterest = true;
    
    setError(newErrors);

    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      // All fields are filled, proceed (e.g., navigate or submit)
      navigation.navigate('TermsaCont', { userInfo: userFormData });
    }
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
            {/* Header Section - Smaller than ForgotPasswordScreen */}
            <View style={[styles.headerSection, { height: height * 0.20 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <View style={styles.backButtonWrapper}>
                  <GoBackButton 
                    buttonStyle={styles.transparentBackButton}
                    iconStyle={styles.backButtonIcon}
                  />
                </View>
                <Image 
                  source={require("../../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>
                
                <Text style={styles.welcomeSubtitle}>
                  Complete your profile to get started with Sikiya
                </Text>
              </View>
            </View>

            <View style={auth_Style.detailFormContainer}>
              {/* First Name */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>First Name</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  firstNameFocused && auth_Style.authInputContainerFocused,
                  error.firstName && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="person-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your first name"
                    value={userFormData.firstName}
                    onChangeText={text => handleFormChanges('firstName', text)}
                    autoCapitalize="words"
                    onFocus={() => {
                      setFirstNameFocused(true);
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    onBlur={() => setFirstNameFocused(false)}
                  />
                </View>
              </View>
              {/* Last Name */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>Last Name</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  lastNameFocused && auth_Style.authInputContainerFocused,
                  error.lastName && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="person-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your last name"
                    value={userFormData.lastName}
                    onChangeText={text => handleFormChanges('lastName', text)}
                    autoCapitalize="words"
                    onFocus={() => {
                      setLastNameFocused(true);
                      scrollRef.current?.scrollTo({ y: 60, animated: true });
                    }}
                    onBlur={() => setLastNameFocused(false)}
                  />
                </View>
              </View>
              {/* Date of Birth */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Date of Birth</Text>
                <DatePickerModal
                  value={userFormData.dob}
                  onSelect={date => handleFormChanges('dob', date)}
                  error={error.dob}
                  label="Date of Birth"
                />
              </View>
              {/* WhatsApp Phone Number */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>WhatsApp Phone Number</Text>
                <View style={styles.phoneContainer}>
                  <View style={styles.countryCodeContainer}>
                    <CountryCodePicker
                      value={userFormData.phoneCountryCode}
                      onSelect={code => handleFormChanges('phoneCountryCode', code)}
                      error={error.phoneCountryCode}
                      placeholder="Code"
                    />
                  </View>
                  <View style={[
                    auth_Style.authInputContainer,
                    phoneNumberFocused && auth_Style.authInputContainerFocused,
                    error.phoneNumber && auth_Style.inputErrorCont,
                    styles.phoneNumberContainer
                  ]}>
                    <Ionicons name="call-outline" style={auth_Style.authLogo}/>
                    <TextInput
                      style={auth_Style.input}
                      hitSlop={defaultButtonHitslop}
                      placeholder="Phone number"
                      value={userFormData.phoneNumber}
                      onChangeText={text => {
                        // Only allow digits
                        const digitsOnly = text.replace(/\D/g, '');
                        handleFormChanges('phoneNumber', digitsOnly);
                      }}
                      keyboardType="phone-pad"
                      maxLength={15}
                      onFocus={() => {
                        setPhoneNumberFocused(true);
                        scrollRef.current?.scrollTo({ y: 240, animated: true });
                      }}
                      onBlur={() => setPhoneNumberFocused(false)}
                    />
                  </View>
                </View>
                {error.phoneNumber && userFormData.phoneNumber && !validatePhoneNumber(userFormData.phoneNumber) && (
                  <Text style={styles.errorText}>Phone number must be between 7 and 15 digits</Text>
                )}
              </View>
              {/* Country of residence */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Country of residence</Text>
                <CountryPicker
                  value={userFormData.country}
                  onSelect={country => {
                    handleFormChanges('country', country);
                    // Clear city when country changes
                    if (userFormData.city) {
                      handleFormChanges('city', '');
                    }
                  }}
                  countryList={AllCountries}
                  error={error.country}
                  label="Country of residence"
                />
              </View>
              {/* City of residence */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>City of residence</Text>
                <CityPicker
                  value={userFormData.city}
                  onSelect={city => handleFormChanges('city', city)}
                  selectedCountry={userFormData.country}
                  error={error.city}
                  label="City of residence"
                  placeholder="Select your city"
                />
              </View>
              {/* African Country of Interest */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>African Country of Interest</Text>
                <CountryPicker
                  value={userFormData.countryOfInterest}
                  onSelect={country => handleFormChanges('countryOfInterest', country)}
                  countryList={AfricanCountries} // <-- pass the African list here
                  error={error.countryOfInterest}
                  label="African Country of Interest"
                />
              </View>
              {/* Continue Button */}
              <TouchableOpacity
                hitSlop={defaultButtonHitslop}
                style={[auth_Style.authButtonStyle, styles.continueButton]}
                activeOpacity={generalActiveOpacity}
                onPress={handleSubmit}
              >
                <Text style={auth_Style.authButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <VerticalSpacer height={40} />
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
    marginBottom: 12,
    //backgroundColor: 'red',
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
    maxHeight: '65%',
    position: 'relative',
  },
  backButtonWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  transparentBackButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    position: 'relative',
    left: 0,
    top: 0,
  },
  backButtonIcon: {
    fontSize: 28,
  },
  companyLogo: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    flex: 0.3,
    justifyContent: 'center',
    paddingTop: 8,
    //backgroundColor: 'red',
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 6,
    fontWeight: '700',
    color: generalTitleColor,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 12,
  },
  welcomeSubtitle: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeContainer: {
    flex: 0.32,
  },
  phoneNumberContainer: {
    flex: 0.68,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: generalTextFont,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default GeneralUserJoinScreen;



