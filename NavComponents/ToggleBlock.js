import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  AppRegistry,
} from 'react-native';
import AppScreenBackgroundColor, {
  generalTextFont,
  generalTitleFont,
  mainBrownColor,
  MainBrownSecondaryColor,
  lightBannerBackgroundColor,
  bannerBackgroundColor,
  main_Style,
  generalTitleFontWeight,
  commentTextSize,
  secCardBackgroundColor,
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
      >
        <Text
          style={[
            styles.text,
            {
              color: selected === 'People'
                ? AppScreenBackgroundColor
                : MainBrownSecondaryColor,
            },
          ]}
        >
          People
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelected('Articles')}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.text,
            {
              color: selected === 'Articles'
                ? AppScreenBackgroundColor
                : MainBrownSecondaryColor,
            },
          ]}
        >
          Articles
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    height: 30,
    width: '60%',
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 2,
    marginBottom: 0,
    borderWidth: 0.8,
    borderColor: '#E0E0E0',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    backgroundColor: MainBrownSecondaryColor,
    borderRadius: 20,
    zIndex: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    height: '100%',
  },
  text: {
    fontSize: commentTextSize,
    fontWeight: generalTitleFontWeight,
    fontFamily: generalTitleFont,
  },
});

export default ToggleBlock;
