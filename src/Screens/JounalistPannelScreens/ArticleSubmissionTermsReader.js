import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { termsAndConditions } from '../../../assets/PDFs/TermsAndConditions';
import {
  generalTitleFont,
  generalTextFont,
  generalTextSize,
  generalTitleSize,
  generalTextColor,
  withdrawnTitleColor,
  commentTextSize,
  MainBrownSecondaryColor,
  generalTitleColor,
  homeFeedBackgroundColor,
} from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useLanguage } from '../../Context/LanguageContext';

export default function ArticleSubmissionTermsReader() {
  const { appLanguage, t } = useLanguage();
  const lang = appLanguage === 'fr' ? 'fr' : 'en';
  const termsData = termsAndConditions.journalist[lang];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backRow}>
        <GoBackButton buttonStyle={{ position: 'relative', left: 0, top: 0, alignSelf: 'flex-start' }} />
      </View>
      <Text style={styles.pageTitle}>{t('onboarding.termsAndConditions')}</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        <Text style={styles.termsTitle}>{termsData.title}</Text>
        <Text style={styles.lastUpdated}>
          {t('onboarding.lastUpdated')}: {termsData.lastUpdated}
        </Text>
        {termsData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeFeedBackgroundColor,
  },
  backRow: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  pageTitle: {
    fontSize: 13,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  termsTitle: {
    fontSize: generalTitleSize + 2,
    fontWeight: '700',
    fontFamily: generalTitleFont,
    color: MainBrownSecondaryColor,
    marginBottom: 6,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: generalTextSize - 3,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: generalTitleSize,
    fontWeight: '700',
    fontFamily: generalTitleFont,
    color: generalTitleColor,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: commentTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    lineHeight: 22,
  },
});
