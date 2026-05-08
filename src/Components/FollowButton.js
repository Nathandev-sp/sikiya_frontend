import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  FollowButtonColor,
  generalTextFont,
  PrimBtnColor,
  MainBrownSecondaryColor,
} from '../styles/GeneralAppStyle';

const FollowButton = ({
  initialFollowed = false,
  onToggle,
  compact = false,
  pill = false,
  /** Smaller, outline-style pill for list rows (e.g. PeopleDisplay) */
  pillSubtle = false,
  /** Fill horizontal space in a row (e.g. profile hero next to trust ring) */
  pillStretch = false,
  followLabel = 'Follow',
  followingLabel = 'Following',
}) => {
  const [followed, setFollowed] = useState(initialFollowed);

  React.useEffect(() => {
    setFollowed(initialFollowed);
  }, [initialFollowed]);

  const handlePress = () => {
    const newFollowedState = !followed;
    setFollowed(newFollowedState);
    if (onToggle) {
      onToggle(followed);
    }
  };

  if (pill) {
    const subtle = pillSubtle;
    return (
      <TouchableOpacity
        style={[
          styles.pillButton,
          pillStretch && styles.pillButtonStretch,
          subtle && styles.pillButtonSubtle,
          followed
            ? subtle
              ? styles.pillFollowingSubtle
              : styles.pillFollowing
            : subtle
              ? styles.pillNotFollowingSubtle
              : styles.pillNotFollowing,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={[styles.pillInner, subtle && styles.pillInnerSubtle]}>
          <Ionicons
            name={followed ? 'checkmark-circle' : 'add-circle-outline'}
            size={subtle ? 15 : 18}
            color={
              followed
                ? MainBrownSecondaryColor
                : subtle
                  ? MainBrownSecondaryColor
                  : '#FFFFFF'
            }
            style={
              subtle
                ? { opacity: followed ? 0.72 : 0.88 }
                : undefined
            }
          />
          <Text
            style={[
              styles.pillText,
              subtle && styles.pillTextSubtle,
              followed
                ? subtle
                  ? styles.pillTextFollowingSubtle
                  : styles.pillTextFollowing
                : subtle
                  ? styles.pillTextNotFollowingSubtle
                  : styles.pillTextNotFollowing,
            ]}
            numberOfLines={1}
          >
            {followed ? followingLabel : followLabel}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

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
        {followed ? followingLabel : followLabel}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
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
  pillButton: {
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignSelf: 'center',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  pillButtonStretch: {
    alignSelf: 'stretch',
    width: '100%',
  },
  pillNotFollowing: {
    backgroundColor: PrimBtnColor,
    borderWidth: 0,
  },
  pillFollowing: {
    backgroundColor: '#FFFCF9',
    borderWidth: 1.5,
    borderColor: 'rgba(102, 70, 44, 0.22)',
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pillText: {
    fontWeight: '700',
    fontSize: 14,
    fontFamily: generalTextFont,
    letterSpacing: 0.2,
  },
  pillTextNotFollowing: {
    color: '#FFFFFF',
  },
  pillTextFollowing: {
    color: MainBrownSecondaryColor,
  },
  pillButtonSubtle: {
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 11,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pillNotFollowingSubtle: {
    backgroundColor: 'rgba(129, 88, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(102, 70, 44, 0.18)',
  },
  pillFollowingSubtle: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(102, 70, 44, 0.14)',
  },
  pillInnerSubtle: {
    gap: 4,
  },
  pillTextSubtle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  pillTextNotFollowingSubtle: {
    color: MainBrownSecondaryColor,
    opacity: 0.88,
  },
  pillTextFollowingSubtle: {
    color: MainBrownSecondaryColor,
    opacity: 0.72,
  },
});

export default FollowButton;
