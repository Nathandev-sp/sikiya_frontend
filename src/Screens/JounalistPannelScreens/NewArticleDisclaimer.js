import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { 
  generalTitleColor, 
  generalTitleFont, 
  main_Style, 
  MainBrownSecondaryColor, 
  generalTextFont, 
  secCardBackgroundColor, 
  cardBackgroundColor, 
  withdrawnTitleColor, 
  generalTextColor, 
  largeTextSize, 
  generalTextFontWeight, 
  generalTitleFontWeight, 
  generalTextSize, 
  generalSmallTextSize, 
  articleTextSize,
  lightBannerBackgroundColor,
  generalActiveOpacity,
  defaultButtonHitslop,
  MainSecondaryBlueColor,
  commentTextSize
} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useLanguage } from '../../Context/LanguageContext';

const NewArticleDisclaimerScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { articleId, articleTitle, articleData } = route.params || {};
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) {
      return;
    }
    if (navigation) {
      // Navigate to NewArticleImageScreen to continue with image uploads
      navigation.navigate('NewArticle', {
        articleId,
        articleTitle,
        articleData
      });
    }
  };

  return (
    <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'bottom']}>
      <StatusBar barStyle={"dark-content"} />
      {/* Header with Back Button and Image */}
      <View style={styles.headerContainer}>
        <View style={{position: 'absolute', top: -44, left: 2, zIndex: 10}}>
          <GoBackButton />
        </View>
        <Image 
          source={require('../../../assets/functionalImages/Sikiya_new_article.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.placeholder} />
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>{t('articleDisclaimer.title')}</Text>
        </View>
      </View>

      

      {/* Disclaimer Content */}
      <View style={styles.disclaimerContainer}>
        {/* Image Quality Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="image" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>{t('articleDisclaimer.imageQuality')}</Text>
        </View>

        {/* Accuracy Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>{t('articleDisclaimer.accuracy')}</Text>
        </View>

        {/* Review Process Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>{t('articleDisclaimer.reviewProcess')}</Text>
        </View>

        {/* Proof Requirements Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>{t('articleDisclaimer.proofRequirements')}</Text>
        </View>

        {/* Publication Rights Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="globe" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>{t('articleDisclaimer.publicationRights')}</Text>
        </View>
      </View>

      {/* Agreement Row */}
      <View style={styles.agreeRow}>
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={styles.checkboxContainer}
          hitSlop={defaultButtonHitslop}
          activeOpacity={generalActiveOpacity}
        >
          <Ionicons
            name={agreed ? "checkbox" : "square-outline"}
            size={24}
            color={agreed ? MainBrownSecondaryColor : MainBrownSecondaryColor}
          />
        </TouchableOpacity>
        <Text style={styles.agreeText}>
          {t('articleDisclaimer.agreeTerms')}
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[
          styles.continueButton, 
          main_Style.genButtonElevation,
          { opacity: agreed ? 1 : 0.5 }
        ]}
        activeOpacity={generalActiveOpacity}
        onPress={handleContinue}
        disabled={!agreed}
      >
        <Text style={styles.continueButtonText}>{t('articleDisclaimer.continue')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: cardBackgroundColor,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  headerLogo: {
    marginTop: 12,
    width: 100,
    height: 100,
  },
  placeholder: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: largeTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    marginTop: 12,
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    //backgroundColor: lightBannerBackgroundColor,
    padding: 16,
    justifyContent: 'space-around',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    //backgroundColor: '#F0F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionText: {
    flex: 1,
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 20,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: lightBannerBackgroundColor,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MainBrownSecondaryColor,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  agreeText: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
});

export default NewArticleDisclaimerScreen;

