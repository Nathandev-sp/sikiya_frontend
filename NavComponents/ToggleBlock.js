import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../src/utils/i18n';
import {
  generalTitleFont,
  mainTitleColor,
  withdrawnTitleColor,
  withdrawnTitleSize,
} from '../src/styles/GeneralAppStyle';

const TRACK_PADDING = 3;

const ToggleBlock = ({ selected, setSelected }) => {
  const sliderAnim = useRef(new Animated.Value(selected === 'People' ? 0 : 1)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.spring(sliderAnim, {
      toValue: selected === 'People' ? 0 : 1,
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [selected, sliderAnim]);

  const segmentWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / 2 : 0;

  const sliderTranslate = sliderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, segmentWidth],
  });

  return (
    <View
      style={styles.track}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) setTrackWidth(width);
      }}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          style={[
            styles.floatingPill,
            {
              width: segmentWidth,
              transform: [{ translateX: sliderTranslate }],
            },
          ]}
        />
      ) : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.segment}
          onPress={() => setSelected('People')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('search.people')}
          accessibilityState={{ selected: selected === 'People' }}
        >
          <Ionicons
            name="people-outline"
            size={15}
            color={selected === 'People' ? mainTitleColor : withdrawnTitleColor}
            style={styles.segmentIcon}
          />
          <Text
            style={[
              styles.segmentLabel,
              selected === 'People' ? styles.segmentLabelActive : styles.segmentLabelIdle,
            ]}
          >
            {i18n.t('search.people')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.segment}
          onPress={() => setSelected('Articles')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('article.articles')}
          accessibilityState={{ selected: selected === 'Articles' }}
        >
          <Ionicons
            name="newspaper-outline"
            size={15}
            color={selected === 'Articles' ? mainTitleColor : withdrawnTitleColor}
            style={styles.segmentIcon}
          />
          <Text
            style={[
              styles.segmentLabel,
              selected === 'Articles' ? styles.segmentLabelActive : styles.segmentLabelIdle,
            ]}
          >
            {i18n.t('article.articles')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    minHeight: 36,
    width: '78%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 20,
    padding: TRACK_PADDING,
    backgroundColor: '#EDE8E2',
    borderWidth: 1,
    borderColor: 'rgba(58, 39, 36, 0.09)',
    position: 'relative',
    marginTop: 0,
    marginBottom: 0,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
  },
  floatingPill: {
    position: 'absolute',
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    zIndex: 0,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
    zIndex: 1,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  segmentIcon: {
    marginTop: 0,
  },
  segmentLabel: {
    fontSize: withdrawnTitleSize,
    fontFamily: generalTitleFont,
    letterSpacing: 0.2,
  },
  segmentLabelActive: {
    color: mainTitleColor,
    fontWeight: '700',
  },
  segmentLabelIdle: {
    color: withdrawnTitleColor,
    fontWeight: '500',
  },
});

export default ToggleBlock;
