import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Make sure you're using Expo

const StarRating = ({ rating }) => {
  const maxStars = 5;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, index) => (
        <FontAwesome
          key={index}
          name={index < rating ? 'star' : 'star-o'}
          size={14}
          color="#D4915E" // gold/yellow
          style={styles.star}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  star: {
    marginHorizontal: 2,
  },
});

export default StarRating;
