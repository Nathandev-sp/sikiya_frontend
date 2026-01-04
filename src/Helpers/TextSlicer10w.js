import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TextSlicer10w = (text) => {
    if (typeof text !== 'string' || !text.trim()) {
        return ''; // Return an empty string if text is not a valid string or is empty
    }

    const words = text.split(' ');
    const newText = words.slice(0, 10).join(' ') + (words.length > 10? ' ...' : '');

    return newText;
};

export default TextSlicer10w;