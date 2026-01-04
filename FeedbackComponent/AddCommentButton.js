import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { mainBrownColor, generalTextFont, withdrawnTitleColor, bannerBackgroundColor, generalTitleColor, main_Style, generalActiveOpacity, genBtnBackgroundColor, MainBrownSecondaryColor } from '../src/styles/GeneralAppStyle';

const AddCommentRow = ({ commentCount, onPress }) => (
  <View style={styles.row}>
    <View style={styles.countContainer}>
      <MaterialIcons name="comment" size={24} color={MainBrownSecondaryColor} />
      <Text style={styles.countText}>{commentCount} Comments</Text>
    </View>
    <TouchableOpacity style={[styles.button, main_Style.genButtonElevation]} activeOpacity={generalActiveOpacity} onPress={onPress}>
      <MaterialIcons name="add-comment" size={24} color={MainBrownSecondaryColor} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:4,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginLeft: 6,
    fontSize: 13,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: genBtnBackgroundColor,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginRight: 4,
  },
  text: {
    color: generalTitleColor,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: generalTextFont,
  },
});

export default AddCommentRow;