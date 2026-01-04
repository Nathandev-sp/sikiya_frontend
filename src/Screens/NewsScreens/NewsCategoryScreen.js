import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTitleFont, main_Style, mainBrownColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';
import NewsCartv2 from '../../Components/NewsCartv2';
import NewsCartv2Loading from '../../Components/LoadingComps/NewsCartv2Loading';

const NewsCategoryScreen = () => {
    const route = useRoute();
    const { category } = route.params || { category: 'Politics' };
    
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false); // Set to false for now since no API
    const [selectedCategory, setSelectedCategory] = useState(category);

    const categories = [
        { name: 'Politics', icon: 'flag', color: '#DC2626' },
        { name: 'Economics', icon: 'trending-up', color: '#059669' },
        { name: 'Social', icon: 'people', color: '#7C3AED' },
        { name: 'Tech', icon: 'hardware-chip', color: '#2563EB' },
        { name: 'Business', icon: 'briefcase', color: '#EA580C' },
        { name: 'Cultural', icon: 'library', color: '#DB2777' },
    ];

    // Commented out API call for when backend is ready
    /*
    useEffect(() => {
        const fetchCategoryArticles = async () => {
            setLoading(true);
            try {
                const response = await SikiyaAPI.get(`articles/category/${selectedCategory.toLowerCase()}`);
                setArticles(response.data);
            } catch (error) {
                console.error('Error fetching category articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryArticles();
    }, [selectedCategory]);
    */

    const handleCategoryPress = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    const getSelectedCategory = () => {
        return categories.find(cat => cat.name === selectedCategory) || categories[0];
    };

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <View style={styles.mainContainer}>
                {/* Header Section with Selected Category */}
                <View style={styles.headerSection}>
                    <Ionicons 
                        name={getSelectedCategory().icon} 
                        size={80} 
                        color={getSelectedCategory().color} 
                    />
                    <Text style={[styles.headerTitle, { color: getSelectedCategory().color }]}>
                        {selectedCategory}
                    </Text>
                </View>

                {/* Category Icons Row */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === cat.name && styles.selectedCategoryButton
                            ]}
                            onPress={() => handleCategoryPress(cat.name)}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={[
                                styles.categoryIconContainer,
                                { backgroundColor: selectedCategory === cat.name ? cat.color : secCardBackgroundColor }
                            ]}>
                                <Ionicons 
                                    name={cat.icon} 
                                    size={20} 
                                    color={selectedCategory === cat.name ? '#fff' : cat.color} 
                                />
                            </View>
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat.name && { color: cat.color, fontWeight: 'bold' }
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <VerticalSpacer height={10} />

                {/* Articles List */}
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={articles}
                    keyExtractor={(article, index) => article._id || index.toString()}
                    renderItem={({ item }) => <NewsCartv2 article={item} />}
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.loadingContainer}>
                                <NewsCartv2Loading />
                                <NewsCartv2Loading />
                                <NewsCartv2Loading />
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="newspaper-outline" size={60} color={withdrawnTitleColor} />
                                <Text style={styles.emptyText}>No articles available</Text>
                                <Text style={styles.emptySubtext}>
                                    Check back later for {selectedCategory} news
                                </Text>
                            </View>
                        )
                    }
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    mainContainer: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        fontFamily: generalTitleFont,
    },
    categoriesContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    categoryButton: {
        alignItems: 'center',
        marginHorizontal: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    selectedCategoryButton: {
        backgroundColor: secCardBackgroundColor,
    },
    categoryIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 11,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        padding: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: generalTextColor,
        marginTop: 16,
        fontFamily: generalTitleFont,
    },
    emptySubtext: {
        fontSize: 13,
        color: withdrawnTitleColor,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: generalTextFont,
    },
});

export default NewsCategoryScreen;