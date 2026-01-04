import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, main_Style, MainBrownSecondaryColor, generalTextFont, secCardBackgroundColor, cardBackgroundColor, withdrawnTitleColor, generalTextColor, largeTextSize, generalTextFontWeight, generalTitleFontWeight, generalTextSize, generalSmallTextSize, articleTextSize, auth_Style} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import CountryPicker from '../../Components/CountryPicker';
import CityPicker from '../../Components/CityPicker';
import VideoGroupPicker from '../../Components/VideoGroupPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import SikiyaAPI from '../../../API/SikiyaAPI';

const NewVideoTitleScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  
  // Form data state
  const [videoData, setVideoData] = useState({
    videoTitle: '',
    country: '',
    city: '',
    videoGroup: '',
  });

  // Focus states for inputs
  const [titleFocused, setTitleFocused] = useState(false);

  // Error states for validation
  const [errors, setErrors] = useState({});

  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form data changes
  const handleFormChange = (key, value) => {
    setVideoData({ ...videoData, [key]: value });
    // Clear error when field is filled
    if (value) {
      setErrors(prev => ({ ...prev, [key]: false }));
    }
    // Clear city when country changes
    if (key === 'country') {
      setVideoData(prev => ({ ...prev, city: '' }));
    }
  };

  // Handle video submission
  const handleSubmitVideo = async () => {
    // Validate required fields
    const requiredFields = {
      videoTitle: videoData.videoTitle,
      country: videoData.country,
      city: videoData.city,
      videoGroup: videoData.videoGroup,
    };

    const newErrors = {};
    Object.keys(requiredFields).forEach(key => {
      if (!requiredFields[key]) {
        newErrors[key] = true;
      }
    });

    setErrors(newErrors);

    // If there are errors, scroll to first error
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Prepare API payload
      const payload = {
        video_title: videoData.videoTitle,
        concerned_country: videoData.country,
        concerned_city: videoData.city,
        video_group: videoData.videoGroup,
      };

      // Call API to create video
      const response = await SikiyaAPI.post('/video/new', payload);

      // Get video ID and title from response
      const videoId = response.data._id;
      const videoTitle = response.data.video_title;

      // Navigate to next screen with video ID and title
      if (navigation) {
        navigation.navigate('NewVideo', { 
          videoId,
          videoTitle,
          videoData // Keep original data for reference if needed
        });
      }
    } catch (error) {
      console.error('Error creating video:', error);
      setIsSubmitting(false);
      
      // Show error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create video. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <BigLoaderAnim />
          <Text style={styles.loadingText}>Creating video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={main_Style.safeArea} edges={['top']}>
      <StatusBar barStyle={"dark-content"} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Back Button and Image */}
          <View style={styles.headerContainer}>
            <View style={{position: 'absolute', top: -45, left: 10, zIndex: 10}}>
                  <GoBackButton />
            </View>
            <Image 
              source={require('../../../assets/functionalImages/video.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.placeholder} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>New Video</Text>
          </View>

          {/* Video Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Video Title</Text>
            <TextInput
              style={[
                styles.titleInput,
                titleFocused && styles.inputFocused,
                errors.videoTitle && styles.inputError
              ]}
              placeholder="Enter video title"
              placeholderTextColor={withdrawnTitleColor}
              value={videoData.videoTitle}
              onChangeText={(text) => handleFormChange('videoTitle', text)}
              onFocus={() => {
                setTitleFocused(true);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              onBlur={() => setTitleFocused(false)}
            />
          </View>

          {/* Country Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Country</Text>
            <CountryPicker
              value={videoData.country}
              onSelect={(country) => handleFormChange('country', country)}
              countryList={AfricanCountries}
              placeholder="Select country"
              label="Country"
              error={errors.country}
            />
          </View>

          {/* City Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>City</Text>
            <CityPicker
              value={videoData.city}
              onSelect={(city) => handleFormChange('city', city)}
              selectedCountry={videoData.country}
              placeholder="Select city"
              label="City"
              error={errors.city}
            />
          </View>

          {/* Video Group Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Video Category</Text>
            <VideoGroupPicker
              value={videoData.videoGroup}
              onSelect={(group) => handleFormChange('videoGroup', group)}
              placeholder="Select video category"
              label="Video Category"
              error={errors.videoGroup}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.submitButton, main_Style.genButtonElevation]}
            activeOpacity={0.7}
            onPress={handleSubmitVideo}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerLogo: {
    width: 80,
    height: 80,
  },
  placeholder: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: largeTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    marginBottom: 4,
  },
  titleInput: {
    backgroundColor: secCardBackgroundColor,
    borderRadius: 8,
    padding: 12,
    fontSize: articleTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputFocused: {
    borderColor: '#2BA1E6',
    borderWidth: 1.5,
    backgroundColor: '#F0F6FA',
  },
  inputError: {
    borderColor: '#F4796B',
    borderWidth: 1.5,
  },
  submitButton: {
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
  bottomSpacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppScreenBackgroundColor,
  },
  loadingText: {
    marginTop: 20,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
});

export default NewVideoTitleScreen;

