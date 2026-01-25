import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, StatusBar, KeyboardAvoidingView, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, main_Style, MainBrownSecondaryColor, generalTextFont, secCardBackgroundColor, cardBackgroundColor, withdrawnTitleColor, generalTextColor, generalTitleSize, generalTitleFontWeight, generalSmallTextSize, articleTextSize, largeTextSize, generalTextSize, lightBannerBackgroundColor, commentTextSize} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';

const NewShortVideoScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { videoId, videoTitle, videoData } = route.params || {};
  const scrollRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [proofText, setProofText] = useState('');

  // Image/video keys from S3 uploads
  const [videoKey, setVideoKey] = useState(null);
  const [proofImageKey, setProofImageKey] = useState(null);

  // Uploading states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Focus states for inputs
  const [proofTextFocused, setProofTextFocused] = useState(false);

  // Error states for validation
  const [errors, setErrors] = useState({});

  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Upload video to S3
  const uploadVideoToS3 = async (uri) => {
    if (!videoId) {
      Alert.alert(t('videoUpload.error'), t('videoUpload.videoIdMissing'));
      return;
    }

    setUploadingVideo(true);
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : 'video/mp4';

      const formData = new FormData();
      formData.append('video', {
        uri,
        name: filename,
        type,
      });

      const response = await SikiyaAPI.post(`/video/${videoId}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVideoKey(response.data.videoKey);
      setVideo(uri);
      if (errors.videoKey) {
        setErrors(prev => ({ ...prev, videoKey: false }));
      }
      console.log('Video uploaded successfully. Key:', response.data.videoKey);
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert(t('videoUpload.uploadFailed'), error.response?.data?.error || t('videoUpload.failedToUploadVideo'));
    } finally {
      setUploadingVideo(false);
    }
  };

  // Video picker function
  const pickVideo = async () => {
    Alert.alert(
      t('videoUpload.selectVideo'),
      t('videoUpload.chooseOption'),
      [
        {
          text: t('videoUpload.camera'),
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('videoUpload.permissionNeeded'), t('videoUpload.cameraVideoPermission'));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 0.8,
              videoMaxDuration: 60, // 1 minute max
            });
            if (!result.canceled) {
              const videoAsset = result.assets[0];
              // Check video duration
              if (videoAsset.duration && videoAsset.duration > 60000) {
                Alert.alert(t('videoUpload.videoTooLong'), t('videoUpload.videoTooLongMessage'));
                return;
              }
              await uploadVideoToS3(videoAsset.uri);
            }
          }
        },
        {
          text: t('videoUpload.gallery'),
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('videoUpload.permissionNeeded'), t('videoUpload.galleryVideoPermission'));
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 0.8,
              videoMaxDuration: 60, // 1 minute max
            });
            if (!result.canceled) {
              const videoAsset = result.assets[0];
              // Check video duration
              if (videoAsset.duration && videoAsset.duration > 60000) {
                Alert.alert(t('videoUpload.videoTooLong'), t('videoUpload.videoTooLongMessage'));
                return;
              }
              await uploadVideoToS3(videoAsset.uri);
            }
          }
        },
        { text: t('videoUpload.cancel'), style: "cancel" }
      ]
    );
  };

  // Upload proof image to S3
  const uploadProofImage = async (uri) => {
    if (!videoId) {
      Alert.alert(t('videoUpload.error'), t('videoUpload.videoIdMissing'));
      return;
    }

    setUploadingProof(true);
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: filename,
        type,
      });

      const response = await SikiyaAPI.post(`/video/${videoId}/upload-proof-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProofImageKey(response.data.imageKey);
      setProofPhoto(uri);
      if (errors.proofImageKey) {
        setErrors(prev => ({ ...prev, proofImageKey: false }));
      }
      console.log('Proof image uploaded successfully. Key:', response.data.imageKey);
    } catch (error) {
      console.error('Error uploading proof image:', error);
      Alert.alert(t('videoUpload.uploadFailed'), error.response?.data?.error || t('videoUpload.failedToUploadProof'));
    } finally {
      setUploadingProof(false);
    }
  };

  // Image picker function for proof photo
  const pickImage = async (aspect = [1.25, 0.8]) => {
    Alert.alert(
      t('videoUpload.selectPhoto'),
      t('videoUpload.chooseOption'),
      [
        {
          text: t('videoUpload.camera'),
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('videoUpload.permissionNeeded'), t('videoUpload.cameraPhotoPermission'));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: aspect,
              quality: 0.8,
            });
            if (!result.canceled) {
              await uploadProofImage(result.assets[0].uri);
            }
          }
        },
        {
          text: t('videoUpload.gallery'),
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('videoUpload.permissionNeeded'), t('videoUpload.galleryPhotoPermission'));
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: aspect,
              quality: 0.8,
            });
            if (!result.canceled) {
              await uploadProofImage(result.assets[0].uri);
            }
          }
        },
        { text: t('videoUpload.cancel'), style: "cancel" }
      ]
    );
  };

  // Handle video submission
  const handleSubmitVideo = async () => {
    // Validate required fields
    const newErrors = {};
    
    // Video is required
    if (!videoKey) {
      newErrors.videoKey = true;
    }

    // Both proof image AND proof text are required
    if (!proofImageKey) {
      newErrors.proofImageKey = true;
    }
    if (!proofText) {
      newErrors.proofText = true;
    }

    setErrors(newErrors);

    // If there are errors, scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const missingFields = [];
      if (newErrors.videoKey) missingFields.push(t('videoUpload.video'));
      if (newErrors.proofImageKey) missingFields.push(t('videoUpload.proofPhoto'));
      if (newErrors.proofText) missingFields.push(t('videoUpload.proofText'));
      Alert.alert(t('videoUpload.missingFields'), `${t('videoUpload.pleaseProvide')} ${missingFields.join(', ')}`);
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Update video with proof text
      if (proofText) {
        await SikiyaAPI.put(`/video/${videoId}/update-proof`, {
          video_proof_text: proofText
        });
      }

      // Navigate back to journalist panel screen
      setIsSubmitting(false);
      if (navigation) {
        navigation.navigate('JournalistPanel');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('videoUpload.failedToUpdate');
      Alert.alert(t('videoUpload.error'), errorMessage);
    }
  };

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <BigLoaderAnim />
          <Text style={styles.loadingText}>{t('videoUpload.submittingVideo')}</Text>
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
        keyboardVerticalOffset={0}
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
            <Text style={styles.screenTitle}>{videoTitle || t('videoUpload.title')}</Text>
          </View>

          {/* Video Upload Section */}
          <View style={styles.videoSection}>
            <Text style={styles.label}>{t('videoUpload.videoLabel')}</Text>
            <Text style={styles.labelDescription}>
              {t('videoUpload.videoDescription')}
            </Text>
            
            {/* Video Container */}
            <TouchableOpacity 
              style={[
                styles.videoContainer,
                errors.videoKey && styles.photoError
              ]}
              onPress={pickVideo}
              activeOpacity={0.7}
              disabled={uploadingVideo}
            >
              {uploadingVideo ? (
                <View style={styles.videoPlaceholder}>
                  <MediumLoadingState />
                  <Text style={styles.videoPlaceholderText}>{t('videoUpload.uploading')}</Text>
                </View>
              ) : video ? (
                <View style={styles.videoPreview}>
                  <Ionicons name="play-circle" size={64} color={AppScreenBackgroundColor} />
                  <Text style={styles.videoPreviewText}>{t('videoUpload.videoSelected')}</Text>
                  <Text style={styles.videoPreviewSubtext}>{t('videoUpload.tapToChange')}</Text>
                </View>
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="videocam" size={48} color={withdrawnTitleColor} />
                  <Text style={styles.videoPlaceholderText}>{t('videoUpload.uploadVideo')}</Text>
                  <Text style={styles.videoPlaceholderSubtext}>{t('videoUpload.maxDuration')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Horizontal Rule */}
          <View style={styles.horizontalRule} />

          {/* Proof Section */}
          <View style={styles.proofSection}>
            <View style={styles.proofHeader}>
              <Ionicons name="lock-closed" size={20} color={MainBrownSecondaryColor} />
              <Text style={styles.proofTitle}>{t('videoUpload.proof')}</Text>
            </View>

            {/* Disclaimer Text */}
            <View style={[styles.disclaimerContainer, main_Style.genContentElevation]}>
              <Text style={styles.disclaimerText}>
                {t('videoUpload.disclaimer1')}{'\n'}
                {t('videoUpload.disclaimer2')}{'\n'}
                {t('videoUpload.disclaimer3')}{'\n'}
                {t('videoUpload.disclaimer4')}
              </Text>
            </View>

            {/* Proof Photo */}
            <Text style={styles.labelDescription}>
              {t('videoUpload.proofPhotoDescription')}
            </Text>
            <TouchableOpacity 
              style={[
                styles.proofPhotoContainer,
                errors.proofImageKey && styles.photoError
              ]}
              onPress={() => pickImage([1.25, 0.8])}
              activeOpacity={0.7}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <View style={styles.photoPlaceholder}>
                  <MediumLoadingState />
                  <Text style={styles.photoPlaceholderText}>{t('videoUpload.uploading')}</Text>
                </View>
              ) : proofPhoto ? (
                <Image source={{ uri: proofPhoto }} style={styles.proofPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color={withdrawnTitleColor} />
                  <Text style={styles.photoPlaceholderText}>{t('videoUpload.proofPhotoLabel')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Proof Text */}
            <View>
              <Text style={styles.label}>{t('videoUpload.proofOfVideo')}</Text>
              <Text style={styles.labelDescription}>
                {t('videoUpload.proofDescription')}
              </Text>
              <TextInput
                style={[
                  styles.textArea, 
                  styles.proofTextArea,
                  proofTextFocused && styles.inputFocused,
                  errors.proofText && styles.inputError
                ]}
                placeholder={t('videoUpload.proofPlaceholder')}
                placeholderTextColor="#aaa"
                value={proofText}
                onChangeText={(text) => {
                  setProofText(text);
                  if (text && errors.proofText) {
                    setErrors(prev => ({ ...prev, proofText: false }));
                  }
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                onFocus={() => {
                  setProofTextFocused(true);
                  // Scroll to bring input into view above keyboard
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 800, animated: true });
                  }, 400);
                }}
                onBlur={() => setProofTextFocused(false)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, main_Style.genButtonElevation]}
            activeOpacity={0.7}
            onPress={handleSubmitVideo}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{t('videoUpload.submitVideo')}</Text>
          </TouchableOpacity>

          <VerticalSpacer height={50} />

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
    width: 50,
    height: 50,
  },
  placeholder: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: generalTitleSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTextColor,
    marginBottom: 4,
  },
  labelDescription: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    marginBottom: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordCount: {
    fontSize: generalSmallTextSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
  titleInput: {
    backgroundColor: secCardBackgroundColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: generalTextFont,
    color: generalTextColor,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputFocused: {
    borderColor: '#2BA1E6',
    borderWidth: 1.2,
    backgroundColor: '#F0F6FA',
  },
  inputError: {
    borderColor: '#F4796B',
    borderWidth: 0.8,
  },
  photoError: {
    borderColor: '#F4796B',
    borderWidth: 0.8,
  },
  videoSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MainBrownSecondaryColor,
  },
  videoPreviewText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
  videoPreviewSubtext: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: AppScreenBackgroundColor,
    opacity: 0.8,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
  },
  videoPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: generalTitleFont,
    color: generalTitleColor,
  },
  videoPlaceholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 4,

    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  horizontalRule: {
    height: 1,
    backgroundColor: cardBackgroundColor,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  proofSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proofTitle: {
    fontSize: largeTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: MainBrownSecondaryColor,
    marginLeft: 8,
    marginBottom: 4,
    marginTop: 4,
  },
  proofPhotoContainer: {
    width: '100%',
    aspectRatio: 1.25 / 0.8, // 1.25 width : 0.8 height ratio
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  proofPhoto: {
    width: '100%',
    height: '100%',
  },
  proofTextArea: {
    minHeight: 120,
  },
  disclaimerContainer: {
    backgroundColor: lightBannerBackgroundColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: MainBrownSecondaryColor,
  },
  disclaimerText: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppScreenBackgroundColor,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
});

export default NewShortVideoScreen;

