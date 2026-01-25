import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar, Keyboard} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, main_Style, MainBrownSecondaryColor, generalTextFont, secCardBackgroundColor, cardBackgroundColor, withdrawnTitleColor, generalTextColor, largeTextSize, generalTextFontWeight, generalTitleFontWeight, generalTextSize, generalSmallTextSize, articleTextSize, auth_Style, commentTextSize} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import CountryPicker from '../../Components/CountryPicker';
import CityPicker from '../../Components/CityPicker';
import ArticleGroupPicker from '../../Components/ArticleGroupPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';

const NewArticleScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const titleInputRef = useRef(null);
  const highlightInputRef = useRef(null);
  const fullArticleInputRef = useRef(null);
  
  // Form data state
  const [articleData, setArticleData] = useState({
    articleTitle: '',
    articleHighlight: '',
    fullArticle: '',
    country: '',
    city: '',
    articleGroup: '',
  });

  // Focus states for inputs
  const [titleFocused, setTitleFocused] = useState(false);
  const [highlightFocused, setHighlightFocused] = useState(false);
  const [fullArticleFocused, setFullArticleFocused] = useState(false);

  // Function to dismiss keyboard and blur all inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    titleInputRef.current?.blur();
    highlightInputRef.current?.blur();
    fullArticleInputRef.current?.blur();
  };

  // Error states for validation
  const [errors, setErrors] = useState({});

  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form data changes
  const handleFormChange = (key, value) => {
    setArticleData({ ...articleData, [key]: value });
    // Clear error when field is filled
    if (value) {
      setErrors(prev => ({ ...prev, [key]: false }));
    }
    // Clear city when country changes
    if (key === 'country') {
      setArticleData(prev => ({ ...prev, city: '' }));
    }
  };

  // Word count helper
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };



  // Handle article submission
  const handleSubmitArticle = async () => {
    // Validate required fields
    const requiredFields = {
      articleTitle: articleData.articleTitle,
      articleHighlight: articleData.articleHighlight,
      fullArticle: articleData.fullArticle,
      country: articleData.country,
      city: articleData.city,
      articleGroup: articleData.articleGroup,
    };

    const newErrors = {};
    Object.keys(requiredFields).forEach(key => {
      if (!requiredFields[key]) {
        newErrors[key] = true;
      }
    });

    // Validate title word count (minimum 8 words)
    const titleWordCount = getWordCount(articleData.articleTitle);
    if (titleWordCount < 8) {
      newErrors.articleTitle = true;
    }

    setErrors(newErrors);

    // If there are errors, scroll to first error
    if (Object.keys(newErrors).length > 0) {
      if (titleWordCount < 8 && articleData.articleTitle) {
        Alert.alert(t('newArticle.titleTooShort'), t('newArticle.titleTooShortMessage'));
      } else {
        Alert.alert(t('newArticle.missingFields'), t('newArticle.missingFieldsMessage'));
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Prepare API payload
      const payload = {
        article_title: articleData.articleTitle,
        article_content: articleData.fullArticle,
        article_highlight: articleData.articleHighlight,
        concerned_country: articleData.country,
        concerned_city: articleData.city,
        article_group: articleData.articleGroup,
      };

      // Call API to create article
      const response = await SikiyaAPI.post('/article/new', payload);

      // Get article ID and title from response
      const articleId = response.data._id;
      const articleTitle = response.data.article_title;

      // Navigate to next screen with article ID and title
      if (navigation) {
        navigation.navigate('NewArticleImage', { 
          articleId,
          articleTitle,
          articleData // Keep original data for reference if needed
        });
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setIsSubmitting(false);
      
      // Show error message
      const errorMessage = error.response?.data?.error || error.message || t('newArticle.failedToCreate');
      Alert.alert(t('newArticle.error'), errorMessage);
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
          <Text style={styles.loadingText}>{t('newArticle.creatingArticle')}</Text>
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
              source={require('../../../assets/functionalImages/article.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.placeholder} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>{t('newArticle.title')}</Text>
          </View>

          {/* Article Title Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('newArticle.articleTitle')}</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.articleTitle)} {t('newArticle.wordsMin')}
              </Text>
            </View>
            <Text style={styles.labelDescription}>
              {t('newArticle.titleDescription')}
            </Text>
            <TextInput
              ref={titleInputRef}
              style={[
                styles.titleInput,
                titleFocused && styles.inputFocused,
                errors.articleTitle && styles.inputError
              ]}
              placeholder={t('newArticle.titlePlaceholder')}
              placeholderTextColor="#aaa"
              value={articleData.articleTitle}
              onChangeText={(text) => handleFormChange('articleTitle', text)}
              onFocus={() => {
                setTitleFocused(true);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              onBlur={() => setTitleFocused(false)}
            />
          </View>

          {/* Article Highlight */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('newArticle.articleHighlight')}</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.articleHighlight)}/30 {t('newArticle.wordsMax')}
              </Text>
            </View>
            <Text style={styles.labelDescription}>
              {t('newArticle.highlightDescription')}
            </Text>
            <TextInput
              ref={highlightInputRef}
              style={[
                styles.textArea, 
                styles.highlightTextArea,
                highlightFocused && styles.inputFocused,
                errors.articleHighlight && styles.inputError
              ]}
              placeholder={t('newArticle.highlightPlaceholder')}
              placeholderTextColor="#aaa"
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

          {/* Full Article */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('newArticle.fullArticle')}</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.fullArticle)}/300 {t('newArticle.wordsMax')}
              </Text>
            </View>
            <Text style={styles.labelDescription}>
              {t('newArticle.fullArticleDescription')}
            </Text>
            <TextInput
              ref={fullArticleInputRef}
              style={[
                styles.textArea, 
                styles.fullArticleTextArea,
                fullArticleFocused && styles.inputFocused,
                errors.fullArticle && styles.inputError
              ]}
              placeholder={t('newArticle.fullArticlePlaceholder')}
              placeholderTextColor="#aaa"
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

          {/* Country Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('newArticle.country')}</Text>
            <CountryPicker
              value={articleData.country}
              onSelect={(country) => handleFormChange('country', country)}
              countryList={AfricanCountries}
              placeholder={t('newArticle.selectCountry')}
              label={t('newArticle.country')}
              error={errors.country}
              onOpen={dismissKeyboard}
            />
          </View>

          {/* City Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('newArticle.city')}</Text>
            <CityPicker
              value={articleData.city}
              onSelect={(city) => handleFormChange('city', city)}
              selectedCountry={articleData.country}
              placeholder={t('newArticle.selectCity')}
              label={t('newArticle.city')}
              error={errors.city}
              onOpen={dismissKeyboard}
            />
          </View>

          {/* Article Group Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('newArticle.articleCategory')}</Text>
            <ArticleGroupPicker
              value={articleData.articleGroup}
              onSelect={(group) => handleFormChange('articleGroup', group)}
              placeholder={t('newArticle.selectCategory')}
              label={t('newArticle.articleCategory')}
              error={errors.articleGroup}
              onOpen={dismissKeyboard}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.submitButton, main_Style.genButtonElevation]}
            activeOpacity={0.7}
            onPress={handleSubmitArticle}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{t('newArticle.continue')}</Text>
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
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    //backgroundColor: 'red',
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
    //backgroundColor: 'red',
  },
  label: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTextColor,
    marginBottom: 4,
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
  labelDescription: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    marginBottom: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  titleInput: {
    fontSize: articleTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
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
    paddingVertical: 12,
    marginBottom: 8,
    //backgroundColor: "#FFFFFF",
    //Adding some content
    zIndex: 8,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3
  },
  highlightTextArea: {
    minHeight: 100,
    maxHeight: 200,
  },
  fullArticleTextArea: {
    minHeight: 300,
    maxHeight: 500,
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

export default NewArticleScreen;

