import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FollowButtonColor, generalTextFont } from '../styles/GeneralAppStyle';

const FollowButton = ({ initialFollowed = false, onToggle }) => {
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
      style={[styles.button, followed ? styles.following : styles.notFollowing]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, followed ? styles.textFollowing : styles.textNotFollowing]}>
        {followed ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
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
  textFollowing: {
    color: '#666666',
  },
  textNotFollowing: {
    color: '#FFFFFF',
  },
});

export default FollowButton;