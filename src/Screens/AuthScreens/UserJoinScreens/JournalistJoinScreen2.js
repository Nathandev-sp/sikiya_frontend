import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Switch, ActivityIndicator, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import AppScreenBackgroundColor, { auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, withdrawnTitleColor } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import GoBackButton from "../../../../NavComponents/GoBackButton";
import SikiyaAPI from "../../../../API/SikiyaAPI";

const JournalistJoinScreen2 = ({ navigation, route }) => {
  const { journalistInfo } = route.params;
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // Form input for all the data from this screen
  const [journalistInfo2, setJournalistInfo2] = useState({
    mediaCompany: '',
    affiliated: false,
    areaOfExpertise: '',
    description: '',
  });

  // Sets error for highlight of missing information
  const [error, setError] = useState({});

  // State for each input focus
  const [mediaCompanyFocused, setMediaCompanyFocused] = useState(false);
  const [areaOfExpertiseFocused, setAreaOfExpertiseFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFormChanges = (key, value) => {
    setJournalistInfo2({ ...journalistInfo2, [key]: value });
    if (value) setError((prev) => ({ ...prev, [key]: false }));
  };

  const pickAndUploadImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile photo.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploadingImage(true);

      // Create form data
      const formData = new FormData();
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profileImage', {
        uri,
        name: filename,
        type,
      });

      // Upload to server
      const response = await SikiyaAPI.post('/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileImage(response.data.imageUrl);
      setError((prev) => ({ ...prev, profileImage: false }));
    } catch (error) {
      console.log('Image upload error:', error);
      Alert.alert('Upload failed', 'Failed to upload profile image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNextJournalistJoin = () => {
    // Check for empty fields (only validate required fields)
    let newErrors = {};
    
    // Profile image is required
    if (!profileImage) {
      newErrors.profileImage = true;
    }
    
    // Area of expertise is always required
    if (!journalistInfo2.areaOfExpertise) {
      newErrors.areaOfExpertise = true;
    }
    
    // Description is required
    if (!journalistInfo2.description) {
      newErrors.description = true;
    }
    
    // Media company is only required if affiliated is true
    if (journalistInfo2.affiliated && !journalistInfo2.mediaCompany) {
      newErrors.mediaCompany = true;
    }
    
    setError(newErrors);

    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      // Pass both journalistInfo, journalistInfo2, and profileImage
      navigation.navigate("JournalistTermConditions", { 
        journalistInfo: journalistInfo,
        journalistInfo2: journalistInfo2,
        profileImage: profileImage
      });
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
        >
          <View style={{ flex: 1 }}>
            {/* Header Section */}
            <View style={[styles.headerSection, { height: height * 0.25 }]}>
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
                <Text style={styles.welcomeTitle}>Professional Details</Text>
                <Text style={styles.welcomeSubtitle}>
                  Tell us more about your journalism experience
                </Text>
              </View>
            </View>

            <View style={auth_Style.detailFormContainer}>
              {/* Profile Photo */}
              <TouchableOpacity 
                style={styles.profilePhotoContainer}
                onPress={pickAndUploadImage}
                disabled={uploadingImage}
                activeOpacity={generalActiveOpacity}
              >
                <View style={[
                  styles.profilePhotoCircle,
                  error.profileImage && styles.profilePhotoError
                ]}>
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <Ionicons name="camera-outline" size={36} color="#fff" />
                  )}
                </View>
                <Text style={[styles.profilePhotoText, error.profileImage && { color: '#d32f2f' }]}>
                  {profileImage ? "Change Profile Photo" : "Add Profile Photo *"}
                </Text>
              </TouchableOpacity>

              {/* Affiliation Question and Toggle */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Are you affiliated to any media company?</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{journalistInfo2.affiliated ? "Yes" : "No"}</Text>
                  <Switch
                    value={journalistInfo2.affiliated}
                    onValueChange={(value) => handleFormChanges('affiliated', value)}
                    thumbColor={journalistInfo2.affiliated ? MainBrownSecondaryColor : "#ccc"}
                    trackColor={{ false: "#ccc", true: "#bfae99" }}
                  />
                </View>
              </View>

              {/* Media Company */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>Media Company</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  mediaCompanyFocused && auth_Style.authInputContainerFocused,
                  error.mediaCompany && auth_Style.inputErrorCont,
                  !journalistInfo2.affiliated && { backgroundColor: "#eee", opacity: 0.6 }
                ]}>
                  <Ionicons name="business-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="Enter your media company"
                    placeholderTextColor="#aaa"
                    value={journalistInfo2.mediaCompany}
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
                <Text style={auth_Style.authLabel}>Area of Expertise</Text>
                <View style={[
                  auth_Style.authInputContainer,
                  areaOfExpertiseFocused && auth_Style.authInputContainerFocused,
                  error.areaOfExpertise && auth_Style.inputErrorCont
                ]}>
                  <Ionicons name="bulb-outline" style={auth_Style.authLogo}/>
                  <TextInput
                    style={auth_Style.input}
                    hitSlop={defaultButtonHitslop}
                    placeholder="e.g., Politics, Sports, Technology"
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

              {/* Description */}
              <View style={auth_Style.authInputBundle}>
                <Text style={auth_Style.authLabel}>Description</Text>
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
                    placeholder="Tell us about yourself and your experience"
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
    maxHeight: '60%',
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
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    flex: 0.4,
    justifyContent: 'center',
    paddingTop: 8,
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
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  profilePhotoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MainBrownSecondaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: 'hidden',
  },
  profilePhotoError: {
    borderWidth: 2,
    borderColor: '#d32f2f',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePhotoText: {
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    fontSize: generalTextSize - 1,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 4,
    marginVertical: 8,
    paddingVertical: 8,
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
    marginTop: 32,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});

export default JournalistJoinScreen2;
