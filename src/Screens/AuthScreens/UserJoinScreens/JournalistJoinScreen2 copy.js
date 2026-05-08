import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Switch, Alert, StatusBar, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, withdrawnTitleColor, secCardBackgroundColor, articleTitleFont, cardBackgroundColor } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import SikiyaAPI from "../../../../API/SikiyaAPI";
import SmallLoadingState from "../../../Components/LoadingComps/SmallLoadingState";
import { useLanguage } from "../../../Context/LanguageContext";
import VerticalSpacer from "../../../Components/UI/VerticalSpacer";
import MediumLoadingState from "../../../Components/LoadingComps/MediumLoadingState";

const JournalistJoinScreen2 = ({ navigation, route }) => {
  const {
    journalistInfo,
    journalistInfo2: journalistInfo2FromParams,
    profileImageKey: profileImageKeyFromParams,
    profileImageUrl: profileImageUrlFromParams,
    initialStep,
  } = route.params || {};
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const { t } = useLanguage();

  const [step, setStep] = useState(initialStep === 2 ? 2 : 1); // 1 | 2 (overall steps 3-4 of 4)

  // Profile photo state
  const [profileImageKey, setProfileImageKey] = useState(profileImageKeyFromParams || null);
  const [profileImageUrl, setProfileImageUrl] = useState(profileImageUrlFromParams || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form input for all the data from this screen
  const [journalistInfo2, setJournalistInfo2] = useState(
    journalistInfo2FromParams || {
      nickname: `${journalistInfo.firstName} ${journalistInfo.lastName}`,
      mediaCompany: '',
      affiliated: false,
      areaOfExpertise: '',
      description: '',
    }
  );

  // Sets error for highlight of missing information
  const [error, setError] = useState({});

  // Upload image to server
  const uploadImage = async (uri) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type,
      });

      const response = await SikiyaAPI.post('/user/profile/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileImageKey(response.data.imageKey);
      setProfileImageUrl(response.data.imageUrl);
      setError((prev) => ({ ...prev, profileImage: false }));
    } catch (error) {
      console.log('Image upload error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      Alert.alert(t('alerts.uploadFailed'), t('alerts.uploadFailedDescription'));
      setProfileImageUrl(null);
      setProfileImageKey(null);
    } finally {
      setUploadingImage(false);
    }
  };
  console.log("Profile Image URL:", profileImageUrl);

  // Pick image from gallery or camera
  const pickImage = async () => {
    Alert.alert(
      t('alerts.addProfilePhoto'),
      t('alerts.addProfilePhotoDescription'),
      [
        {
          text: t('alerts.camera'),
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('alerts.permissionNeeded'), t('alerts.cameraPermissionDescription '));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              console.log("Camera image URI:", result.assets[0].uri);
              uploadImage(result.assets[0].uri);
            }
          }
        },
        {
          text: t('alerts.gallery'),
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('alerts.permissionNeeded'), t('alerts.galleryPermissionDescription'));
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              console.log("Gallery image URI:", result.assets[0].uri);
              uploadImage(result.assets[0].uri);
            }
          }
        },
        { text: t('common.cancel'), style: "cancel" }
      ]
    );
  };

  // State for each input focus
  const [mediaCompanyFocused, setMediaCompanyFocused] = useState(false);
  const [areaOfExpertiseFocused, setAreaOfExpertiseFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const handleFormChanges = (key, value) => {
    if (key === 'affiliated') {
      setJournalistInfo2({ 
        ...journalistInfo2, 
        [key]: value,
        mediaCompany: value ? '' : 'Independent Journalist'
      });
    } else {
      setJournalistInfo2({ ...journalistInfo2, [key]: value });
    }
    if (value) setError((prev) => ({ ...prev, [key]: false }));
  };

  const goToStep = (nextStep) => {
    Keyboard.dismiss();
    setStep(nextStep);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 0);
  };

  const handleBack = () => {
    if (step === 2) {
      goToStep(1);
      return;
    }
    navigation.goBack();
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!journalistInfo2.areaOfExpertise) newErrors.areaOfExpertise = true;
    if (journalistInfo2.affiliated && !journalistInfo2.mediaCompany) newErrors.mediaCompany = true;

    setError((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!journalistInfo2.description) newErrors.description = true;

    setError((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      const ok = validateStep1();
      if (ok) goToStep(2);
      return;
    }

    const ok = validateStep2();
    if (!ok) return;

    navigation.navigate("JournalistTermConditions", { 
      journalistInfo: journalistInfo,
      journalistInfo2: journalistInfo2, 
      profileImageKey: profileImageKey,
      profileImageUrl: profileImageUrl,
    });
  };
  console.log("Profile Image Key:", profileImageKey);

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
            <View style={[styles.headerSection, { height: height * 0.32 }]}>
              <View style={[styles.logoContainer, main_Style.genButtonElevation]}>
                <View style={styles.backButtonWrapper}>
                  <TouchableOpacity
                    hitSlop={defaultButtonHitslop}
                    style={styles.transparentBackButton}
                    activeOpacity={generalActiveOpacity}
                    onPress={handleBack}
                  >
                    <Ionicons name="arrow-back" style={styles.backButtonIcon} />
                  </TouchableOpacity>
                </View>
                <Image 
                  source={require("../../../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
                  style={styles.companyLogo}
                />
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeSubtitle}>
                  {t('onboarding.journalistJoinMessage2')}
                </Text>
              </View>
            </View>

            <View style={auth_Style.detailFormContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Step {step + 2} of 4</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${((step + 2) / 4) * 100}%` }]} />
                  <View style={[styles.progressDot, { left: `${((step + 2) / 4) * 100}%` }]} />
                </View>
              </View>

              {step === 1 ? (
                <>
                  {/* Profile Photo and Public Nickname Row */}
                  <View style={[styles.profileRow, main_Style.genButtonElevation]}>
                    <Text style={styles.profilePreviewText}>
                      {t('onboarding.thisIsHowUsersWillSeeYouInTheApp')}
                    </Text>
                    <View style={styles.profileRowContent}>
                      <TouchableOpacity 
                        style={styles.profilePhotoSection}
                        onPress={pickImage}
                        activeOpacity={0.7}
                        disabled={uploadingImage}
                      >
                        <View style={[styles.profileImageWrapper, uploadingImage && styles.profileImageLoading]}>
                          {uploadingImage ? (
                            <View style={styles.loadingContainer}>
                              <MediumLoadingState />
                            </View>
                          ) : profileImageUrl ? (
                            <Image source={{ uri: profileImageUrl }} style={[
                              styles.profileImage,
                              error.profileImage && styles.profileImageError
                            ]} />
                          ) : (
                            <Image source={require('../../../../assets/functionalImages/ProfilePic.png')} style={[
                              styles.profileImage,
                              error.profileImage && styles.profileImageError
                            ]} />
                          )}
                        </View>
                        <View style={styles.cameraIconOverlay}>
                          <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.nicknameSection}>
                        <Text style={auth_Style.authLabel}>{t('profile.displayName')}</Text>
                        <View style={[
                          auth_Style.authInputContainer,
                          error.nickname && auth_Style.inputErrorCont
                        ]}>
                          <Ionicons name="at-outline" style={auth_Style.authLogo}/>
                          <TextInput
                            style={auth_Style.input}
                            hitSlop={defaultButtonHitslop}
                            placeholder={t('onboarding.displayNamePlaceholder')}
                            placeholderTextColor="#aaa"
                            value={journalistInfo2.nickname || ''}
                            onChangeText={(text) => handleFormChanges('nickname', text)}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Affiliation Question and Toggle */}
                  <View style={auth_Style.authInputBundle}>
                    <Text style={auth_Style.authLabel}>{t('onboarding.mediaAffiliation')}</Text>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>{journalistInfo2.affiliated ? t('common.yes') : t('common.no')}</Text>
                      <Switch
                        value={journalistInfo2.affiliated}
                        onValueChange={(value) => handleFormChanges('affiliated', value)}
                        thumbColor={journalistInfo2.affiliated ? MainBrownSecondaryColor : AppScreenBackgroundColor}
                        trackColor={{ false: "#e0e0e0", true: "#d4c4b0" }}
                      />
                    </View>
                  </View>

                  {/* Media Company */}
                  <View style={auth_Style.authInputBundle}> 
                    <Text style={auth_Style.authLabel}>{t('profile.mediaCompany')}</Text>
                    <View style={[
                      auth_Style.authInputContainer,
                      mediaCompanyFocused && auth_Style.authInputContainerFocused,
                      error.mediaCompany && auth_Style.inputErrorCont,
                      !journalistInfo2.affiliated && { opacity: 0.6 }
                    ]}>
                      <Ionicons name="business-outline" style={auth_Style.authLogo}/>
                      <TextInput
                        style={auth_Style.input}
                        hitSlop={defaultButtonHitslop}
                        placeholder={journalistInfo2.affiliated ? t('onboarding.mediaAffiliationPlaceholder') : t('onboarding.independentJournalist')}
                        placeholderTextColor="#aaa"
                        value={journalistInfo2.affiliated ? journalistInfo2.mediaCompany : t('onboarding.independentJournalist')}
                        onChangeText={(text) => handleFormChanges('mediaCompany', text)}
                        autoCapitalize="words"
                        onFocus={() => {
                          setMediaCompanyFocused(true);
                          scrollRef.current?.scrollTo({ y: 200, animated: true });
                        }}
                        onBlur={() => setMediaCompanyFocused(false)}
                        editable={journalistInfo2.affiliated}
                      />
                    </View>
                  </View>

                  {/* Area of Expertise - Always Enabled */}
                  <View style={auth_Style.authInputBundle}> 
                    <Text style={auth_Style.authLabel}>{t('profile.areaOfExpertise')}</Text>
                    <View style={[
                      auth_Style.authInputContainer,
                      areaOfExpertiseFocused && auth_Style.authInputContainerFocused,
                      error.areaOfExpertise && auth_Style.inputErrorCont
                    ]}>
                      <Ionicons name="bulb-outline" style={auth_Style.authLogo}/>
                      <TextInput
                        style={auth_Style.input}
                        hitSlop={defaultButtonHitslop}
                        placeholder={t('onboarding.areaOfExpertisePlaceholder')}
                        placeholderTextColor="#aaa"
                        value={journalistInfo2.areaOfExpertise}
                        onChangeText={(text) => handleFormChanges('areaOfExpertise', text)}
                        autoCapitalize="words"
                        onFocus={() => {
                          setAreaOfExpertiseFocused(true);
                          scrollRef.current?.scrollTo({ y: 300, animated: true });
                        }}
                        onBlur={() => setAreaOfExpertiseFocused(false)}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Description (Bio) */}
                  <View style={auth_Style.authInputBundle}>
                    <Text style={auth_Style.authLabel}>{t('onboarding.description')}</Text>
                    <View style={[
                      auth_Style.authInputContainer,
                      descriptionFocused && auth_Style.authInputContainerFocused,
                      error.description && auth_Style.inputErrorCont,
                      { minHeight: 100 }
                    ]}>
                      <Ionicons name="document-text-outline" style={[auth_Style.authLogo, { alignSelf: 'flex-start', marginTop: 8 }]}/>
                      <TextInput
                        style={[auth_Style.input, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                        hitSlop={defaultButtonHitslop}
                        placeholder={t('onboarding.descriptionPlaceholder')}
                        placeholderTextColor="#aaa"
                        value={journalistInfo2.description}
                        onChangeText={(text) => handleFormChanges('description', text)}
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
                </>
              )}

              {/* Continue Button */}
              <TouchableOpacity
                hitSlop={defaultButtonHitslop}
                style={[auth_Style.authButtonStyle, styles.continueButton]}
                activeOpacity={generalActiveOpacity}
                onPress={handleContinue}
              >
                <Text style={auth_Style.authButtonText}>{t('common.continue')}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <VerticalSpacer height={24} />
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
    //backgroundColor: 'red',
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
    color: MainBrownSecondaryColor,
  },
  companyLogo: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    //marginVertical: 12,
    //flex: 0.3,
    justifyContent: 'center',
    //backgroundColor: 'red',
  },
  welcomeSubtitle: {
    fontFamily: articleTitleFont,
    fontSize: generalTextSize+3,
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  progressHeader: {
    marginBottom: 14,
    alignItems: "center",
  },
  progressLabel: {
    fontFamily: generalTextFont,
    fontSize: 12,
    color: withdrawnTitleColor,
    marginBottom: 8,
    textAlign: "center",
  },
  progressTrack: {
    width: "35%",
    minWidth: 140,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "visible",
    position: "relative",
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: MainSecondaryBlueColor,
  },
  progressDot: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: MainSecondaryBlueColor,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -7 }],
  },
  profileRow: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 16,
    
  },
  profilePreviewText: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  profileRowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  profileImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: AppScreenBackgroundColor,
  },
  loadingContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageLoading: {
    //borderWidth: 1.2,
    borderColor: '#ccc',
  },
  profileImageError: {
    borderColor: '#d32f2f',
    borderwidth: 1.2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    //padding: 2.5,
    //borderWidth: 1.2,
    borderColor: MainBrownSecondaryColor,
    backgroundColor: AppScreenBackgroundColor,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: MainSecondaryBlueColor,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePhotoText: {
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    fontSize: generalTextSize - 3,
  },
  nicknameSection: {
    flex: 1,
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 4,
    marginVertical: 6,
    paddingVertical: 0,
  },
  toggleLabel: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: generalTitleColor,
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});

export default JournalistJoinScreen2;
