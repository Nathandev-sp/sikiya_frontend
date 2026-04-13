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
import GoBackButton from '../../../NavComponents/GoBackButton';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import CountryPicker from '../../Components/CountryPicker';
import CityPicker from '../../Components/CityPicker';
import ArticleGroupPicker from '../../Components/ArticleGroupPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';
import ArticleSubmissionStepHeader from '../../Components/ArticleSubmissionStepHeader';
import { SUBMISSION_SEGMENT_COLORS } from '../../styles/submissionFlowAccents';

const BORDER_IDLE = 'rgba(44, 36, 22, 0.14)';

const sectionAccent = (index) => ({
  borderLeftWidth: 3,
  borderLeftColor: SUBMISSION_SEGMENT_COLORS[index % SUBMISSION_SEGMENT_COLORS.length],
  paddingLeft: 12,
});

const NewArticleScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const titleInputRef = useRef(null);
  const highlightInputRef = useRef(null);
  const fullArticleInputRef = useRef(null);

  const [articleData, setArticleData] = useState({
    articleTitle: '',
    articleHighlight: '',
    fullArticle: '',
    country: '',
    city: '',
    articleGroup: '',
  });

  const [titleFocused, setTitleFocused] = useState(false);
  const [highlightFocused, setHighlightFocused] = useState(false);
  const [fullArticleFocused, setFullArticleFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    titleInputRef.current?.blur();
    highlightInputRef.current?.blur();
    fullArticleInputRef.current?.blur();
  };

  const handleFormChange = (key, value) => {
    setArticleData({ ...articleData, [key]: value });
    if (value) {
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
    if (key === 'country') {
      setArticleData((prev) => ({ ...prev, city: '' }));
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const handleSubmitArticle = async () => {
    const requiredFields = {
      articleTitle: articleData.articleTitle,
      articleHighlight: articleData.articleHighlight,
      fullArticle: articleData.fullArticle,
      country: articleData.country,
      city: articleData.city,
      articleGroup: articleData.articleGroup,
    };

    const newErrors = {};
    Object.keys(requiredFields).forEach((key) => {
      if (!requiredFields[key]) {
        newErrors[key] = true;
      }
    });

    const titleWordCount = getWordCount(articleData.articleTitle);
    if (titleWordCount < 8) {
      newErrors.articleTitle = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (titleWordCount < 8 && articleData.articleTitle) {
        Alert.alert(t('newArticle.titleTooShort'), t('newArticle.titleTooShortMessage'));
      } else {
        Alert.alert(t('newArticle.missingFields'), t('newArticle.missingFieldsMessage'));
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        article_title: articleData.articleTitle,
        article_content: articleData.fullArticle,
        article_highlight: articleData.articleHighlight,
        concerned_country: articleData.country,
        concerned_city: articleData.city,
        article_group: articleData.articleGroup,
      };

      const response = await SikiyaAPI.post('/article/new', payload);
      const articleId = response.data._id;
      const articleTitle = response.data.article_title;

      navigation?.navigate('NewArticleImage', {
        articleId,
        articleTitle,
        articleData,
      });
    } catch (error) {
      console.error('Error creating article:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || t('newArticle.failedToCreate');
      Alert.alert(t('newArticle.error'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <BigLoaderAnim />
          <Text style={styles.loadingText}>{t('newArticle.creatingArticle')}</Text>
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
        <ArticleSubmissionStepHeader step={2} variant="compact" flow="article" />

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
                <Text style={styles.screenTitle}>{t('newArticle.title')}</Text>
                <Text style={styles.screenSubtitle}>{t('articleFlow.writeSubtitle')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(0)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.articleTitle')}</Text>
                <View
                  style={[
                    styles.inputShell,
                    titleFocused && styles.inputShellFocused,
                    errors.articleTitle && styles.inputShellError,
                  ]}
                >
                  <Text style={styles.cornerCount}>
                    {getWordCount(articleData.articleTitle)} {t('newArticle.wordsMin')}
                  </Text>
                  <TextInput
                    ref={titleInputRef}
                    style={styles.inputTitle}
                    placeholder={t('newArticle.titlePlaceholder')}
                    placeholderTextColor="#A8A29E"
                    value={articleData.articleTitle}
                    onChangeText={(text) => handleFormChange('articleTitle', text)}
                    onFocus={() => {
                      setTitleFocused(true);
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    onBlur={() => setTitleFocused(false)}
                  />
                </View>
                <Text style={styles.fieldHint}>{t('newArticle.titleDescription')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(1)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.articleHighlight')}</Text>
                <View
                  style={[
                    styles.inputShell,
                    highlightFocused && styles.inputShellFocused,
                    errors.articleHighlight && styles.inputShellError,
                  ]}
                >
                  <Text style={styles.cornerCount}>
                    {getWordCount(articleData.articleHighlight)}/30 {t('newArticle.wordsMax')}
                  </Text>
                  <TextInput
                    ref={highlightInputRef}
                    style={styles.inputAreaSm}
                    placeholder={t('newArticle.highlightPlaceholder')}
                    placeholderTextColor="#A8A29E"
                    value={articleData.articleHighlight}
                    onChangeText={(text) => {
                      const wordCount = getWordCount(text);
                      if (wordCount <= 30) {
                        handleFormChange('articleHighlight', text);
                      } else {
                        Alert.alert(t('newArticle.wordLimit'), t('newArticle.highlightWordLimit'));
                      }
                    }}
                    multiline
                    textAlignVertical="top"
                    onFocus={() => setHighlightFocused(true)}
                    onBlur={() => setHighlightFocused(false)}
                  />
                </View>
                <Text style={styles.fieldHint}>{t('newArticle.highlightDescription')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(2)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.fullArticle')}</Text>
                <View
                  style={[
                    styles.inputShell,
                    fullArticleFocused && styles.inputShellFocused,
                    errors.fullArticle && styles.inputShellError,
                  ]}
                >
                  <Text style={styles.cornerCount}>
                    {getWordCount(articleData.fullArticle)}/300 {t('newArticle.wordsMax')}
                  </Text>
                  <TextInput
                    ref={fullArticleInputRef}
                    style={styles.inputAreaLg}
                    placeholder={t('newArticle.fullArticlePlaceholder')}
                    placeholderTextColor="#A8A29E"
                    value={articleData.fullArticle}
                    onChangeText={(text) => {
                      const wordCount = getWordCount(text);
                      if (wordCount <= 300) {
                        handleFormChange('fullArticle', text);
                      } else {
                        Alert.alert(t('newArticle.wordLimit'), t('newArticle.fullArticleWordLimit'));
                      }
                    }}
                    multiline
                    textAlignVertical="top"
                    onFocus={() => setFullArticleFocused(true)}
                    onBlur={() => setFullArticleFocused(false)}
                  />
                </View>
                <Text style={styles.fieldHint}>{t('newArticle.fullArticleDescription')}</Text>
              </View>

              <View style={[styles.section, sectionAccent(0)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.country')}</Text>
                <CountryPicker
                  value={articleData.country}
                  onSelect={(country) => handleFormChange('country', country)}
                  countryList={AfricanCountries}
                  placeholder={t('newArticle.selectCountry')}
                  label={t('newArticle.country')}
                  error={errors.country}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <View style={[styles.section, sectionAccent(1)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.city')}</Text>
                <CityPicker
                  value={articleData.city}
                  onSelect={(city) => handleFormChange('city', city)}
                  selectedCountry={articleData.country}
                  placeholder={t('newArticle.selectCity')}
                  label={t('newArticle.city')}
                  error={errors.city}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <View style={[styles.section, sectionAccent(2)]}>
                <Text style={styles.sectionLabel}>{t('newArticle.articleCategory')}</Text>
                <ArticleGroupPicker
                  value={articleData.articleGroup}
                  onSelect={(group) => handleFormChange('articleGroup', group)}
                  placeholder={t('newArticle.selectCategory')}
                  label={t('newArticle.articleCategory')}
                  error={errors.articleGroup}
                  onOpen={dismissKeyboard}
                  containerStyle={styles.pickerSurface}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
                onPress={handleSubmitArticle}
                disabled={isSubmitting}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                <Text style={styles.submitButtonText}>{t('newArticle.continue')}</Text>
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
  inputAreaSm: {
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 14,
    minHeight: 108,
    maxHeight: 200,
  },
  inputAreaLg: {
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    paddingTop: 36,
    paddingBottom: 14,
    paddingHorizontal: 14,
    minHeight: 280,
    maxHeight: 420,
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
    marginLeft: 4,
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

export default NewArticleScreen;
