import React from 'react';
import { View } from 'react-native';

const VerticalSpacer = ({ height = 10 }) => {
    return (
        <View style={{ height }} />
    );
};

export default VerticalSpacer;
