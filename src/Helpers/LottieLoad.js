import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * A reusable Lottie animation component for loading states
 * @param {Object} props Component props
 * @param {number} props.size Size of the animation (width and height)
 * @param {number} props.speed Animation speed (default: 1)
 * @param {Object} props.style Additional styles to apply
 * @param {string} props.source Custom animation source file (optional)
 */
const LottieLoad = ({ 
    size = 40,
    speed = 1,
    style,
    source
    }) => {
  // Default to your local loading animation, or use the provided source
    const animationSource = require('../../assets/Animations/LoadingAnimation.json');

  return (
      <LottieView
        source={animationSource}
        autoPlay
        loop
        speed={speed}
        style={{ width: 180, height: 24 }}
      />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red'
  }
});

export default LottieLoad;