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
  MainSecondaryBlueColor
} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';

const NewArticleDisclaimerScreen = ({ navigation, route }) => {
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
        <Text style={styles.screenTitle}>Article Disclaimer</Text>
      </View>

      {/* Disclaimer Content */}
      <View style={styles.disclaimerContainer}>
        {/* Image Quality Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="image" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>Upload good images with good quality</Text>
        </View>

        {/* Accuracy Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>Upload the most accurate information to the best of your knowledge</Text>
        </View>

        {/* Review Process Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>All articles are subject to review by Sikiya's editorial team</Text>
        </View>

        {/* Proof Requirements Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>Provide proof text and/or images to support your article</Text>
        </View>

        {/* Publication Rights Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="globe" size={32} color={MainSecondaryBlueColor} />
          </View>
          <Text style={styles.sectionText}>You grant Sikiya the right to publish and distribute your article</Text>
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
            color={agreed ? MainBrownSecondaryColor : "#888"}
          />
        </TouchableOpacity>
        <Text style={styles.agreeText}>
          I have read and understand the article disclaimer and agree to the terms
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
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
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
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: largeTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    textAlign: 'center',
  },
  disclaimerContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: "#E0E0E0",
    
    padding: 16,
    justifyContent: 'space-around',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    //borderRadius: 25,
    //backgroundColor: '#F0F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionText: {
    flex: 1,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 20,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  agreeText: {
    fontSize: generalTextSize - 1,
    fontFamily: generalTextFont,
    color: generalTitleColor,
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

