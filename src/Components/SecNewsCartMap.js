// This component is used to display the flash news in a horizontal scrollable view.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SecondaryNewsCart from './SecondaryNewscart';
import NewsAPI from '../../API/NewsAPI';
import { mainTitleColor } from '../styles/GeneralAppStyle';

const SecNewsCartMap = ({ articles}) => (

  //console.log('Articles in SecNewsCartMap:', articles),

  <View style={styles.container}>
    <View style={styles.stories}>
      {articles.length === 0 ? (
        <View style={styles.storyContainer}>
          <SecondaryNewsCart article={null} />
        </View>
      ) : (
        articles.map((item) => (
          <View key={item._id} style={styles.storyContainer}>
            <SecondaryNewsCart article={item} />
          </View>
        ))
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#C8A07E",
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    margin: 12,
    fontWeight: 'bold',
    color: mainTitleColor,
  },
  stories: {
    flexDirection: 'column', // Stack vertically
  },
  storyContainer: {
    marginBottom: 8,
  },
});

export default SecNewsCartMap;