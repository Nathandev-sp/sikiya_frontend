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
import { SUBMISSION_SEGMENT_COLORS } from '../../styles/submissionFlowAccents';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';
import ArticleSubmissionStepHeader from '../../Components/ArticleSubmissionStepHeader';
import SubmissionFlowTopBar from '../../Components/SubmissionFlowTopBar';

const BORDER_IDLE = 'rgba(44, 36, 22, 0.14)';
const VIDEO_PREVIEW_BG = '#3D5A66';
const PLAY_RING = '#7DCFB6';

const NewShortVideoScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { videoId, videoTitle, videoData } = route.params || {};
  const scrollRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [proofText, setProofText] = useState('');

  const [videoKey, setVideoKey] = useState(null);
  const [proofImageKey, setProofImageKey] = useState(null);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [proofTextFocused, setProofTextFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      formData.append('video', { uri, name: filename, type });

      const response = await SikiyaAPI.post(`/video/${videoId}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVideoKey(response.data.videoKey);
      setVideo(uri);
      if (errors.videoKey) {
        setErrors((prev) => ({ ...prev, videoKey: false }));
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert(t('videoUpload.uploadFailed'), error.response?.data?.error || t('videoUpload.failedToUploadVideo'));
    } finally {
      setUploadingVideo(false);
    }
  };

  const pickVideo = async () => {
    Alert.alert(t('videoUpload.selectVideo'), t('videoUpload.chooseOption'), [
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
            videoMaxDuration: 60,
          });
          if (!result.canceled) {
            const videoAsset = result.assets[0];
            if (videoAsset.duration && videoAsset.duration > 60000) {
              Alert.alert(t('videoUpload.videoTooLong'), t('videoUpload.videoTooLongMessage'));
              return;
            }
            await uploadVideoToS3(videoAsset.uri);
          }
        },
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
            videoMaxDuration: 60,
          });
          if (!result.canceled) {
            const videoAsset = result.assets[0];
            if (videoAsset.duration && videoAsset.duration > 60000) {
              Alert.alert(t('videoUpload.videoTooLong'), t('videoUpload.videoTooLongMessage'));
              return;
            }
            await uploadVideoToS3(videoAsset.uri);
          }
        },
      },
      { text: t('videoUpload.cancel'), style: 'cancel' },
    ]);
  };

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
      formData.append('image', { uri, name: filename, type });

      const response = await SikiyaAPI.post(`/video/${videoId}/upload-proof-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProofImageKey(response.data.imageKey);
      setProofPhoto(uri);
      if (errors.proofImageKey) {
        setErrors((prev) => ({ ...prev, proofImageKey: false }));
      }
    } catch (error) {
      console.error('Error uploading proof image:', error);
      Alert.alert(t('videoUpload.uploadFailed'), error.response?.data?.error || t('videoUpload.failedToUploadProof'));
    } finally {
      setUploadingProof(false);
    }
  };

  const pickImage = async (aspect = [1.25, 0.8]) => {
    Alert.alert(t('videoUpload.selectPhoto'), t('videoUpload.chooseOption'), [
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
            aspect,
            quality: 0.8,
          });
          if (!result.canceled) {
            await uploadProofImage(result.assets[0].uri);
          }
        },
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
            aspect,
            quality: 0.8,
          });
          if (!result.canceled) {
            await uploadProofImage(result.assets[0].uri);
          }
        },
      },
      { text: t('videoUpload.cancel'), style: 'cancel' },
    ]);
  };

  const clearVideo = () => {
    setVideo(null);
    setVideoKey(null);
    setErrors((prev) => ({ ...prev, videoKey: false }));
  };

  const clearProofPhoto = () => {
    setProofPhoto(null);
    setProofImageKey(null);
    setErrors((prev) => ({ ...prev, proofImageKey: false }));
  };

  const handleSubmitVideo = async () => {
    const newErrors = {};
    if (!videoKey) newErrors.videoKey = true;
    if (!proofImageKey) newErrors.proofImageKey = true;
    if (!proofText) newErrors.proofText = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const missingFields = [];
      if (newErrors.videoKey) missingFields.push(t('videoUpload.video'));
      if (newErrors.proofImageKey) missingFields.push(t('videoUpload.proofPhoto'));
      if (newErrors.proofText) missingFields.push(t('videoUpload.proofText'));
      Alert.alert(t('videoUpload.missingFields'), `${t('videoUpload.pleaseProvide')} ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (proofText) {
        await SikiyaAPI.put(`/video/${videoId}/update-proof`, {
          video_proof_text: proofText,
        });
      }
      setIsSubmitting(false);
      navigation?.navigate('JournalistPanel');
    } catch (error) {
      console.error('Error updating video:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('videoUpload.failedToUpdate');
      Alert.alert(t('videoUpload.error'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <SubmissionFlowTopBar />
        <ArticleSubmissionStepHeader step={3} variant="compact" flow="video" />

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.screenHead}>
            <Text style={styles.screenTitle} numberOfLines={2}>
              {videoTitle || t('videoUpload.title')}
            </Text>
            <Text style={styles.screenSubtitle}>{t('videoFlow.mediaSubtitle')}</Text>
          </View>

          <View style={styles.blockTitleRow}>
            <View style={[styles.accentBar, { backgroundColor: SUBMISSION_SEGMENT_COLORS[0] }]} />
            <View style={styles.blockTitleCol}>
              <Text style={styles.blockTitle}>{t('videoUpload.videoSectionTitle')}</Text>
              <Text style={styles.blockHint}>{t('videoUpload.videoSectionHint')}</Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.videoZone,
              errors.videoKey && styles.zoneError,
              !video && styles.videoZoneEmpty,
            ]}
            onPress={pickVideo}
            disabled={uploadingVideo}
          >
            {uploadingVideo ? (
              <View style={styles.zoneInner}>
                <MediumLoadingState />
                <Text style={styles.uploadingLabel}>{t('videoUpload.uploading')}</Text>
              </View>
            ) : video ? (
              <View>
                <View style={styles.videoPreview}>
                  <View style={styles.playRing}>
                    <Ionicons name="play" size={36} color={PLAY_RING} />
                  </View>
                  <Text style={styles.videoPreviewText}>{t('videoUpload.videoSelected')}</Text>
                  <Text style={styles.videoPreviewSub}>{t('videoUpload.tapToChange')}</Text>
                </View>
                <View style={styles.heroActions}>
                  <Pressable style={styles.heroChip} onPress={pickVideo}>
                    <Ionicons name="videocam-outline" size={16} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                    <Text style={styles.heroChipText}>{t('videoUpload.replaceVideo')}</Text>
                  </Pressable>
                  <Pressable style={[styles.heroChip, styles.heroChipDanger]} onPress={clearVideo}>
                    <Ionicons name="trash-outline" size={16} color="#B91C1C" style={{ marginRight: 6 }} />
                    <Text style={styles.heroChipTextDanger}>{t('videoUpload.removeVideo')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.zoneInner}>
                <View style={styles.addCircle}>
                  <Ionicons name="videocam" size={30} color={SUBMISSION_SEGMENT_COLORS[0]} />
                </View>
                <Text style={styles.addLabel}>{t('videoUpload.addVideo')}</Text>
                <Text style={styles.maxDur}>{t('videoUpload.maxDuration')}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.sectionDivider} />

          <View style={styles.proofBlock}>
            <View style={styles.proofTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={22} color={SUBMISSION_SEGMENT_COLORS[2]} style={{ marginRight: 10 }} />
              <Text style={styles.proofTitle}>{t('videoUpload.proofRequiredTitle')}</Text>
            </View>
            <Text style={styles.proofWhy}>{t('videoUpload.proofWhyMatters')}</Text>

            <Text style={styles.subLabel}>{t('videoUpload.proofPhotoLabel')}</Text>
            <Pressable
              style={[styles.proofPhotoZone, errors.proofImageKey && styles.zoneError]}
              onPress={() => pickImage([1.25, 0.8])}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <View style={styles.zoneInner}>
                  <MediumLoadingState />
                  <Text style={styles.uploadingLabel}>{t('videoUpload.uploading')}</Text>
                </View>
              ) : proofPhoto ? (
                <View>
                  <Image source={{ uri: proofPhoto }} style={styles.proofImage} />
                  <View style={styles.heroActions}>
                    <Pressable style={styles.heroChip} onPress={() => pickImage([1.25, 0.8])}>
                      <Text style={styles.heroChipText}>{t('articleImages.replacePhoto')}</Text>
                    </Pressable>
                    <Pressable style={[styles.heroChip, styles.heroChipDanger]} onPress={clearProofPhoto}>
                      <Text style={styles.heroChipTextDanger}>{t('articleImages.removePhoto')}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.zoneInner}>
                  <Ionicons name="camera-outline" size={28} color={MainBrownSecondaryColor} />
                  <Text style={styles.addLabel}>{t('videoUpload.proofPhotoDescription')}</Text>
                </View>
              )}
            </Pressable>

            <Text style={styles.proofTextHelper}>{t('videoUpload.proofTextHelper')}</Text>
            <Text style={styles.subLabel}>{t('videoUpload.proofOfVideo')}</Text>
            <View
              style={[
                styles.proofInputShell,
                proofTextFocused && styles.proofInputFocused,
                errors.proofText && styles.zoneError,
              ]}
            >
              <TextInput
                style={styles.proofTextArea}
                placeholder={t('videoUpload.proofPlaceholder')}
                placeholderTextColor="#A8A29E"
                value={proofText}
                onChangeText={(text) => {
                  setProofText(text);
                  if (text && errors.proofText) {
                    setErrors((prev) => ({ ...prev, proofText: false }));
                  }
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
            onPress={handleSubmitVideo}
            disabled={isSubmitting}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.submitButtonText}>{t('videoUpload.submitVideo')}</Text>
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
  backRow: {
    paddingHorizontal: 12,
    paddingTop: 4,
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
  blockTitleCol: { flex: 1 },
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
  videoZone: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: '#FFFFFF',
  },
  videoZoneEmpty: {
    borderWidth: 2,
    borderColor: 'rgba(58, 125, 114, 0.4)',
    borderStyle: 'dashed',
    backgroundColor: lightBannerBackgroundColor,
  },
  zoneError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  zoneInner: {
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  videoPreview: {
    minHeight: 200,
    backgroundColor: VIDEO_PREVIEW_BG,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28,
  },
  playRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: PLAY_RING,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  videoPreviewText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: generalTitleFont,
    color: '#FFFFFF',
  },
  videoPreviewSub: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: 'rgba(255,255,255,0.85)',
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
    borderColor: 'rgba(58, 125, 114, 0.25)',
  },
  addLabel: {
    fontSize: 15,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  maxDur: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
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
  proofImage: {
    width: '100%',
    aspectRatio: 1.25 / 0.8,
    backgroundColor: '#EEE',
  },
  proofTextHelper: {
    fontSize: 13,
    fontFamily: generalTextFont,
    color: '#6B7280',
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

export default NewShortVideoScreen;
