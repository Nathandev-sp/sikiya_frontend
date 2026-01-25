import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, StatusBar, KeyboardAvoidingView, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, main_Style, MainBrownSecondaryColor, generalTextFont, secCardBackgroundColor, cardBackgroundColor, withdrawnTitleColor, generalTextColor, largeTextSize, generalTextFontWeight, generalTitleFontWeight, generalTextSize, generalSmallTextSize, articleTextSize, lightBannerBackgroundColor, commentTextSize} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import SikiyaAPI from '../../../API/SikiyaAPI';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import { useLanguage } from '../../Context/LanguageContext';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';

const NewArticleImageScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const { articleId, articleTitle, articleData } = route.params || {};

  const [mainPhoto, setMainPhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null]);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [proofText, setProofText] = useState('');

  // Image keys from S3 uploads
  const [heroImageKey, setHeroImageKey] = useState(null);
  const [additionalImageKeys, setAdditionalImageKeys] = useState([]);
  const [proofImageKey, setProofImageKey] = useState(null);

  // Upload states
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Focus states for inputs
  const [proofTextFocused, setProofTextFocused] = useState(false);

  // Error states for validation
  const [errors, setErrors] = useState({});

  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image picker function with aspect ratio (1.25 width, 0.8 height for big images, 1.25:0.9 for additional)
  const pickImage = async (setImageFunction, onImageSelected, aspect = [1.25, 0.8]) => {
    Alert.alert(
      t('articleImages.selectPhoto'),
      t('articleImages.chooseOption'),
      [
        {
          text: t('articleImages.camera'),
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('articleImages.permissionNeeded'), t('articleImages.cameraPermissionMessage'));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: aspect,
              quality: 0.8,
            });
            if (!result.canceled && onImageSelected) {
              await onImageSelected(result.assets[0].uri);
            } else if (!result.canceled) {
              setImageFunction(result.assets[0].uri);
            }
          }
        },
        {
          text: t('articleImages.gallery'),
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('articleImages.permissionNeeded'), t('articleImages.galleryPermissionMessage'));
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: aspect,
              quality: 0.8,
            });
            if (!result.canceled && onImageSelected) {
              await onImageSelected(result.assets[0].uri);
            } else if (!result.canceled) {
              setImageFunction(result.assets[0].uri);
            }
          }
        },
        { text: t('articleImages.cancel'), style: "cancel" }
      ]
    );
  };

  // Upload hero image to S3
  const uploadHeroImage = async (uri) => {
    if (!articleId) {
      Alert.alert(t('articleImages.error'), t('articleImages.articleIdMissing'));
      return;
    }

    setUploadingHero(true);
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

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-hero-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setHeroImageKey(response.data.imageKey);
      setMainPhoto(uri);
      console.log('Hero image uploaded successfully. Key:', response.data.imageKey);
    } catch (error) {
      console.error('Error uploading hero image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadHero'));
    } finally {
      setUploadingHero(false);
    }
  };

  // Upload additional images to S3
  const uploadAdditionalImage = async (uri, index) => {
    if (!articleId) {
      Alert.alert(t('articleImages.error'), t('articleImages.articleIdMissing'));
      return;
    }

    setUploadingAdditional(true);
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('images', {
        uri,
        name: filename,
        type,
      });

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-additional-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the image keys array
      const newKeys = [...additionalImageKeys];
      if (response.data.imageKeys && response.data.imageKeys.length > 0) {
        // The API returns an array, we need to add the new key(s)
        newKeys[index] = response.data.imageKeys[0]; // First key from the response
        setAdditionalImageKeys(newKeys);
      }

      // Update the photo in state
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = uri;
      setAdditionalPhotos(newPhotos);
      
      console.log('Additional image uploaded successfully. Key:', response.data.imageKeys[0]);
    } catch (error) {
      console.error('Error uploading additional image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadImage'));
    } finally {
      setUploadingAdditional(false);
    }
  };

  // Upload proof image to S3
  const uploadProofImage = async (uri) => {
    if (!articleId) {
      Alert.alert(t('articleImages.error'), t('articleImages.articleIdMissing'));
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

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-proof-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProofImageKey(response.data.imageKey);
      setProofPhoto(uri);
      console.log('Proof image uploaded successfully. Key:', response.data.imageKey);
    } catch (error) {
      console.error('Error uploading proof image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadProof'));
    } finally {
      setUploadingProof(false);
    }
  };

  const handleMainPhotoPress = () => {
    pickImage(null, uploadHeroImage, [1.25, 0.8]); // Big image aspect ratio
  };

  const handleAdditionalPhotoPress = (index) => {
    pickImage(null, (uri) => uploadAdditionalImage(uri, index), [1.25, 0.9]); // Additional images keep 1.25:0.9
  };

  // Handle article submission
  const handleSubmitArticle = async () => {
    // Validate required fields
    const newErrors = {};
    
    // Hero image is required
    if (!heroImageKey) {
      newErrors.heroImageKey = true;
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
      if (newErrors.heroImageKey) missingFields.push(t('articleImages.mainPhoto'));
      if (newErrors.proofImageKey) missingFields.push(t('articleImages.proofPhoto'));
      if (newErrors.proofText) missingFields.push(t('articleImages.proofText'));
      Alert.alert(t('articleImages.missingFields'), `${t('articleImages.pleaseProvide')} ${missingFields.join(', ')}`);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Update article with proof text
      if (proofText) {
        await SikiyaAPI.put(`/article/${articleId}/update-proof`, {
          article_proof_text: proofText
        });
      }

      // Log the image keys for debugging
      //console.log('Article ID:', articleId);
      //console.log('Hero Image Key:', heroImageKey);
      //console.log('Additional Image Keys:', additionalImageKeys);
      //console.log('Proof Image Key:', proofImageKey);
      //console.log('Proof Text:', proofText);

      // Navigate back to journalist panel screen
      setIsSubmitting(false);
      if (navigation) {
        navigation.navigate('JournalistPanel');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('articleImages.failedToUpdate');
      Alert.alert(t('articleImages.error'), errorMessage);
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
          <Text style={styles.loadingText}>{t('articleImages.submittingArticle')}</Text>
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
              source={require('../../../assets/functionalImages/article.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.placeholder} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>{articleTitle || t('articleImages.title')}</Text>
          </View>

          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>{t('articleImages.photos')}</Text>
            <Text style={styles.labelDescription}>
              {t('articleImages.photosDescription')}
            </Text>
            
            {/* Main Photo */}
            <TouchableOpacity 
              style={[
                styles.mainPhotoContainer,
                errors.heroImageKey && styles.photoError
              ]}
              onPress={handleMainPhotoPress}
              activeOpacity={0.7}
              disabled={uploadingHero}
            >
              {uploadingHero ? (
                <View style={styles.photoPlaceholder}>
                  <MediumLoadingState />
                  <Text style={styles.photoPlaceholderText}>{t('articleImages.uploading')}</Text>
                </View>
              ) : mainPhoto ? (
                <Image source={{ uri: mainPhoto }} style={styles.mainPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color={withdrawnTitleColor} />
                  <Text style={styles.photoPlaceholderText}>{t('articleImages.mainPhotoLabel')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Additional Photos */}
            <View style={styles.additionalPhotosContainer}>
              {additionalPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.additionalPhotoContainer}
                  onPress={() => handleAdditionalPhotoPress(index)}
                  activeOpacity={0.7}
                  disabled={uploadingAdditional}
                >
                  {uploadingAdditional && !photo ? (
                    <View style={styles.photoPlaceholder}>
                      <MediumLoadingState />
                    </View>
                  ) : photo ? (
                    <Image source={{ uri: photo }} style={styles.additionalPhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="image" size={24} color={withdrawnTitleColor} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Horizontal Rule */}
          <View style={styles.horizontalRule} />

          {/* Proof Section */}
          <View style={styles.proofSection}>
            <View style={styles.proofHeader}>
              <Ionicons name="lock-closed" size={20} color={MainBrownSecondaryColor} />
              <Text style={styles.proofTitle}>{t('articleImages.proof')}</Text>
            </View>

            {/* Disclaimer Text */}
            <View style={[styles.disclaimerContainer, main_Style.genContentElevation]}>
              <Text style={styles.disclaimerText}>
                {t('articleImages.disclaimer1')}{'\n'}
                {t('articleImages.disclaimer2')}{'\n'}
                {t('articleImages.disclaimer3')}{'\n'}
                {t('articleImages.disclaimer4')}
              </Text>
            </View>

            {/* Proof Photo */}
            <Text style={styles.labelDescription}>
              {t('articleImages.proofPhotoDescription')}
            </Text>
            <TouchableOpacity 
              style={[
                styles.proofPhotoContainer,
                errors.proofImageKey && styles.photoError
              ]}
              onPress={() => pickImage(null, uploadProofImage, [1.25, 0.8])} // Big image aspect ratio
              activeOpacity={0.7}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <View style={styles.photoPlaceholder}>
                  <MediumLoadingState />
                  <Text style={styles.photoPlaceholderText}>{t('articleImages.uploading')}</Text>
                </View>
              ) : proofPhoto ? (
                <Image source={{ uri: proofPhoto }} style={styles.proofPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color={withdrawnTitleColor} />
                  <Text style={styles.photoPlaceholderText}>{t('articleImages.proofPhotoLabel')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Proof Text */}
            <View>
              <Text style={styles.label}>{t('articleImages.proofOfArticle')}</Text>
              <Text style={styles.labelDescription}>
                {t('articleImages.proofDescription')}
              </Text>
              <TextInput
                style={[
                  styles.textArea, 
                  styles.proofTextArea,
                  proofTextFocused && styles.inputFocused,
                  errors.proofText && styles.inputError
                ]}
                placeholder={t('articleImages.proofPlaceholder')}
                placeholderTextColor="#aaa"
                value={proofText}
                onChangeText={(text) => {
                  setProofText(text);
                  if (text) {
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
            onPress={handleSubmitArticle}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{t('articleImages.submitArticle')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
          
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
    fontSize: largeTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    textAlign: 'center',
  },
  photoSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: generalTextSize,
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
  mainPhotoContainer: {
    width: '100%',
    aspectRatio: 1.25 / 0.8, // 1.25 width : 0.8 height ratio
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  photoError: {
    borderColor: '#F4796B',
    borderWidth: 0.8,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  additionalPhotosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  additionalPhotoContainer: {
    flex: 1,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
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
  additionalPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
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
    marginTop: 12,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  proofTitle: {
    fontSize: articleTextSize+3,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: MainBrownSecondaryColor,
    marginLeft: 8,
    //marginTop: 12,
  },
  disclaimerContainer: {
    backgroundColor: lightBannerBackgroundColor,
    borderRadius: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
    borderWidth: 0.5,
    borderColor: '#ccc',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: MainBrownSecondaryColor,
    ...main_Style.genContentElevation,
  },
  disclaimerText: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 24,
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
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  proofTextArea: {
    minHeight: 120,
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

export default NewArticleImageScreen;


