import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import i18n from '../src/utils/i18n';
import AppScreenBackgroundColor, {
  generalTextFont,
  generalTitleFont,
  mainBrownColor,
  MainBrownSecondaryColor,
  main_Style,
  generalTitleFontWeight,
  commentTextSize,
  withdrawnTitleSize,
} from '../src/styles/GeneralAppStyle';

const ToggleBlock = ({ selected, setSelected }) => {
  const sliderAnim = useRef(new Animated.Value(selected === 'People' ? 0 : 1)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    Animated.spring(sliderAnim, {
      toValue: selected === 'People' ? 0 : 1,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const sliderTranslate = sliderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerWidth / 2], // Move from left to right half
  });

  return (
    <View 
      style={[styles.toggleContainer, main_Style.genButtonElevation]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) {
          setContainerWidth(width);
        }
      }}
    >
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX: sliderTranslate }],
          },
        ]}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelected('People')}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('search.people')}
        accessibilityState={{ selected: selected === 'People' }}
      >
        <Text
          style={[
            styles.text,
            {
              color: selected === 'People'
                ? AppScreenBackgroundColor
                : MainBrownSecondaryColor,
              fontWeight: selected === 'People' ? '700' : '600',
            },
          ]}
        >
          {i18n.t('search.people')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelected('Articles')}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('article.articles')}
        accessibilityState={{ selected: selected === 'Articles' }}
      >
        <Text
          style={[
            styles.text,
            {
              color: selected === 'Articles'
                ? AppScreenBackgroundColor
                : MainBrownSecondaryColor,
              fontWeight: selected === 'Articles' ? '700' : '600',
            },
          ]}
        >
          {i18n.t('article.articles')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    height: 38,
    width: '65%',
    maxWidth: 320,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    backgroundColor: MainBrownSecondaryColor,
    borderRadius: 24,
    zIndex: 0,
    shadowColor: MainBrownSecondaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    height: '100%',
  },
  text: {
    fontSize: withdrawnTitleSize + 1,
    fontFamily: generalTitleFont,
    letterSpacing: 0.3,
  },
});

export default ToggleBlock;
