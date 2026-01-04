import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TextSlicer = (text) => {
    if (typeof text !== 'string' || !text.trim()) {
        return ''; // Return an empty string if text is not a valid string or is empty
    }

    const words = text.split(' ');
    const newText = words.slice(0, 8).join(' ') + (words.length > 8? ' ...' : '');

    return newText;
};

export default TextSlicer;