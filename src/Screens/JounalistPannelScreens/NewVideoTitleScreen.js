import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, {
  generalTitleFont,
  main_Style,
  MainBrownSecondaryColor,
  generalTextFont,
  withdrawnTitleColor,
  generalTextColor,
  generalTextSize,
  generalSmallTextSize,
  articleTextSize,
  generalTitleFontWeight,
  homeFeedBackgroundColor,
  PrimBtnColor,
} from '../../styles/GeneralAppStyle';
import { SUBMISSION_SEGMENT_COLORS } from '../../styles/submissionFlowAccents';
import GoBackButton from '../../../NavComponents/GoBackButton';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import CountryPicker from '../../Components/CountryPicker';
import CityPicker from '../../Components/CityPicker';
import VideoGroupPicker from '../../Components/VideoGroupPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';
import ArticleSubmissionStepHeader from '../../Components/ArticleSubmissionStepHeader';

const BORDER_IDLE = 'rgba(44, 36, 22, 0.14)';

const sectionAccent = (index) => ({
  borderLeftWidth: 3,
  borderLeftColor: SUBMISSION_SEGMENT_COLORS[index % SUBMISSION_SEGMENT_COLORS.length],
  paddingLeft: 12,
});

const NewVideoTitleScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const titleInputRef = useRef(null);

  const [videoData, setVideoData] = useState({
    videoTitle: '',
    country: '',
    city: '',
    videoGroup: '',
  });

  const [titleFocused, setTitleFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    titleInputRef.current?.blur();
  };

  const handleFormChange = (key, value) => {
    setVideoData({ ...videoData, [key]: value });
    if (value) {
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
    if (key === 'country') {
      setVideoData((prev) => ({ ...prev, city: '' }));
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const handleSubmitVideo = async () => {
    const requiredFields = {
      videoTitle: videoData.videoTitle,
      country: videoData.country,
      city: videoData.city,
      videoGroup: videoData.videoGroup,
    };

    const newErrors = {};
    Object.keys(requiredFields).forEach((key) => {
      if (!requiredFields[key]) {
        newErrors[key] = true;
      }
    });

    const titleWordCount = getWordCount(videoData.videoTitle);
    if (titleWordCount < 8) {
      newErrors.videoTitle = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (titleWordCount < 8 && videoData.videoTitle) {
        Alert.alert(t('newVideo.titleTooShort'), t('newVideo.titleTooShortMessage'));
      } else {
        Alert.alert(t('newVideo.missingFields'), t('newVideo.missingFieldsMessage'));
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        video_title: videoData.videoTitle,
        concerned_country: videoData.country,
        concerned_city: videoData.city,
        video_group: videoData.videoGroup,
      };

      const response = await SikiyaAPI.post('/video/new', payload);
      const videoId = response.data._id;
      const videoTitle = response.data.video_title;

      navigation?.navigate('NewVideo', {
        videoId,
        videoTitle,
        videoData,
      });
    } catch (error) {
      console.error('Error creating video:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('newVideo.failedToCreate');
      Alert.alert(t('newVideo.error'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <BigLoaderAnim />
          <Text style={styles.loadingText}>{t('newVideo.creatingVideo')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.backRow}>
          <GoBackButton
            buttonStyle={{ position: 'relative', left: 0, top: 0, alignSelf: 'flex-start' }}
          />
        </View>
        <ArticleSubmissionStepHeader step={2} variant="compact" flow="video" />

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View>
              <View style={styles.screenHead}>
                <Text style={styles.screenTitle}>{t('newVideo.title')}</Text>
                <Text style={styles.screenSubtitle}>{t('videoFlow.detailsSubtitle')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(0)]}>
                <Text style={styles.sectionLabel}>{t('newVideo.videoTitle')}</Text>
                <View
                  style={[
                    styles.inputShell,
                    titleFocused && styles.inputShellFocused,
                    errors.videoTitle && styles.inputShellError,
                  ]}
                >
                  <Text style={styles.cornerCount}>
                    {getWordCount(videoData.videoTitle)} {t('newVideo.wordsMin')}
                  </Text>
                  <TextInput
                    ref={titleInputRef}
                    style={styles.inputTitle}
                    placeholder={t('newVideo.titlePlaceholder')}
                    placeholderTextColor="#A8A29E"
                    value={videoData.videoTitle}
                    onChangeText={(text) => handleFormChange('videoTitle', text)}
                    onFocus={() => {
                      setTitleFocused(true);
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    onBlur={() => setTitleFocused(false)}
                  />
                </View>
                <Text style={styles.fieldHint}>{t('newVideo.titleDescription')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(1)]}>
                <Text style={styles.sectionLabel}>{t('newVideo.country')}</Text>
                <CountryPicker
                  value={videoData.country}
                  onSelect={(country) => handleFormChange('country', country)}
                  countryList={AfricanCountries}
                  placeholder={t('newVideo.selectCountry')}
                  label={t('newVideo.country')}
                  error={errors.country}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <View style={[styles.section, sectionAccent(2)]}>
                <Text style={styles.sectionLabel}>{t('newVideo.city')}</Text>
                <CityPicker
                  value={videoData.city}
                  onSelect={(city) => handleFormChange('city', city)}
                  selectedCountry={videoData.country}
                  placeholder={t('newVideo.selectCity')}
                  label={t('newVideo.city')}
                  error={errors.city}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <View style={[styles.section, sectionAccent(0)]}>
                <Text style={styles.sectionLabel}>{t('newVideo.videoCategory')}</Text>
                <VideoGroupPicker
                  value={videoData.videoGroup}
                  onSelect={(group) => handleFormChange('videoGroup', group)}
                  placeholder={t('newVideo.selectCategory')}
                  label={t('newVideo.videoCategory')}
                  error={errors.videoGroup}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
                onPress={handleSubmitVideo}
                disabled={isSubmitting}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                <Text style={styles.submitButtonText}>{t('newVideo.continue')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.submitIcon} />
              </Pressable>

              <View style={styles.bottomSpacer} />
            </View>
          </TouchableWithoutFeedback>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  screenHead: {
    marginBottom: 22,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: PrimBtnColor,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: generalSmallTextSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    lineHeight: 18,
  },
  section: {
    marginBottom: 26,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: '#6B6560',
    marginBottom: 6,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  inputShell: {
    borderWidth: 1,
    borderColor: BORDER_IDLE,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  inputShellFocused: {
    borderColor: MainBrownSecondaryColor,
    shadowColor: MainBrownSecondaryColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  inputShellError: {
    borderColor: '#DC2626',
  },
  cornerCount: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 2,
    fontSize: 11,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
  inputTitle: {
    fontSize: articleTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    paddingTop: 34,
    paddingBottom: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  fieldHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    lineHeight: 17,
  },
  pickerSurface: {
    borderWidth: 1,
    borderColor: BORDER_IDLE,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 0,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 4,
  },
  submitPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  submitIcon: {
    marginLeft: 8,
  },
  submitButtonText: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
  bottomSpacer: {
    height: 24,
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
