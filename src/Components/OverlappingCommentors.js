import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const OverlappingCommentors = ({ images }) => {
  // Filter out duplicate images by comparing their URI properties
  const uniqueImages = images.reduce((unique, current) => {
    // Only add if we don't already have an image with this URI
    const isDuplicate = unique.some(img => 
      img && current && img.uri === current.uri
    );
    
    if (!isDuplicate && current) {
      unique.push(current);
    }
    return unique;
  }, []);

  // Limit to a maximum of 5 images to prevent overflow
  const displayImages = uniqueImages.slice(0, 5);

  return (
    <View style={styles.container}>
      {displayImages.map((img, idx) => (
        <Image
          key={idx}
          source={img}
          style={[
            styles.avatar,
            { left: idx * 18, zIndex: displayImages.length - idx } // overlap and stacking order
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    justifyContent: 'flex-start',
    marginLeft: 0
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 8,
    position: 'absolute',
    backgroundColor: '#ccc',
  },
});

export default OverlappingCommentors;