import React from 'react';
import {View, StyleSheet,Text} from 'react-native';

const StoryVideoScreen= () => {
    return(
        <View style={styles.mainContainer}>
            <Text>This is the story screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    }
});

export default StoryVideoScreen;