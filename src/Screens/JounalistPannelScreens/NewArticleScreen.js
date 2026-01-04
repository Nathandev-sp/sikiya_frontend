import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, main_Style, MainBrownSecondaryColor, generalTextFont, secCardBackgroundColor, cardBackgroundColor, withdrawnTitleColor, generalTextColor, largeTextSize, generalTextFontWeight, generalTitleFontWeight, generalTextSize, generalSmallTextSize, articleTextSize, auth_Style} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import MediumLoadingState from '../../Components/LoadingComps/MediumLoadingState';
import CountryPicker from '../../Components/CountryPicker';
import CityPicker from '../../Components/CityPicker';
import ArticleGroupPicker from '../../Components/ArticleGroupPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import SikiyaAPI from '../../../API/SikiyaAPI';

const NewArticleScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  
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
        Alert.alert('Title Too Short', 'Article title must be at least 8 words long.');
      } else {
        Alert.alert('Missing Fields', 'Please fill in all required fields');
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
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create article. Please try again.';
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
          <Text style={styles.loadingText}>Creating article...</Text>
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
            <Text style={styles.screenTitle}>New Article</Text>
          </View>

          {/* Article Title Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Article Title</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.articleTitle)} words (min: 8)
              </Text>
            </View>
            <TextInput
              style={[
                styles.titleInput,
                titleFocused && styles.inputFocused,
                errors.articleTitle && styles.inputError
              ]}
              placeholder="Enter article title (minimum 8 words)"
              placeholderTextColor={withdrawnTitleColor}
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
              <Text style={styles.label}>Article Highlight</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.articleHighlight)}/30 words
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea, 
                styles.highlightTextArea,
                highlightFocused && styles.inputFocused,
                errors.articleHighlight && styles.inputError
              ]}
              placeholder="Write a brief highlight (30 words max)"
              placeholderTextColor={withdrawnTitleColor}
              value={articleData.articleHighlight}
              onChangeText={(text) => {
                const wordCount = getWordCount(text);
                if (wordCount <= 30) {
                  handleFormChange('articleHighlight', text);
                } else {
                  Alert.alert('Word Limit', 'Article highlight must be 30 words or less.');
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => {
                setHighlightFocused(true);
                scrollRef.current?.scrollTo({ y: 200, animated: true });
              }}
              onBlur={() => setHighlightFocused(false)}
            />
          </View>

          {/* Full Article */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Full Article</Text>
              <Text style={styles.wordCount}>
                {getWordCount(articleData.fullArticle)}/300 words
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea, 
                styles.fullArticleTextArea,
                fullArticleFocused && styles.inputFocused,
                errors.fullArticle && styles.inputError
              ]}
              placeholder="Write the full article (300 words max)"
              placeholderTextColor={withdrawnTitleColor}
              value={articleData.fullArticle}
              onChangeText={(text) => {
                const wordCount = getWordCount(text);
                if (wordCount <= 300) {
                  handleFormChange('fullArticle', text);
                } else {
                  Alert.alert('Word Limit', 'Full article must be 300 words or less.');
                }
              }}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              onFocus={() => {
                setFullArticleFocused(true);
                scrollRef.current?.scrollTo({ y: 400, animated: true });
              }}
              onBlur={() => setFullArticleFocused(false)}
            />
          </View>

          {/* Country Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Country</Text>
            <CountryPicker
              value={articleData.country}
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
              value={articleData.city}
              onSelect={(city) => handleFormChange('city', city)}
              selectedCountry={articleData.country}
              placeholder="Select city"
              label="City"
              error={errors.city}
            />
          </View>

          {/* Article Group Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Article Category</Text>
            <ArticleGroupPicker
              value={articleData.articleGroup}
              onSelect={(group) => handleFormChange('articleGroup', group)}
              placeholder="Select article category"
              label="Article Category"
              error={errors.articleGroup}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.submitButton, main_Style.genButtonElevation]}
            activeOpacity={0.7}
            onPress={handleSubmitArticle}
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
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    //backgroundColor: 'red',
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
    //backgroundColor: 'red',
  },
  label: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
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
  textArea: {
    backgroundColor: secCardBackgroundColor,
    borderRadius: 8,
    padding: 12,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  highlightTextArea: {
    minHeight: 100,
  },
  fullArticleTextArea: {
    minHeight: 200,
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

