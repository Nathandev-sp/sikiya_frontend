import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AppScreenBackgroundColor, {
  generalTitleFont,
  main_Style,
  MainBrownSecondaryColor,
  generalTextFont,
  withdrawnTitleColor,
  generalTextColor,
  generalTextSize,
  generalSmallTextSize,
  generalTitleFontWeight,
  lightBannerBackgroundColor,
  homeFeedBackgroundColor,
  PrimBtnColor,
} from '../../styles/GeneralAppStyle';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import SikiyaAPI from '../../../API/SikiyaAPI';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import { useLanguage } from '../../Context/LanguageContext';
import ArticleSubmissionStepHeader from '../../Components/ArticleSubmissionStepHeader';
import { SUBMISSION_SEGMENT_COLORS } from '../../styles/submissionFlowAccents';
import SubmissionFlowTopBar from '../../Components/SubmissionFlowTopBar';

const BORDER_IDLE = 'rgba(44, 36, 22, 0.14)';

const NewArticleImageScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const { articleId, articleTitle, articleData } = route.params || {};

  const [mainPhoto, setMainPhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null]);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [proofText, setProofText] = useState('');

  const [heroImageKey, setHeroImageKey] = useState(null);
  const [additionalImageKeys, setAdditionalImageKeys] = useState([]);
  const [proofImageKey, setProofImageKey] = useState(null);

  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [proofTextFocused, setProofTextFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (setImageFunction, onImageSelected, aspect = [1.25, 0.8]) => {
    Alert.alert(t('articleImages.selectPhoto'), t('articleImages.chooseOption'), [
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
            aspect,
            quality: 0.8,
          });
          if (!result.canceled && onImageSelected) {
            await onImageSelected(result.assets[0].uri);
          } else if (!result.canceled) {
            setImageFunction(result.assets[0].uri);
          }
        },
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
            aspect,
            quality: 0.8,
          });
          if (!result.canceled && onImageSelected) {
            await onImageSelected(result.assets[0].uri);
          } else if (!result.canceled) {
            setImageFunction(result.assets[0].uri);
          }
        },
      },
      { text: t('articleImages.cancel'), style: 'cancel' },
    ]);
  };

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
      formData.append('image', { uri, name: filename, type });

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-hero-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setHeroImageKey(response.data.imageKey);
      setMainPhoto(uri);
    } catch (error) {
      console.error('Error uploading hero image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadHero'));
    } finally {
      setUploadingHero(false);
    }
  };

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
      formData.append('images', { uri, name: filename, type });

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-additional-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newKeys = [...additionalImageKeys];
      if (response.data.imageKeys && response.data.imageKeys.length > 0) {
        newKeys[index] = response.data.imageKeys[0];
        setAdditionalImageKeys(newKeys);
      }

      const newPhotos = [...additionalPhotos];
      newPhotos[index] = uri;
      setAdditionalPhotos(newPhotos);
    } catch (error) {
      console.error('Error uploading additional image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadImage'));
    } finally {
      setUploadingAdditional(false);
    }
  };

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
      formData.append('image', { uri, name: filename, type });

      const response = await SikiyaAPI.post(`/article/${articleId}/upload-proof-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProofImageKey(response.data.imageKey);
      setProofPhoto(uri);
    } catch (error) {
      console.error('Error uploading proof image:', error);
      Alert.alert(t('articleImages.uploadFailed'), error.response?.data?.error || t('articleImages.failedToUploadProof'));
    } finally {
      setUploadingProof(false);
    }
  };

  const handleMainPhotoPress = () => {
    pickImage(null, uploadHeroImage, [1.25, 0.8]);
  };

  const handleAdditionalPhotoPress = (index) => {
    pickImage(null, (uri) => uploadAdditionalImage(uri, index), [1.25, 0.9]);
  };

  const clearHero = () => {
    setMainPhoto(null);
    setHeroImageKey(null);
    setErrors((prev) => ({ ...prev, heroImageKey: false }));
  };

  const clearAdditional = (index) => {
    const newPhotos = [...additionalPhotos];
    newPhotos[index] = null;
    setAdditionalPhotos(newPhotos);
    const newKeys = [...additionalImageKeys];
    newKeys[index] = undefined;
    setAdditionalImageKeys(newKeys);
  };

  const clearProofPhoto = () => {
    setProofPhoto(null);
    setProofImageKey(null);
    setErrors((prev) => ({ ...prev, proofImageKey: false }));
  };

  const handleSubmitArticle = async () => {
    const newErrors = {};
    if (!heroImageKey) newErrors.heroImageKey = true;
    if (!proofImageKey) newErrors.proofImageKey = true;
    if (!proofText) newErrors.proofText = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const missingFields = [];
      if (newErrors.heroImageKey) missingFields.push(t('articleImages.mainPhoto'));
      if (newErrors.proofImageKey) missingFields.push(t('articleImages.proofPhoto'));
      if (newErrors.proofText) missingFields.push(t('articleImages.proofText'));
      Alert.alert(t('articleImages.missingFields'), `${t('articleImages.pleaseProvide')} ${missingFields.join(', ')}`);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsSubmitting(true);

    try {
      if (proofText) {
        await SikiyaAPI.put(`/article/${articleId}/update-proof`, {
          article_proof_text: proofText,
        });
      }
      setIsSubmitting(false);
      navigation?.navigate('JournalistPanel');
    } catch (error) {
      console.error('Error updating article:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('articleImages.failedToUpdate');
      Alert.alert(t('articleImages.error'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <SubmissionFlowTopBar />
        <ArticleSubmissionStepHeader step={3} variant="compact" flow="article" />

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.screenHead}>
            <Text style={styles.screenTitle} numberOfLines={2}>
              {articleTitle || t('articleImages.title')}
            </Text>
            <Text style={styles.screenSubtitle}>{t('articleFlow.mediaSubtitle')}</Text>
          </View>

          <View style={styles.blockTitleRow}>
            <View style={[styles.accentBar, { backgroundColor: SUBMISSION_SEGMENT_COLORS[0] }]} />
            <View style={styles.blockTitleCol}>
              <Text style={styles.blockTitle}>{t('articleImages.heroSectionTitle')}</Text>
              <Text style={styles.blockHint}>{t('articleImages.heroSectionHint')}</Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.heroZone,
              errors.heroImageKey && styles.zoneError,
              !mainPhoto && styles.heroZoneEmpty,
            ]}
            onPress={handleMainPhotoPress}
            disabled={uploadingHero}
          >
            {uploadingHero ? (
              <View style={styles.heroInner}>
                <MediumLoadingState />
                <Text style={styles.uploadingLabel}>{t('articleImages.uploading')}</Text>
              </View>
            ) : mainPhoto ? (
              <View style={styles.heroPreviewWrap}>
                <Image source={{ uri: mainPhoto }} style={styles.heroImage} />
                <View style={styles.heroActions}>
                    <Pressable style={styles.heroChip} onPress={handleMainPhotoPress}>
                    <Ionicons name="image-outline" size={16} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                    <Text style={styles.heroChipText}>{t('articleImages.replacePhoto')}</Text>
                  </Pressable>
                  <Pressable style={[styles.heroChip, styles.heroChipDanger]} onPress={clearHero}>
                    <Ionicons name="trash-outline" size={16} color="#B91C1C" style={{ marginRight: 6 }} />
                    <Text style={styles.heroChipTextDanger}>{t('articleImages.removePhoto')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.heroInner}>
                <View style={styles.addCircle}>
                  <Ionicons name="add" size={32} color={MainBrownSecondaryColor} />
                </View>
                <Text style={styles.addMainLabel}>{t('articleImages.addMainPhoto')}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.sectionDivider} />

          <View style={styles.blockTitleRow}>
            <View style={[styles.accentBar, { backgroundColor: SUBMISSION_SEGMENT_COLORS[1] }]} />
            <View style={styles.blockTitleCol}>
              <Text style={styles.blockTitle}>{t('articleImages.additionalSectionTitle')}</Text>
              <Text style={styles.blockHint}>{t('articleImages.additionalSectionHint')}</Text>
            </View>
          </View>

          <View style={styles.extraRow}>
            {[0, 1, 2].map((index) =>
              additionalPhotos[index] ? (
                <View key={index} style={[styles.extraChip, styles.extraChipFilled]}>
                  <Pressable style={styles.extraThumbPress} onPress={() => handleAdditionalPhotoPress(index)} disabled={uploadingAdditional}>
                    <Image source={{ uri: additionalPhotos[index] }} style={styles.extraThumb} />
                  </Pressable>
                  <Pressable style={styles.extraRemove} onPress={() => clearAdditional(index)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color="rgba(0,0,0,0.55)" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  key={index}
                  style={styles.extraChip}
                  onPress={() => handleAdditionalPhotoPress(index)}
                  disabled={uploadingAdditional}
                >
                  {uploadingAdditional ? (
                    <MediumLoadingState />
                  ) : (
                    <>
                      <Ionicons name="add" size={22} color={MainBrownSecondaryColor} />
                      <Text style={styles.extraChipText}>{t('articleImages.addPhotoAction')}</Text>
                    </>
                  )}
                </Pressable>
              )
            )}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.proofBlock}>
            <View style={styles.proofTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={22} color={SUBMISSION_SEGMENT_COLORS[2]} style={{ marginRight: 10 }} />
              <Text style={styles.proofTitle}>{t('articleImages.proofRequiredTitle')}</Text>
            </View>
            <Text style={styles.proofWhy}>{t('articleImages.proofWhyMatters')}</Text>

            <Text style={styles.subLabel}>{t('articleImages.proofPhotoLabel')}</Text>
            <Pressable
              style={[styles.proofPhotoZone, errors.proofImageKey && styles.zoneError]}
              onPress={() => pickImage(null, uploadProofImage, [1.25, 0.8])}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <View style={styles.heroInner}>
                  <MediumLoadingState />
                  <Text style={styles.uploadingLabel}>{t('articleImages.uploading')}</Text>
                </View>
              ) : proofPhoto ? (
                <View style={styles.heroPreviewWrap}>
                  <Image source={{ uri: proofPhoto }} style={styles.proofImage} />
                  <View style={styles.heroActions}>
                    <Pressable style={styles.heroChip} onPress={() => pickImage(null, uploadProofImage, [1.25, 0.8])}>
                      <Text style={styles.heroChipText}>{t('articleImages.replacePhoto')}</Text>
                    </Pressable>
                    <Pressable style={[styles.heroChip, styles.heroChipDanger]} onPress={clearProofPhoto}>
                      <Text style={styles.heroChipTextDanger}>{t('articleImages.removePhoto')}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.heroInner}>
                  <Ionicons name="camera-outline" size={28} color={MainBrownSecondaryColor} />
                  <Text style={styles.addMainLabel}>{t('articleImages.proofPhotoDescription')}</Text>
                </View>
              )}
            </Pressable>

            <Text style={styles.proofTextHelper}>{t('articleImages.proofTextHelper')}</Text>
            <Text style={styles.subLabel}>{t('articleImages.proofOfArticle')}</Text>
            <View
              style={[
                styles.proofInputShell,
                proofTextFocused && styles.proofInputFocused,
                errors.proofText && styles.zoneError,
              ]}
            >
              <TextInput
                style={styles.proofTextArea}
                placeholder={t('articleImages.proofPlaceholder')}
                placeholderTextColor="#A8A29E"
                value={proofText}
                onChangeText={(text) => {
                  setProofText(text);
                  if (text) setErrors((prev) => ({ ...prev, proofText: false }));
                }}
                multiline
                textAlignVertical="top"
                onFocus={() => {
                  setProofTextFocused(true);
                  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                }}
                onBlur={() => setProofTextFocused(false)}
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
            onPress={handleSubmitArticle}
            disabled={isSubmitting}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.submitButtonText}>{t('articleImages.submitArticle')}</Text>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeFeedBackgroundColor,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenHead: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 16,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    lineHeight: 21,
  },
  screenSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: '#6B7280',
    lineHeight: 16,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 2,
  },
  blockTitleCol: {
    flex: 1,
  },
  blockTitle: {
    fontSize: 15,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: PrimBtnColor,
    marginBottom: 4,
  },
  blockHint: {
    fontSize: 12,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    marginBottom: 12,
    lineHeight: 17,
  },
  heroZone: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 200,
    backgroundColor: '#FFFFFF',
  },
  heroZoneEmpty: {
    borderWidth: 2,
    borderColor: 'rgba(129, 88, 55, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: lightBannerBackgroundColor,
  },
  zoneError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  heroInner: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heroPreviewWrap: {
    width: '100%',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1.25 / 0.8,
    backgroundColor: '#EEE',
  },
  proofImage: {
    width: '100%',
    aspectRatio: 1.25 / 0.8,
    backgroundColor: '#EEE',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_IDLE,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: lightBannerBackgroundColor,
    borderWidth: 1,
    borderColor: 'rgba(129, 88, 55, 0.25)',
    marginRight: 8,
    marginBottom: 4,
  },
  heroChipDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(185, 28, 28, 0.25)',
  },
  heroChipText: {
    fontSize: 13,
    fontFamily: generalTitleFont,
    fontWeight: '600',
    color: MainBrownSecondaryColor,
  },
  heroChipTextDanger: {
    fontSize: 13,
    fontFamily: generalTitleFont,
    fontWeight: '600',
    color: '#B91C1C',
  },
  addCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 88, 55, 0.2)',
  },
  addMainLabel: {
    fontSize: 15,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  uploadingLabel: {
    marginTop: 8,
    fontSize: generalSmallTextSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(44, 36, 22, 0.1)',
    marginVertical: 24,
  },
  extraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  extraChip: {
    flex: 1,
    minWidth: '28%',
    maxWidth: '32%',
    marginHorizontal: 5,
    marginBottom: 10,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 88, 55, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: lightBannerBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  extraChipFilled: {
    borderStyle: 'solid',
    borderColor: BORDER_IDLE,
    backgroundColor: '#FFFFFF',
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  extraThumbPress: {
    width: '100%',
    height: '100%',
  },
  extraChipText: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
  },
  extraThumb: {
    width: '100%',
    height: '100%',
  },
  extraRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
  },
  proofBlock: {
    marginBottom: 8,
  },
  proofTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proofTitle: {
    fontSize: 17,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: PrimBtnColor,
    flex: 1,
  },
  proofWhy: {
    fontSize: 14,
    fontFamily: generalTextFont,
    color: '#5C564E',
    lineHeight: 21,
    marginBottom: 18,
  },
  subLabel: {
    fontSize: 12,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: '#6B6560',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  proofPhotoZone: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_IDLE,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  proofTextHelper: {
    fontSize: 13,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 4,
  },
  proofInputShell: {
    borderWidth: 1,
    borderColor: BORDER_IDLE,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  proofInputFocused: {
    borderColor: MainBrownSecondaryColor,
    shadowColor: MainBrownSecondaryColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  proofTextArea: {
    minHeight: 140,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 16,
    borderRadius: 999,
    marginTop: 20,
  },
  submitPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
  bottomSpacer: { height: 28 },
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
