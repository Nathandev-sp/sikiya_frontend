import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FollowButtonColor, generalTextFont } from '../styles/GeneralAppStyle';

const FollowButton = ({ initialFollowed = false, onToggle, compact = false }) => {
  const [followed, setFollowed] = useState(initialFollowed);

  // Update state when initialFollowed prop changes
  React.useEffect(() => {
    setFollowed(initialFollowed);
  }, [initialFollowed]);

  const handlePress = () => {
    const newFollowedState = !followed;
    // Optimistically update the UI
    setFollowed(newFollowedState);
    if (onToggle) {
      // Pass the current state (before toggle) to parent for API call
      onToggle(followed);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        followed ? styles.following : styles.notFollowing,
        compact && styles.buttonCompact,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          followed ? styles.textFollowing : styles.textNotFollowing,
          compact && styles.textCompact,
        ]}
        numberOfLines={1}
      >
        {followed ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android Elevation
    elevation: 1,
  },
  buttonCompact: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    minWidth: 96,
    borderRadius: 8,
  },
  following: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  notFollowing: {
    backgroundColor: FollowButtonColor,
    borderColor: FollowButtonColor,
  },
  text: {
    fontWeight: '600',
    fontSize: 12,
    fontFamily: generalTextFont,
    letterSpacing: 0.3,
  },
  textCompact: {
    fontSize: 12,
    letterSpacing: 0.25,
  },
  textFollowing: {
    color: '#666666',
  },
  textNotFollowing: {
    color: '#FFFFFF',
  },
});

export default FollowButton;