import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewsCart from './NewsCart';
import { articleTitleFont, generalActiveOpacity, generalTextFont, main_Style, MainSecondaryBlueColor, mainTitleColor, secCardBackgroundColor } from '../styles/GeneralAppStyle';
import NewsCartv2 from './NewsCartv2';
import NewsCartv2Loading from './LoadingComps/NewsCartv2Loading';
import { useNavigation } from '@react-navigation/native';

const NewsCategory = (props) => {
    const [loading, setLoading] = useState(false);
    return(
        <View>
            {props.articles && props.articles.length > 0 ? (
                props.articles.map((article) => (
                    loading ? (
                        <NewsCartv2Loading key={article._id} />
                    ) : (
                        <NewsCartv2 key={article._id} article={article} />
                    )
                ))
            ) : (
                <Text style={styles.emptyText}>There are currently no articles listed here.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyText: {
        textAlign: 'center',
        marginVertical: 20,
        paddingHorizontal: 16,
        color: '#999',
        fontSize: 14,
        fontFamily: generalTextFont,
        fontWeight: '500',
        opacity: 0.7,
    }
});

export default NewsCategory;