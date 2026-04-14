import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, StatusBar, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, {
  generalTitleFont,
  MainBrownSecondaryColor,
  generalTextFont,
  generalTextColor,
  generalTextSize,
  generalTitleFontWeight,
  homeFeedBackgroundColor,
  PrimBtnColor,
} from '../../styles/GeneralAppStyle';
import { SUBMISSION_BULLET_COLORS, SUBMISSION_SEGMENT_COLORS } from '../../styles/submissionFlowAccents';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useLanguage } from '../../Context/LanguageContext';
import ArticleSubmissionStepHeader from '../../Components/ArticleSubmissionStepHeader';
import SubmissionFlowTopBar from '../../Components/SubmissionFlowTopBar';

const BULLET_KEYS = ['bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5'];

const NewVideoDisclaimerScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const ctaScale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.spring(ctaScale, {
      toValue: agreed ? 1 : 0.97,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [agreed, ctaScale]);

  const handleContinue = () => {
    if (!agreed) return;
    navigation?.navigate('NewVideoTitle');
  };

  const openTerms = () => {
    navigation?.navigate('ArticleTerms');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <SubmissionFlowTopBar />

      <ArticleSubmissionStepHeader step={1} variant="full" flow="video" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Image
            source={require('../../../assets/functionalImages/Sikiya_new_video.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>{t('videoDisclaimer.beforeYouPublish')}</Text>
        </View>

        <View style={styles.bulletList}>
          {BULLET_KEYS.map((key, i) => (
            <View key={key} style={styles.bulletRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="rgba(107,114,128,0.9)"
                style={styles.bulletIcon}
              />
              <Text style={styles.bulletText}>{t(`videoDisclaimer.${key}`)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.agreeRow}>
          <Pressable onPress={() => setAgreed(!agreed)} hitSlop={12} style={styles.checkHit}>
            <Ionicons
              name={agreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={MainBrownSecondaryColor}
            />
          </Pressable>
          <Text style={styles.agreeCopy}>
            {t('videoDisclaimer.agreeTermsPrefix')}
            <Text onPress={openTerms} style={styles.agreeLink}>
              {t('videoDisclaimer.agreeTermsLink')}
            </Text>
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: ctaScale }], alignSelf: 'stretch' }}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !agreed && styles.continueBtnDisabled,
              pressed && agreed && styles.continueBtnPressed,
            ]}
            onPress={handleContinue}
            disabled={!agreed}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.continueBtnText}>{t('videoDisclaimer.continue')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // Keep the entire screen consistent; avoids a bottom safe-area strip under the CTA.
    backgroundColor: homeFeedBackgroundColor,
  },
  backRow: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 0,
  },
  scroll: {
    flex: 1,
    backgroundColor: homeFeedBackgroundColor,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: homeFeedBackgroundColor,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 22,
    borderLeftWidth: 4,
    borderLeftColor: SUBMISSION_SEGMENT_COLORS[0],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 36, 22, 0.08)',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroImage: {
    width: 88,
    height: 88,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: PrimBtnColor,
    textAlign: 'center',
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontFamily: generalTextFont,
    color: '#6B7280',
    lineHeight: 22,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkHit: {
    marginRight: 10,
    padding: 2,
  },
  agreeCopy: {
    flex: 1,
    fontSize: 15,
    fontFamily: generalTextFont,
    color: '#6B7280',
    lineHeight: 22,
  },
  agreeLink: {
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: MainBrownSecondaryColor,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(44, 36, 22, 0.08)',
    backgroundColor: homeFeedBackgroundColor,
  },
  continueBtn: {
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.38,
  },
  continueBtnPressed: {
    opacity: 0.9,
  },
  continueBtnText: {
    fontSize: generalTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
    color: AppScreenBackgroundColor,
  },
});

export default NewVideoDisclaimerScreen;
