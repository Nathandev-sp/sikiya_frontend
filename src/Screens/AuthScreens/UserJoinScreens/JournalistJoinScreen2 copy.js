import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Switch, Alert, StatusBar, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppScreenBackgroundColor, { auth_Style, defaultButtonHitslop, generalActiveOpacity, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, generalTitleColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, withdrawnTitleColor, secCardBackgroundColor } from "../../../styles/GeneralAppStyle";
import { Ionicons } from "@expo/vector-icons";
import GoBackButton from "../../../../NavComponents/GoBackButton";
import * as ImagePicker from 'expo-image-picker';
import SikiyaAPI from "../../../../API/SikiyaAPI";
import SmallLoadingState from "../../../Components/LoadingComps/SmallLoadingState";

const JournalistJoinScreen2 = ({ navigation, route }) => {
  const { journalistInfo } = route.params;
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // Profile photo state
  const [profileImageKey, setProfileImageKey] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form input for all the data from this screen
  const [journalistInfo2, setJournalistInfo2] = useState({
    nickname: `${journalistInfo.firstName} ${journalistInfo.lastName}`,
    mediaCompany: '',
    affiliated: false,
    areaOfExpertise: '',
    description: '',
  });

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
      Alert.alert('Upload failed', 'Failed to upload profile image. Please try again.');
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
      "Add Profile Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
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
          text: "Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery permission is required to select a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
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
        { text: "Cancel", style: "cancel" }
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

  const handleNextJournalistJoin = () => {
    // Check for empty fields (only validate required fields)
    let newErrors = {};
    
    // Profile image is required
    if (!profileImageKey) {
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
      // Pass both journalistInfo, journalistInfo2, and the image key (for DB storage)
      navigation.navigate("JournalistTermConditions", { 
        journalistInfo: journalistInfo,
        journalistInfo2: journalistInfo2, 
        profileImageKey: profileImageKey
      });
    }
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
        >
          <View style={{ flex: 1 }}>
            {/* Header Section */}
            <View style={[styles.headerSection, { height: height * 0.2 }]}>
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
                  Tell us more about your journalism experience
                </Text>
              </View>
            </View>

            <View style={auth_Style.detailFormContainer}>
              {/* Profile Photo and Public Nickname Row */}
              <View style={[styles.profileRow, main_Style.genButtonElevation]}>
                <Text style={styles.profilePreviewText}>
                  This is how users will see you in the app
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
                        <SmallLoadingState />
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
                    <Text style={auth_Style.authLabel}>Public Nickname</Text>
                    <View style={[
                      auth_Style.authInputContainer,
                      error.nickname && auth_Style.inputErrorCont
                    ]}>
                      <Ionicons name="at-outline" style={auth_Style.authLogo}/>
                      <TextInput
                        style={auth_Style.input}
                        hitSlop={defaultButtonHitslop}
                        placeholder="Enter your nickname"
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
                <Text style={auth_Style.authLabel}>Are you affiliated to any media company?</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{journalistInfo2.affiliated ? "Yes" : "No"}</Text>
                  <Switch
                    value={journalistInfo2.affiliated}
                    onValueChange={(value) => handleFormChanges('affiliated', value)}
                    thumbColor={journalistInfo2.affiliated ? MainBrownSecondaryColor : "#ccc"}
                    trackColor={{ false: "#e0e0e0", true: "#d4c4b0" }}
                  />
                </View>
              </View>

              {/* Media Company */}
              <View style={auth_Style.authInputBundle}> 
                <Text style={auth_Style.authLabel}>Media Company Affiliation</Text>
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
                    placeholder={journalistInfo2.affiliated ? "Enter your media company" : "Independent Journalist"}
                    placeholderTextColor="#aaa"
                    value={journalistInfo2.affiliated ? journalistInfo2.mediaCompany : "Independent Journalist"}
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
    marginBottom: 0,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightBannerBackgroundColor,
    borderColor: MainBrownSecondaryColor,
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
  profileRow: {
    backgroundColor: secCardBackgroundColor,
    borderRadius: 12,
    padding: 16,
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
    overflow: 'hidden',
    marginBottom: 6,
  },
  profileImageLoading: {
    borderColor: '#ccc',
  },
  profileImageError: {
    borderColor: '#d32f2f',
    borderwidth: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2.5,
    borderWidth: 1.5,
    borderColor: MainSecondaryBlueColor,
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
    marginTop: 32,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});

export default JournalistJoinScreen2;
