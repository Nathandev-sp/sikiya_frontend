import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // or use 'react-native-vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { defaultButtonHitslop, generalTextFont, withdrawnTitleColor } from '../src/styles/GeneralAppStyle';

const Upvote = () => {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [voteStatus, setVoteStatus] = useState(null); // 'up' | 'down' | null

  const handleUpvote = () => {
    if (voteStatus === 'up') {
      setUpvotes(upvotes - 1);
      setVoteStatus(null);
    } else {
      setUpvotes(upvotes + 1);
      if (voteStatus === 'down') setDownvotes(downvotes - 1);
      setVoteStatus('up');
    }
  };

  const handleDownvote = () => {
    if (voteStatus === 'down') {
      setDownvotes(downvotes - 1);
      setVoteStatus(null);
    } else {
      setDownvotes(downvotes + 1);
      if (voteStatus === 'up') setUpvotes(upvotes - 1);
      setVoteStatus('down');
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={handleUpvote} style={{ marginBottom: 6 }} hitSlop={defaultButtonHitslop}>
            <Text style={styles.voteText}>{upvotes}</Text>
            <Ionicons
                name="checkmark-done-circle-outline"
                size={26}
                color={voteStatus === 'up' ? 'green' : 'gray'}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownvote} style={{ marginTop: 6 }} hitSlop={defaultButtonHitslop}>
            <Ionicons
                name="close-circle-outline"
                size={26}
                color={voteStatus === 'down' ? 'red' : 'gray'}
            />
            <Text style={styles.voteText}>{downvotes}</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteText: {
    fontSize: 10,
    marginVertical: 2,
    alignSelf: 'center',
    fontWeight: 'bold',
    fontFamily: generalTextFont,
    color: 'gray',
  },
});

export default Upvote;
