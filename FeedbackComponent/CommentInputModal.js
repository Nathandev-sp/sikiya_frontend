import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import AppScreenBackgroundColor, { bannerBackgroundColor, cardBackgroundColor, genBtnBackgroundColor, generalLineHeight, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../src/styles/GeneralAppStyle';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CommentInputModal = ({ visible, onClose, onSend, placeholder, mode = "article", replyToName = "", isLoading = false }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Focus input after animation - with multiple attempts for reliability
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };
      
      // Try focusing at different intervals to ensure it works
      setTimeout(focusInput, 150);
      setTimeout(focusInput, 350);
      setTimeout(focusInput, 500);
    } else {
      // Reset animations
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      setText('');
      setIsFocused(false);
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSend = () => {
    if (!sendDisabled) {
      onSend(text);
      setText('');
    }
  };

  // Count words in text
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(text);
  const maxWords = 120;

  // determine disabled state for the send action
  const sendDisabled = !text.trim() || isLoading || wordCount > maxWords;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
              marginBottom: Platform.OS === 'ios' ? 12 : 8,
              marginHorizontal: 12,
            },
            main_Style.genButtonElevation,
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerText}>
                {mode === "article"
                  ? "Add a comment"
                  : `Reply to${replyToName ? ` ${replyToName}` : ""}`}
              </Text>
              {mode === "article" && (
                <Text style={styles.subNote}>You can't delete main comments.</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={withdrawnTitleColor} />
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={[styles.input, isFocused && styles.inputFocused]}
                  placeholder={placeholder || "Write your comment..."}
                  placeholderTextColor={withdrawnTitleColor}
                  value={text}
                  onChangeText={(newText) => {
                    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
                    if (words.length <= maxWords || newText.length < text.length) {
                      setText(newText);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  multiline
                  keyboardAppearance='light'
                  editable={!isLoading}
                  textAlignVertical="top"
                  autoFocus={visible}
                />
              </View>
              
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled, { marginLeft: 12 }]}
                disabled={sendDisabled}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={sendDisabled ? '#C0C0C0' : '#FFFFFF'}
                  />
                )}
              </TouchableOpacity>
            </View>
            {text.length > 0 && (
              <View style={styles.wordCountContainer}>
                <Text style={[styles.charCountText, wordCount > maxWords && styles.charCountTextError]}>
                  {wordCount}/{maxWords} words
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: AppScreenBackgroundColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 0,
    paddingHorizontal: 16,
    maxHeight: '80%',
    //shadowColor: '#000',
    /*shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',*/
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerLeft: {
    flex: 1,
  },
  headerText: {
    fontSize: generalTitleSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: generalTitleColor,
  },
  subNote: {
    marginTop: 4,
    fontSize: withdrawnTitleSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  inputSection: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    backgroundColor: AppScreenBackgroundColor,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    minHeight: 60,
    maxHeight: 180,
    borderColor: '#E0E0E0',
    borderWidth: 0.8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    backgroundColor: '#FAFAFA',
    lineHeight: generalLineHeight,
  },
  inputFocused: {
    borderColor: '#B3E5FC',
    borderWidth: 1.6,
    backgroundColor: '#FFFFFF',
  },
  wordCountContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  charCountText: {
    fontSize: withdrawnTitleSize,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
  },
  charCountTextError: {
    color: '#E74C3C',
  },
  sendButton: {
    backgroundColor: MainBrownSecondaryColor,
    borderRadius: 20,
    width: 40,
    height: 40, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MainBrownSecondaryColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CommentInputModal;