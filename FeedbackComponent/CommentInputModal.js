import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Keyboard, Pressable, InteractionManager } from 'react-native';
import AppScreenBackgroundColor, { articleTitleSize, bannerBackgroundColor, cardBackgroundColor, commentTextSize, genBtnBackgroundColor, generalLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, generalTitleSize, lightBannerBackgroundColor, main_Style, MainBlueColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../src/styles/GeneralAppStyle';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLanguage } from '../src/Context/LanguageContext';

const CommentInputModal = ({ 
  visible, 
  onClose, 
  onSend, 
  placeholder, 
  mode = "article", 
  replyToName = "", 
  isLoading = false,
  quota = null, // { dailyLimit, unlocked, used, remaining }
  quotaLoading = false,
  onUnlock,
  onUpgrade,
  userRole = ''
}) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const focusTimeoutsRef = useRef([]);
  const isClosingRef = useRef(false);
  const { t } = useLanguage();

  const clearFocusTimeouts = useCallback(() => {
    focusTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    focusTimeoutsRef.current = [];
  }, []);

  const runCloseAnimation = useCallback((notifyParent) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    clearFocusTimeouts();
    Keyboard.dismiss();
    if (inputRef.current) {
      inputRef.current.blur();
    }

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
      setIsRendered(false);
      setText('');
      setIsFocused(false);
      isClosingRef.current = false;
      if (notifyParent) {
        onClose();
      }
    });
  }, [clearFocusTimeouts, fadeAnim, onClose, slideAnim]);

  const handleClose = useCallback(() => {
    runCloseAnimation(true);
  }, [runCloseAnimation]);

  useEffect(() => {
    if (visible && !isRendered) {
      setIsRendered(true);
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      isClosingRef.current = false;

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

      clearFocusTimeouts();
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      InteractionManager.runAfterInteractions(() => {
        focusTimeoutsRef.current.push(setTimeout(focusInput, 120));
      });
    } else if (!visible && isRendered) {
      runCloseAnimation(false);
    }

    return () => {
      clearFocusTimeouts();
    };
  }, [clearFocusTimeouts, fadeAnim, isRendered, runCloseAnimation, slideAnim, visible]);

  const handleSend = () => {
    if (!sendDisabled) {
      onSend(text);
      setText('');
    }
  };

  const handleUpgrade = () => {
    // Close modal first, then navigate
    handleClose();
    // Call onUpgrade after a short delay to ensure modal closes smoothly
    setTimeout(() => {
      if (onUpgrade) {
        onUpgrade();
      }
    }, 300);
  };

  // Count words in text
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(text);
  const maxWords = 120;

  // determine disabled state for the send action
  const isGeneralUser = userRole === 'general';
  const remainingMainComments = quota?.remaining ?? null;
  const showQuota = isGeneralUser && quota && (mode === 'article' || mode === 'video');
  const quotaExceeded = showQuota && remainingMainComments !== null && remainingMainComments <= 0;

  const sendDisabled = !text.trim() || isLoading || wordCount > maxWords || quotaExceeded;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (!isRendered) return null;

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
          pointerEvents="box-none"
        >
          <Pressable 
            style={styles.overlayTouchable}
            onPress={handleClose}
          />
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
                  ? t('comments.addComment')
                  : `${t('comments.addReply')}${replyToName ? ` ${replyToName}` : ""}`}
              </Text>
              {mode === "article" && (
                <Text style={styles.subNote}>{t('comments.youCantDeleteMainComments')}</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={MainBrownSecondaryColor} />
            </TouchableOpacity>
          </View>

          

          {/* Limit reached actions */}
          {quotaExceeded && (
            <View style={[styles.limitBox, main_Style.genContentElevation]}>
              <Text style={styles.limitTitle}>{t('comments.dailyCommentLimit')}</Text>
              <Text style={styles.limitSub}>
                {t('comments.dailyCommentLimitDescription')}
              </Text>
              <View style={styles.limitActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionPrimary, main_Style.genButtonElevation]}
                  onPress={onUnlock}
                  disabled={quotaLoading || isLoading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play-outline" size={18} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
                  <Text style={[styles.actionButtonText, styles.actionPrimaryText]}>{t('comments.watchAd')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionSecondary, main_Style.genButtonElevation]}
                  onPress={handleUpgrade}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionButtonText}>{t('comments.upgrade')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
                  onFocus={() => {
                    setIsFocused(true);
                  }}
                  onBlur={() => {
                    setIsFocused(false);
                  }}
                  multiline
                  keyboardAppearance='light'
                  editable={!isLoading}
                  textAlignVertical="top"
                  autoFocus={false}
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
                  {wordCount}/{maxWords} {t('common.words')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: AppScreenBackgroundColor,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 0.5,
    borderColor: MainBrownSecondaryColor,
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
    backgroundColor: '#B0B0B0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerLeft: {
    flex: 1,
  },
  headerText: {
    fontSize: generalTitleSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: MainBrownSecondaryColor,
  },
  subNote: {
    marginTop: 4,
    fontSize: withdrawnTitleSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  quotaContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 12,
    backgroundColor: lightBannerBackgroundColor,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  quotaText: {
    fontSize: commentTextSize,
    color: MainSecondaryBlueColor,
    fontFamily: generalTextFont,
  },
  quotaSubText: {
    marginTop: 2,
    fontSize: withdrawnTitleSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
  limitBox: {
    marginHorizontal: 12,
    marginBottom: 16,
    marginTop: 0,
    padding: 12,
    borderWidth: 1,
    borderColor: '#7B0D1E',
    borderRadius: 12,
    backgroundColor: secCardBackgroundColor, //#66101F
    //borderWidth: 1,
    //borderColor: lightBannerBackgroundColor,
  },
  limitTitle: {
    fontSize: articleTitleSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: '#66101F',
    marginBottom: 8,
    textAlign: 'center',
  },
  limitSub: {
    fontSize: generalSmallTextSize,
    color: generalTextColor,
    fontFamily: generalTextFont,
    marginBottom: 16,
  },
  limitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionPrimary: {
    backgroundColor: '#fff',
    //borderWidth: 1,
    //borderColor: MainBrownSecondaryColor,
  },
  actionSecondary: {
    backgroundColor: MainSecondaryBlueColor,
  },
  actionButtonText: {
    fontSize: generalTextSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: '#fff',
  },
  actionPrimaryText: {
    color: MainBrownSecondaryColor,
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
    minHeight: 80,
    maxHeight: 180,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    backgroundColor: '#FFFFFF',
    lineHeight: generalLineHeight,
    ...main_Style.genContentElevation
  },
  inputFocused: {
    borderColor: '#2BA1E6', // blue #51D6FF #04698F
    borderWidth: 1.2,
    backgroundColor: '#F0F6FA',
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