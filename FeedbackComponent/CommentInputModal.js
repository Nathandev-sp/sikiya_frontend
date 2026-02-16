import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import AppScreenBackgroundColor, { articleTitleSize, cardBackgroundColor, generalLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../src/styles/GeneralAppStyle';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLanguage } from '../src/Context/LanguageContext';


const CommentInputModal = ({ onSend, placeholder, isLoading = false, quota = null, quotaLoading = false, onUnlock, onUpgrade, userRole = '', modalTitle = null, titleColor = null, replyToName = null, onCancelReply = null }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const { t } = useLanguage();
  const isReplyMode = Boolean(replyToName);

  const handleSend = () => {
    if (!sendDisabled) {
      onSend(text);
      setText('');
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
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
  const isGeneralUser = userRole === 'general';
  const remainingMainComments = quota?.remaining ?? null;
  const quotaExceeded = isGeneralUser && quota && remainingMainComments !== null && remainingMainComments <= 0;

  const sendDisabled = !text.trim() || isLoading || wordCount > maxWords || (!isReplyMode && quotaExceeded);

  return (
    <View style={styles.container}>
      {!isReplyMode && quotaExceeded && (
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
              <Ionicons name="play-outline" size={16} color={MainBrownSecondaryColor} style={{ marginRight: 6 }} />
              <Text style={[styles.actionButtonText, styles.actionPrimaryText]}>{t('comments.watchAd')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionSecondary, main_Style.genButtonElevation]}
              onPress={handleUpgrade}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="rocket-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>{t('comments.upgrade')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isReplyMode ? (
        <View style={styles.postingInRow}>
          <Ionicons
            name="arrow-undo"
            size={14}
            color={MainBrownSecondaryColor}
            style={styles.postingInArrow}
          />
          <Text style={[styles.postingInLabel, { color: MainBrownSecondaryColor }]} numberOfLines={1}>
            {t('comments.replyingTo')}: {replyToName}
          </Text>
          {onCancelReply && (
            <TouchableOpacity
              onPress={onCancelReply}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.cancelReplyButton}
            >
              <Ionicons name="close-circle" size={22} color={withdrawnTitleColor} />
            </TouchableOpacity>
          )}
        </View>
      ) : modalTitle ? (
        <View style={styles.postingInRow}>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={titleColor || generalTitleColor}
            style={styles.postingInArrow}
          />
          <Text style={[styles.postingInLabel, titleColor ? { color: titleColor } : null]} numberOfLines={1}>
            {t('comments.postingIn')}: {modalTitle}
          </Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={isReplyMode ? t('comments.writeReplyPlaceholder') : (placeholder || t('comments.writeCommentPlaceholder'))}
            placeholderTextColor={withdrawnTitleColor}
            value={text}
            onChangeText={(newText) => {
              const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
              if (words.length <= maxWords || newText.length < text.length) {
                setText(newText);
              }
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
          style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
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
        <View style={styles.wordCountRow}>
          <Text style={[styles.charCountText, wordCount > maxWords && styles.charCountTextError]}>
            {wordCount}/{maxWords} {t('common.words')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppScreenBackgroundColor,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    //borderTopLeftRadius: 20,
    //borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: MainBrownSecondaryColor,
  },
  limitBox: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#7B0D1E',
    borderRadius: 12,
    backgroundColor: secCardBackgroundColor,
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
  inputSection: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 52,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: 44,
  },
  input: {
    minHeight: 40,
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: MainBrownSecondaryColor,
    //borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: generalTextColor,
    backgroundColor: '#FAFAFA',
    lineHeight: generalLineHeight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  postingInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  postingInArrow: {
    marginRight: 6,
  },
  cancelReplyButton: {
    padding: 4,
  },
  postingInLabel: {
    fontSize: generalSmallTextSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: generalTitleColor,
    flex: 1,
  },
  wordCountRow: {
    marginTop: 4,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
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
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: MainBrownSecondaryColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CommentInputModal;