import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../Context/LanguageContext';
import {
  generalTitleFont,
  AppScreenBackgroundColor,
  MainSecondaryBlueColor,
} from '../styles/GeneralAppStyle';
import { SUBMISSION_SEGMENT_COLORS } from '../styles/submissionFlowAccents';

const ARTICLE_LABEL_KEYS = [
  'articleFlow.stepLabel1',
  'articleFlow.stepLabel2',
  'articleFlow.stepLabel3',
];

const VIDEO_LABEL_KEYS = [
  'videoFlow.stepLabel1',
  'videoFlow.stepLabel2',
  'videoFlow.stepLabel3',
];

/**
 * @param {{ step: 1 | 2 | 3, variant?: 'full' | 'compact', flow?: 'article' | 'video' }} props
 */
export default function ArticleSubmissionStepHeader({ step, variant = 'full', flow = 'article' }) {
  const { t } = useLanguage();
  const compact = variant === 'compact';
  const labelKeys = flow === 'video' ? VIDEO_LABEL_KEYS : ARTICLE_LABEL_KEYS;
  const accent = SUBMISSION_SEGMENT_COLORS[Math.min(step, 3) - 1] || MainSecondaryBlueColor;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.stepLine, compact && styles.stepLineCompact]}>
        <Text style={styles.stepPrefix}>{t('submissionFlow.stepPrefix', { current: step, total: 3 })}</Text>
        <Text style={[styles.stepCurrent, { color: accent }]}>{' — '}{t(labelKeys[step - 1])}</Text>
      </Text>
      <View style={styles.track}>
        {[1, 2, 3].map((i, idx) => (
          <View
            key={i}
            style={[
              styles.segment,
              i <= step ? { backgroundColor: SUBMISSION_SEGMENT_COLORS[i - 1] } : styles.segmentOff,
              idx < 2 && styles.segmentGap,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: AppScreenBackgroundColor,
  },
  wrapCompact: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  stepLine: {
    fontSize: 13,
    fontFamily: generalTitleFont,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  stepLineCompact: {
    fontSize: 12,
    marginBottom: 8,
  },
  stepPrefix: {
    color: '#5C534A',
  },
  stepCurrent: {
    fontFamily: generalTitleFont,
    fontWeight: '800',
  },
  track: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentGap: {
    marginRight: 6,
  },
  segmentOff: {
    backgroundColor: 'rgba(44, 36, 22, 0.12)',
  },
});
