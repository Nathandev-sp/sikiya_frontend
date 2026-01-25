import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, withdrawnTitleColor, articleTitleFont } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import CountryPicker from "../../../Components/CountryPicker";
import CityPicker from "../../../Components/CityPicker";
import CountryCodePicker from "../../../Components/CountryCodePicker";
import AfricanCountries from "../../../../assets/Data/AfricanCountries.json";
import AllCountries from "../../../../assets/Data/AllCountries.json";
import DatePickerModal from "../../../Components/DOBPicker";
import GoBackButton from "../../../../NavComponents/GoBackButton";
import VerticalSpacer from "../../../Components/UI/VerticalSpacer";
import { useLanguage } from "../../../Context/LanguageContext";

const JournalistJoinScreen1 = ({ navigation }) => {
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const phoneNumberInputRef = useRef(null);
  const { t } = useLanguage();

  // Form input for all the data
  const [journalistFormData, setJournalistFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phoneCountryCode: null,
    phoneNumber: "",
    city: "",
    country: "",
    countryOfInterest: "",
  });

  // Sets error for highlight of missing information
  const [error, setError] = useState({});

  // State for each input focus
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);

  // Function to dismiss keyboard and blur all inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    firstNameInputRef.current?.blur();
    lastNameInputRef.current?.blur();
    phoneNumberInputRef.current?.blur();
  };

  const handleFormChanges = (key, value) => {
    setJournalistFormData({ ...journalistFormData, [key]: value });
    if (value) setError((prev) => ({ ...prev, [key]: false }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters for validation
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // Phone number should be between 7 and 15 digits (international standard)
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const handleNextJournalistJoin = () => {
    // Check for empty fields
    let newErrors = {};
    
    // Check required fields
    if (!journalistFormData.firstName) newErrors.firstName = true;
    if (!journalistFormData.lastName) newErrors.lastName = true;
    if (!journalistFormData.dob) newErrors.dob = true;
    if (!journalistFormData.phoneCountryCode) newErrors.phoneCountryCode = true;
    if (!journalistFormData.phoneNumber) {
      newErrors.phoneNumber = true;
    } else if (!validatePhoneNumber(journalistFormData.phoneNumber)) {
      newErrors.phoneNumber = true;
    }
    if (!journalistFormData.city) newErrors.city = true;
    if (!journalistFormData.country) newErrors.country = true;
    if (!journalistFormData.countryOfInterest) newErrors.countryOfInterest = true;
    
    setError(newErrors);

    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      // All fields are filled, proceed to next screen
      navigation.navigate("JournalistJoin2", { journalistInfo: journalistFormData });
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
            {/* Header Section */}
            <View style={[styles.headerSection, { height: height * 0.35 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <View style={styles.backButtonWrapper}>
                  <GoBackButton 
                    buttonStyle={styles.transparentBackButton}
                    iconStyle={styles.backButtonIcon}
                  />
                </View>
                <Image 
                  source={require("../../../../assets/SikiyaLogoV2/NathanApprovedSikiyaPreloadingLogo.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>

                <Text style={styles.welcomeSubtitle}>
                  {t('onboarding.journalistJoinMessage')}
                </Text>
              </View>
            </View>

            <View style={auth_Style.detailFormContainer}>
              {/* First Name */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>{t('profile.firstName')}</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  firstNameFocused && auth_Style.authInputContainerFocused,
                  error.firstName && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="person-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    ref={firstNameInputRef}
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder={t('profile.firstNamePlaceholder')}
                    placeholderTextColor="#aaa"
                    value={journalistFormData.firstName}
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
                <Text style={auth_Style.authLabel}>{t('profile.lastName')}</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  lastNameFocused && auth_Style.authInputContainerFocused,
                  error.lastName && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="person-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    ref={lastNameInputRef}
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder={t('profile.lastNamePlaceholder')}
                    placeholderTextColor="#aaa"
                    value={journalistFormData.lastName}
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
                <Text style={auth_Style.authLabel}>{t('profile.dateOfBirth')}</Text>
                <DatePickerModal
                  value={journalistFormData.dob}
                  onSelect={date => handleFormChanges('dob', date)}
                  error={error.dob}
                  label={t('profile.dateOfBirth')}
                  placeholder={t('profile.dateOfBirthPlaceholder')}
                  onOpen={dismissKeyboard}
                />
              </View>

              {/* WhatsApp Phone Number */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>{t('profile.whatsAppPhoneNumber')}</Text>
                <View style={styles.phoneContainer}>
                  <View style={styles.countryCodeContainer}>
                    <CountryCodePicker
                      value={journalistFormData.phoneCountryCode}
                      onSelect={code => handleFormChanges('phoneCountryCode', code)}
                      error={error.phoneCountryCode}
                      placeholder="Code"
                      onOpen={dismissKeyboard}
                      label={t('profile.countryCode')}
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
                      ref={phoneNumberInputRef}
                      style={auth_Style.input}
                      hitSlop={defaultButtonHitslop}
                      placeholder={t('profile.whatsAppPhoneNumberPlaceholder')}
                      placeholderTextColor="#aaa"
                      value={journalistFormData.phoneNumber}
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
                {error.phoneNumber && journalistFormData.phoneNumber && !validatePhoneNumber(journalistFormData.phoneNumber) && (
                  <Text style={styles.errorText}>{t('profile.phoneNumberError')}</Text>
                )}
              </View>

              {/* Country */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>{t('profile.countryOfResidence')}</Text>
                <CountryPicker
                  value={journalistFormData.country}
                  onSelect={country => {
                    handleFormChanges('country', country);
                    // Clear city when country changes
                    if (journalistFormData.city) {
                      handleFormChanges('city', '');
                    }
                  }}
                  countryList={AllCountries}
                  error={error.country}
                  label={t('profile.countryOfResidence')}
                  placeholder={t('profile.countryOfResidencePlaceholder')}
                  onOpen={dismissKeyboard}
                />
              </View>

              {/* City */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>{t('profile.cityOfResidence')}</Text>
                <CityPicker
                  value={journalistFormData.city}
                  onSelect={city => handleFormChanges('city', city)}
                  selectedCountry={journalistFormData.country}
                  error={error.city}
                  label={t('profile.cityOfResidence')}
                  placeholder={t('profile.cityOfResidencePlaceholder')}
                  onOpen={dismissKeyboard}
                />
              </View>

              {/* African Country of Interest */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>{t('profile.interestedCountry')}</Text>
                <CountryPicker
                  value={journalistFormData.countryOfInterest}
                  onSelect={country => handleFormChanges('countryOfInterest', country)}
                  countryList={AfricanCountries}
                  error={error.countryOfInterest}
                  label={t('profile.interestedCountry')}
                  placeholder={t('profile.africanCountryOfInterestPlaceholder')}
                  onOpen={dismissKeyboard}
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                hitSlop={defaultButtonHitslop}
                style={[auth_Style.authButtonStyle, styles.continueButton]}
                activeOpacity={generalActiveOpacity}
                onPress={handleNextJournalistJoin}
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
    paddingTop: 0,
    marginBottom: 12,
    //backgroundColor: 'red',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MainBrownSecondaryColor,
    borderColor: MainBrownSecondaryColor,
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
    color: '#FFF'
  },
  companyLogo: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    //flex: 0.4,
    justifyContent: 'center',
    paddingTop: 24,
  },
  welcomeSubtitle: {
    fontFamily: articleTitleFont,
    fontSize: generalTextSize+1,
    color: withdrawnTitleColor,
    textAlign: 'center',
    lineHeight: 22,
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
    flex: 0.34,
  },
  phoneNumberContainer: {
    flex: 0.66,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: generalTextFont,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default JournalistJoinScreen1;
