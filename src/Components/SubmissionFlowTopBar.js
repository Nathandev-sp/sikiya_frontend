import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import GoBackButton from '../../NavComponents/GoBackButton';
import AppScreenBackgroundColor, { homeFeedBackgroundColor } from '../styles/GeneralAppStyle';

export default function SubmissionFlowTopBar() {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <GoBackButton buttonStyle={styles.backBtn} />
      </View>

      <View style={styles.center} pointerEvents="none">
        <Image
          source={require('../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
          style={styles.logoBanner}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: homeFeedBackgroundColor,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: 12,
    top: 6,
    bottom: 6,
    justifyContent: 'center',
    zIndex: 2,
  },
  backBtn: {
    position: 'relative',
    left: 0,
    top: 0,
    alignSelf: 'flex-start',
  },
  center: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logoBanner: {
    width: 160,
    height: 44,
  },
});

